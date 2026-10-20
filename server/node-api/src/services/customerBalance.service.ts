import {
  getPendingUnpaidAmount,
} from "../repositories/customerBalance.repository";

export const getWholesalerPendingUnpaidAmount = async (
  pharmaCompanyId: string,
  wholesalerCompanyId: string,
) => {
  return getPendingUnpaidAmount(
    pharmaCompanyId,
    wholesalerCompanyId,
  );
};