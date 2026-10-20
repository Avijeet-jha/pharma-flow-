import { Router } from "express";

import {
  getLowStockController,
} from "../controllers/stock.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/low-stock",
  authenticate,
  requireCompany,
  getLowStockController
);

export default router;