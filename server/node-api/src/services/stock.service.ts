import {
  getLowStockInventory,
} from "../repositories/stock.repository";

export const getLowStock = async (
  companyId: string,
  threshold: number = 100
) => {
  return getLowStockInventory(
    companyId,
    threshold
  );
};