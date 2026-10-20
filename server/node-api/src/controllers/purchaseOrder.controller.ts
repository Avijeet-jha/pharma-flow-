import { Response } from "express";

import {
  getPurchaseOrders,
  getPurchaseOrder,
  registerPurchaseOrder,
  changePurchaseOrderStatus,
  checkPurchaseOrderAvailability,
  confirmPharmaOrder,
} from "../services/purchaseOrder.service";

import {
  sendPaymentReminderForOrder,
} from "../services/notification.service";

import { AuthRequest } from "../middlewares/auth.middleware";

// =========================================================
// GET ALL PURCHASE ORDERS
// =========================================================

export const getPurchaseOrdersController = async (
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

    const orders = await getPurchaseOrders(companyId);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get purchase orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase orders",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

// =========================================================
// GET PURCHASE ORDER BY ID
// =========================================================

export const getPurchaseOrderController = async (
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
        message: "Purchase order ID is required",
      });
    }

    const order = await getPurchaseOrder(
      id,
      companyId,
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(
      "Get purchase order error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase order",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

// =========================================================
// CREATE PURCHASE ORDER
// =========================================================

export const createPurchaseOrderController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const buyerCompanyId = req.user?.companyId;

    if (!buyerCompanyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    const {
      orderNumber,
      sellerCompanyId,
      expectedDate,
      notes,
      items,
    } = req.body;

    if (!sellerCompanyId || !items) {
      return res.status(400).json({
        success: false,
        message:
          "sellerCompanyId and items are required",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one purchase order item is required",
      });
    }

    if (
      buyerCompanyId === sellerCompanyId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Buyer and seller companies cannot be the same",
      });
    }

    let formattedExpectedDate:
      Date | undefined;

    if (expectedDate) {
      const parsedDate =
        new Date(expectedDate);

      if (
        Number.isNaN(
          parsedDate.getTime(),
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid expected date",
        });
      }

      formattedExpectedDate =
        parsedDate;
    }

    const formattedItems =
      items.map(
        (item: {
          medicineId: string;
          quantity: number;
        }) => ({
          medicineId:
            item.medicineId,
          quantity:
            Number(item.quantity),
        }),
      );

    for (
      const item of formattedItems
    ) {
      if (!item.medicineId) {
        return res.status(400).json({
          success: false,
          message:
            "Medicine ID is required for every purchase order item",
        });
      }

      if (
        !Number.isInteger(
          item.quantity,
        ) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Purchase order quantity must be a positive whole number",
        });
      }
    }

    const order =
      await registerPurchaseOrder({
        orderNumber:
          typeof orderNumber ===
            "string" &&
          orderNumber.trim()
            ? orderNumber.trim()
            : undefined,

        buyerCompanyId,

        sellerCompanyId,

        expectedDate:
          formattedExpectedDate,

        notes:
          typeof notes ===
            "string"
            ? notes.trim() ||
              undefined
            : undefined,

        items:
          formattedItems,
      });

    return res.status(201).json({
      success: true,
      message:
        "Purchase order submitted successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Create purchase order error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    const businessErrors = [
      "Buyer and seller companies cannot be the same",
      "At least one purchase order item is required",
      "Medicine ID is required for every purchase order item",
      "Purchase order quantity must be greater than zero",
      "Purchase order quantity must be a positive whole number",
    ];

    if (
      businessErrors.includes(
        message,
      ) ||
      message.startsWith("Medicine ") ||
      message.startsWith("Batch ")
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create purchase order",
      error: message,
    });
  }
};

// =========================================================
// UPDATE PURCHASE ORDER STATUS
// =========================================================

