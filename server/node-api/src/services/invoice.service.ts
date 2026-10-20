import {
  createInvoice,
  getInvoicesByCompany,
  getInvoiceById,
  getInvoiceByPurchaseOrder,
  updateInvoiceStatus,
  updateInvoicePayment,
} from "../repositories/invoice.repository";

import {
  getPurchaseOrderById,
} from "../repositories/purchaseOrder.repository";

// =========================================================
// TYPES
// =========================================================

type InvoiceItemInput = {
  medicineId: string;
  batchId: string;

  quantity: number;

  unit?: string;

  unitPrice: number;

  discountPercent?: number;

  gstPercent?: number;
};

type GenerateInvoiceData = {
  purchaseOrderId: string;

  sourceWarehouseId?: string;
  destinationWarehouseId?: string;

  dueDate?: Date;

  placeOfSupply?: string;

  paymentTerms?: string;

  items?: InvoiceItemInput[];
};

// =========================================================
// GET ALL INVOICES
// =========================================================

export const getInvoices = async (
  companyId: string,
) => {
  return getInvoicesByCompany(companyId);
};

// =========================================================
// GET INVOICE BY ID
// =========================================================

export const getInvoice = async (
  invoiceId: string,
  companyId: string,
) => {
  const invoice = await getInvoiceById(
    invoiceId,
    companyId,
  );

  if (!invoice) {
    throw new Error(
      "Invoice not found",
    );
  }

  return invoice;
};

// =========================================================
// GET INVOICE BY PURCHASE ORDER
// =========================================================

export const getInvoiceForPurchaseOrder = async (
  purchaseOrderId: string,
  companyId: string,
) => {
  const purchaseOrder =
    await getPurchaseOrderById(
      purchaseOrderId,
      companyId,
    );

  if (!purchaseOrder) {
    throw new Error(
      "Purchase order not found",
    );
  }

  const invoice =
    await getInvoiceByPurchaseOrder(
      purchaseOrderId,
    );

  if (!invoice) {
    throw new Error(
      "Invoice not found for this purchase order",
    );
  }

  // Make sure the requesting company
  // actually belongs to this invoice.
  if (
    invoice.sellerCompanyId !== companyId &&
    invoice.buyerCompanyId !== companyId
  ) {
    throw new Error(
      "You are not authorized to view this invoice",
    );
  }

  return invoice;
};

// =========================================================
// GENERATE INVOICE
// =========================================================
//
// Invoice is generated from a PURCHASE ORDER.
//
// Expected PO state:
// PENDING or APPROVED
//
// In normal PharmaFlow flow:
//
// PENDING
//    ↓
// Pharma confirms quantity + batch + price
//    ↓
// Invoice generated
//    ↓
// PO becomes APPROVED
//
// =========================================================

