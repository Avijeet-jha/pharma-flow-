import prisma from "../config/prisma";

export const getExpiringBatches = async (
  companyId: string,
  days: number = 30
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryLimit = new Date(today);
  expiryLimit.setDate(expiryLimit.getDate() + days);
  expiryLimit.setHours(23, 59, 59, 999);

  return prisma.medicineBatch.findMany({
    where: {
      expiryDate: {
        gte: today,
        lte: expiryLimit,
      },

      inventory: {
        some: {
          warehouse: {
            companyId,
          },
          quantity: {
            gt: 0,
          },
        },
      },
    },

    include: {
      medicine: true,
      inventory: {
        where: {
          warehouse: {
            companyId,
          },
          quantity: {
            gt: 0,
          },
        },
        include: {
          warehouse: true,
        },
      },
    },

    orderBy: {
      expiryDate: "asc",
    },
  });
};

export const getExpiredBatches = async (
  companyId: string
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.medicineBatch.findMany({
    where: {
      expiryDate: {
        lt: today,
      },

      inventory: {
        some: {
          warehouse: {
            companyId,
          },
          quantity: {
            gt: 0,
          },
        },
      },
    },

    include: {
      medicine: true,
      inventory: {
        where: {
          warehouse: {
            companyId,
          },
          quantity: {
            gt: 0,
          },
        },
        include: {
          warehouse: true,
        },
      },
    },

    orderBy: {
      expiryDate: "asc",
    },
  });
};