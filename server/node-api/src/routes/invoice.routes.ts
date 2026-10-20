import { Router } from "express";

import {
  getInvoicesController,
  getInvoiceController,
  getInvoiceForPurchaseOrderController,
  generateInvoiceController,
  sendInvoiceController,
  recordInvoicePaymentController,
} from "../controllers/invoice.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

// =========================================================
// GET ALL INVOICES
// =========================================================

router.get(
  "/",
  authenticate,
  requireCompany,
  getInvoicesController,
);

// =========================================================
// GET INVOICE BY PURCHASE ORDER
// =========================================================
//
// IMPORTANT:
// This must be BEFORE /:id
//

router.get(
  "/purchase-order/:purchaseOrderId",
  authenticate,
  requireCompany,
  getInvoiceForPurchaseOrderController,
);

// =========================================================
// GET INVOICE BY ID
// =========================================================

router.get(
  "/:id",
  authenticate,
  requireCompany,
  getInvoiceController,
);

// =========================================================
// GENERATE INVOICE
// =========================================================

router.post(
  "/",
  authenticate,
  requireCompany,
  generateInvoiceController,
);

// =========================================================
// SEND INVOICE
// =========================================================

router.put(
  "/:id/send",
  authenticate,
  requireCompany,
  sendInvoiceController,
);

// =========================================================
// RECORD PAYMENT
// =========================================================

router.put(
  "/:id/payment",
  authenticate,
  requireCompany,
  recordInvoicePaymentController,
);

export default router;