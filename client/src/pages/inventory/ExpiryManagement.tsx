import { useEffect, useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Clock,
  Search,
  Loader2,
  RefreshCw,
  TrendingDown,
  ShieldAlert,
  ArrowUpDown,
  Tag,
  Ban,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

type Medicine = {
  id: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
};

type ExpiryBatch = {
  id: string;
  medicineId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  mrp: number | string;
  quantity: number;
  medicine?: Medicine;
};

export default function ExpiryManagement() {
  const [activeTab, setActiveTab] = useState<"expiring" | "expired">("expiring");
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [expiringBatches, setExpiringBatches] = useState<ExpiryBatch[]>([]);
  const [expiredBatches, setExpiredBatches] = useState<ExpiryBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const token = localStorage.getItem("token") || "";

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [expiringRes, expiredRes] = await Promise.all([
        fetch(`${API_BASE_URL}/expiry/expiring?days=${daysFilter}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/expiry/expired`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const expiringData = await expiringRes.json();
      const expiredData = await expiredRes.json();

      if (expiringData.success && Array.isArray(expiringData.data)) {
        setExpiringBatches(expiringData.data);
      }
      if (expiredData.success && Array.isArray(expiredData.data)) {
        setExpiredBatches(expiredData.data);
      }
    } catch (err) {
      console.error("Error fetching expiry data:", err);
    } finally {
      setLoading(false);
    }
  }, [token, daysFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate days difference
  const getDaysRemaining = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // KPIs
  const kpis = useMemo(() => {
    let unitsExpiring = 0;
    let valueExpiring = 0;
    expiringBatches.forEach((b) => {
      const q = Number(b.quantity) || 0;
      const m = Number(b.mrp) || 0;
      unitsExpiring += q;
      valueExpiring += q * m;
    });

    let unitsExpired = 0;
    let valueExpired = 0;
    expiredBatches.forEach((b) => {
      const q = Number(b.quantity) || 0;
      const m = Number(b.mrp) || 0;
      unitsExpired += q;
      valueExpired += q * m;
    });

    return {
      expiringCount: expiringBatches.length,
      unitsExpiring,
      valueExpiring,
      expiredCount: expiredBatches.length,
      unitsExpired,
      valueExpired,
    };
  }, [expiringBatches, expiredBatches]);

  // Filtered and sorted batches
  const displayedBatches = useMemo(() => {
    const sourceList = activeTab === "expiring" ? expiringBatches : expiredBatches;

    const filtered = sourceList.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const medName = b.medicine?.medicineName?.toLowerCase() || "";
      const genName = b.medicine?.genericName?.toLowerCase() || "";
      const batchNum = b.batchNumber.toLowerCase();
      return medName.includes(q) || genName.includes(q) || batchNum.includes(q);
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.expiryDate).getTime();
      const dateB = new Date(b.expiryDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [activeTab, expiringBatches, expiredBatches, searchQuery, sortOrder]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
            Expiry Tracking & Early Alerts
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Proactively manage shelf-life risk, prevent expired dispensing, and protect operating capital.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium text-sm transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Expiring in {daysFilter} Days</p>
            <h3 className="text-2xl font-bold text-amber-700 mt-1">{kpis.expiringCount} Batches</h3>
            <p className="text-xs text-slate-500 mt-1">{kpis.unitsExpiring.toLocaleString()} units</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Expiring Stock Value</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              ₹{kpis.valueExpiring.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 mt-1">At risk of loss</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Already Expired</p>
            <h3 className="text-2xl font-bold text-rose-700 mt-1">{kpis.expiredCount} Batches</h3>
            <p className="text-xs text-rose-600/80 mt-1">{kpis.unitsExpired.toLocaleString()} units expired</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Expired Loss Value</p>
            <h3 className="text-2xl font-bold text-rose-700 mt-1">
              ₹{kpis.valueExpired.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-rose-600/80 mt-1">Requires quarantine / return</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <Ban className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("expiring")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "expiring"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-4 h-4" />
              Expiring Soon ({kpis.expiringCount})
            </button>
            <button
              onClick={() => setActiveTab("expired")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "expired"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              Expired Batches ({kpis.expiredCount})
            </button>
          </div>

          {activeTab === "expiring" && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-slate-400 px-2 font-medium">Window:</span>
              {[15, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDaysFilter(d)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    daysFilter === d
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medicine or batch #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            title="Sort by expiry date"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortOrder === "asc" ? "Earliest First" : "Latest First"}
          </button>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
            <p className="text-sm font-medium">Scanning inventory for expiry risk...</p>
          </div>
        ) : displayedBatches.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <ShieldAlert className="w-12 h-12 stroke-[1.5] text-slate-300 mb-2" />
            <p className="text-base font-semibold text-slate-600">No {activeTab} batches detected</p>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === "expiring"
                ? `All medicines have more than ${daysFilter} days before expiration.`
                : "No expired stock found in your warehouses."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Medicine & Formula</th>
                  <th className="py-3.5 px-6">Batch Details</th>
                  <th className="py-3.5 px-6">Expiry Date</th>
                  <th className="py-3.5 px-6">Time Status</th>
                  <th className="py-3.5 px-6">Stock & Units</th>
                  <th className="py-3.5 px-6">Total Value (₹)</th>
                  <th className="py-3.5 px-6 text-right">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayedBatches.map((batch) => {
                  const daysLeft = getDaysRemaining(batch.expiryDate);
                  const totalValue = (Number(batch.quantity) || 0) * (Number(batch.mrp) || 0);

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/75 transition">
                      {/* Medicine */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{batch.medicine?.medicineName || "Unknown Medicine"}</span>
                          {batch.medicine?.strength && (
                            <span className="text-xs text-slate-500 font-normal">
                              ({batch.medicine.strength})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {batch.medicine?.dosageForm || "Tablet"} • {batch.medicine?.genericName || "Generic"}
                        </div>
                      </td>

                      {/* Batch Details */}
                      <td className="py-4 px-6">
                        <div className="font-mono font-medium text-slate-800 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          {batch.batchNumber}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Mfg: {new Date(batch.manufacturingDate).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(batch.expiryDate).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Time Status */}
                      <td className="py-4 px-6">
                        {daysLeft < 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertOctagon className="w-3 h-3" />
                            Expired {Math.abs(daysLeft)}d ago
                          </span>
                        ) : daysLeft <= 15 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            {daysLeft} days remaining
                          </span>
                        ) : daysLeft <= 30 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            {daysLeft} days remaining
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                            <Clock className="w-3 h-3" />
                            {daysLeft} days remaining
                          </span>
                        )}
                      </td>

                      {/* Stock & Units */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">
                          {Number(batch.quantity).toLocaleString()} Units
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          MRP: ₹{Number(batch.mrp).toFixed(2)}/unit
                        </div>
                      </td>

                      {/* Total Value */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>

                      {/* Recommended Action */}
                      <td className="py-4 px-6 text-right">
                        {daysLeft < 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                            <Ban className="w-3.5 h-3.5" />
                            Quarantine / Dispose
                          </span>
                        ) : daysLeft <= 15 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Priority Dispatch
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                            <Tag className="w-3.5 h-3.5" />
                            Discount & Sell (FEFO)
                          </span>
                        )}
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
