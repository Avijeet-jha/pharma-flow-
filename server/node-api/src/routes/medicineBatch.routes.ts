import { Router } from "express";

import {
  getMedicineBatchesController,
  getMedicineBatchController,
  createMedicineBatchController,
  updateMedicineBatchController,
} from "../controllers/medicineBatch.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

// Get all batches for a medicine
router.get(
  "/medicine/:medicineId",
  authenticate,
  requireCompany,
  getMedicineBatchesController
);

// Get one batch
router.get(
  "/:batchId",
  authenticate,
  requireCompany,
  getMedicineBatchController
);

// Create a batch
router.post(
  "/",
  authenticate,
  requireCompany,
  createMedicineBatchController
);

// Update a batch
router.put(
  "/:batchId",
  authenticate,
  requireCompany,
  updateMedicineBatchController
);

export default router;