import { Response } from "express";

import {
  getDashboard,
  getAdminDashboard,
} from "../services/dashboard.service";

import {
  AuthRequest,
} from "../middlewares/auth.middleware";

// ==========================================
// COMPANY DASHBOARD
// Pharma / Wholesaler / Retailer
// ==========================================

export const getDashboardController = async (
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

    const dashboard = await getDashboard(companyId);

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};


// ==========================================
// SUPER ADMIN DASHBOARD
// ==========================================

export const getAdminDashboardController = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const dashboard = await getAdminDashboard();

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error(
      "Get admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard data",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};