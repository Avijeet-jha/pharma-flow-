import { Router } from "express";

import {
  getDashboardController,
  getAdminDashboardController,
} from "../controllers/dashboard.controller";

import {
  authenticate,
  authorize,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  requireCompany,
  getDashboardController
);

router.get(
  "/overview",
  authenticate,
  authorize("SUPER_ADMIN"),
  getAdminDashboardController
);

export default router;