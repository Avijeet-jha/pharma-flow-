import { Response } from "express";

import {
  getInventoryTransactions,
  getInventoryTransaction,
} from "../services/inventoryTransaction.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getInventoryTransactionsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    const transactions = await getInventoryTransactions(companyId);

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Get inventory transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory transactions",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

export const getInventoryTransactionController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;
    const id = String(req.params.id);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const transaction = await getInventoryTransaction(
      id,
      companyId
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Inventory transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error(
      "Get inventory transaction error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory transaction",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};