import { Routes, Route } from "react-router-dom";

import Login from "./pages/login.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// ============================================================
// ADMIN
// ============================================================
import AdminDashboard from "./pages/admin/AdminDashboard";
import CompanyManagement from "./pages/admin/CompanyManagement";
import Settings from "./pages/admin/Settings";

// ============================================================
// WAREHOUSE
// ============================================================
import WarehouseManagement from "./pages/warehouse/WarehouseManagement";

// ============================================================
// SUPPLY CHAIN
// ============================================================
import PurchaseOrderManagement from "./pages/supply-chain/PurchaseOrderManagement";
import InvoiceManagement from "./pages/supply-chain/InvoiceManagement";
import DispatchManagement from "./pages/supply-chain/DispatchManagement";
import InventoryManagement from "./pages/inventory/InventoryManagement";
import ExpiryManagement from "./pages/inventory/ExpiryManagement";

// ============================================================
// ADMIN - COMPANY MANAGEMENT
// ============================================================
import Companies from "./pages/admin/company/Companies";
import CompanyDetails from "./pages/admin/company/CompanyDetails";
import CompanyApprovals from "./pages/admin/company/CompanyApprovals";
import CompanyDocuments from "./pages/admin/company/CompanyDocuments";
import CompanyDocumentsList from "./pages/admin/company/CompanyDocumentsList";
import CompanyPerformance from "./pages/admin/company/CompanyPerformance";
import CompanyPerformanceDetails from "./pages/admin/company/CompanyPerformanceDetails";
import RegisterCompany from "./pages/admin/company/RegisterCompany";

// ============================================================
// ADMIN - ANALYTICS
// ============================================================
import MedicineUsage from "./pages/admin/analytics/MedicineUsage";
import InventoryMovement from "./pages/admin/analytics/InventoryMovement";
import DemandTrends from "./pages/admin/analytics/DemandTrends";
import CompanyRanking from "./pages/admin/analytics/CompanyRanking";
import MarketInsights from "./pages/admin/MarketInsights";

// ============================================================
// OTHER ROLES
// ============================================================
import PharmaDashboard from "./pages/pharma/PharmaDashboard";
import WholesalerDashboard from "./pages/wholesaler/WholesalerDashboard";
import RetailerDashboard from "./pages/retailer/RetailerDashboard";

function App() {
  return (
    <Routes>
      {/* ======================================================
          LOGIN
      ====================================================== */}

      <Route path="/" element={<Login />} />

      {/* ======================================================
          SUPER ADMIN
      ====================================================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ------------------------------------------------------
          Admin - Company Management
      ------------------------------------------------------ */}

      <Route
        path="/admin/company-management"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <CompanyManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/company-management/companies"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <Companies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/company-management/companies/:id"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <CompanyDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/company-management/approvals"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <CompanyApprovals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/company-management/documents"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <CompanyDocumentsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/company-management/documents/:companyId"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <CompanyDocuments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/company-management/performance"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <CompanyPerformance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/company-management/performance/:id"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <CompanyPerformanceDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/company-management/register"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <RegisterCompany />
          </ProtectedRoute>
        }
      />

      {/* ------------------------------------------------------
          Admin - Analytics
      ------------------------------------------------------ */}

      <Route
        path="/admin/analytics/medicine-usage"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <MedicineUsage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/analytics/inventory-movement"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <InventoryMovement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/analytics/demand-trends"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <DemandTrends />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/analytics/company-ranking"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <CompanyRanking />
          </ProtectedRoute>
        }
      />

      {/* ------------------------------------------------------
          Admin - Market Insights
      ------------------------------------------------------ */}

      <Route
        path="/admin/market-insights"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <MainLayout role="admin">
              <MarketInsights />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ------------------------------------------------------
          Admin - Settings
      ------------------------------------------------------ */}

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          PHARMA
      ====================================================== */}

      {/* Pharma Dashboard */}

      <Route
        path="/pharma"
        element={
          <ProtectedRoute allowedRoles={["PHARMA"]}>
            <PharmaDashboard />
          </ProtectedRoute>
        }
      />

      {/* ------------------------------------------------------
          Pharma - Warehouses
      ------------------------------------------------------ */}

      <Route
        path="/pharma/warehouses"
        element={
          <ProtectedRoute allowedRoles={["PHARMA"]}>
            <MainLayout role="pharma">
              <WarehouseManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ------------------------------------------------------
          Pharma - Purchase Orders
      ------------------------------------------------------ */}

      <Route
        path="/pharma/supply-chain/purchase-orders"
        element={
          <ProtectedRoute allowedRoles={["PHARMA"]}>
            <MainLayout role="pharma">
              <PurchaseOrderManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/pharma/supply-chain/invoices"
        element={
          <ProtectedRoute allowedRoles={["PHARMA"]}>
            <MainLayout role="pharma">
              <InvoiceManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          WHOLESALER
      ====================================================== */}

      {/* Wholesaler Dashboard */}

      <Route
        path="/wholesaler"
        element={
          <ProtectedRoute allowedRoles={["WHOLESALER"]}>
            <WholesalerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ------------------------------------------------------
          Wholesaler - Warehouses
      ------------------------------------------------------ */}

      <Route
        path="/wholesaler/warehouses"
        element={
          <ProtectedRoute allowedRoles={["WHOLESALER"]}>
            <MainLayout role="wholesaler">
              <WarehouseManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ------------------------------------------------------
          Wholesaler - Purchase Orders / Purchase Requests
      ------------------------------------------------------ */}

      <Route
        path="/wholesaler/supply-chain/purchase-orders"
        element={
          <ProtectedRoute allowedRoles={["WHOLESALER"]}>
            <MainLayout role="wholesaler">
              <PurchaseOrderManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wholesaler/inventory"
        element={
          <ProtectedRoute allowedRoles={["WHOLESALER"]}>
            <MainLayout role="wholesaler">
              <InventoryManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wholesaler/inventory/expiry"
        element={
          <ProtectedRoute allowedRoles={["WHOLESALER"]}>
            <MainLayout role="wholesaler">
              <ExpiryManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wholesaler/supply-chain/dispatches"
        element={
          <ProtectedRoute allowedRoles={["WHOLESALER"]}>
            <MainLayout role="wholesaler">
              <DispatchManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/pharma/supply-chain/dispatches"
        element={
          <ProtectedRoute allowedRoles={["PHARMA"]}>
            <MainLayout role="pharma">
              <DispatchManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wholesaler/supply-chain/invoices"
        element={
          <ProtectedRoute allowedRoles={["WHOLESALER"]}>
            <MainLayout role="wholesaler">
              <InvoiceManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          RETAILER
      ====================================================== */}

      {/* Retailer Dashboard */}

      <Route
        path="/retailer"
        element={
          <ProtectedRoute allowedRoles={["RETAILER"]}>
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ------------------------------------------------------
          Retailer - Warehouses
      ------------------------------------------------------ */}

      <Route
        path="/retailer/warehouses"
        element={
          <ProtectedRoute allowedRoles={["RETAILER"]}>
            <MainLayout role="retailer">
              <WarehouseManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
