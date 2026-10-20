import prisma from "../config/prisma";

export const getMedicinesByCompany = async (
  companyId: string
) => {
  return prisma.medicine.findMany({
    where: {
      companyId,
    },
    include: {
      category: true,
      batches: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getMedicineById = async (
  medicineId: string,
  companyId: string
) => {
  return prisma.medicine.findFirst({
    where: {
      id: medicineId,
      companyId,
    },
    include: {
      category: true,
      batches: true,
    },
  });
};

export const createMedicine = async (data: {
  companyId: string;
  categoryId: string;
  medicineName: string;
  genericName?: string;
  strength: string;
  dosageForm: string;
  description?: string;
}) => {
  return prisma.medicine.create({
    data,
    include: {
      category: true,
      batches: true,
    },
  });
};

export const updateMedicine = async (
  medicineId: string,
  companyId: string,
  data: {
    categoryId?: string;
    medicineName?: string;
    genericName?: string;
    strength?: string;
    dosageForm?: string;
    description?: string;
    isActive?: boolean;
  }
) => {
  return prisma.medicine.updateMany({
    where: {
      id: medicineId,
      companyId,
    },
    data,
  });
};

export const deactivateMedicine = async (
  medicineId: string,
  companyId: string
) => {
  return prisma.medicine.updateMany({
    where: {
      id: medicineId,
      companyId,
    },
    data: {
      isActive: false,
    },
  });
};