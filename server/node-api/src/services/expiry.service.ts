import {
  getExpiringBatches,
  getExpiredBatches,
} from "../repositories/expiry.repository";

export const getExpiringMedicines = async (
  companyId: string,
  days: number = 30
) => {
  return getExpiringBatches(companyId, days);
};

export const getExpiredMedicines = async (
  companyId: string
) => {
  return getExpiredBatches(companyId);
};