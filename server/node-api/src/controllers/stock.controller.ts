import { Response } from "express";

import { getLowStock } from "../services/stock.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getLowStockController = async (
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

    const threshold =
      Number(req.query.threshold) || 100;

    if (threshold < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Threshold cannot be negative",
      });
    }

    const inventory = await getLowStock(
      companyId,
      threshold
    );

    return res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error(
      "Get low stock error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch low stock inventory",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};