import { Router } from "express";

import {
  getExpiringController,
  getExpiredController,
} from "../controllers/expiry.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/expiring",
  authenticate,
  requireCompany,
  getExpiringController
);

router.get(
  "/expired",
  authenticate,
  requireCompany,
  getExpiredController
);

export default router;