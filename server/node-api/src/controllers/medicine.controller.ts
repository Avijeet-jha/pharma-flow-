import { Response } from "express";

import {
  getMedicines,
  getMedicine,
  registerMedicine,
  editMedicine,
  disableMedicine,
} from "../services/medicine.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getMedicinesController = async (
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

    const medicines = await getMedicines(companyId);

    return res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (error) {
    console.error("Get medicines error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicines",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getMedicineController = async (
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
        message: "Medicine ID is required",
      });
    }

    const medicine = await getMedicine(id, companyId);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    console.error("Get medicine error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicine",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createMedicineController = async (
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

    const {
      categoryId,
      medicineName,
      genericName,
      strength,
      dosageForm,
      description,
    } = req.body;

    if (
      !categoryId ||
      !medicineName ||
      !strength ||
      !dosageForm
    ) {
      return res.status(400).json({
        success: false,
        message:
          "categoryId, medicineName, strength and dosageForm are required",
      });
    }

    const medicine = await registerMedicine({
      companyId,
      categoryId,
      medicineName,
      genericName,
      strength,
      dosageForm,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Medicine created successfully",
      data: medicine,
    });
  } catch (error) {
    console.error("Create medicine error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create medicine",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateMedicineController = async (
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
        message: "Medicine ID is required",
      });
    }

    const existingMedicine = await getMedicine(id, companyId);

    if (!existingMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    const {
      categoryId,
      medicineName,
      genericName,
      strength,
      dosageForm,
      description,
      isActive,
    } = req.body;

    const medicine = await editMedicine(id, companyId, {
      categoryId,
      medicineName,
      genericName,
      strength,
      dosageForm,
      description,
      isActive,
    });

    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: medicine,
    });
  } catch (error) {
    console.error("Update medicine error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update medicine",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deactivateMedicineController = async (
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
        message: "Medicine ID is required",
      });
    }

    const existingMedicine = await getMedicine(id, companyId);

    if (!existingMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    await disableMedicine(id, companyId);

    return res.status(200).json({
      success: true,
      message: "Medicine deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate medicine error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate medicine",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
