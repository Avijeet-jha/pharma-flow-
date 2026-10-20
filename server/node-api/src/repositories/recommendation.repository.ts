import prisma from "../config/prisma";

export const getRecommendationData = async (
  companyId: string,
  days: number = 30
) => {
  const since = new Date();

  since.setDate(since.getDate() - days);

  const inventory = await prisma.inventory.findMany({
    where: {
      warehouse: {
        companyId,
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
  });

  const sales = await prisma.saleItem.findMany({
    where: {
      sale: {
        companyId,
        status: "COMPLETED",
        saleDate: {
          gte: since,
        },
      },
    },
    include: {
      batch: {
        include: {
          medicine: true,
        },
      },
    },
  });

  return {
    inventory,
    sales,
  };
};