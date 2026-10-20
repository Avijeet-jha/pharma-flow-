import { Response } from "express";

import { returnSale } from "../services/return.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const createReturnController = async (
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

    const saleId = String(req.params.saleId);

    if (!saleId) {
      return res.status(400).json({
        success: false,
        message: "Sale ID is required",
      });
    }

    const sale = await returnSale(
      saleId,
      companyId
    );

    return res.status(200).json({
      success: true,
      message: "Sale returned successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Return sale error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};