import { Response } from "express";

import { fetchCategories } from "../services/category.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getCategoriesController = async (
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

    const categories = await fetchCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};