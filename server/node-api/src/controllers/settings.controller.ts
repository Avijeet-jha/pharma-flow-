import { Response } from "express";

import {
  AuthRequest,
} from "../middlewares/auth.middleware";

import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getUserSettings,
  updateUserSettings,
} from "../services/settings.service";

// ==========================================
// GET PROFILE
// ==========================================

export const getProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const profile =
      await getUserProfile(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });

  } catch (error) {

    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch profile",
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const {
      name,
      email,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Name and email are required",
      });
    }

    const profile =
      await updateUserProfile(
        userId,
        name,
        email
      );

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      data: profile,
    });

  } catch (error) {

    console.error(
      "Update profile error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update profile",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

export const changePassword = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 6 characters",
      });
    }

    await changeUserPassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });

  } catch (error) {

    console.error(
      "Change password error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to change password",
    });
  }
};

// ==========================================
// GET USER SETTINGS
// ==========================================

export const getSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const settings =
      await getUserSettings(userId);

    return res.status(200).json({
      success: true,
      data: settings,
    });

  } catch (error) {
    console.error(
      "Get settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch settings",
    });
  }
};


// ==========================================
// UPDATE USER SETTINGS
// ==========================================

export const updateSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      emailNotifications,
      approvalNotifications,
      systemAlerts,
      language,
    } = req.body;

    if (
      typeof emailNotifications !== "boolean" ||
      typeof approvalNotifications !== "boolean" ||
      typeof systemAlerts !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notification settings must be true or false",
      });
    }

    if (!language || typeof language !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Language is required",
      });
    }

    const settings =
      await updateUserSettings(
        userId,
        emailNotifications,
        approvalNotifications,
        systemAlerts,
        language
      );

    return res.status(200).json({
      success: true,
      message:
        "Settings updated successfully",
      data: settings,
    });

  } catch (error) {
    console.error(
      "Update settings error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update settings",
    });
  }
};