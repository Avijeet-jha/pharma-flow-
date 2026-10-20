import prisma from "../config/prisma";

export const createNotification = async (
  senderCompanyId: string,
  recipientCompanyId: string,
  title: string,
  message: string,
  type: string = "GENERAL",
) => {
  return prisma.notification.create({
    data: {
      senderCompanyId,
      recipientCompanyId,
      title,
      message,
      type,
    },
  });
};

export const getNotificationsByCompany = async (
  companyId: string,
) => {
  return prisma.notification.findMany({
    where: {
      recipientCompanyId: companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getUnreadNotificationCount = async (
  companyId: string,
) => {
  return prisma.notification.count({
    where: {
      recipientCompanyId: companyId,
      isRead: false,
    },
  });
};

export const markNotificationAsRead = async (
  notificationId: string,
  companyId: string,
) => {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      recipientCompanyId: companyId,
    },
    data: {
      isRead: true,
    },
  });
};