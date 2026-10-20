import prisma from "../config/prisma";

export const getLowStockInventory = async (
  companyId: string,
  threshold: number = 100
) => {
  return prisma.inventory.findMany({
    where: {
      warehouse: {
        companyId,
      },
      quantity: {
        lte: threshold,
      },
    },
    include: {
      warehouse: true,
      batch: {
        include: {
          medicine: true,
        },
      },
    },
    orderBy: {
      quantity: "asc",
    },
  });
};