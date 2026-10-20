import {
  getSalesByCompany,
  getSaleById,
  createSale,
} from "../repositories/sale.repository";

export const getSales = async (
  companyId: string
) => {
  return getSalesByCompany(companyId);
};

export const getSale = async (
  saleId: string,
  companyId: string
) => {
  return getSaleById(saleId, companyId);
};

export const registerSale = async (data: {
  companyId: string;
  warehouseId: string;
  invoiceNumber: string;
  totalAmount: number;
  notes?: string;
  items: {
    batchId: string;
    quantity: number;
    unitPrice: number;
  }[];
}) => {
  return createSale(data);
};