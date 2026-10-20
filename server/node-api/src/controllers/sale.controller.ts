import { Response } from "express";

import {
  getSales,
  getSale,
  registerSale,
} from "../services/sale.service";

import { AuthRequest } from "../middlewares/auth.middleware";

export const getSalesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    const sales = await getSales(companyId);

    return res.status(200).json({
      success: true,
      data: sales,
    });
  } catch (error) {
    console.error("Get sales error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

export const getSaleController = async (
  req: AuthRequest,
  res: Response
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

    const sale = await getSale(
      id,
      companyId
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error("Get sale error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sale",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

export const createSaleController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    const {
      warehouseId,
      invoiceNumber,
      totalAmount,
      notes,
      items,
    } = req.body;

    if (
      !warehouseId ||
      !invoiceNumber ||
      totalAmount === undefined ||
      !items
    ) {
      return res.status(400).json({
        success: false,
        message:
          "warehouseId, invoiceNumber, totalAmount and items are required",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one sale item is required",
      });
    }

    const formattedItems = items.map(
      (item: {
        batchId: string;
        quantity: number;
        unitPrice: number;
      }) => ({
        batchId: item.batchId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })
    );

    const sale = await registerSale({
      companyId,
      warehouseId,
      invoiceNumber,
      totalAmount: Number(totalAmount),
      notes,
      items: formattedItems,
    });

    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Create sale error:", error);

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return res.status(400).json({
      success: false,
      message,
    });
  }
};