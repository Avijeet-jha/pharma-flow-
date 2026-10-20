import { Router } from "express";

import {
  getPurchaseOrdersController,
  getPurchaseOrderController,
  createPurchaseOrderController,
  updatePurchaseOrderStatusController,
  checkPurchaseOrderAvailabilityController,
  confirmPharmaPurchaseOrderController,
  sendPaymentReminderController,
} from "../controllers/purchaseOrder.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

// =========================================================
// GET ALL PURCHASE ORDERS
// =========================================================

router.get(
  "/",
  authenticate,
  requireCompany,
  getPurchaseOrdersController,
);

// =========================================================
// CHECK PURCHASE ORDER AVAILABILITY
// =========================================================

router.get(
  "/:id/availability",
  authenticate,
  requireCompany,
  checkPurchaseOrderAvailabilityController,
);

// =========================================================
// GET PURCHASE ORDER BY ID
// =========================================================

router.get(
  "/:id",
  authenticate,
  requireCompany,
  getPurchaseOrderController,
);

// =========================================================
// CREATE PURCHASE ORDER
// =========================================================

router.post(
  "/",
  authenticate,
  requireCompany,
  createPurchaseOrderController,
);

// =========================================================
// CONFIRM PURCHASE ORDER
// =========================================================

router.put(
  "/:id/confirm",
  authenticate,
  requireCompany,
  confirmPharmaPurchaseOrderController,
);

// =========================================================
// SEND PAYMENT REMINDER
// =========================================================

router.post(
  "/:id/payment-reminder",
  authenticate,
  requireCompany,
  sendPaymentReminderController,
);

// =========================================================
// UPDATE PURCHASE ORDER STATUS
// =========================================================

router.put(
  "/:id/status",
  authenticate,
  requireCompany,
  updatePurchaseOrderStatusController,
);

export default router;