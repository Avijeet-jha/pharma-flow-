import prisma from "../config/prisma";
import { Prisma } from "../generated/prisma";

// =========================================================
// TYPES
// =========================================================

type CreatePurchaseRequestItem = {
  medicineId: string;
  requestedQuantity: number;
};

type CreatePurchaseRequestData = {
  requestNumber: string;
  buyerCompanyId: string;
  sellerCompanyId: string;
  preferredDeliveryDate?: Date;
  requirement?: string;
  items: CreatePurchaseRequestItem[];
};

type ApprovalItem = {
  itemId: string;
  approvedQuantity: number;
  unitPrice: number;
  batchId: string;
};

// =========================================================
// GET ALL PURCHASE REQUESTS
// =========================================================

export const getPurchaseRequestsByCompany = async (companyId: string) => {
  return prisma.purchaseRequest.findMany({
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
        select: {
          id: true,
          companyName: true,
          companyType: true,
          city: true,
          state: true,
        },
      },

      sellerCompany: {
        select: {
          id: true,
          companyName: true,
          companyType: true,
          city: true,
          state: true,
        },
      },

      items: {
        include: {
          medicine: {
            select: {
              id: true,
              medicineName: true,
              genericName: true,
              strength: true,
              dosageForm: true,
            },
          },

          batch: {
            select: {
              id: true,
              batchNumber: true,
              manufacturingDate: true,
              expiryDate: true,
              mrp: true,
              quantity: true,
            },
          },
        },
      },

      purchaseOrder: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

// =========================================================
// GET PURCHASE REQUEST BY ID
// =========================================================

export const getPurchaseRequestById = async (
  requestId: string,
  companyId: string,
) => {
  return prisma.purchaseRequest.findFirst({
    where: {
      id: requestId,

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
        select: {
          id: true,
          companyName: true,
          companyType: true,
          city: true,
          state: true,
        },
      },

      sellerCompany: {
        select: {
          id: true,
          companyName: true,
          companyType: true,
          city: true,
          state: true,
        },
      },

      items: {
        include: {
          medicine: {
            select: {
              id: true,
              medicineName: true,
              genericName: true,
              strength: true,
              dosageForm: true,
            },
          },

          batch: {
            select: {
              id: true,
              batchNumber: true,
              manufacturingDate: true,
              expiryDate: true,
              mrp: true,
              quantity: true,
            },
          },
        },
      },

      purchaseOrder: true,
    },
  });
};

// =========================================================
// CREATE PURCHASE REQUEST
// =========================================================
//
// Buyer creates the request.
//
// Buyer provides:
// - Supplier
// - Medicine
// - Quantity
// - Requirement
// - Preferred delivery date
//
// Buyer does NOT decide:
// - Selling price
// - Approved quantity
// - Batch
//
// Those are decided by the supplier during approval.
// =========================================================

export const createPurchaseRequest = async (
  data: CreatePurchaseRequestData,
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // -----------------------------------------------
    // Buyer and seller cannot be the same
    // -----------------------------------------------

    if (data.buyerCompanyId === data.sellerCompanyId) {
      throw new Error("Buyer and seller companies cannot be the same");
    }

    // -----------------------------------------------
    // Items validation
    // -----------------------------------------------

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("At least one purchase request item is required");
    }

    // -----------------------------------------------
    // Validate every medicine
    // -----------------------------------------------

    for (const item of data.items) {
      if (!item.medicineId) {
        throw new Error(
          "Medicine ID is required for every purchase request item",
        );
      }

      if (
        !Number.isInteger(item.requestedQuantity) ||
        item.requestedQuantity <= 0
      ) {
        throw new Error("Requested quantity must be a positive integer");
      }

      // Medicine must belong to selected supplier

      const medicine = await tx.medicine.findFirst({
        where: {
          id: item.medicineId,

          companyId: data.sellerCompanyId,

          isActive: true,
        },
      });

      if (!medicine) {
        throw new Error(
          `Medicine ${item.medicineId} does not belong to the selected supplier`,
        );
      }
    }

    // -----------------------------------------------
    // Create purchase request
    // -----------------------------------------------

    return tx.purchaseRequest.create({
      data: {
        requestNumber: data.requestNumber,

        buyerCompanyId: data.buyerCompanyId,

        sellerCompanyId: data.sellerCompanyId,

        preferredDeliveryDate: data.preferredDeliveryDate,

        requirement: data.requirement,

        status: "PENDING",

        items: {
          create: data.items.map((item) => ({
            medicineId: item.medicineId,

            requestedQuantity: item.requestedQuantity,
          })),
        },
      },

      include: {
        buyerCompany: {
          select: {
            id: true,
            companyName: true,
            companyType: true,
          },
        },

        sellerCompany: {
          select: {
            id: true,
            companyName: true,
            companyType: true,
          },
        },

        items: {
          include: {
            medicine: true,
          },
        },
      },
    });
  });
};

