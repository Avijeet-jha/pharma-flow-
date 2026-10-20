import {
  createNotification,
  getNotificationsByCompany,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "../repositories/notification.repository";

import {
  getPurchaseOrderById,
} from "../repositories/purchaseOrder.repository";

import {
  getPendingUnpaidAmount,
} from "../repositories/customerBalance.repository";

// =========================================================
// CREATE / SEND NOTIFICATION
// =========================================================

export const sendNotification = async (
  senderCompanyId: string,
  recipientCompanyId: string,
  title: string,
  message: string,
  type: string = "GENERAL",
) => {
  return createNotification(
    senderCompanyId,
    recipientCompanyId,
    title,
    message,
    type,
  );
};

// =========================================================
// GET COMPANY NOTIFICATIONS
// =========================================================

export const getCompanyNotifications = async (
  companyId: string,
) => {
  return getNotificationsByCompany(companyId);
};

// =========================================================
// GET UNREAD NOTIFICATION COUNT
// =========================================================

export const getCompanyUnreadNotificationCount = async (
  companyId: string,
) => {
  return getUnreadNotificationCount(companyId);
};

// =========================================================
// MARK NOTIFICATION AS READ
// =========================================================

export const readNotification = async (
  notificationId: string,
  companyId: string,
) => {
  const result = await markNotificationAsRead(
    notificationId,
    companyId,
  );

  if (result.count === 0) {
    throw new Error("Notification not found");
  }

  return {
    success: true,
  };
};

// =========================================================
// SEND PAYMENT REMINDER FOR PURCHASE ORDER
// =========================================================
//
// Pharma sends a payment reminder to the wholesaler
// associated with the purchase order.
//
// The backend automatically:
// 1. Finds the purchase order
// 2. Identifies the wholesaler
// 3. Gets the current pending unpaid amount
// 4. Creates the notification
//
// =========================================================

export const sendPaymentReminderForOrder = async (
  pharmaCompanyId: string,
  purchaseOrderId: string,
) => {
  // -------------------------------------------------------
  // 1. Get purchase order
  // -------------------------------------------------------

  const purchaseOrder =
    await getPurchaseOrderById(
      purchaseOrderId,
      pharmaCompanyId,
    );

  if (!purchaseOrder) {
    throw new Error(
      "Purchase order not found",
    );
  }

  // -------------------------------------------------------
  // 2. Make sure Pharma is the seller
  // -------------------------------------------------------

  if (
    purchaseOrder.sellerCompanyId !==
    pharmaCompanyId
  ) {
    throw new Error(
      "Only the Pharma company can send this reminder",
    );
  }

  // -------------------------------------------------------
  // 3. Get current customer balance
  // -------------------------------------------------------

  const balance =
    await getPendingUnpaidAmount(
      pharmaCompanyId,
      purchaseOrder.buyerCompanyId,
    );

  // -------------------------------------------------------
  // 4. Create payment reminder notification
  // -------------------------------------------------------

  const notification =
    await createNotification(
      pharmaCompanyId,
      purchaseOrder.buyerCompanyId,
      "Payment Reminder",
      `Your pending unpaid amount is ₹${balance.pendingUnpaidAmount.toLocaleString(
        "en-IN",
      )}. Please clear the pending amount at your earliest convenience.`,
      "PAYMENT_REMINDER",
    );

  return notification;
};