import {
  getTransactionsByCompany,
  getTransactionById,
  createInventoryTransaction,
} from "../repositories/inventoryTransaction.repository";

export const getInventoryTransactions = async (
  companyId: string
) => {
  return getTransactionsByCompany(companyId);
};

export const getInventoryTransaction = async (
  transactionId: string,
  companyId: string
) => {
  return getTransactionById(transactionId, companyId);
};

export const createInventoryMovement = async (data: {
  inventoryId: string;
  type:
    | "PURCHASE"
    | "SALE"
    | "DISPATCH"
    | "RETURN"
    | "EXPIRY"
    | "DAMAGE"
    | "ADJUSTMENT";
  quantity: number;
  referenceId?: string;
  notes?: string;
}) => {
  return createInventoryTransaction(data);
};