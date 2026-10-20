import { Response } from "express";

import {
  sendNotification,
  getCompanyNotifications,
  getCompanyUnreadNotificationCount,
  readNotification,
} from "../services/notification.service";

import { AuthRequest } from "../middlewares/auth.middleware";

// =========================================================
// GET COMPANY NOTIFICATIONS
// =========================================================

export const getNotificationsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const companyId = req.user?.companyId;

    // Temporary debugging
    console.log("Notification companyId:", companyId);
    console.log("Authenticated user:", req.user);

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    const notifications =
      await getCompanyNotifications(companyId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

// =========================================================
// GET UNREAD NOTIFICATION COUNT
// =========================================================

export const getUnreadNotificationCountController =
  async (
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

      const count =
        await getCompanyUnreadNotificationCount(
          companyId,
        );

      return res.status(200).json({
        success: true,
        data: {
          unreadCount: count,
        },
      });
    } catch (error) {
      console.error(
        "Get unread notification count error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch unread notification count",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  };

// =========================================================
// CREATE NOTIFICATION
// =========================================================

export const createNotificationController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const senderCompanyId =
        req.user?.companyId;

      if (!senderCompanyId) {
        return res.status(403).json({
          success: false,
          message: "Company account required",
        });
      }

      const {
        recipientCompanyId,
        title,
        message,
        type,
      } = req.body;

      if (!recipientCompanyId) {
        return res.status(400).json({
          success: false,
          message:
            "Recipient company ID is required",
        });
      }

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message:
            "Title and message are required",
        });
      }

      const notification =
        await sendNotification(
          senderCompanyId,
          recipientCompanyId,
          title,
          message,
          type,
        );

      return res.status(201).json({
        success: true,
        message: "Notification sent successfully",
        data: notification,
      });
    } catch (error) {
      console.error(
        "Create notification error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Failed to send notification",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  };

// =========================================================
// MARK NOTIFICATION AS READ
// =========================================================

export const markNotificationAsReadController =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const companyId = req.user?.companyId;
      const notificationId =
        String(req.params.id);

      if (!companyId) {
        return res.status(403).json({
          success: false,
          message: "Company account required",
        });
      }

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Notification ID is required",
        });
      }

      await readNotification(
        notificationId,
        companyId,
      );

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
      });
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error,
      );

      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Notification not found",
      });
    }
  };