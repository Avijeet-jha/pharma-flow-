import { Router } from "express";

import {
  createReturnController,
} from "../controllers/return.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/:saleId",
  authenticate,
  requireCompany,
  createReturnController
);

export default router;