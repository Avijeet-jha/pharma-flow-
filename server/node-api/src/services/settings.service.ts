import bcrypt from "bcrypt";
import prisma from "../config/prisma";

// ==========================================
// GET CURRENT USER PROFILE
// ==========================================

export const getUserProfile = async (
  userId: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// ==========================================
// UPDATE CURRENT USER PROFILE
// ==========================================

export const updateUserProfile = async (
  userId: string,
  name: string,
  email: string
) => {
  const existingUser =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Check if another user already has this email
  if (email !== existingUser.email) {
    const emailExists =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (emailExists) {
      throw new Error(
        "This email is already being used"
      );
    }
  }

  const updatedUser =
    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        name,
        email,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return updatedUser;
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

  if (!user) {
    throw new Error("User not found");
  }

  // Check current password
  const passwordValid =
    await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

  if (!passwordValid) {
    throw new Error(
      "Current password is incorrect"
    );
  }

  // Prevent using the same password
  const samePassword =
    await bcrypt.compare(
      newPassword,
      user.passwordHash
    );

  if (samePassword) {
    throw new Error(
      "New password must be different from the current password"
    );
  }

  // Hash new password
  const newPasswordHash =
    await bcrypt.hash(
      newPassword,
      10
    );

  await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      passwordHash: newPasswordHash,
    },
  });

  return {
    success: true,
  };
};

// ==========================================
// GET USER SETTINGS
// ==========================================

export const getUserSettings = async (
  userId: string
) => {
  let settings =
    await prisma.userSettings.findUnique({
      where: {
        userId,
      },
    });

  // Create default settings automatically
  // if this user doesn't have settings yet.
  if (!settings) {
    settings =
      await prisma.userSettings.create({
        data: {
          userId,
        },
      });
  }

  return settings;
};

// ==========================================
// UPDATE USER SETTINGS
// ==========================================

export const updateUserSettings = async (
  userId: string,
  emailNotifications: boolean,
  approvalNotifications: boolean,
  systemAlerts: boolean,
  language: string
) => {
  const settings =
    await prisma.userSettings.upsert({
      where: {
        userId,
      },

      create: {
        userId,
        emailNotifications,
        approvalNotifications,
        systemAlerts,
        language,
      },

      update: {
        emailNotifications,
        approvalNotifications,
        systemAlerts,
        language,
      },
    });

  return settings;
};