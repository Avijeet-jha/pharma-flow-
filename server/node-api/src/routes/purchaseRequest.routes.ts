import { Router } from "express";

import {
  getPurchaseRequestsController,
  getPurchaseRequestController,
  createPurchaseRequestController,
  approvePurchaseRequestController,
  rejectPurchaseRequestController,
  cancelPurchaseRequestController,
  acceptPurchaseRequestController,
  declinePurchaseRequestController,
} from "../controllers/purchaseRequest.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

// =========================================================
// PURCHASE REQUESTS
// =========================================================

// Get all purchase requests
router.get(
  "/",
  authenticate,
  requireCompany,
  getPurchaseRequestsController
);

// Get purchase request by ID
router.get(
  "/:id",
  authenticate,
  requireCompany,
  getPurchaseRequestController
);

// Create purchase request
router.post(
  "/",
  authenticate,
  requireCompany,
  createPurchaseRequestController
);

// Pharma approves request + sets commercial details
router.put(
  "/:id/approve",
  authenticate,
  requireCompany,
  approvePurchaseRequestController
);

// Pharma rejects request
router.put(
  "/:id/reject",
  authenticate,
  requireCompany,
  rejectPurchaseRequestController
);

// Wholesaler cancels request
router.put(
  "/:id/cancel",
  authenticate,
  requireCompany,
  cancelPurchaseRequestController
);

// Wholesaler accepts approved request
router.put(
  "/:id/accept",
  authenticate,
  requireCompany,
  acceptPurchaseRequestController
);

// Wholesaler declines approved request
router.put(
  "/:id/decline",
  authenticate,
  requireCompany,
  declinePurchaseRequestController
);

export default router;