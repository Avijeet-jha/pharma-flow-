import {
  getDashboardOverview,
  getAdminDashboardOverview,
} from "../repositories/dashboard.repository";


// ==========================================
// COMPANY DASHBOARD
// Pharma / Wholesaler / Retailer
// ==========================================

export const getDashboard = async (
  companyId: string
) => {
  return getDashboardOverview(companyId);
};


// ==========================================
// SUPER ADMIN DASHBOARD
// ==========================================

export const getAdminDashboard = async () => {
  return getAdminDashboardOverview();
};