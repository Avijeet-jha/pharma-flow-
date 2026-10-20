import prisma from "../config/prisma";

export const getBatchesByMedicine = async (
  medicineId: string,
  companyId: string
) => {
  return prisma.medicineBatch.findMany({
    where: {
      medicineId,
      medicine: {
        companyId,
      },
    },
    orderBy: {
      expiryDate: "asc",
    },
  });
};

export const getBatchById = async (
  batchId: string,
  companyId: string
) => {
  return prisma.medicineBatch.findFirst({
    where: {
      id: batchId,
      medicine: {
        companyId,
      },
    },
    include: {
      medicine: true,
      inventory: {
        include: {
          warehouse: true,
        },
      },
    },
  });
};

export const createBatch = async (data: {
  medicineId: string;
  batchNumber: string;
  manufacturingDate: Date;
  expiryDate: Date;
  mrp: number;
  quantity: number;
}) => {
  return prisma.medicineBatch.create({
    data: {
      medicineId: data.medicineId,
      batchNumber: data.batchNumber,
      manufacturingDate: data.manufacturingDate,
      expiryDate: data.expiryDate,
      mrp: data.mrp,
      quantity: data.quantity,
    },
    include: {
      medicine: true,
    },
  });
};

export const updateBatch = async (
  batchId: string,
  companyId: string,
  data: {
    batchNumber?: string;
    manufacturingDate?: Date;
    expiryDate?: Date;
    mrp?: number;
    quantity?: number;
  }
) => {
  return prisma.medicineBatch.updateMany({
    where: {
      id: batchId,
      medicine: {
        companyId,
      },
    },
    data,
  });
};