import prisma from "../config/prisma";
import { Prisma } from "../generated/prisma";

// =========================================================
// SAFE COMPANY SELECT
// =========================================================
// Never return passwordHash from invoice APIs.
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
// DATABASE CLIENT TYPE
// =========================================================
//
// This allows the same invoice creation logic to work with:
// - normal Prisma client
// - Prisma transaction client
//
// This is important because Purchase Order confirmation
// will create the Invoice inside the SAME transaction.
// =========================================================

type InvoiceDatabase =
  | typeof prisma
  | Prisma.TransactionClient;

// =========================================================
// CREATE INVOICE RECORD
// =========================================================
//
// Internal helper.
//
// This function is used by:
// 1. Normal invoice service
// 2. Purchase Order confirmation transaction
//
// =========================================================

const createInvoiceRecord = async (
  db: InvoiceDatabase,
  data: {
    invoiceNumber: string;

    purchaseOrderId: string;

    sellerCompanyId: string;

    buyerCompanyId: string;

    sourceWarehouseId?: string | null;

    destinationWarehouseId?: string | null;

    invoiceDate?: Date;

    dueDate?: Date | null;

    placeOfSupply?: string | null;

    paymentTerms?: string | null;

    status?:
      | "DRAFT"
      | "GENERATED"
      | "SENT"
      | "PARTIALLY_PAID"
      | "PAID"
      | "OVERDUE"
      | "CANCELLED";

    subtotal: number;

    discountAmount: number;

    taxableAmount: number;

    cgstAmount: number;

    sgstAmount: number;

    igstAmount: number;

    totalGst: number;

    totalAmount: number;

    paidAmount?: number;

    balanceDue?: number;

    items: {
      medicineId: string;

      batchId: string;

      quantity: number;

      unit: string;

      unitPrice: number;

      discountPercent?: number;

      taxableValue: number;

      gstPercent?: number;

      gstAmount: number;

      amount: number;
    }[];
  },
) => {
  return db.invoice.create({
    data: {
      invoiceNumber: data.invoiceNumber,

      purchaseOrderId:
        data.purchaseOrderId,

      sellerCompanyId:
        data.sellerCompanyId,

      buyerCompanyId:
        data.buyerCompanyId,

      sourceWarehouseId:
        data.sourceWarehouseId ?? null,

      destinationWarehouseId:
        data.destinationWarehouseId ?? null,

      invoiceDate:
        data.invoiceDate ?? new Date(),

      dueDate:
        data.dueDate ?? null,

      placeOfSupply:
        data.placeOfSupply ?? null,

      paymentTerms:
        data.paymentTerms ?? null,

      status:
        data.status ?? "GENERATED",

      subtotal:
        data.subtotal,

      discountAmount:
        data.discountAmount,

      taxableAmount:
        data.taxableAmount,

      cgstAmount:
        data.cgstAmount,

      sgstAmount:
        data.sgstAmount,

      igstAmount:
        data.igstAmount,

      totalGst:
        data.totalGst,

      totalAmount:
        data.totalAmount,

      paidAmount:
        data.paidAmount ?? 0,

      balanceDue:
        data.balanceDue ??
        data.totalAmount,

      items: {
        create: data.items.map(
          (item) => ({
            medicineId:
              item.medicineId,

            batchId:
              item.batchId,

            quantity:
              item.quantity,

            unit:
              item.unit,

            unitPrice:
              item.unitPrice,

            discountPercent:
              item.discountPercent ?? 0,

            taxableValue:
              item.taxableValue,

            gstPercent:
              item.gstPercent ?? 0,

            gstAmount:
              item.gstAmount,

            amount:
              item.amount,
          }),
        ),
      },
    },

    include: {
      sellerCompany: {
        select: companySelect,
      },

      buyerCompany: {
        select: companySelect,
      },

      sourceWarehouse: true,

      destinationWarehouse: true,

      items: {
        include: {
          medicine: true,
          batch: true,
        },
      },
    },
  });
};

// =========================================================
// CREATE INVOICE
// =========================================================
//
// Normal invoice creation.
//
// Used by invoice.service.ts
//
// =========================================================

