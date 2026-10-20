import { Response } from "express";

import {
  getMedicineBatches,
  getMedicineBatch,
  registerMedicineBatch,
  editMedicineBatch,
} from "../services/medicineBatch.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getMedicineBatchesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;
    const medicineId = String(req.params.medicineId);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    const batches = await getMedicineBatches(
      medicineId,
      companyId
    );

    return res.status(200).json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error("Get medicine batches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicine batches",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getMedicineBatchController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;
    const batchId = String(req.params.batchId);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required",
      });
    }

    const batch = await getMedicineBatch(
      batchId,
      companyId
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Medicine batch not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error("Get medicine batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicine batch",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createMedicineBatchController = async (
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
      medicineId,
      batchNumber,
      manufacturingDate,
      expiryDate,
      mrp,
      quantity,
    } = req.body;

    if (
      !medicineId ||
      !batchNumber ||
      !manufacturingDate ||
      !expiryDate ||
      mrp === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "medicineId, batchNumber, manufacturingDate, expiryDate, mrp and quantity are required",
      });
    }

    const medicineBatch = await registerMedicineBatch({
      medicineId,
      batchNumber,
      manufacturingDate: new Date(manufacturingDate),
      expiryDate: new Date(expiryDate),
      mrp: Number(mrp),
      quantity: Number(quantity),
    });

    return res.status(201).json({
      success: true,
      message: "Medicine batch created successfully",
      data: medicineBatch,
    });
  } catch (error) {
    console.error("Create medicine batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create medicine batch",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateMedicineBatchController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;
    const batchId = String(req.params.batchId);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required",
      });
    }

    const existingBatch = await getMedicineBatch(
      batchId,
      companyId
    );

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: "Medicine batch not found",
      });
    }

    const {
      batchNumber,
      manufacturingDate,
      expiryDate,
      mrp,
      quantity,
    } = req.body;

    const medicineBatch = await editMedicineBatch(
      batchId,
      companyId,
      {
        batchNumber,
        manufacturingDate: manufacturingDate
          ? new Date(manufacturingDate)
          : undefined,
        expiryDate: expiryDate
          ? new Date(expiryDate)
          : undefined,
        mrp:
          mrp !== undefined
            ? Number(mrp)
            : undefined,
        quantity:
          quantity !== undefined
            ? Number(quantity)
            : undefined,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Medicine batch updated successfully",
      data: medicineBatch,
    });
  } catch (error) {
    console.error("Update medicine batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update medicine batch",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};