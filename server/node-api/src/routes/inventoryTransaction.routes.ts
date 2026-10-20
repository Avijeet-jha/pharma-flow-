import { Router } from "express";

import {
  getInventoryTransactionsController,
  getInventoryTransactionController,
} from "../controllers/inventoryTransaction.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

// Get all inventory transactions
router.get(
  "/",
  authenticate,
  requireCompany,
  getInventoryTransactionsController
);

// Get one inventory transaction
router.get(
  "/:id",
  authenticate,
  requireCompany,
  getInventoryTransactionController
);

export default router;