export const createInvoice = async (
  data: Parameters<
    typeof createInvoiceRecord
  >[1],
) => {
  return createInvoiceRecord(
    prisma,
    data,
  );
};

// =========================================================
// CREATE INVOICE INSIDE TRANSACTION
// =========================================================
//
// IMPORTANT
//
// Used by Purchase Order confirmation.
//
// Invoice creation, PO confirmation,
// CustomerBalance update and notification
// can therefore happen atomically.
// =========================================================

export const createInvoiceInTransaction =
  async (
    tx: Prisma.TransactionClient,
    data: Parameters<
      typeof createInvoiceRecord
    >[1],
  ) => {
    return createInvoiceRecord(
      tx,
      data,
    );
  };

// =========================================================
// GET ALL INVOICES
// =========================================================

export const getInvoicesByCompany =
  async (companyId: string) => {
    return prisma.invoice.findMany({
      where: {
        OR: [
          {
            sellerCompanyId:
              companyId,
          },
          {
            buyerCompanyId:
              companyId,
          },
        ],
      },

      include: {
        sellerCompany: {
          select: companySelect,
        },

        buyerCompany: {
          select: companySelect,
        },

        sourceWarehouse: true,

        destinationWarehouse: true,

        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },

      orderBy: {
        invoiceDate: "desc",
      },
    });
  };

// =========================================================
// GET INVOICE BY ID
// =========================================================

