import {
  getPurchaseOrdersByCompany,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  confirmPharmaPurchaseOrder,
} from "../repositories/purchaseOrder.repository";

import {
  getAvailableStockForMedicine,
} from "../repositories/inventory.repository";

// =========================================================
// GET ALL PURCHASE ORDERS
// =========================================================

export const getPurchaseOrders = async (
  companyId: string,
) => {
  return getPurchaseOrdersByCompany(companyId);
};

// =========================================================
// GET PURCHASE ORDER BY ID
// =========================================================

export const getPurchaseOrder = async (
  purchaseOrderId: string,
  companyId: string,
) => {
  return getPurchaseOrderById(
    purchaseOrderId,
    companyId,
  );
};

// =========================================================
// CREATE PURCHASE ORDER
// =========================================================
//
// Wholesaler creates the order.
//
// Price and batch are NOT provided here.
// Pharma determines them during confirmation.
//

export const registerPurchaseOrder = async (data: {
  orderNumber?: string;

  buyerCompanyId: string;

  sellerCompanyId: string;

  expectedDate?: Date;

  notes?: string;

  items: {
    medicineId: string;
    quantity: number;
  }[];
}) => {
  return createPurchaseOrder(data);
};

// =========================================================
// UPDATE PURCHASE ORDER STATUS
// =========================================================

export const changePurchaseOrderStatus = async (
  purchaseOrderId: string,
  companyId: string,
  status:
    | "DRAFT"
    | "PENDING"
    | "APPROVED"
    | "DISPATCHED"
    | "DELIVERED"
    | "CANCELLED"
    | "REJECTED",
) => {
  return updatePurchaseOrderStatus(
    purchaseOrderId,
    companyId,
    status,
  );
};

// =========================================================
// CHECK PURCHASE ORDER STOCK AVAILABILITY
// =========================================================
//
// Used by Pharma while reviewing a wholesaler's
// PENDING purchase order.
//
// This does NOT approve the order.
//

export const checkPurchaseOrderAvailability = async (
  purchaseOrderId: string,
  pharmaCompanyId: string,
) => {
  // -------------------------------------------------------
  // 1. Get purchase order
  // -------------------------------------------------------

  const purchaseOrder =
    await getPurchaseOrderById(
      purchaseOrderId,
      pharmaCompanyId,
    );

  if (!purchaseOrder) {
    throw new Error(
      "Purchase order not found",
    );
  }

  // -------------------------------------------------------
  // 2. Make sure Pharma is the seller
  // -------------------------------------------------------

  if (
    purchaseOrder.sellerCompanyId !==
    pharmaCompanyId
  ) {
    throw new Error(
      "Only the Pharma company can check this purchase order",
    );
  }

  // -------------------------------------------------------
  // 3. Only PENDING orders can be checked
  // -------------------------------------------------------

  if (
    purchaseOrder.status !== "PENDING"
  ) {
    throw new Error(
      `Only PENDING purchase orders can be checked. Current status: ${purchaseOrder.status}`,
    );
  }

  // -------------------------------------------------------
  // 4. Check stock for every medicine
  // -------------------------------------------------------

  const items = [];

  for (const item of purchaseOrder.items) {
    const requestedQuantity =
      item.requestedQuantity;

    const availableQuantity =
      await getAvailableStockForMedicine(
        pharmaCompanyId,
        item.medicineId,
      );

    // -----------------------------------------------------
    // 5. Calculate 1/3 threshold
    // -----------------------------------------------------

    const minimumRequiredQuantity =
      Math.ceil(
        requestedQuantity / 3,
      );

    const eligible =
      availableQuantity >=
      minimumRequiredQuantity;

    items.push({
      medicineId: item.medicineId,

      medicineName:
        item.medicine.medicineName,

      requestedQuantity,

      availableQuantity,

      minimumRequiredQuantity,

      eligible,
    });
  }

  // -------------------------------------------------------
  // 6. Return availability information
  // -------------------------------------------------------

  return {
    purchaseOrderId:
      purchaseOrder.id,

    orderNumber:
      purchaseOrder.orderNumber,

    status:
      purchaseOrder.status,

    buyerCompany:
      purchaseOrder.buyerCompany.companyName,

    sellerCompany:
      purchaseOrder.sellerCompany.companyName,

    items,
  };
};

// =========================================================
// CONFIRM PHARMA PURCHASE ORDER
// =========================================================
//
// Pharma finalizes:
// - approved quantity
// - batch
// - unit price
//
// The repository will:
// - calculate order total
// - update CustomerBalance
// - move PO to APPROVED
//
// =========================================================

export const confirmPharmaOrder = async (
  companyId: string,
  orderId: string,
  items: any[],
) => {
  return confirmPharmaPurchaseOrder(
    orderId,
    companyId,
    items,
  );
};