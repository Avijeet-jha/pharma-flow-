import { Router } from "express";

import {
  getCategoriesController,
} from "../controllers/category.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  requireCompany,
  getCategoriesController
);

export default router;