// =========================================================
// APPROVE PURCHASE REQUEST
// =========================================================
//
// Supplier/Pharma decides:
// - Approved quantity
// - Selling price
// - Batch
//
// Buyer cannot decide these values.
// =========================================================

export const approvePurchaseRequest = async (
  requestId: string,
  companyId: string,
  items: ApprovalItem[],
  preferredDeliveryDate?: Date,
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // -----------------------------------------------
    // Find request
    // -----------------------------------------------

    const request = await tx.purchaseRequest.findFirst({
      where: {
        id: requestId,

        sellerCompanyId: companyId,
      },

      include: {
        items: true,
      },
    });

    if (!request) {
      throw new Error("Purchase request not found");
    }

    // -----------------------------------------------
    // Only PENDING request can be approved
    // -----------------------------------------------

    if (request.status !== "PENDING") {
      throw new Error("Only pending purchase requests can be approved");
    }

    // -----------------------------------------------
    // Every request item must be handled
    // -----------------------------------------------

    if (!Array.isArray(items) || items.length !== request.items.length) {
      throw new Error("Approval details are required for every request item");
    }

    // -----------------------------------------------
    // Validate approval details
    // -----------------------------------------------

    for (const approvalItem of items) {
      const requestItem = request.items.find(
        (item) => item.id === approvalItem.itemId,
      );

      if (!requestItem) {
        throw new Error(
          `Purchase request item ${approvalItem.itemId} not found`,
        );
      }

      // ---------------------------------------------
      // Approved quantity
      // ---------------------------------------------

      if (
        !Number.isInteger(approvalItem.approvedQuantity) ||
        approvalItem.approvedQuantity <= 0
      ) {
        throw new Error("Approved quantity must be a positive integer");
      }

      if (approvalItem.approvedQuantity > requestItem.requestedQuantity) {
        throw new Error("Approved quantity cannot exceed requested quantity");
      }

      // ---------------------------------------------
      // Selling price
      // ---------------------------------------------

      if (
        !Number.isFinite(approvalItem.unitPrice) ||
        approvalItem.unitPrice < 0
      ) {
        throw new Error("Selling price must be a valid non-negative number");
      }

      // ---------------------------------------------
      // Batch required
      // ---------------------------------------------

      if (!approvalItem.batchId) {
        throw new Error("Batch is required for every approved item");
      }

      // ---------------------------------------------
      // Validate batch
      // ---------------------------------------------

      const batch = await tx.medicineBatch.findFirst({
        where: {
          id: approvalItem.batchId,

          medicineId: requestItem.medicineId,
        },

        include: {
          medicine: {
            select: {
              companyId: true,
            },
          },
        },
      });

      if (!batch) {
        throw new Error(
          "Selected batch does not belong to the requested medicine",
        );
      }

      // ---------------------------------------------
      // Batch must belong to supplier
      // ---------------------------------------------

      if (batch.medicine.companyId !== companyId) {
        throw new Error("Selected batch does not belong to your company");
      }

      // ---------------------------------------------
      // Check batch quantity
      // ---------------------------------------------

      if (batch.quantity < approvalItem.approvedQuantity) {
        throw new Error(
          `Insufficient available quantity for batch ${batch.batchNumber}`,
        );
      }
    }

    // -----------------------------------------------
    // Update request items
    // -----------------------------------------------

    for (const approvalItem of items) {
      await tx.purchaseRequestItem.update({
        where: {
          id: approvalItem.itemId,
        },

        data: {
          approvedQuantity: approvalItem.approvedQuantity,

          unitPrice: approvalItem.unitPrice,

          batchId: approvalItem.batchId,
        },
      });
    }

    // -----------------------------------------------
    // Mark request APPROVED
    // -----------------------------------------------

    return tx.purchaseRequest.update({
      where: {
        id: requestId,
      },

      data: {
        status: "APPROVED",

        preferredDeliveryDate:
          preferredDeliveryDate ?? request.preferredDeliveryDate,
      },

      include: {
        buyerCompany: {
          select: {
            id: true,
            companyName: true,
            companyType: true,
          },
        },

        sellerCompany: {
          select: {
            id: true,
            companyName: true,
            companyType: true,
          },
        },

        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
    });
  });
};

// =========================================================
// REJECT PURCHASE REQUEST
// =========================================================
//
// Only supplier can reject.
// =========================================================

export const rejectPurchaseRequest = async (
  requestId: string,
  companyId: string,
) => {
  const request = await prisma.purchaseRequest.findFirst({
    where: {
      id: requestId,

      sellerCompanyId: companyId,
    },
  });

  if (!request) {
    throw new Error("Purchase request not found or you are not the supplier");
  }

  if (request.status !== "PENDING") {
    throw new Error(
      `Purchase request cannot be rejected from ${request.status} status`,
    );
  }

  return prisma.purchaseRequest.update({
    where: {
      id: requestId,
    },

    data: {
      status: "REJECTED",
    },

    include: {
      items: true,
    },
  });
};

