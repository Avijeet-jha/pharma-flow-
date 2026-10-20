import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingCart,
  Search,
  Loader2,
  RefreshCw,
  Warehouse,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

type Recommendation = {
  medicineId: string;
  medicineName: string;
  warehouseId: string;
  warehouseName: string;
  batchId: string;
  batchNumber: string;
  currentStock: number;
  soldLastDays: number;
  averageDailyDemand: number;
  targetStock: number;
  recommendedQuantity: number;
};

export default function RecommendationsView() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [daysWindow, setDaysWindow] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");

  const token = localStorage.getItem("token") || "";

  const fetchRecommendations = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/recommendations?days=${daysWindow}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRecommendations(data.data);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  }, [token, daysWindow]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Determine urgency level
  const getUrgencyLevel = (rec: Recommendation) => {
    if (rec.currentStock === 0) return "CRITICAL";
    const ratio = rec.currentStock / (rec.targetStock || 1);
    if (ratio < 0.3) return "HIGH";
    if (ratio < 0.7) return "MEDIUM";
    return "LOW";
  };

  // KPIs
  const kpis = useMemo(() => {
    let totalRecommendedUnits = 0;
    let criticalCount = 0;
    let stockoutCount = 0;

    recommendations.forEach((r) => {
      totalRecommendedUnits += r.recommendedQuantity;
      if (r.currentStock === 0) stockoutCount++;
      const urg = getUrgencyLevel(r);
      if (urg === "CRITICAL" || urg === "HIGH") criticalCount++;
    });

    return {
      skusNeedingReorder: recommendations.length,
      totalRecommendedUnits,
      criticalCount,
      stockoutCount,
    };
  }, [recommendations]);

  // Filtered recommendations
  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      const urg = getUrgencyLevel(r);
      if (urgencyFilter !== "ALL" && urg !== urgencyFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const med = r.medicineName.toLowerCase();
        const wh = r.warehouseName.toLowerCase();
        const bch = r.batchNumber.toLowerCase();
        return med.includes(q) || wh.includes(q) || bch.includes(q);
      }

      return true;
    });
  }, [recommendations, urgencyFilter, searchQuery]);

  const handleOrder = () => {
    const rawUser = localStorage.getItem("user");
    let role = "wholesaler";
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        role = u.role?.toLowerCase() || "wholesaler";
      } catch {
        // ignore
      }
    }
    navigate(`/${role}/supply-chain/purchase-orders`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            Predictive Reorder Recommendations
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Demand-velocity driven procurement suggestions to avoid stockouts and optimize inventory turnover.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium text-sm transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            Re-calculate
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Reorder Required</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.skusNeedingReorder} SKUs</h3>
            <p className="text-xs text-slate-500 mt-1">Based on {daysWindow}-day run rate</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Suggested Units</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {kpis.totalRecommendedUnits.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Total procurement quantity</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">High / Stockout Risk</p>
            <h3 className="text-2xl font-bold text-rose-700 mt-1">{kpis.criticalCount} SKUs</h3>
            <p className="text-xs text-rose-600/80 mt-1">
              {kpis.stockoutCount} completely out of stock
            </p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Algorithm Status</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">Optimal</h3>
            <p className="text-xs text-emerald-600/80 mt-1">Targeting buffer safety level</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Period Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <span className="text-slate-400 px-2 font-medium">History Window:</span>
            {[15, 30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDaysWindow(d)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  daysWindow === d
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((urg) => (
              <button
                key={urg}
                onClick={() => setUrgencyFilter(urg)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  urgencyFilter === urg
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {urg === "ALL" ? "All Priorities" : urg}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medicine or warehouse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Recommendations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm font-medium">Computing demand velocity & replenishment buffers...</p>
          </div>
        ) : filteredRecs.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 stroke-[1.5] text-emerald-500 mb-2" />
            <p className="text-base font-semibold text-slate-700">Inventory levels are healthy</p>
            <p className="text-xs text-slate-400 mt-1">
              No medicines currently fall below target threshold based on your {daysWindow}-day demand velocity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Medicine</th>
                  <th className="py-3.5 px-6">Warehouse</th>
                  <th className="py-3.5 px-6 text-right">Current Stock</th>
                  <th className="py-3.5 px-6 text-right">Sold ({daysWindow}d)</th>
                  <th className="py-3.5 px-6 text-right">Avg Daily Demand</th>
                  <th className="py-3.5 px-6 text-right">Target Buffer</th>
                  <th className="py-3.5 px-6 text-right">Recommended Order</th>
                  <th className="py-3.5 px-6">Urgency</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRecs.map((rec) => {
                  const urg = getUrgencyLevel(rec);

                  return (
                    <tr key={`${rec.medicineId}-${rec.warehouseId}-${rec.batchId}`} className="hover:bg-slate-50/75 transition">
                      {/* Medicine */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">
                          {rec.medicineName}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">
                          Batch: {rec.batchNumber}
                        </div>
                      </td>

                      {/* Warehouse */}
                      <td className="py-4 px-6">
                        <div className="text-slate-800 flex items-center gap-1.5 font-medium">
                          <Warehouse className="w-4 h-4 text-slate-400" />
                          {rec.warehouseName}
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`font-bold ${
                            rec.currentStock === 0 ? "text-rose-600" : "text-slate-800"
                          }`}
                        >
                          {rec.currentStock.toLocaleString()}
                        </span>
                      </td>

                      {/* Sold last N days */}
                      <td className="py-4 px-6 text-right text-slate-600 font-medium">
                        {rec.soldLastDays.toLocaleString()}
                      </td>

                      {/* Daily Demand */}
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <TrendingUp className="w-3 h-3 text-indigo-600" />
                          {rec.averageDailyDemand}/day
                        </span>
                      </td>

                      {/* Target Buffer */}
                      <td className="py-4 px-6 text-right text-slate-600 font-medium">
                        {rec.targetStock.toLocaleString()}
                      </td>

                      {/* Recommended Quantity */}
                      <td className="py-4 px-6 text-right">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200">
                          +{rec.recommendedQuantity.toLocaleString()}
                        </span>
                      </td>

                      {/* Urgency */}
                      <td className="py-4 px-6">
                        {urg === "CRITICAL" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            Stockout Risk
                          </span>
                        ) : urg === "HIGH" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            High
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={handleOrder}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                        >
                          <span>Reorder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
