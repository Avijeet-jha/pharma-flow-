import {
  Building2,
  Users,
  ClipboardCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../layouts/MainLayout";
import KPICard from "../../components/cards/KPICard";
import AnalyticsPanel from "../../components/charts/AnalyticsPanel";
import PlatformAnalytics from "../../components/charts/PlatformAnalytics";
import PendingApprovalPanel from "../../components/dashboard/PendingApprovalPanel";
import NotificationPanel from "../../components/dashboard/NotificationPanel";
import RecentActivityPanel from "../../components/dashboard/RecentActivityPanel";

// ==========================================
// DASHBOARD SUMMARY TYPE
// ==========================================

type AdminDashboardData = {
  totalCompanies: number;
  totalUsers: number;
  pendingApprovals: number;
  activeCompanies: number;
  activeSubscriptions: number | null;
};

// ==========================================
// COMPANY GROWTH TYPE
// ==========================================

type CompanyGrowthItem = {
  month?: string;
  quarter?: string;
  year?: number;
  companies: number;
};

// ==========================================
// USER GROWTH TYPE
// ==========================================

type UserGrowthItem = {
  month?: string;
  quarter?: string;
  year?: number;
  users: number;
};

// ==========================================
// USER DISTRIBUTION TYPE
// ==========================================

type UserDistributionItem = {
  role: string;
  users: number;
};

// ==========================================
// ADMIN ANALYTICS TYPE
// ==========================================

type AdminAnalyticsData = {
  companyGrowth: {
    monthly: CompanyGrowthItem[];
    quarterly: CompanyGrowthItem[];
    yearly: CompanyGrowthItem[];
  };

  userGrowth: {
    monthly: UserGrowthItem[];
    quarterly: UserGrowthItem[];
    yearly: UserGrowthItem[];
  };

  userDistribution: UserDistributionItem[];

  subscriptionOverview: null;
};

// ==========================================
// API RESPONSE TYPE
// ==========================================

type AdminDashboardResponse = {
  success: boolean;

  data?: {
    summary: AdminDashboardData;
    analytics: AdminAnalyticsData;
  };

  message?: string;
};

// ==========================================
// ADMIN DASHBOARD
// ==========================================

function AdminDashboard() {
  const navigate = useNavigate();

  // ==========================================
  // DASHBOARD SUMMARY STATE
  // ==========================================

  const [dashboardData, setDashboardData] =
    useState<AdminDashboardData | null>(null);

  // ==========================================
  // ANALYTICS STATE
  // ==========================================

  const [analyticsData, setAnalyticsData] =
    useState<AdminAnalyticsData | null>(null);

  // ==========================================
  // LOADING STATE
  // ==========================================

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // ERROR STATE
  // ==========================================

  const [error, setError] =
    useState("");

  // ==========================================
  // FETCH ADMIN DASHBOARD
  // ==========================================

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // Get authentication token
        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found"
          );
        }

        // ======================================
        // API REQUEST
        // ======================================

        const response = await fetch(
          "http://localhost:5000/api/dashboard/overview",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // ======================================
        // PARSE RESPONSE
        // ======================================

        const result: AdminDashboardResponse =
          await response.json();

        // ======================================
        // VALIDATE RESPONSE
        // ======================================

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to fetch dashboard"
          );
        }

        // ======================================
        // VALIDATE DASHBOARD DATA
        // ======================================

        if (!result.data?.summary) {
          throw new Error(
            "Invalid dashboard response"
          );
        }

        // ======================================
        // STORE SUMMARY
        // ======================================

        setDashboardData(
          result.data.summary
        );

        // ======================================
        // STORE ANALYTICS
        // ======================================

        if (result.data.analytics) {
          setAnalyticsData(
            result.data.analytics
          );
        } else {
          setAnalyticsData(null);
        }

      } catch (error) {

        console.error(
          "Admin dashboard error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard"
        );

      } finally {

        setLoading(false);

      }
    };

    fetchAdminDashboard();

  }, []);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <MainLayout role="admin">

      <div className="space-y-6">

        {/* ====================================
            PAGE TITLE
        ==================================== */}

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>

          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening
            across the PharmaFlow platform.
          </p>

        </div>


        {/* ====================================
            LOADING
        ==================================== */}

        {loading && (

          <div className="bg-white rounded-xl shadow-md p-6">

            <p className="text-gray-500">
              Loading dashboard data...
            </p>

          </div>

        )}


        {/* ====================================
            ERROR
        ==================================== */}

        {error && !loading && (

          <div className="bg-red-100 text-red-700 rounded-xl p-4">

            {error}

          </div>

        )}


        {/* ====================================
            KPI CARDS
        ==================================== */}

        {!loading &&
          !error &&
          dashboardData && (

            <div className="grid grid-cols-4 gap-6">

              {/* TOTAL COMPANIES */}

              <KPICard
                title="Total Companies"
                value={String(
                  dashboardData.totalCompanies
                )}
                icon={
                  <Building2 size={30} />
                }
                onClick={() => {
                  navigate(
                    "/admin/company-management/companies"
                  );
                }}
              />


              {/* TOTAL USERS */}

              <KPICard
                title="Total Users"
                value={String(
                  dashboardData.totalUsers
                )}
                icon={
                  <Users size={30} />
                }
                onClick={() => {
                  navigate(
                    "/admin/company-management/companies"
                  );
                }}
              />


              {/* PENDING APPROVALS */}

              <KPICard
                title="Pending Approvals"
                value={String(
                  dashboardData.pendingApprovals
                )}
                icon={
                  <ClipboardCheck size={30} />
                }
                onClick={() => {
                  navigate(
                    "/admin/company-management/approvals"
                  );
                }}
              />


              {/* ACTIVE COMPANIES */}

              <KPICard
                title="Active Companies"
                value={String(
                  dashboardData.activeCompanies
                )}
                icon={
                  <Building2 size={30} />
                }
                onClick={() => {
                  navigate(
                    "/admin/company-management/companies"
                  );
                }}
              />

            </div>

          )}


        {/* ====================================
            PLATFORM ANALYTICS
        ==================================== */}

        <PlatformAnalytics
          analytics={analyticsData}
        />


        {/* ====================================
            BUSINESS INSIGHTS
        ==================================== */}

        <AnalyticsPanel />


        {/* ====================================
            PENDING + NOTIFICATIONS
        ==================================== */}

        <div className="grid grid-cols-2 gap-6">

          <PendingApprovalPanel />

          <NotificationPanel />

        </div>


        {/* ====================================
            RECENT ACTIVITY
        ==================================== */}

        <div className="grid grid-cols-2 gap-6 mt-6">

          <RecentActivityPanel />

        </div>

      </div>

    </MainLayout>
  );
}

export default AdminDashboard;