// =========================================================
// CANCEL PURCHASE REQUEST
// =========================================================
//
// Buyer can cancel while:
// - PENDING
// - APPROVED
//
// Once accepted and PO exists, buyer cannot cancel the
// purchase request through this endpoint.
// =========================================================

export const cancelPurchaseRequest = async (
  requestId: string,
  companyId: string,
) => {
  const request = await prisma.purchaseRequest.findFirst({
    where: {
      id: requestId,

      buyerCompanyId: companyId,
    },
  });

  if (!request) {
    throw new Error("Purchase request not found or you are not the buyer");
  }

  if (request.status !== "PENDING" && request.status !== "APPROVED") {
    throw new Error(
      `Purchase request cannot be cancelled from ${request.status} status`,
    );
  }

  return prisma.purchaseRequest.update({
    where: {
      id: requestId,
    },

    data: {
      status: "CANCELLED",
    },

    include: {
      items: true,
    },
  });
};

// =========================================================
// ACCEPT PURCHASE REQUEST
// =========================================================
//
// Buyer accepts supplier's commercial terms.
//
// This creates the confirmed Purchase Order.
//
// Request:
//     APPROVED
//
// Then:
//     Purchase Order created
//     Purchase Request -> ACCEPTED
// =========================================================

export const acceptPurchaseRequest = async (
  requestId: string,
  companyId: string,
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // -----------------------------------------------
    // Find request
    // -----------------------------------------------

    const request = await tx.purchaseRequest.findFirst({
      where: {
        id: requestId,

        buyerCompanyId: companyId,
      },

      include: {
        items: true,

        purchaseOrder: true,
      },
    });

    if (!request) {
      throw new Error("Purchase request not found or you are not the buyer");
    }

    // -----------------------------------------------
    // Must be APPROVED
    // -----------------------------------------------

    if (request.status !== "APPROVED") {
      throw new Error("Only an approved purchase request can be accepted");
    }

    // -----------------------------------------------
    // Prevent duplicate PO
    // -----------------------------------------------

    if (request.purchaseOrder) {
      throw new Error("Purchase order already exists for this request");
    }

    // -----------------------------------------------
    // Validate final commercial details
    // -----------------------------------------------

    for (const item of request.items) {
      if (
        item.approvedQuantity === null ||
        item.unitPrice === null ||
        item.batchId === null
      ) {
        throw new Error(
          "All purchase request items must have approved quantity, price and batch",
        );
      }
    }

    // -----------------------------------------------
    // Generate PO number
    // -----------------------------------------------

    const orderNumber = `PO-${Date.now()}`;

    // -----------------------------------------------
    // Create Purchase Order
    // -----------------------------------------------

    const purchaseOrder = await tx.purchaseOrder.create({
      data: {
        orderNumber,

        purchaseRequestId: request.id,

        buyerCompanyId: request.buyerCompanyId,

        sellerCompanyId: request.sellerCompanyId,

        status: "APPROVED",

        expectedDate: request.preferredDeliveryDate,

        notes: request.requirement,

        items: {
          create: request.items.map((item) => ({
            medicineId: item.medicineId,

            batchId: item.batchId,

            requestedQuantity: item.requestedQuantity,

            quantity: item.approvedQuantity!,

            unitPrice: item.unitPrice!,

            totalPrice:
              Number(item.approvedQuantity!) * Number(item.unitPrice!),
          })),
        },
      },

      include: {
        buyerCompany: {
          select: {
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
          },
        },

        sellerCompany: {
          select: {
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
          },
        },

        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
    });

    // -----------------------------------------------
    // Mark Purchase Request ACCEPTED
    // -----------------------------------------------

    await tx.purchaseRequest.update({
      where: {
        id: requestId,
      },

      data: {
        status: "ACCEPTED",
      },
    });

    return purchaseOrder;
  });
};

// =========================================================
// DECLINE PURCHASE REQUEST
// =========================================================
//
// Buyer declines supplier's approved terms.
// =========================================================

export const declinePurchaseRequest = async (
  requestId: string,
  companyId: string,
) => {
  const request = await prisma.purchaseRequest.findFirst({
    where: {
      id: requestId,

      buyerCompanyId: companyId,
    },
  });

  if (!request) {
    throw new Error("Purchase request not found or you are not the buyer");
  }

  if (request.status !== "APPROVED") {
    throw new Error("Only approved purchase requests can be declined");
  }

  return prisma.purchaseRequest.update({
    where: {
      id: requestId,
    },

    data: {
      status: "DECLINED",
    },

    include: {
      items: true,
    },
  });
};
