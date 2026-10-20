import {
  getAdminDashboardOverview,
} from "../repositories/adminDashboard.repository";

export const getAdminDashboard = async () => {
  return getAdminDashboardOverview();
};