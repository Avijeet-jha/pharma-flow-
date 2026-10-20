import {
  getMedicinesByCompany,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deactivateMedicine,
} from "../repositories/medicine.repository";

export const getMedicines = async (companyId: string) => {
  return getMedicinesByCompany(companyId);
};

export const getMedicine = async (
  medicineId: string,
  companyId: string
) => {
  return getMedicineById(medicineId, companyId);
};

export const registerMedicine = async (data: {
  companyId: string;
  categoryId: string;
  medicineName: string;
  genericName?: string;
  strength: string;
  dosageForm: string;
  description?: string;
}) => {
  return createMedicine(data);
};

export const editMedicine = async (
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
  return updateMedicine(medicineId, companyId, data);
};

export const disableMedicine = async (
  medicineId: string,
  companyId: string
) => {
  return deactivateMedicine(medicineId, companyId);
};