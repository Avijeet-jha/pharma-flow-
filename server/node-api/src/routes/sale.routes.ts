import { Router } from "express";

import {
  getSalesController,
  getSaleController,
  createSaleController,
} from "../controllers/sale.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  requireCompany,
  getSalesController
);

router.get(
  "/:id",
  authenticate,
  requireCompany,
  getSaleController
);

router.post(
  "/",
  authenticate,
  requireCompany,
  createSaleController
);

export default router;