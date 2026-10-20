import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Boxes,
  IndianRupee,
  ShoppingCart,
  Truck,
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  TrendingUp,
  Loader2,
  AlertTriangle,
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
  sellerCompany?: {
    companyName: string;
  };
  items?: Array<{
    quantity: number;
    medicine?: {
      medicineName: string;
    };
  }>;
};

export default function WholesalerDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentPOs, setRecentPOs] = useState<RecentPO[]>([]);
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
      }
    } catch (err) {
      console.error("Failed to load wholesaler dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchDashboardData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchDashboardData]);

  const getPOStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Awaiting Pharma</span>;
      case "APPROVED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Pharma Approved</span>;
      case "DISPATCHED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 animate-pulse">In Transit</span>;
      case "DELIVERED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Received & Added</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <MainLayout role="wholesaler">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-600" />
              Wholesale Distribution Hub
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Procure from pharma manufacturers, track inbound dispatches, manage warehouse stock, and supply retailers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/wholesaler/supply-chain/purchase-orders")}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
            >
              <ShoppingCart className="w-4 h-4" />
              New Purchase Order
            </button>
          </div>
        </div>

        {/* Live KPI Cards */}
        {loading ? (
          <div className="p-12 flex justify-center items-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Warehouse Inventory */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Stock</span>
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">
                {(summary?.totalInventory || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Across registered warehouses
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
                At wholesale MRP valuation
              </p>
            </div>

            {/* Active Procurement Orders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Active Orders</span>
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-amber-700 mt-2">
                {summary?.pendingPurchaseOrders || 0}
              </h3>
              <p className="text-xs text-amber-600/80 mt-1">
                Orders with pharma suppliers
              </p>
            </div>

            {/* Low Stock SKUs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Low Stock SKUs</span>
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-rose-700 mt-2">
                {summary?.lowStockCount || 0}
              </h3>
              <p className="text-xs text-rose-600/80 mt-1">
                SKUs below minimum safe buffer
              </p>
            </div>
          </div>
        )}

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/wholesaler/supply-chain/purchase-orders")}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              Purchase Orders
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">Place orders with Pharma suppliers</p>
          </button>

          <button
            onClick={() => navigate("/wholesaler/supply-chain/dispatches")}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              Inbound Dispatches
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">Confirm delivery & auto-increment stock</p>
          </button>

          <button
            onClick={() => navigate("/wholesaler/supply-chain/invoices")}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              Invoices & Bills
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">View tax invoices & record payments</p>
          </button>

          <button
            onClick={() => navigate("/wholesaler/recommendations")}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              Smart Recommendations
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">AI predictive reorder suggestions</p>
          </button>
        </div>

        {/* Recent POs and Workflow Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Purchase Orders List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                Recent Orders Placed
              </h3>
              <button
                onClick={() => navigate("/wholesaler/supply-chain/purchase-orders")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all orders <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentPOs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No recent purchase orders created yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPOs.map((po) => (
                  <div
                    key={po.id}
                    onClick={() => navigate("/wholesaler/supply-chain/purchase-orders")}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl transition cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                        <span>{po.orderNumber}</span>
                        {getPOStatusBadge(po.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supplier: <span className="font-medium text-slate-700">{po.sellerCompany?.companyName || "Pharma Manufacturer"}</span>
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

          {/* Supply Chain Workflow Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              End-to-End Workflow
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-800">Place PO Request</p>
                  <p className="text-slate-500">Request required medicines & quantity from Pharma.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-800">Pharma 1/3 Rule & Pricing</p>
                  <p className="text-slate-500">Pharma confirms price, discounts, and batch eligibility.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-800">Dispatch & Delivery</p>
                  <p className="text-slate-500">Pharma dispatches, you confirm delivery to increase stock.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  4
                </div>
                <div>
                  <p className="font-bold text-slate-800">GST Invoice & Payment</p>
                  <p className="text-slate-500">Reconcile compliant GST tax invoice and record payments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}