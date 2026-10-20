import prisma from "../config/prisma";

export const getAdminDashboardOverview = async () => {
  const [
    totalCompanies,
    totalUsers,
    pendingApprovals,
    activeCompanies,
  ] = await Promise.all([
    // Total registered companies
    prisma.company.count(),

    // Total users
    prisma.user.count(),

    // Companies waiting for approval
    prisma.company.count({
      where: {
        status: "PENDING",
      },
    }),

    // Currently active companies
    prisma.company.count({
      where: {
        status: "ACTIVE",
      },
    }),
  ]);

  return {
    totalCompanies,
    totalUsers,
    pendingApprovals,
    activeCompanies,

    // Subscription system is not implemented
    // in the current Prisma schema.
    activeSubscriptions: null,
  };
};