import { Router } from "express";

import {
  getInventoryController,
  getInventoryItemController,
  createInventoryController,
  updateInventoryController,
  adjustInventoryController,
  getLowStockController,
} from "../controllers/inventory.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

// Get all inventory for logged-in company
router.get(
  "/",
  authenticate,
  requireCompany,
  getInventoryController
);

// Create inventory
router.post(
  "/",
  authenticate,
  requireCompany,
  createInventoryController
);

// Adjust inventory
router.patch(
  "/adjust",
  authenticate,
  requireCompany,
  adjustInventoryController
);

router.get(
  "/low-stock",
  authenticate,
  requireCompany,
  getLowStockController
);

// Get one inventory item
router.get(
  "/:id",
  authenticate,
  requireCompany,
  getInventoryItemController
);

// Update inventory quantity
router.put(
  "/:id",
  authenticate,
  requireCompany,
  updateInventoryController
);

export default router;