import prisma from "../config/prisma";

// =========================================================
// GET INVENTORY BY COMPANY
// =========================================================

export const getInventoryByCompany = async (companyId: string) => {
  return prisma.inventory.findMany({
    where: {
      warehouse: {
        companyId,
      },
    },
    include: {
      warehouse: true,
      batch: {
        include: {
          medicine: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

// =========================================================
// GET INVENTORY BY ID
// =========================================================

export const getInventoryById = async (
  inventoryId: string,
  companyId: string
) => {
  return prisma.inventory.findFirst({
    where: {
      id: inventoryId,
      warehouse: {
        companyId,
      },
    },
    include: {
      warehouse: true,
      batch: {
        include: {
          medicine: {
            include: {
              category: true,
            },
          },
        },
      },
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });
};

// =========================================================
// CREATE INVENTORY
// =========================================================

export const createInventory = async (data: {
  warehouseId: string;
  batchId: string;
  quantity: number;
}) => {
  return prisma.inventory.upsert({
    where: {
      warehouseId_batchId: {
        warehouseId: data.warehouseId,
        batchId: data.batchId,
      },
    },
    update: {
      quantity: {
        increment: data.quantity,
      },
    },
    create: {
      warehouseId: data.warehouseId,
      batchId: data.batchId,
      quantity: data.quantity,
    },
    include: {
      warehouse: true,
      batch: {
        include: {
          medicine: true,
        },
      },
    },
  });
};

// =========================================================
// UPDATE INVENTORY QUANTITY
// =========================================================

export const updateInventoryQuantity = async (
  inventoryId: string,
  companyId: string,
  quantity: number
) => {
  const existing = await prisma.inventory.findFirst({
    where: {
      id: inventoryId,
      warehouse: {
        companyId,
      },
    },
  });

  if (!existing) {
    throw new Error("Inventory item not found");
  }

  return prisma.inventory.update({
    where: {
      id: inventoryId,
    },
    data: {
      quantity,
    },
    include: {
      warehouse: true,
      batch: {
        include: {
          medicine: true,
        },
      },
    },
  });
};

// =========================================================
// ADJUST INVENTORY (ADJUSTMENT OR DAMAGE)
// =========================================================

export const adjustInventory = async (data: {
  inventoryId: string;
  companyId: string;
  quantity: number;
  type: "ADJUSTMENT" | "DAMAGE";
  notes?: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.inventory.findFirst({
      where: {
        id: data.inventoryId,
        warehouse: {
          companyId: data.companyId,
        },
      },
    });

    if (!existing) {
      throw new Error("Inventory item not found");
    }

    let newQuantity = existing.quantity;
    let transactionQuantity = data.quantity;

    if (data.type === "DAMAGE") {
      if (data.quantity > existing.quantity) {
        throw new Error("Damage quantity cannot exceed current inventory");
      }
      newQuantity = existing.quantity - data.quantity;
      transactionQuantity = data.quantity;
    } else {
      // Target adjusted quantity
      transactionQuantity = Math.abs(data.quantity - existing.quantity);
      newQuantity = data.quantity;
    }

    const updated = await tx.inventory.update({
      where: {
        id: data.inventoryId,
      },
      data: {
        quantity: newQuantity,
      },
      include: {
        warehouse: true,
        batch: {
          include: {
            medicine: true,
          },
        },
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        inventoryId: data.inventoryId,
        type: data.type,
        quantity: transactionQuantity,
        notes: data.notes || `${data.type} adjustment applied`,
      },
    });

    return updated;
  });
};

// =========================================================
// GET AVAILABLE STOCK FOR MEDICINE
// =========================================================
// =========================================================
// GET LOW STOCK INVENTORY
// =========================================================

export const getLowStockInventory = async (
  companyId: string
) => {
  return prisma.inventory.findMany({
    where: {
      warehouse: {
        companyId,
      },
      quantity: {
        lte: 50,
      },
    },
    include: {
      warehouse: true,
      batch: {
        include: {
          medicine: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      quantity: "asc",
    },
  });
};