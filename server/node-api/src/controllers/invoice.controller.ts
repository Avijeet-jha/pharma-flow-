import { Response } from "express";

import {
  getInvoices,
  getInvoice,
  getInvoiceForPurchaseOrder,
  generateInvoice,
  sendInvoice,
  recordInvoicePayment,
} from "../services/invoice.service";

import { AuthRequest } from "../middlewares/auth.middleware";

// =========================================================
// GET ALL INVOICES
// =========================================================

export const getInvoicesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    const invoices =
      await getInvoices(companyId);

    return res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error(
      "Get invoices error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

// =========================================================
// GET INVOICE BY ID
// =========================================================

export const getInvoiceController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.user?.companyId;

    const id = String(req.params.id);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    const invoice =
      await getInvoice(
        id,
        companyId,
      );

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error(
      "Get invoice error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    if (
      message ===
      "Invoice not found"
    ) {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
      error: message,
    });
  }
};

// =========================================================
// GET INVOICE BY PURCHASE ORDER
// =========================================================

export const getInvoiceForPurchaseOrderController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const companyId =
        req.user?.companyId;

      const purchaseOrderId =
        String(
          req.params.purchaseOrderId,
        );

      if (!companyId) {
        return res.status(403).json({
          success: false,
          message:
            "Company account required",
        });
      }

      if (!purchaseOrderId) {
        return res.status(400).json({
          success: false,
          message:
            "Purchase order ID is required",
        });
      }

      const invoice =
        await getInvoiceForPurchaseOrder(
          purchaseOrderId,
          companyId,
        );

      return res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      console.error(
        "Get invoice for purchase order error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      if (
        message ===
          "Purchase order not found" ||
        message ===
          "Invoice not found for this purchase order"
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch invoice for purchase order",
        error: message,
      });
    }
  };

// =========================================================
// GENERATE INVOICE
// =========================================================

export const generateInvoiceController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const companyId =
        req.user?.companyId;

      if (!companyId) {
        return res.status(403).json({
          success: false,
          message:
            "Company account required",
        });
      }

      const {
        purchaseOrderId,
        sourceWarehouseId,
        destinationWarehouseId,
        dueDate,
        placeOfSupply,
        paymentTerms,
        items,
      } = req.body;

      // -----------------------------------------------------
      // Required purchase order
      // -----------------------------------------------------

      if (!purchaseOrderId) {
        return res.status(400).json({
          success: false,
          message:
            "Purchase order ID is required",
        });
      }

      // -----------------------------------------------------
      // Validate items if provided
      // -----------------------------------------------------

      if (
        items !== undefined &&
        !Array.isArray(items)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invoice items must be an array",
        });
      }

      const invoice =
        await generateInvoice(
          companyId,
          {
            purchaseOrderId:

              String(
                purchaseOrderId,
              ),

            sourceWarehouseId,

            destinationWarehouseId,

            dueDate: dueDate
              ? new Date(dueDate)
              : undefined,

            placeOfSupply,

            paymentTerms,

            items,
          },
        );

      return res.status(201).json({
        success: true,
        message:
          "Invoice generated successfully",
        data: invoice,
      });
    } catch (error) {
      console.error(
        "Generate invoice error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      // -----------------------------------------------------
      // Not found
      // -----------------------------------------------------

      if (
        message ===
        "Purchase order not found"
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      // -----------------------------------------------------
      // Authorization
      // -----------------------------------------------------

      if (
        message.includes(
          "Only the Pharma",
        ) ||
        message.includes(
          "not authorized",
        )
      ) {
        return res.status(403).json({
          success: false,
          message,
        });
      }

      // -----------------------------------------------------
      // Duplicate invoice
      // -----------------------------------------------------

      if (
        message.includes(
          "Invoice already exists",
        )
      ) {
        return res.status(409).json({
          success: false,
          message,
        });
      }

      // -----------------------------------------------------
      // Validation/business errors
      // -----------------------------------------------------

      if (
        message.includes(
          "cannot be generated",
        ) ||
        message.includes(
          "required",
        ) ||
        message.includes(
          "cannot exceed",
        ) ||
        message.includes(
          "must be",
        ) ||
        message.includes(
          "does not match",
        ) ||
        message.includes(
          "cannot be",
        )
      ) {
        return res.status(400).json({
          success: false,
          message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to generate invoice",
        error: message,
      });
    }
  };

// =========================================================
// SEND INVOICE
// =========================================================

export const sendInvoiceController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const companyId =
        req.user?.companyId;

      const id =
        String(req.params.id);

      if (!companyId) {
        return res.status(403).json({
          success: false,
          message:
            "Company account required",
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Invoice ID is required",
        });
      }

      const invoice =
        await sendInvoice(
          id,
          companyId,
        );

      return res.status(200).json({
        success: true,
        message:
          "Invoice sent successfully",
        data: invoice,
      });
    } catch (error) {
      console.error(
        "Send invoice error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      if (
        message ===
        "Invoice not found"
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      if (
        message.includes(
          "Only the Pharma",
        )
      ) {
        return res.status(403).json({
          success: false,
          message,
        });
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }
  };

// =========================================================
// RECORD INVOICE PAYMENT
// =========================================================

export const recordInvoicePaymentController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const companyId =
        req.user?.companyId;

      const id =
        String(req.params.id);

      const {
        paymentAmount,
      } = req.body;

      if (!companyId) {
        return res.status(403).json({
          success: false,
          message:
            "Company account required",
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Invoice ID is required",
        });
      }

      // -----------------------------------------------------
      // Convert numeric string to number
      // -----------------------------------------------------

      const amount =
        Number(paymentAmount);

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment amount must be a valid number greater than zero",
        });
      }

      const invoice =
        await recordInvoicePayment(
          id,
          companyId,
          amount,
        );

      return res.status(200).json({
        success: true,
        message:
          "Payment recorded successfully",
        data: invoice,
      });
    } catch (error) {
      console.error(
        "Record invoice payment error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      if (
        message ===
        "Invoice not found"
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }
  };