import { Response } from "express";

import {
  getPurchaseRequests,
  getPurchaseRequest,
  registerPurchaseRequest,
  approveRequest,
  rejectRequest,
  cancelRequest,
  acceptRequest,
  declineRequest,
} from "../services/purchaseRequest.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getPurchaseRequestsController = async (
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

    const requests = await getPurchaseRequests(companyId);

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get purchase requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase requests",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getPurchaseRequestController = async (
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

    const request = await getPurchaseRequest(id, companyId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Purchase request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get purchase request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase request",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createPurchaseRequestController = async (
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
      requestNumber,
      sellerCompanyId,
      preferredDeliveryDate,
      requirement,
      items,
    } = req.body;

    if (!sellerCompanyId || !items) {
      return res.status(400).json({
        success: false,
        message: "sellerCompanyId and items are required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one purchase request item is required",
      });
    }

    if (buyerCompanyId === sellerCompanyId) {
      return res.status(400).json({
        success: false,
        message: "Buyer and seller companies cannot be the same",
      });
    }

    let formattedDate: Date | undefined;

    if (preferredDeliveryDate) {
      const parsedDate = new Date(preferredDeliveryDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid preferred delivery date",
        });
      }

      formattedDate = parsedDate;
    }

    const formattedItems = items.map(
      (item: { medicineId: string; requestedQuantity: number }) => ({
        medicineId: item.medicineId,
        requestedQuantity: Number(item.requestedQuantity),
      }),
    );

    const generatedRequestNumber = requestNumber || `PR-${Date.now()}`;

    const request = await registerPurchaseRequest({
      requestNumber: generatedRequestNumber,

      buyerCompanyId,

      sellerCompanyId,

      preferredDeliveryDate: formattedDate,

      requirement: requirement?.trim() || undefined,

      items: formattedItems,
    });

    return res.status(201).json({
      success: true,
      message: "Purchase request sent successfully",
      data: request,
    });
  } catch (error) {
    console.error("Create purchase request error:", error);

    const message = error instanceof Error ? error.message : String(error);

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const approvePurchaseRequestController = async (
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

    const { items, preferredDeliveryDate } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Approval details are required",
      });
    }

    let formattedDate: Date | undefined;

    if (preferredDeliveryDate) {
      const parsedDate = new Date(preferredDeliveryDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid preferred delivery date",
        });
      }

      formattedDate = parsedDate;
    }

    const formattedItems = items.map(
      (item: {
        itemId: string;
        approvedQuantity: number;
        unitPrice: number;
        batchId: string;
      }) => ({
        itemId: item.itemId,

        approvedQuantity: Number(item.approvedQuantity),

        unitPrice: Number(item.unitPrice),

        batchId: item.batchId,
      }),
    );

    const result = await approveRequest(
      id,
      companyId,
      formattedItems,
      formattedDate,
    );

    return res.status(200).json({
      success: true,
      message: "Purchase request approved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Approve purchase request error:", error);

    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

export const rejectPurchaseRequestController = async (
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

    const result = await rejectRequest(id, companyId);

    return res.status(200).json({
      success: true,
      message: "Purchase request rejected",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

export const cancelPurchaseRequestController = async (
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

    const result = await cancelRequest(id, companyId);

    return res.status(200).json({
      success: true,
      message: "Purchase request cancelled",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

export const acceptPurchaseRequestController = async (
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

    const result = await acceptRequest(id, companyId);

    return res.status(200).json({
      success: true,
      message: "Purchase request accepted and purchase order created",
      data: result,
    });
  } catch (error) {
    console.error("Accept purchase request error:", error);

    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

export const declinePurchaseRequestController = async (
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

    const result = await declineRequest(id, companyId);

    return res.status(200).json({
      success: true,
      message: "Purchase request declined",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
