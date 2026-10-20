import { Router } from "express";

import {
  getAdminDashboardController,
} from "../controllers/adminDashboard.controller";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  getAdminDashboardController
);

export default router;