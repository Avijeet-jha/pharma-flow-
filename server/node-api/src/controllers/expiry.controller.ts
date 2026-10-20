import { Response } from "express";

import {
  getExpiringMedicines,
  getExpiredMedicines,
} from "../services/expiry.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getExpiringController = async (
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

    const days = Number(req.query.days) || 30;

    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: "Days must be greater than zero",
      });
    }

    const batches =
      await getExpiringMedicines(
        companyId,
        days
      );

    return res.status(200).json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error(
      "Get expiring medicines error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expiring medicines",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

export const getExpiredController = async (
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

    const batches =
      await getExpiredMedicines(companyId);

    return res.status(200).json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error(
      "Get expired medicines error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expired medicines",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};