export const generateInvoice = async (
  companyId: string,
  data: GenerateInvoiceData,
) => {
  // -------------------------------------------------------
  // 1. Get purchase order
  // -------------------------------------------------------

  const purchaseOrder =
    await getPurchaseOrderById(
      data.purchaseOrderId,
      companyId,
    );

  if (!purchaseOrder) {
    throw new Error(
      "Purchase order not found",
    );
  }

  // -------------------------------------------------------
  // 2. Only Pharma seller can generate invoice
  // -------------------------------------------------------

  if (
    purchaseOrder.sellerCompanyId !==
    companyId
  ) {
    throw new Error(
      "Only the Pharma company can generate this invoice",
    );
  }

  // -------------------------------------------------------
  // 3. Check whether invoice already exists
  // -------------------------------------------------------

  const existingInvoice =
    await getInvoiceByPurchaseOrder(
      purchaseOrder.id,
    );

  if (existingInvoice) {
    throw new Error(
      `Invoice already exists for purchase order ${purchaseOrder.orderNumber}`,
    );
  }

  // -------------------------------------------------------
  // 4. Validate PO status
  // -------------------------------------------------------

  if (
    purchaseOrder.status !== "APPROVED" &&
    purchaseOrder.status !== "PENDING"
  ) {
    throw new Error(
      `Invoice cannot be generated for purchase order with status ${purchaseOrder.status}`,
    );
  }

  // -------------------------------------------------------
  // 5. Make sure PO has items
  // -------------------------------------------------------

  if (
    !purchaseOrder.items ||
    purchaseOrder.items.length === 0
  ) {
    throw new Error(
      "Purchase order does not contain any items",
    );
  }

  // -------------------------------------------------------
  // 6. Prepare invoice items
  // -------------------------------------------------------
  //
  // If items are provided, Pharma can use them.
  //
  // Otherwise we use the values already stored
  // on the confirmed PurchaseOrderItems.
  //
  // -------------------------------------------------------

  const invoiceItems =
    data.items ??
    purchaseOrder.items.map(
      (item) => ({
        medicineId:
          item.medicineId,

        batchId:
          item.batchId,

        quantity:
          item.quantity,

        unit: "Unit",

        unitPrice:
          Number(item.unitPrice),

        discountPercent: 0,

        gstPercent: 12,
      }),
    );

  // -------------------------------------------------------
  // 7. Validate invoice items
  // -------------------------------------------------------

  if (
    invoiceItems.length === 0
  ) {
    throw new Error(
      "At least one invoice item is required",
    );
  }

  // -------------------------------------------------------
  // 8. Calculate totals
  // -------------------------------------------------------

  let subtotal = 0;

  let discountAmount = 0;

  let taxableAmount = 0;

  let cgstAmount = 0;

  let sgstAmount = 0;

  let igstAmount = 0;

  const processedItems = [];

  // -------------------------------------------------------
  // Determine GST type
  // -------------------------------------------------------
  //
  // If place of supply is provided and differs from
  // seller state, IGST is used.
  //
  // Otherwise CGST + SGST is used.
  //
  // -------------------------------------------------------

  const sellerState =
    purchaseOrder.sellerCompany.state;

  const isInterState =
    Boolean(
      data.placeOfSupply &&
      sellerState &&
      data.placeOfSupply
        .trim()
        .toLowerCase() !==
        sellerState
          .trim()
          .toLowerCase(),
    );

  // -------------------------------------------------------
  // Process every invoice item
  // -------------------------------------------------------

  for (
    const item of invoiceItems
  ) {
    // -----------------------------------------------------
    // Basic validation
    // -----------------------------------------------------

    if (!item.medicineId) {
      throw new Error(
        "Medicine ID is required for invoice item",
      );
    }

    if (!item.batchId) {
      throw new Error(
        `Batch is required for medicine ${item.medicineId}`,
      );
    }

    if (
      !Number.isInteger(
        item.quantity,
      ) ||
      item.quantity <= 0
    ) {
      throw new Error(
        "Invoice quantity must be a positive whole number",
      );
    }

    if (
      !Number.isFinite(
        item.unitPrice,
      ) ||
      item.unitPrice <= 0
    ) {
      throw new Error(
        "Invoice unit price must be greater than zero",
      );
    }

    const discountPercent =
      item.discountPercent ?? 0;

    const gstPercent =
      item.gstPercent ?? 12;

    if (
      !Number.isFinite(
        discountPercent,
      ) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      throw new Error(
        "Discount percentage must be between 0 and 100",
      );
    }

    if (
      !Number.isFinite(
        gstPercent,
      ) ||
      gstPercent < 0
    ) {
      throw new Error(
        "GST percentage cannot be negative",
      );
    }

    // -----------------------------------------------------
    // Find corresponding PO item
    // -----------------------------------------------------

    const purchaseOrderItem =
      purchaseOrder.items.find(
        (poItem) =>
          poItem.medicineId ===
            item.medicineId &&
          poItem.batchId ===
            item.batchId,
      );

    if (!purchaseOrderItem) {
      throw new Error(
        `Invoice item for medicine ${item.medicineId} and batch ${item.batchId} does not match the purchase order`,
      );
    }

    // -----------------------------------------------------
    // Quantity cannot exceed approved PO quantity
    // -----------------------------------------------------

    if (
      item.quantity >
      purchaseOrderItem.quantity
    ) {
      throw new Error(
        `Invoice quantity for ${item.medicineId} cannot exceed approved purchase order quantity of ${purchaseOrderItem.quantity}`,
      );
    }

    // -----------------------------------------------------
    // Calculate gross value
    // -----------------------------------------------------

    const grossAmount =
      item.quantity *
      item.unitPrice;

    // -----------------------------------------------------
    // Calculate discount
    // -----------------------------------------------------

    const itemDiscount =
      grossAmount *
      (discountPercent / 100);

    // -----------------------------------------------------
    // Calculate taxable value
    // -----------------------------------------------------

    const itemTaxableValue =
      grossAmount -
      itemDiscount;

    // -----------------------------------------------------
    // Calculate GST
    // -----------------------------------------------------

    const itemGst =
      itemTaxableValue *
      (gstPercent / 100);

    // -----------------------------------------------------
    // Calculate final item amount
    // -----------------------------------------------------

    const itemAmount =
      itemTaxableValue +
      itemGst;

    // -----------------------------------------------------
    // Split GST
    // -----------------------------------------------------

    let itemCgst = 0;

    let itemSgst = 0;

    let itemIgst = 0;

    if (isInterState) {
      itemIgst = itemGst;
    } else {
      itemCgst =
        itemGst / 2;

      itemSgst =
        itemGst / 2;
    }

    // -----------------------------------------------------
    // Add to invoice totals
    // -----------------------------------------------------

    subtotal += grossAmount;

    discountAmount +=
      itemDiscount;

    taxableAmount +=
      itemTaxableValue;

    cgstAmount +=
      itemCgst;

    sgstAmount +=
      itemSgst;

    igstAmount +=
      itemIgst;

    // -----------------------------------------------------
    // Store processed item
    // -----------------------------------------------------

    processedItems.push({
      medicineId:
        item.medicineId,

      batchId:
        item.batchId,

      quantity:
        item.quantity,

      unit:
        item.unit ?? "Unit",

      unitPrice:
        item.unitPrice,

      discountPercent,

      taxableValue:
        itemTaxableValue,

      gstPercent,

      gstAmount:
        itemGst,

      amount:
        itemAmount,
    });
  }

  // -------------------------------------------------------
  // 9. Calculate total GST
  // -------------------------------------------------------

  const totalGst =
    cgstAmount +
    sgstAmount +
    igstAmount;

  // -------------------------------------------------------
  // 10. Calculate grand total
  // -------------------------------------------------------

  const totalAmount =
    taxableAmount +
    totalGst;

  // -------------------------------------------------------
  // 11. Initial payment state
  // -------------------------------------------------------

  const paidAmount = 0;

  const balanceDue =
    totalAmount;

  // -------------------------------------------------------
  // 12. Generate invoice number
  // -------------------------------------------------------

  const invoiceNumber =
    `INV-${Date.now()}`;

  // -------------------------------------------------------
  // 13. Create invoice
  // -------------------------------------------------------

  const invoice =
    await createInvoice({
      invoiceNumber,

      purchaseOrderId:
        purchaseOrder.id,

      sellerCompanyId:
        purchaseOrder.sellerCompanyId,

      buyerCompanyId:
        purchaseOrder.buyerCompanyId,

      sourceWarehouseId:
        data.sourceWarehouseId,

      destinationWarehouseId:
        data.destinationWarehouseId,

      invoiceDate:
        new Date(),

      dueDate:
        data.dueDate,

      placeOfSupply:
        data.placeOfSupply,

      paymentTerms:
        data.paymentTerms ??
        "Payment due as per agreed terms",

      status:
        "GENERATED",

      subtotal,

      discountAmount,

      taxableAmount,

      cgstAmount,

      sgstAmount,

      igstAmount,

      totalGst,

      totalAmount,

      paidAmount,

      balanceDue,

      items:
        processedItems,
    });

  return invoice;
};

