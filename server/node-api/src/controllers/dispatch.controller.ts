import { Response } from "express";

import {
  getDispatches,
  getDispatch,
  registerDispatch,
  changeDispatchStatus,
} from "../services/dispatch.service";

import { AuthRequest } from "../middlewares/auth.middleware";


/*
 * =========================================================
 * GET ALL DISPATCHES
 * =========================================================
 */
export const getDispatchesController = async (
  req: AuthRequest,
  res: Response
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

    const dispatches =
      await getDispatches(companyId);

    return res.status(200).json({
      success: true,
      data: dispatches,
    });
  } catch (error) {
    console.error(
      "Get dispatches error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dispatches",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};


/*
 * =========================================================
 * GET DISPATCH BY ID
 * =========================================================
 */
export const getDispatchController = async (
  req: AuthRequest,
  res: Response
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
          "Dispatch ID is required",
      });
    }

    const dispatch =
      await getDispatch(
        id,
        companyId
      );

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message:
          "Dispatch not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: dispatch,
    });
  } catch (error) {
    console.error(
      "Get dispatch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dispatch",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};


/*
 * =========================================================
 * CREATE DISPATCH
 * =========================================================
 *
 * Seller/Pharma creates a dispatch.
 *
 * Source:
 *     Seller warehouse
 *
 * Destination:
 *     Buyer warehouse
 */
export const createDispatchController = async (
  req: AuthRequest,
  res: Response
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
      items,
    } = req.body;


    /*
     * Required fields
     */

    if (
      !purchaseOrderId ||
      !sourceWarehouseId ||
      !destinationWarehouseId ||
      !items
    ) {
      return res.status(400).json({
        success: false,
        message:
          "purchaseOrderId, sourceWarehouseId, destinationWarehouseId and items are required",
      });
    }


    /*
     * Items must be an array
     */

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one dispatch item is required",
      });
    }


    /*
     * Format items
     */

    const formattedItems =
      items.map(
        (item: {
          batchId: string;
          quantity: number;
        }) => ({
          batchId:
            item.batchId,

          quantity:
            Number(item.quantity),
        })
      );


    /*
     * Validate items
     */

    for (
      const item
      of formattedItems
    ) {
      if (!item.batchId) {
        return res.status(400).json({
          success: false,
          message:
            "batchId is required for every dispatch item",
        });
      }

      if (
        !Number.isInteger(
          item.quantity
        ) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Dispatch quantity must be a positive integer",
        });
      }
    }


    /*
     * Register dispatch
     */

    const dispatch =
      await registerDispatch({
        purchaseOrderId,

        sourceWarehouseId,

        destinationWarehouseId,

        items:
          formattedItems,
      });


    return res.status(201).json({
      success: true,
      message:
        "Dispatch created successfully",
      data: dispatch,
    });
  } catch (error) {
    console.error(
      "Create dispatch error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);


    /*
     * Business errors
     */

    const businessErrors = [
      "Purchase order not found",

      "Only approved purchase orders can be dispatched",

      "Source warehouse does not belong to the seller company",

      "Destination warehouse does not belong to the buyer company",

      "Source and destination warehouses cannot be the same",

      "At least one dispatch item is required",

      "Dispatch quantity must be a positive integer",

      "Dispatch quantity must be greater than zero",
    ];


    if (
      businessErrors.includes(
        message
      ) ||
      message.startsWith(
        "Batch not found:"
      ) ||
      (
        message.startsWith(
          "Batch "
        ) &&
        message.includes(
          "does not belong to this purchase order"
        )
      ) ||
      message.startsWith(
        "Dispatch quantity for batch"
      ) ||
      message.startsWith(
        "Batch "
      ) &&
      message.includes(
        "is not available in the source warehouse"
      ) ||
      message.startsWith(
        "Insufficient inventory for batch"
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
        "Failed to create dispatch",
      error: message,
    });
  }
};


/*
 * =========================================================
 * UPDATE DISPATCH STATUS
 * =========================================================
 */
export const updateDispatchStatusController =
  async (
    req: AuthRequest,
    res: Response
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
            "Dispatch ID is required",
        });
      }


      const validStatuses = [
        "PENDING",
        "DISPATCHED",
        "DELIVERED",
        "CANCELLED",
      ];


      if (
        !status ||
        !validStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid dispatch status",
        });
      }


      /*
       * Check dispatch exists and
       * belongs to the company.
       */

      const existingDispatch =
        await getDispatch(
          id,
          companyId
        );


      if (!existingDispatch) {
        return res.status(404).json({
          success: false,
          message:
            "Dispatch not found",
        });
      }


      /*
       * Change status
       */

      const dispatch =
        await changeDispatchStatus(
          id,
          companyId,
          status
        );


      return res.status(200).json({
        success: true,
        message:
          "Dispatch status updated successfully",
        data: dispatch,
      });
    } catch (error) {
      console.error(
        "Update dispatch status error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);


      const businessErrors = [
        "Dispatch not found",

        "Only the seller company can mark a dispatch as DISPATCHED",

        "Only the buyer company can mark a dispatch as DELIVERED",

        "Only the seller company can cancel a pending dispatch",

        "Only pending dispatches can be cancelled",

        "Cannot change dispatch status from DELIVERED",

        "Cannot change dispatch status from CANCELLED",

        "Pending dispatch can only be DISPATCHED or CANCELLED",

        "Dispatched order can only be DELIVERED or CANCELLED",

        "Invalid dispatch status transition",
      ];


      if (
        businessErrors.includes(
          message
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
          "Failed to update dispatch status",
        error: message,
      });
    }
  };