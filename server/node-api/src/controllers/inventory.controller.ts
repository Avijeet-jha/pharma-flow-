import { Response } from "express";
import {
  updateInventoryStock,
} from "../services/inventory.service";

import {
  getInventory,
  getInventoryItem,
  registerInventory,
  editInventoryQuantity,
  getLowStockItems,
} from "../services/inventory.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getInventoryController = async (
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

    const inventory = await getInventory(companyId);

    return res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};



export const getInventoryItemController = async (
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
        message: "Inventory ID is required",
      });
    }

    const inventory = await getInventoryItem(id, companyId);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Get inventory item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// =========================================================
// GET LOW STOCK INVENTORY
// =========================================================

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

    const inventory = await getLowStockItems(companyId);

    return res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Get low stock inventory error:", error);

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

export const createInventoryController = async (
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
      warehouseId,
      batchId,
      quantity,
    } = req.body;

    if (
      !warehouseId ||
      !batchId ||
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "warehouseId, batchId and quantity are required",
      });
    }

    const inventory = await registerInventory({
      warehouseId,
      batchId,
      quantity: Number(quantity),
    });

    return res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Create inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create inventory",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateInventoryController = async (
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
        message: "Inventory ID is required",
      });
    }

    const existingInventory = await getInventoryItem(
      id,
      companyId
    );

    if (!existingInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    const inventory = await editInventoryQuantity(
      id,
      companyId,
      Number(quantity)
    );

    return res.status(200).json({
      success: true,
      message: "Inventory quantity updated successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Update inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update inventory",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const adjustInventoryController = async (
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
      inventoryId,
      quantity,
      type,
      notes,
    } = req.body;

    if (
      !inventoryId ||
      quantity === undefined ||
      !type
    ) {
      return res.status(400).json({
        success: false,
        message:
          "inventoryId, quantity and type are required",
      });
    }

    if (
      type !== "ADJUSTMENT" &&
      type !== "DAMAGE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Type must be ADJUSTMENT or DAMAGE",
      });
    }

    const result =
      await updateInventoryStock({
        inventoryId,
        companyId,
        quantity: Number(quantity),
        type,
        notes,
      });

    return res.status(200).json({
      success: true,
      message:
        "Inventory updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Inventory adjustment error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};