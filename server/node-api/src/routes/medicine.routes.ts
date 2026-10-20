import { Router } from "express";

import {
  getMedicinesController,
  getMedicineController,
  createMedicineController,
  updateMedicineController,
  deactivateMedicineController,
} from "../controllers/medicine.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

// Get all medicines for logged-in company
router.get(
  "/",
  authenticate,
  requireCompany,
  getMedicinesController
);

// Get one medicine
router.get(
  "/:id",
  authenticate,
  requireCompany,
  getMedicineController
);

// Create medicine
router.post(
  "/",
  authenticate,
  requireCompany,
  createMedicineController
);

// Update medicine
router.put(
  "/:id",
  authenticate,
  requireCompany,
  updateMedicineController
);

// Deactivate medicine
router.patch(
  "/:id/deactivate",
  authenticate,
  requireCompany,
  deactivateMedicineController
);

export default router;