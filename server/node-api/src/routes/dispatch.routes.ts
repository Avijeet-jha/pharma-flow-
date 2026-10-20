import { Router } from "express";

import {
  getDispatchesController,
  getDispatchController,
  createDispatchController,
  updateDispatchStatusController,
} from "../controllers/dispatch.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

// Get all dispatches
router.get(
  "/",
  authenticate,
  requireCompany,
  getDispatchesController
);

// Get dispatch by ID
router.get(
  "/:id",
  authenticate,
  requireCompany,
  getDispatchController
);

// Create dispatch
router.post(
  "/",
  authenticate,
  requireCompany,
  createDispatchController
);

// Update dispatch status
router.put(
  "/:id/status",
  authenticate,
  requireCompany,
  updateDispatchStatusController
);

export default router;