// =========================================================
// MARK INVOICE AS SENT
// =========================================================

export const sendInvoice = async (
  invoiceId: string,
  companyId: string,
) => {
  const invoice =
    await getInvoiceById(
      invoiceId,
      companyId,
    );

  if (!invoice) {
    throw new Error(
      "Invoice not found",
    );
  }

  if (
    invoice.sellerCompanyId !==
    companyId
  ) {
    throw new Error(
      "Only the Pharma company can send this invoice",
    );
  }

  if (
    invoice.status !== "GENERATED"
  ) {
    throw new Error(
      `Only GENERATED invoices can be sent. Current status: ${invoice.status}`,
    );
  }

  return updateInvoiceStatus(
    invoiceId,
    "SENT",
  );
};

// =========================================================
// UPDATE INVOICE PAYMENT
// =========================================================

export const recordInvoicePayment = async (
  invoiceId: string,
  companyId: string,
  paymentAmount: number,
) => {
  // -------------------------------------------------------
  // 1. Validate payment amount
  // -------------------------------------------------------

  if (
    !Number.isFinite(
      paymentAmount,
    ) ||
    paymentAmount <= 0
  ) {
    throw new Error(
      "Payment amount must be greater than zero",
    );
  }

  // -------------------------------------------------------
  // 2. Get invoice
  // -------------------------------------------------------

  const invoice =
    await getInvoiceById(
      invoiceId,
      companyId,
    );

  if (!invoice) {
    throw new Error(
      "Invoice not found",
    );
  }

  // -------------------------------------------------------
  // 3. Calculate new payment
  // -------------------------------------------------------

  const currentPaidAmount =
    Number(invoice.paidAmount);

  const totalAmount =
    Number(invoice.totalAmount);

  const newPaidAmount =
    currentPaidAmount +
    paymentAmount;

  // -------------------------------------------------------
  // 4. Prevent overpayment
  // -------------------------------------------------------

  if (
    newPaidAmount >
    totalAmount
  ) {
    throw new Error(
      "Payment cannot exceed invoice total amount",
    );
  }

  const newBalanceDue =
    totalAmount -
    newPaidAmount;

  // -------------------------------------------------------
  // 5. Determine status
  // -------------------------------------------------------

  let status:
    | "GENERATED"
    | "SENT"
    | "PARTIALLY_PAID"
    | "PAID"
    | "OVERDUE";

  if (
    newBalanceDue === 0
  ) {
    status = "PAID";
  } else {
    status = "PARTIALLY_PAID";
  }

  // -------------------------------------------------------
  // 6. Update invoice
  // -------------------------------------------------------

  return updateInvoicePayment(
    invoiceId,
    newPaidAmount,
    newBalanceDue,
    status,
  );
};