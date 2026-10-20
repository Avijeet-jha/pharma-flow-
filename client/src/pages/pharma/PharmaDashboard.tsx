import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  IndianRupee,
  ShoppingCart,
  AlertTriangle,
  Clock,
  ArrowRight,
  Truck,
  FileText,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Loader2,
  Building2,
  Package,
} from "lucide-react";
import MainLayout from "../../layouts/MainLayout";

const API_BASE_URL = "http://localhost:5000/api";

type DashboardSummary = {
  totalMedicines: number;
  totalInventory: number;
  inventoryValue: number;
  totalSales: number;
  totalSalesCount: number;
  pendingPurchaseOrders: number;
  lowStockCount: number;
  expiringCount: number;
};

type RecentPO = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount?: number;
  createdAt: string;
  buyerCompany?: {
    companyName: string;
  };
  items?: Array<{
    quantity: number;
    medicine?: {
      medicineName: string;
    };
  }>;
};

type RecentSale = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  warehouse?: {
    warehouseName: string;
  };
};

export default function PharmaDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentPOs, setRecentPOs] = useState<RecentPO[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token") || "";

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSummary(data.data.summary || null);
        setRecentPOs(data.data.recentPurchaseOrders || []);
        setRecentSales(data.data.recentSales || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getPOStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Pending Approval</span>;
      case "APPROVED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Approved</span>;
      case "DISPATCHED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Dispatched</span>;
      case "DELIVERED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Delivered</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <MainLayout role="pharma">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Pharma Operations Center
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Live manufacturing inventory, wholesale purchase order fulfillment, and tax invoicing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/pharma/supply-chain/purchase-orders")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
            >
              <ShoppingCart className="w-4 h-4" />
              Review Incoming Orders
            </button>
          </div>
        </div>

        {/* Live KPI Cards */}
        {loading ? (
          <div className="p-12 flex justify-center items-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Inventory Stock */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Stock</span>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">
                {(summary?.totalInventory || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Across {summary?.totalMedicines || 0} catalog medicines
              </p>
            </div>

            {/* Inventory Valuation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inventory Value</span>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">
                ₹{(summary?.inventoryValue || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                At manufacturer MRP valuation
              </p>
            </div>

            {/* Pending Orders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending POs</span>
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-amber-700 mt-2">
                {summary?.pendingPurchaseOrders || 0}
              </h3>
              <p className="text-xs text-amber-600/80 mt-1">
                Awaiting stock check & price approval
              </p>
            </div>

            {/* Expiry Risk Alerts */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Expiring Batches</span>
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-rose-700 mt-2">
                {summary?.expiringCount || 0}
              </h3>
              <p className="text-xs text-rose-600/80 mt-1">
                Expiring in the next 30 days
              </p>
            </div>
          </div>
        )}

        {/* Quick Navigation Action Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/pharma/supply-chain/purchase-orders")}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              Order Fulfillment
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">Approve POs with 1/3 availability rule</p>
          </button>

          <button
            onClick={() => navigate("/pharma/supply-chain/dispatches")}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              Dispatches & Shipments
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">Create dispatch & deduct warehouse stock</p>
          </button>

          <button
            onClick={() => navigate("/pharma/supply-chain/invoices")}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              Invoices & Payments
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">GST tax bills, payments & reminders</p>
          </button>

          <button
            onClick={() => navigate("/pharma/expiry")}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              Expiry Alert Monitor
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">FEFO prioritized batch liquidation</p>
          </button>
        </div>

        {/* Recent Purchase Orders and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Purchase Orders List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Recent Purchase Orders
              </h3>
              <button
                onClick={() => navigate("/pharma/supply-chain/purchase-orders")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all orders <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentPOs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No recent purchase orders received.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPOs.map((po) => (
                  <div
                    key={po.id}
                    onClick={() => navigate("/pharma/supply-chain/purchase-orders")}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl transition cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                        <span>{po.orderNumber}</span>
                        {getPOStatusBadge(po.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        From: <span className="font-medium text-slate-700">{po.buyerCompany?.companyName || "Wholesaler"}</span>
                        {" • "}{po.items?.length || 0} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Insights / Highlights */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Operational Highlights
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  <Package className="w-4 h-4 text-blue-600" />
                  1/3 Rule Fulfillment
                </div>
                <p className="text-slate-600 mt-1">
                  Orders require at least 33.3% stock availability to be eligible for confirmation.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Sales Volume ({recentSales.length} Recent)
                </div>
                <p className="text-slate-600 mt-1">
                  Total completed sales: <span className="font-bold text-slate-800">₹{(summary?.totalSales || 0).toLocaleString("en-IN")}</span> across {summary?.totalSalesCount || 0} transactions.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Low Stock Watch
                </div>
                <p className="text-slate-600 mt-1">
                  {summary?.lowStockCount || 0} inventory items are currently at or below 100 units.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}