import prisma from "../config/prisma";

export const getWarehousesByCompany = async (
  companyId: string
) => {
  return prisma.warehouse.findMany({
    where: {
      companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getWarehouseById = async (
  warehouseId: string,
  companyId: string
) => {
  return prisma.warehouse.findFirst({
    where: {
      id: warehouseId,
      companyId,
    },
  });
};

export const createWarehouse = async (data: {
  companyId: string;
  warehouseName: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) => {
  return prisma.warehouse.create({
    data,
  });
};

export const updateWarehouse = async (
  warehouseId: string,
  companyId: string,
  data: {
    warehouseName?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }
) => {
  return prisma.warehouse.updateMany({
    where: {
      id: warehouseId,
      companyId,
    },
    data,
  });
};
export const deleteWarehouse = async (
  warehouseId: string,
  companyId: string
) => {
  return prisma.warehouse.deleteMany({
    where: {
      id: warehouseId,
      companyId,
    },
  });
};