import { Router } from "express";

import {
  getRecommendationsController,
} from "../controllers/recommendation.controller";

import {
  authenticate,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getRecommendationsController
);

export default router;