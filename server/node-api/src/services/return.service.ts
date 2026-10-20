import {
  createSaleReturn,
} from "../repositories/return.repository";

export const returnSale = async (
  saleId: string,
  companyId: string
) => {
  return createSaleReturn({
    saleId,
    companyId,
  });
};