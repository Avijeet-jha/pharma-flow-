import {
  getBatchesByMedicine,
  getBatchById,
  createBatch,
  updateBatch,
} from "../repositories/medicineBatch.repository";

export const getMedicineBatches = async (
  medicineId: string,
  companyId: string
) => {
  return getBatchesByMedicine(medicineId, companyId);
};

export const getMedicineBatch = async (
  batchId: string,
  companyId: string
) => {
  return getBatchById(batchId, companyId);
};

export const registerMedicineBatch = async (data: {
  medicineId: string;
  batchNumber: string;
  manufacturingDate: Date;
  expiryDate: Date;
  mrp: number;
  quantity: number;
}) => {
  return createBatch(data);
};

export const editMedicineBatch = async (
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
  return updateBatch(batchId, companyId, data);
};