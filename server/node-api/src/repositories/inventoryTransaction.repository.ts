import prisma from "../config/prisma";

export const getTransactionsByCompany = async (
  companyId: string
) => {
  return prisma.inventoryTransaction.findMany({
    where: {
      inventory: {
        warehouse: {
          companyId,
        },
      },
    },
    include: {
      inventory: {
        include: {
          warehouse: true,
          batch: {
            include: {
              medicine: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getTransactionById = async (
  transactionId: string,
  companyId: string
) => {
  return prisma.inventoryTransaction.findFirst({
    where: {
      id: transactionId,
      inventory: {
        warehouse: {
          companyId,
        },
      },
    },
    include: {
      inventory: {
        include: {
          warehouse: true,
          batch: {
            include: {
              medicine: true,
            },
          },
        },
      },
    },
  });
};

export const createInventoryTransaction = async (data: {
  inventoryId: string;
  type:
    | "PURCHASE"
    | "SALE"
    | "DISPATCH"
    | "RETURN"
    | "EXPIRY"
    | "DAMAGE"
    | "ADJUSTMENT";
  quantity: number;
  referenceId?: string;
  notes?: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: {
        id: data.inventoryId,
      },
    });

    if (!inventory) {
      throw new Error("Inventory item not found");
    }

    let quantityChange = 0;

    switch (data.type) {
      case "PURCHASE":
      case "RETURN":
        quantityChange = data.quantity;
        break;

      case "SALE":
      case "DISPATCH":
      case "EXPIRY":
      case "DAMAGE":
        quantityChange = -data.quantity;
        break;

      case "ADJUSTMENT":
        quantityChange = data.quantity;
        break;

      default:
        throw new Error("Invalid inventory transaction type");
    }

    const newQuantity =
      inventory.quantity + quantityChange;

    if (newQuantity < 0) {
      throw new Error("Insufficient inventory quantity");
    }

    const updatedInventory =
      await tx.inventory.update({
        where: {
          id: data.inventoryId,
        },
        data: {
          quantity: newQuantity,
        },
      });

    const transaction =
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: data.inventoryId,
          type: data.type,
          quantity: data.quantity,
          referenceId: data.referenceId,
          notes: data.notes,
        },
      });

    return {
      transaction,
      inventory: updatedInventory,
    };
  });
};