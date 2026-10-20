import { Response } from "express";

import {
  getWarehouses,
  getWarehouse,
  registerWarehouse,
  editWarehouse,
  removeWarehouse,
} from "../services/warehouse.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getWarehousesController = async (
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

    const warehouses = await getWarehouses(companyId);

    return res.status(200).json({
      success: true,
      data: warehouses,
    });
  } catch (error) {
    console.error("Get warehouses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouses",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getWarehouseController = async (
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
        message: "Warehouse ID is required",
      });
    }

    const warehouse = await getWarehouse(id, companyId);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    console.error("Get warehouse error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createWarehouseController = async (
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
      warehouseName,
      address,
      city,
      state,
      pincode,
    } = req.body;

    if (!warehouseName) {
      return res.status(400).json({
        success: false,
        message: "Warehouse name is required",
      });
    }

    const warehouse = await registerWarehouse({
      companyId,
      warehouseName,
      address,
      city,
      state,
      pincode,
    });

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse,
    });
  } catch (error) {
    console.error("Create warehouse error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create warehouse",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateWarehouseController = async (
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
        message: "Warehouse ID is required",
      });
    }

    const existingWarehouse = await getWarehouse(id, companyId);

    if (!existingWarehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    const {
      warehouseName,
      address,
      city,
      state,
      pincode,
    } = req.body;

    const warehouse = await editWarehouse(
      id,
      companyId,
      {
        warehouseName,
        address,
        city,
        state,
        pincode,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: warehouse,
    });
  } catch (error) {
    console.error("Update warehouse error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update warehouse",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteWarehouseController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;
    const id = String(req.params.id || "");

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Warehouse ID is required",
      });
    }

    // Verify that this warehouse belongs to the company.
    const warehouse = await getWarehouse(id, companyId);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    const result = await removeWarehouse(id, companyId);

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.error("Delete warehouse error:", error);

    // Keep linked inventory and other records safe.
    const errorCode = (
      error as { code?: string }
    )?.code;

    if (errorCode === "P2003" || errorCode === "P2014") {
      return res.status(409).json({
        success: false,
        message:
          "This warehouse has linked records and cannot be deleted. Remove or reassign the linked records first.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete warehouse",
    });
  }
};  