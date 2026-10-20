import { Response } from "express";

import {
  getWholesalerPendingUnpaidAmount,
} from "../services/customerBalance.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getWholesalerPendingUnpaidAmountController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const pharmaCompanyId =
        req.user?.companyId;

      const wholesalerCompanyId =
        String(req.params.wholesalerCompanyId);

      if (!pharmaCompanyId) {
        return res.status(403).json({
          success: false,
          message: "Company account required",
        });
      }

      if (!wholesalerCompanyId) {
        return res.status(400).json({
          success: false,
          message:
            "Wholesaler company ID is required",
        });
      }

      const balance =
        await getWholesalerPendingUnpaidAmount(
          pharmaCompanyId,
          wholesalerCompanyId,
        );

      return res.status(200).json({
        success: true,
        message:
          "Wholesaler pending unpaid amount fetched successfully",
        data: balance,
      });
    } catch (error) {
      console.error(
        "Get wholesaler pending unpaid amount error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch wholesaler pending unpaid amount",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  };