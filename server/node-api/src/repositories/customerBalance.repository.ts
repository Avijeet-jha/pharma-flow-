import prisma from "../config/prisma";

export const getPendingUnpaidAmount = async (
  pharmaCompanyId: string,
  wholesalerCompanyId: string,
) => {
  const balance = await prisma.customerBalance.findUnique({
    where: {
      pharmaCompanyId_wholesalerCompanyId: {
        pharmaCompanyId,
        wholesalerCompanyId,
      },
    },
  });

  if (!balance) {
    return {
      totalAmount: 0,
      paidAmount: 0,
      pendingUnpaidAmount: 0,
    };
  }

  const pendingUnpaidAmount =
    Number(balance.totalAmount) - Number(balance.paidAmount);

  return {
    totalAmount: Number(balance.totalAmount),
    paidAmount: Number(balance.paidAmount),
    pendingUnpaidAmount: Math.max(0, pendingUnpaidAmount),
  };
};