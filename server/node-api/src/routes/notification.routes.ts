import { Router } from "express";

import {
  getNotificationsController,
  getUnreadNotificationCountController,
  createNotificationController,
  markNotificationAsReadController,
} from "../controllers/notification.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  requireCompany,
  getNotificationsController,
);

router.get(
  "/unread-count",
  authenticate,
  requireCompany,
  getUnreadNotificationCountController,
);

router.post(
  "/",
  authenticate,
  requireCompany,
  createNotificationController,
);

router.put(
  "/:id/read",
  authenticate,
  requireCompany,
  markNotificationAsReadController,
);

export default router;