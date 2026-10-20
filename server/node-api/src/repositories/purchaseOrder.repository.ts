import prisma from "../config/prisma";
import { Prisma } from "../generated/prisma";

import {
  createInvoiceInTransaction,
} from "./invoice.repository";

// =========================================================
// SAFE COMPANY SELECT
// =========================================================

const companySelect = {
  id: true,
  companyName: true,
  companyType: true,
  email: true,
  phone: true,
  gstNumber: true,
  drugLicenseNumber: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  status: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

// =========================================================
// GET ALL PURCHASE ORDERS
// =========================================================

export const getPurchaseOrdersByCompany = async (
  companyId: string,
) => {
  const purchaseOrders =
    await prisma.purchaseOrder.findMany({
      where: {
        OR: [
          {
            buyerCompanyId: companyId,
          },
          {
            sellerCompanyId: companyId,
          },
        ],
      },

      include: {
        buyerCompany: {
          select: companySelect,
        },

        sellerCompany: {
          select: companySelect,
        },

        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },

        dispatches: true,

        // Invoice generated after Pharma confirmation
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalAmount: true,
            paidAmount: true,
            balanceDue: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  // =======================================================
  // CALCULATE PURCHASE ORDER AMOUNT
  // =======================================================

  return purchaseOrders.map((order) => {
    const itemTotal = order.items.reduce(
      (total, item) =>
        total + Number(item.totalPrice || 0),
      0,
    );

    const totalAmount = order.invoice
      ? Number(order.invoice.totalAmount)
      : itemTotal;

    return {
      ...order,
      totalAmount,
    };
  });
};

// =========================================================
// GET PURCHASE ORDER BY ID
// =========================================================

export const getPurchaseOrderById = async (
  purchaseOrderId: string,
  companyId: string,
) => {
  return prisma.purchaseOrder.findFirst({
    where: {
      id: purchaseOrderId,

      OR: [
        {
          buyerCompanyId: companyId,
        },
        {
          sellerCompanyId: companyId,
        },
      ],
    },

    include: {
      buyerCompany: {
        select: companySelect,
      },

      sellerCompany: {
        select: companySelect,
      },

      items: {
        include: {
          medicine: true,
          batch: true,
        },
      },

      dispatches: {
        include: {
          sourceWarehouse: true,
          destinationWarehouse: true,
          items: {
            include: {
              batch: true,
            },
          },
        },
      },

      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          totalAmount: true,
          paidAmount: true,
          balanceDue: true,
        },
      },
    },
  });
};

// =========================================================
// CREATE PURCHASE ORDER
// =========================================================
//
// Wholesaler provides:
// - medicine
// - requested quantity
//
// Wholesaler does NOT provide:
// - batch
// - price
//
// Pharma decides these during confirmation.
//
// =========================================================

export const createPurchaseOrder = async (
  data: {
    orderNumber?: string;

    buyerCompanyId: string;

    sellerCompanyId: string;

    expectedDate?: Date;

    notes?: string;

    items: {
      medicineId: string;
      quantity: number;
    }[];
  },
) => {
  return prisma.$transaction(
    async (
      tx: Prisma.TransactionClient,
    ) => {
      // -------------------------------------------------------
      // 1. Buyer and seller cannot be same
      // -------------------------------------------------------

      if (
        data.buyerCompanyId ===
        data.sellerCompanyId
      ) {
        throw new Error(
          "Buyer and seller companies cannot be the same",
        );
      }

      // -------------------------------------------------------
      // 2. Validate items
      // -------------------------------------------------------

      if (
        !Array.isArray(data.items) ||
        data.items.length === 0
      ) {
        throw new Error(
          "At least one purchase order item is required",
        );
      }

      // -------------------------------------------------------
      // 3. Validate each item
      // -------------------------------------------------------

      for (const item of data.items) {
        if (!item.medicineId) {
          throw new Error(
            "Medicine ID is required for every purchase order item",
          );
        }

        if (
          !Number.isInteger(
            item.quantity,
          ) ||
          item.quantity <= 0
        ) {
          throw new Error(
            "Purchase order quantity must be greater than zero",
          );
        }

        const medicine =
          await tx.medicine.findFirst({
            where: {
              id: item.medicineId,

              companyId:
                data.sellerCompanyId,

              isActive: true,
            },
          });

        if (!medicine) {
          throw new Error(
            `Medicine ${item.medicineId} does not belong to the seller company or is inactive`,
          );
        }
      }

      // -------------------------------------------------------
      // 4. Generate order number
      // -------------------------------------------------------

      const generatedOrderNumber =
        data.orderNumber ||
        `PO-${Date.now()}`;

      // -------------------------------------------------------
      // 5. Create purchase order
      // -------------------------------------------------------

      const purchaseOrder =
        await tx.purchaseOrder.create({
          data: {
            orderNumber:
              generatedOrderNumber,

            buyerCompanyId:
              data.buyerCompanyId,

            sellerCompanyId:
              data.sellerCompanyId,

            expectedDate:
              data.expectedDate,

            notes:
              data.notes,

            status: "PENDING",

            items: {
              create:
                data.items.map(
                  (item) => ({
                    medicineId:
                      item.medicineId,

                    batchId: null,

                    requestedQuantity:
                      item.quantity,

                    quantity:
                      item.quantity,

                    unitPrice: 0,

                    totalPrice: 0,
                  }),
                ),
            },
          },

          include: {
            buyerCompany: {
              select:
                companySelect,
            },

            sellerCompany: {
              select:
                companySelect,
            },

            items: {
              include: {
                medicine: true,
                batch: true,
              },
            },
          },
        });

      return {
        ...purchaseOrder,

        totalAmount: 0,
      };
    },
  );
};

// =========================================================
// UPDATE PURCHASE ORDER STATUS
// =========================================================
//
// EXISTING DISPATCH WORKFLOW PRESERVED.
//
// PENDING
//    ↓
// APPROVED
//    ↓
// DISPATCHED
//    ↓
// DELIVERED
//
// =========================================================

export const updatePurchaseOrderStatus =
  async (
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
    return prisma.$transaction(
      async (
        tx: Prisma.TransactionClient,
      ) => {
        const purchaseOrder =
          await tx.purchaseOrder.findFirst({
            where: {
              id: purchaseOrderId,

              OR: [
                {
                  buyerCompanyId:
                    companyId,
                },
                {
                  sellerCompanyId:
                    companyId,
                },
              ],
            },
          });

        if (!purchaseOrder) {
          throw new Error(
            "Purchase order not found",
          );
        }

        if (
          purchaseOrder.status ===
            "DELIVERED" ||
          purchaseOrder.status ===
            "CANCELLED" ||
          purchaseOrder.status ===
            "REJECTED"
        ) {
          throw new Error(
            `Cannot change purchase order status from ${purchaseOrder.status}`,
          );
        }

        if (
          purchaseOrder.status ===
            "PENDING" &&
          status !== "APPROVED" &&
          status !== "REJECTED" &&
          status !== "CANCELLED"
        ) {
          throw new Error(
            "Pending purchase order can only be APPROVED, REJECTED or CANCELLED",
          );
        }

        if (
          purchaseOrder.status ===
            "APPROVED" &&
          status !== "DISPATCHED" &&
          status !== "CANCELLED"
        ) {
          throw new Error(
            "Approved purchase order can only be DISPATCHED or CANCELLED",
          );
        }

        if (
          purchaseOrder.status ===
            "DISPATCHED" &&
          status !== "DELIVERED"
        ) {
          throw new Error(
            "Dispatched purchase order can only be DELIVERED",
          );
        }

        if (
          purchaseOrder.status ===
            "DRAFT" &&
          status !== "PENDING" &&
          status !== "CANCELLED"
        ) {
          throw new Error(
            "Draft purchase order can only be PENDING or CANCELLED",
          );
        }

        return tx.purchaseOrder.update({
          where: {
            id: purchaseOrderId,
          },

          data: {
            status,
          },
        });
      },
    );
  };

// =========================================================
// UPDATE PHARMA APPROVED QUANTITIES
// =========================================================

export const updatePharmaApprovedQuantities =
  async (
    purchaseOrderId: string,
    pharmaCompanyId: string,
    items: {
      purchaseOrderItemId: string;
      approvedQuantity: number;
    }[],
  ) => {
    return prisma.$transaction(
      async (
        tx: Prisma.TransactionClient,
      ) => {
        const purchaseOrder =
          await tx.purchaseOrder.findFirst({
            where: {
              id: purchaseOrderId,

              sellerCompanyId:
                pharmaCompanyId,
            },

            include: {
              items: true,
            },
          });

        if (!purchaseOrder) {
          throw new Error(
            "Purchase order not found",
          );
        }

        if (
          purchaseOrder.status !==
          "PENDING"
        ) {
          throw new Error(
            `Only PENDING purchase orders can be processed. Current status: ${purchaseOrder.status}`,
          );
        }

        if (
          !Array.isArray(items) ||
          items.length === 0
        ) {
          throw new Error(
            "At least one purchase order item is required",
          );
        }

        for (const requestedItem of items) {
          const orderItem =
            purchaseOrder.items.find(
              (item) =>
                item.id ===
                requestedItem.purchaseOrderItemId,
            );

          if (!orderItem) {
            throw new Error(
              `Purchase order item ${requestedItem.purchaseOrderItemId} not found`,
            );
          }

          if (
            !Number.isInteger(
              requestedItem.approvedQuantity,
            ) ||
            requestedItem.approvedQuantity <=
              0
          ) {
            throw new Error(
              "Approved quantity must be a positive whole number",
            );
          }

          if (
            requestedItem.approvedQuantity >
            orderItem.requestedQuantity
          ) {
            throw new Error(
              `Approved quantity for ${orderItem.medicineId} cannot exceed requested quantity`,
            );
          }
        }

        for (const requestedItem of items) {
          await tx.purchaseOrderItem.update({
            where: {
              id:
                requestedItem.purchaseOrderItemId,
            },

            data: {
              quantity:
                requestedItem.approvedQuantity,
            },
          });
        }

        return tx.purchaseOrder.findUnique({
          where: {
            id: purchaseOrderId,
          },

          include: {
            items: {
              include: {
                medicine: true,
                batch: true,
              },
            },
          },
        });
      },
    );
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
// Automatically:
// - calculates invoice
// - creates invoice
// - marks invoice SENT
// - creates notification
// - updates CustomerBalance
// - changes PO to APPROVED
//
// Everything happens in ONE transaction.
//
// =========================================================

export const confirmPharmaPurchaseOrder =
  async (
    purchaseOrderId: string,
    pharmaCompanyId: string,
    items: {
      purchaseOrderItemId: string;

      batchId: string;

      unitPrice: number;

      approvedQuantity: number;

      discountPercent?: number;

      gstPercent?: number;
    }[],
  ) => {
    return prisma.$transaction(
      async (
        tx: Prisma.TransactionClient,
      ) => {
        // =====================================================
        // 1. FIND PURCHASE ORDER
        // =====================================================

        const purchaseOrder =
          await tx.purchaseOrder.findFirst({
            where: {
              id: purchaseOrderId,

              sellerCompanyId:
                pharmaCompanyId,
            },

            include: {
              items: true,

              buyerCompany: {
                select: {
                  id: true,
                  companyName: true,
                  email: true,
                  state: true,
                },
              },

              sellerCompany: {
                select: {
                  id: true,
                  companyName: true,
                  email: true,
                  state: true,
                },
              },
            },
          });

        if (!purchaseOrder) {
          throw new Error(
            "Purchase order not found",
          );
        }

        // =====================================================
        // 2. ORDER MUST BE PENDING
        // =====================================================

        if (
          purchaseOrder.status !==
          "PENDING"
        ) {
          throw new Error(
            `Only PENDING purchase orders can be confirmed. Current status: ${purchaseOrder.status}`,
          );
        }

        // =====================================================
        // 3. VALIDATE ITEMS
        // =====================================================

        if (
          !Array.isArray(items) ||
          items.length === 0
        ) {
          throw new Error(
            "At least one purchase order item is required",
          );
        }

        // Prevent confirming only part of the PO accidentally.
        if (
          items.length !==
          purchaseOrder.items.length
        ) {
          throw new Error(
            "All purchase order items must be processed during confirmation",
          );
        }

        // =====================================================
        // 4. PREPARE INVOICE CALCULATIONS
        // =====================================================

        let subtotal = 0;

        let discountAmount = 0;

        let taxableAmount = 0;

        let cgstAmount = 0;

        let sgstAmount = 0;

        let igstAmount = 0;

        const invoiceItems: {
          medicineId: string;

          batchId: string;

          quantity: number;

          unit: string;

          unitPrice: number;

          discountPercent: number;

          taxableValue: number;

          gstPercent: number;

          gstAmount: number;

          amount: number;
        }[] = [];

        // =====================================================
        // Helper for money rounding
        // =====================================================

        const money = (
          value: number,
        ) =>
          Math.round(
            (value + Number.EPSILON) *
              100,
          ) / 100;

        // =====================================================
        // Determine place of supply
        // =====================================================

        const sellerState =
          purchaseOrder.sellerCompany.state
            ?.trim()
            .toLowerCase();

        const buyerState =
          purchaseOrder.buyerCompany.state
            ?.trim()
            .toLowerCase();

        const isInterState =
          Boolean(
            sellerState &&
              buyerState &&
              sellerState !==
                buyerState,
          );

        // =====================================================
        // 5. VALIDATE AND CALCULATE EACH ITEM
        // =====================================================

        for (const requestedItem of items) {
          const orderItem =
            purchaseOrder.items.find(
              (item) =>
                item.id ===
                requestedItem.purchaseOrderItemId,
            );

          if (!orderItem) {
            throw new Error(
              `Purchase order item ${requestedItem.purchaseOrderItemId} not found`,
            );
          }

          // ---------------------------------------------------
          // Quantity validation
          // ---------------------------------------------------

          if (
            !Number.isInteger(
              requestedItem.approvedQuantity,
            ) ||
            requestedItem.approvedQuantity <=
              0
          ) {
            throw new Error(
              "Approved quantity must be a positive whole number",
            );
          }

          if (
            requestedItem.approvedQuantity >
            orderItem.requestedQuantity
          ) {
            throw new Error(
              `Approved quantity for ${orderItem.medicineId} cannot exceed requested quantity`,
            );
          }

          // ---------------------------------------------------
          // Price validation
          // ---------------------------------------------------

          if (
            !Number.isFinite(
              requestedItem.unitPrice,
            ) ||
            requestedItem.unitPrice <= 0
          ) {
            throw new Error(
              "Unit price must be greater than zero",
            );
          }

          // ---------------------------------------------------
          // Discount validation
          // ---------------------------------------------------

          const discountPercent =
            requestedItem.discountPercent ??
            0;

          if (
            !Number.isFinite(
              discountPercent,
            ) ||
            discountPercent < 0 ||
            discountPercent > 100
          ) {
            throw new Error(
              "Discount percent must be between 0 and 100",
            );
          }

          // ---------------------------------------------------
          // GST validation
          // ---------------------------------------------------

          const gstPercent =
            requestedItem.gstPercent ??
            12;

          if (
            !Number.isFinite(
              gstPercent,
            ) ||
            gstPercent < 0 ||
            gstPercent > 100
          ) {
            throw new Error(
              "GST percent must be between 0 and 100",
            );
          }

          // ---------------------------------------------------
          // Verify batch belongs to medicine
          // ---------------------------------------------------

          const batch =
            await tx.medicineBatch.findFirst({
              where: {
                id:
                  requestedItem.batchId,

                medicineId:
                  orderItem.medicineId,
              },
            });

          if (!batch) {
            throw new Error(
              `Batch ${requestedItem.batchId} does not belong to the selected medicine`,
            );
          }

          // ---------------------------------------------------
          // Check selected batch inventory
          // ---------------------------------------------------

          const inventory =
            await tx.inventory.findMany({
              where: {
                batchId:
                  requestedItem.batchId,

                warehouse: {
                  companyId:
                    pharmaCompanyId,
                },
              },

              select: {
                quantity: true,
              },
            });

          const availableQuantity =
            inventory.reduce(
              (
                total,
                inventoryItem,
              ) =>
                total +
                inventoryItem.quantity,
              0,
            );

          if (
            requestedItem.approvedQuantity >
            availableQuantity
          ) {
            throw new Error(
              `Approved quantity for ${orderItem.medicineId} cannot exceed available stock of ${availableQuantity}`,
            );
          }

          // ---------------------------------------------------
          // Calculate values
          // ---------------------------------------------------

          const grossAmount =
            requestedItem.approvedQuantity *
            requestedItem.unitPrice;

          const itemDiscount =
            grossAmount *
            (discountPercent / 100);

          const itemTaxable =
            grossAmount -
            itemDiscount;

          const itemGst =
            itemTaxable *
            (gstPercent / 100);

          const itemAmount =
            itemTaxable +
            itemGst;

          subtotal += grossAmount;

          discountAmount +=
            itemDiscount;

          taxableAmount +=
            itemTaxable;

          if (isInterState) {
            igstAmount += itemGst;
          } else {
            cgstAmount +=
              itemGst / 2;

            sgstAmount +=
              itemGst / 2;
          }

          invoiceItems.push({
            medicineId:
              orderItem.medicineId,

            batchId:
              requestedItem.batchId,

            quantity:
              requestedItem.approvedQuantity,

            unit: "Unit",

            unitPrice:
              requestedItem.unitPrice,

            discountPercent,

            taxableValue:
              money(itemTaxable),

            gstPercent,

            gstAmount:
              money(itemGst),

            amount:
              money(itemAmount),
          });
        }

        // =====================================================
        // 6. FINAL INVOICE TOTALS
        // =====================================================

        subtotal = money(subtotal);

        discountAmount =
          money(discountAmount);

        taxableAmount =
          money(taxableAmount);

        cgstAmount =
          money(cgstAmount);

        sgstAmount =
          money(sgstAmount);

        igstAmount =
          money(igstAmount);

        const totalGst =
          money(
            cgstAmount +
              sgstAmount +
              igstAmount,
          );

        const invoiceTotal =
          money(
            taxableAmount +
              totalGst,
          );

        // =====================================================
        // 7. UPDATE PURCHASE ORDER ITEMS
        // =====================================================

        for (const requestedItem of items) {
          const itemTotal =
            requestedItem.approvedQuantity *
            requestedItem.unitPrice;

          await tx.purchaseOrderItem.update(
            {
              where: {
                id:
                  requestedItem.purchaseOrderItemId,
              },

              data: {
                quantity:
                  requestedItem.approvedQuantity,

                batchId:
                  requestedItem.batchId,

                unitPrice:
                  requestedItem.unitPrice,

                totalPrice:
                  money(itemTotal),
              },
            },
          );
        }

        // =====================================================
        // 8. CREATE INVOICE
        // =====================================================

        const invoiceDate =
          new Date();

        const dueDate =
          new Date(
            invoiceDate.getTime() +
              30 *
                24 *
                60 *
                60 *
                1000,
          );

        const invoice =
          await createInvoiceInTransaction(
            tx,
            {
              invoiceNumber:
                `INV-${Date.now()}`,

              purchaseOrderId:
                purchaseOrder.id,

              sellerCompanyId:
                purchaseOrder.sellerCompanyId,

              buyerCompanyId:
                purchaseOrder.buyerCompanyId,

              sourceWarehouseId:
                null,

              destinationWarehouseId:
                null,

              invoiceDate,

              dueDate,

              placeOfSupply:
                purchaseOrder
                  .buyerCompany
                  .state ?? null,

              paymentTerms:
                "Payment due within 30 days",

              status:
                "GENERATED",

              subtotal,

              discountAmount,

              taxableAmount,

              cgstAmount,

              sgstAmount,

              igstAmount,

              totalGst,

              totalAmount:
                invoiceTotal,

              paidAmount: 0,

              balanceDue:
                invoiceTotal,

              items:
                invoiceItems,
            },
          );

        // =====================================================
        // 9. MARK INVOICE AS SENT
        // =====================================================

        const sentInvoice =
          await tx.invoice.update({
            where: {
              id: invoice.id,
            },

            data: {
              status: "SENT",
            },

            include: {
              sellerCompany: {
                select:
                  companySelect,
              },

              buyerCompany: {
                select:
                  companySelect,
              },

              sourceWarehouse: true,

              destinationWarehouse:
                true,

              items: {
                include: {
                  medicine: true,
                  batch: true,
                },
              },
            },
          });

        // =====================================================
        // 10. UPDATE CUSTOMER BALANCE
        // =====================================================

        await tx.customerBalance.upsert({
          where: {
            pharmaCompanyId_wholesalerCompanyId:
              {
                pharmaCompanyId,

                wholesalerCompanyId:
                  purchaseOrder.buyerCompanyId,
              },
          },

          create: {
            pharmaCompanyId,

            wholesalerCompanyId:
              purchaseOrder.buyerCompanyId,

            totalAmount:
              invoiceTotal,

            paidAmount: 0,
          },

          update: {
            totalAmount: {
              increment:
                invoiceTotal,
            },
          },
        });

        // =====================================================
        // 11. CREATE NOTIFICATION
        // =====================================================

        await tx.notification.create({
          data: {
            senderCompanyId:
              purchaseOrder.sellerCompanyId,

            recipientCompanyId:
              purchaseOrder.buyerCompanyId,

            title:
              "Order Confirmed - Invoice Sent",

            message:
              `Your purchase order ${purchaseOrder.orderNumber} has been confirmed by ${purchaseOrder.sellerCompany.companyName}. Invoice ${sentInvoice.invoiceNumber} has been generated and sent. Total amount: ₹${invoiceTotal}.`,

            type:
              "ORDER_CONFIRMED",
          },
        });

        // =====================================================
        // 12. APPROVE PURCHASE ORDER
        // =====================================================

        await tx.purchaseOrder.update({
          where: {
            id: purchaseOrderId,
          },

          data: {
            status: "APPROVED",
          },
        });

        // =====================================================
        // 13. GET FINAL PURCHASE ORDER
        // =====================================================

        const updatedPurchaseOrder =
          await tx.purchaseOrder.findUnique({
            where: {
              id: purchaseOrderId,
            },

            include: {
              buyerCompany: {
                select:
                  companySelect,
              },

              sellerCompany: {
                select:
                  companySelect,
              },

              items: {
                include: {
                  medicine: true,
                  batch: true,
                },
              },

              dispatches: true,

              invoice: {
                select: {
                  id: true,
                  invoiceNumber: true,
                  status: true,
                  totalAmount: true,
                  paidAmount: true,
                  balanceDue: true,
                },
              },
            },
          });

        // =====================================================
        // 14. RETURN BOTH PO + INVOICE
        // =====================================================

        return {
          ...updatedPurchaseOrder,

          invoice:
            sentInvoice,
        };
      },
    );
  };