export const getInvoiceById =
  async (
    invoiceId: string,
    companyId: string,
  ) => {
    return prisma.invoice.findFirst({
      where: {
        id: invoiceId,

        OR: [
          {
            sellerCompanyId:
              companyId,
          },
          {
            buyerCompanyId:
              companyId,
          },
        ],
      },

      include: {
        sellerCompany: {
          select: companySelect,
        },

        buyerCompany: {
          select: companySelect,
        },

        sourceWarehouse: true,

        destinationWarehouse: true,

        purchaseOrder: true,

        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
    });
  };

// =========================================================
// GET INVOICE BY PURCHASE ORDER
// =========================================================

export const getInvoiceByPurchaseOrder = async (
  purchaseOrderId: string,
  companyId?: string,
) => {
    return prisma.invoice.findFirst({
      where: {
        purchaseOrderId,

        OR: [
          {
            sellerCompanyId:
              companyId,
          },
          {
            buyerCompanyId:
              companyId,
          },
        ],
      },

      include: {
        sellerCompany: {
          select: companySelect,
        },

        buyerCompany: {
          select: companySelect,
        },

        sourceWarehouse: true,

        destinationWarehouse: true,

        purchaseOrder: true,

        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
    });
  };

// =========================================================
// UPDATE INVOICE STATUS
// =========================================================

export const updateInvoiceStatus =
  async (
    invoiceId: string,
    status:
      | "DRAFT"
      | "GENERATED"
      | "SENT"
      | "PARTIALLY_PAID"
      | "PAID"
      | "OVERDUE"
      | "CANCELLED",
  ) => {
    return prisma.invoice.update({
      where: {
        id: invoiceId,
      },

      data: {
        status,
      },

      include: {
        sellerCompany: {
          select: companySelect,
        },

        buyerCompany: {
          select: companySelect,
        },

        sourceWarehouse: true,

        destinationWarehouse: true,

        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
    });
  };

// =========================================================
// RECORD INVOICE PAYMENT
// =========================================================

export const recordInvoicePayment =
  async (
    invoiceId: string,
    paymentAmount: number,
  ) => {
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

    return prisma.$transaction(
      async (
        tx: Prisma.TransactionClient,
      ) => {
        const invoice =
          await tx.invoice.findUnique({
            where: {
              id: invoiceId,
            },
          });

        if (!invoice) {
          throw new Error(
            "Invoice not found",
          );
        }

        if (
          invoice.status ===
            "CANCELLED"
        ) {
          throw new Error(
            "Cannot record payment for a cancelled invoice",
          );
        }

        const currentPaid =
          Number(invoice.paidAmount);

        const totalAmount =
          Number(invoice.totalAmount);

        const currentBalance =
          Number(invoice.balanceDue);

        if (
          paymentAmount >
          currentBalance
        ) {
          throw new Error(
            `Payment cannot exceed balance due of ${currentBalance}`,
          );
        }

        const newPaidAmount =
          currentPaid +
          paymentAmount;

        const newBalance =
          totalAmount -
          newPaidAmount;

        let newStatus:
          | "PARTIALLY_PAID"
          | "PAID";

        if (
          newBalance <= 0
        ) {
          newStatus = "PAID";
        } else {
          newStatus =
            "PARTIALLY_PAID";
        }

        const updatedInvoice =
          await tx.invoice.update({
            where: {
              id: invoiceId,
            },

            data: {
              paidAmount:
                newPaidAmount,

              balanceDue:
                Math.max(
                  newBalance,
                  0,
                ),

              status:
                newStatus,
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

              sourceWarehouse:
                true,

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

        // -----------------------------------------------------
        // Keep CustomerBalance synchronized
        // -----------------------------------------------------

        await tx.customerBalance.updateMany(
          {
            where: {
              pharmaCompanyId:
                invoice.sellerCompanyId,

              wholesalerCompanyId:
                invoice.buyerCompanyId,
            },

            data: {
              paidAmount: {
                increment:
                  paymentAmount,
              },
            },
          },
        );

        return updatedInvoice;
      },
    );
  };

  // =========================================================
// UPDATE INVOICE PAYMENT
// =========================================================

export const updateInvoicePayment = async (
  invoiceId: string,
  paidAmount: number,
  balanceDue: number,
  status:
    | "GENERATED"
    | "SENT"
    | "PARTIALLY_PAID"
    | "PAID"
    | "OVERDUE",
) => {
  return prisma.$transaction(
    async (
      tx: Prisma.TransactionClient,
    ) => {
      // -----------------------------------------------------
      // 1. Find invoice
      // -----------------------------------------------------

      const invoice =
        await tx.invoice.findUnique({
          where: {
            id: invoiceId,
          },
        });

      if (!invoice) {
        throw new Error(
          "Invoice not found",
        );
      }

      // -----------------------------------------------------
      // 2. Validate payment values
      // -----------------------------------------------------

      if (paidAmount < 0) {
        throw new Error(
          "Paid amount cannot be negative",
        );
      }

      if (balanceDue < 0) {
        throw new Error(
          "Balance due cannot be negative",
        );
      }

      if (
        paidAmount >
        Number(invoice.totalAmount)
      ) {
        throw new Error(
          "Paid amount cannot exceed invoice total amount",
        );
      }

      // -----------------------------------------------------
      // 3. Calculate newly received payment
      // -----------------------------------------------------

      const previousPaidAmount =
        Number(invoice.paidAmount);

      const paymentDifference =
        paidAmount -
        previousPaidAmount;

      // -----------------------------------------------------
      // 4. Update invoice
      // -----------------------------------------------------

      const updatedInvoice =
        await tx.invoice.update({
          where: {
            id: invoiceId,
          },

          data: {
            paidAmount,

            balanceDue,

            status,
          },

          include: {
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
                createdAt: true,
                updatedAt: true,
              },
            },

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
                createdAt: true,
                updatedAt: true,
              },
            },

            sourceWarehouse: true,

            destinationWarehouse: true,

            items: {
              include: {
                medicine: true,
                batch: true,
              },
            },
          },
        });

      // -----------------------------------------------------
      // 5. Update Customer Balance
      // -----------------------------------------------------

      if (
        paymentDifference > 0
      ) {
        await tx.customerBalance.updateMany({
          where: {
            pharmaCompanyId:
              invoice.sellerCompanyId,

            wholesalerCompanyId:
              invoice.buyerCompanyId,
          },

          data: {
            paidAmount: {
              increment:
                paymentDifference,
            },
          },
        });
      }

      // -----------------------------------------------------
      // 6. Return updated invoice
      // -----------------------------------------------------

      return updatedInvoice;
    },
  );
};