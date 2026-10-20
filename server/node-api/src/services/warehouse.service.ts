import {
  getWarehousesByCompany,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse as deleteWarehouseFromRepository,
} from "../repositories/warehouse.repository";


export const getWarehouses = async (companyId: string) => {
  return getWarehousesByCompany(companyId);
};

export const getWarehouse = async (
  warehouseId: string,
  companyId: string
) => {
  return getWarehouseById(warehouseId, companyId);
};

export const registerWarehouse = async (data: {
  companyId: string;
  warehouseName: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) => {
  return createWarehouse(data);
};

export const editWarehouse = async (
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
  return updateWarehouse(warehouseId, companyId, data);
};

export const removeWarehouse = async (
  warehouseId: string,
  companyId: string
) => {
  return deleteWarehouseFromRepository(
    warehouseId,
    companyId
  );
};