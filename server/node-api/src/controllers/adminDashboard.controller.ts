import { Response } from "express";

import {
  getAdminDashboard,
} from "../services/adminDashboard.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getAdminDashboardController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Make sure the request has an authenticated user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Make sure only Super Admin can access this API
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Super Admin access required",
      });
    }

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
      message: "Failed to fetch admin dashboard",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};