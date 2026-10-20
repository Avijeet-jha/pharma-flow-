import { Router } from "express";

import {
  getWholesalerPendingUnpaidAmountController,
} from "../controllers/customerBalance.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/wholesaler/:wholesalerCompanyId",
  authenticate,
  requireCompany,
  getWholesalerPendingUnpaidAmountController,
);

export default router;