export const updatePurchaseOrderStatusController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const companyId =
        req.user?.companyId;

      const id =
        String(req.params.id);

      const { status } =
        req.body;

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
            "Purchase order ID is required",
        });
      }

      const validStatuses = [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "DISPATCHED",
        "DELIVERED",
        "CANCELLED",
        "REJECTED",
      ];

      if (
        !status ||
        !validStatuses.includes(
          status,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid purchase order status",
        });
      }

      const existingOrder =
        await getPurchaseOrder(
          id,
          companyId,
        );

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message:
            "Purchase order not found",
        });
      }

      const result =
        await changePurchaseOrderStatus(
          id,
          companyId,
          status as
            | "DRAFT"
            | "PENDING"
            | "APPROVED"
            | "DISPATCHED"
            | "DELIVERED"
            | "CANCELLED"
            | "REJECTED",
        );

      return res.status(200).json({
        success: true,
        message:
          "Purchase order status updated successfully",
        data: result,
      });
    } catch (error) {
      console.error(
        "Update purchase order status error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      const businessErrors = [
        "Purchase order not found",
        "Cannot change purchase order status from DELIVERED",
        "Cannot change purchase order status from CANCELLED",
        "Cannot change purchase order status from REJECTED",
        "Pending purchase order can only be APPROVED, REJECTED or CANCELLED",
        "Approved purchase order can only be DISPATCHED or CANCELLED",
        "Dispatched purchase order can only be DELIVERED",
        "Draft purchase order can only be PENDING or CANCELLED",
      ];

      if (
        businessErrors.includes(
          message,
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
          "Failed to update purchase order status",
        error: message,
      });
    }
  };

// =========================================================
// CHECK PURCHASE ORDER STOCK AVAILABILITY
// =========================================================

export const checkPurchaseOrderAvailabilityController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const pharmaCompanyId =
        req.user?.companyId;

      const id =
        String(req.params.id);

      if (!pharmaCompanyId) {
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
            "Purchase order ID is required",
        });
      }

      const result =
        await checkPurchaseOrderAvailability(
          id,
          pharmaCompanyId,
        );

      return res.status(200).json({
        success: true,
        message:
          "Purchase order stock availability checked successfully",
        data: result,
      });
    } catch (error) {
      console.error(
        "Check purchase order availability error:",
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
          "Only the Pharma company can check this purchase order"
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      if (
        message.startsWith(
          "Only PENDING purchase orders",
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
          "Failed to check purchase order availability",
        error: message,
      });
    }
  };

// =========================================================
// CONFIRM PHARMA PURCHASE ORDER
// =========================================================

export const confirmPharmaPurchaseOrderController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const companyId =
        req.user?.companyId;

      const orderId =
        String(req.params.id);

      if (!companyId) {
        return res.status(403).json({
          success: false,
          message:
            "Company account required",
        });
      }

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message:
            "Purchase order ID is required",
        });
      }

      const { items } =
        req.body;

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order items are required",
        });
      }

      const purchaseOrder =
        await confirmPharmaOrder(
          companyId,
          orderId,
          items,
        );

      return res.status(200).json({
        success: true,
        message:
          "Purchase order confirmed successfully",
        data: purchaseOrder,
      });
    } catch (error) {
      console.error(
        "Confirm pharma purchase order error:",
        error,
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  };

// =========================================================
// SEND PAYMENT REMINDER
// =========================================================
//
// Pharma sends a payment reminder for a purchase order.
// The backend automatically:
// - identifies the wholesaler
// - gets current pending unpaid amount
// - creates the notification
//
// =========================================================

export const sendPaymentReminderController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const pharmaCompanyId =
        req.user?.companyId;

      const purchaseOrderId =
        String(req.params.id);

      if (!pharmaCompanyId) {
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

      const notification =
        await sendPaymentReminderForOrder(
          pharmaCompanyId,
          purchaseOrderId,
        );

      return res.status(201).json({
        success: true,
        message:
          "Payment reminder sent successfully",
        data: notification,
      });
    } catch (error) {
      console.error(
        "Send payment reminder error:",
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
          "Only the Pharma company can send this reminder"
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to send payment reminder",
        error: message,
      });
    }
  };