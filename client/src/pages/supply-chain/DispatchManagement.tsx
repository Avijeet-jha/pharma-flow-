import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Truck,
  Search,
  Plus,
  X,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

type Warehouse = {
  id: string;
  warehouseName: string;
  companyId: string;
  address?: string;
  city?: string;
  state?: string;
};

type DispatchItem = {
  id: string;
  dispatchId: string;
  batchId: string;
  quantity: number;
  batch?: {
    id: string;
    batchNumber: string;
    expiryDate: string;
    mrp: number;
    medicine?: {
      id: string;
      medicineName: string;
      strength?: string;
    };
  };
};

type Dispatch = {
  id: string;
  purchaseOrderId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  status: "PENDING" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  dispatchedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;

  purchaseOrder?: {
    id: string;
    orderNumber: string;
    buyerCompanyId: string;
    sellerCompanyId: string;
    buyerCompany?: {
      id: string;
      companyName: string;
      city?: string;
      state?: string;
    };
    sellerCompany?: {
      id: string;
      companyName: string;
      city?: string;
      state?: string;
    };
  };

  sourceWarehouse?: Warehouse;
  destinationWarehouse?: Warehouse;
  items?: DispatchItem[];
};

type ApprovedPurchaseOrder = {
  id: string;
  orderNumber: string;
  buyerCompanyId: string;
  sellerCompanyId: string;
  status: string;
  buyerCompany?: {
    id: string;
    companyName: string;
  };
  items?: {
    id: string;
    medicineId: string;
    batchId?: string;
    quantity: number; // approved quantity
    medicine?: {
      id: string;
      medicineName: string;
    };
    batch?: {
      id: string;
      batchNumber: string;
    };
  }[];
};

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

function getCompanyId() {
  try {
    const user =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null");
    return user?.companyId || "";
  } catch {
    return "";
  }
}

function getUserRole() {
  try {
    const user =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null");
    return user?.role || "";
  } catch {
    return "";
  }
}

function formatDate(date?: string) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDispatchBadge(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "DISPATCHED":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

export default function DispatchManagement() {
  const userRole = getUserRole();
  const companyId = getCompanyId();
  const isPharma = userRole === "PHARMA";

  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);

  /* Toast Notification */
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    window.setTimeout(() => setToastMessage(""), 3500);
  };

  /* Create Dispatch States (Pharma) */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingDispatch, setCreatingDispatch] = useState(false);
  const [approvedOrders, setApprovedOrders] = useState<ApprovedPurchaseOrder[]>([]);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [myWarehouses, setMyWarehouses] = useState<Warehouse[]>([]);
  const [destinationWarehouses, setDestinationWarehouses] = useState<Warehouse[]>([]);
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [destinationWarehouseId, setDestinationWarehouseId] = useState("");
  const [dispatchItemsInput, setDispatchItemsInput] = useState<{ batchId: string; batchNumber: string; medicineName: string; maxQty: number; quantity: number }[]>([]);

  /* Action loading */
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* =========================================================
     FETCH DISPATCHES
  ========================================================= */

  const fetchDispatches = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/dispatches`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch dispatches");
      }

      setDispatches(result.data || []);
    } catch (err) {
      console.error("Fetch dispatches error:", err);
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDispatches();
  }, [fetchDispatches]);

  /* =========================================================
     FETCH DATA FOR CREATE DISPATCH MODAL
  ========================================================= */

  const openCreateDispatchModal = async () => {
    setShowCreateModal(true);
    setSelectedPoId("");
    setSourceWarehouseId("");
    setDestinationWarehouseId("");
    setDispatchItemsInput([]);

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      // 1. Fetch approved purchase orders where I am seller
      const poRes = await fetch(`${API_BASE_URL}/purchase-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const poData = await poRes.json();
      if (poRes.ok && poData.success && Array.isArray(poData.data)) {
        const approvedOnly = poData.data.filter(
          (o: ApprovedPurchaseOrder) => o.status === "APPROVED" && o.sellerCompanyId === companyId
        );
        setApprovedOrders(approvedOnly);
      }

      // 2. Fetch my warehouses (Source)
      const whRes = await fetch(`${API_BASE_URL}/warehouses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const whData = await whRes.json();
      if (whRes.ok && whData.success && Array.isArray(whData.data)) {
        setMyWarehouses(whData.data);
        if (whData.data.length > 0) {
          setSourceWarehouseId(whData.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load dispatch prerequisites:", err);
      showToast("Unable to load orders or warehouses for dispatch", "error");
    }
  };

  // When selected PO changes, load destination warehouses and batch items
  const handleSelectPO = async (poId: string) => {
    setSelectedPoId(poId);
    const chosenOrder = approvedOrders.find((o) => o.id === poId);
    if (!chosenOrder) return;

    // Build dispatch items from approved items
    const items = (chosenOrder.items || []).map((it) => ({
      batchId: it.batchId || "",
      batchNumber: it.batch?.batchNumber || "Assigned Batch",
      medicineName: it.medicine?.medicineName || "Medicine",
      maxQty: it.quantity,
      quantity: it.quantity,
    }));
    setDispatchItemsInput(items);

    // Fetch destination company's warehouses
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/warehouses/company/${chosenOrder.buyerCompanyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setDestinationWarehouses(data.data);
        setDestinationWarehouseId(data.data[0].id);
      } else {
        // Fallback: If warehouse by company endpoint returns all or restricted, fetch public or first available
        setDestinationWarehouses([
          {
            id: chosenOrder.buyerCompanyId,
            warehouseName: `${chosenOrder.buyerCompany?.companyName || "Wholesaler"} Main Receiving Warehouse`,
            companyId: chosenOrder.buyerCompanyId,
          },
        ]);
        setDestinationWarehouseId(chosenOrder.buyerCompanyId);
      }
    } catch (err) {
      console.error("Fetch destination warehouse error:", err);
      setDestinationWarehouses([
        {
          id: chosenOrder.buyerCompanyId,
          warehouseName: `${chosenOrder.buyerCompany?.companyName || "Wholesaler"} Main Receiving Warehouse`,
          companyId: chosenOrder.buyerCompanyId,
        },
      ]);
      setDestinationWarehouseId(chosenOrder.buyerCompanyId);
    }
  };

  /* Submit Create Dispatch */
  const submitCreateDispatch = async () => {
    try {
      setCreatingDispatch(true);
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      if (!selectedPoId) throw new Error("Please select an approved purchase order.");
      if (!sourceWarehouseId) throw new Error("Please select a source warehouse.");
      if (!destinationWarehouseId) throw new Error("Please select a destination warehouse.");
      if (dispatchItemsInput.length === 0) throw new Error("No items configured for dispatch.");

      for (const it of dispatchItemsInput) {
        if (!it.batchId) throw new Error(`Missing batch ID for ${it.medicineName}`);
        if (!it.quantity || it.quantity <= 0) throw new Error(`Please enter valid quantity for ${it.medicineName}`);
        if (it.quantity > it.maxQty) {
          throw new Error(`Quantity for ${it.medicineName} cannot exceed approved ${it.maxQty}`);
        }
      }

      const payload = {
        purchaseOrderId: selectedPoId,
        sourceWarehouseId,
        destinationWarehouseId,
        items: dispatchItemsInput.map((it) => ({
          batchId: it.batchId,
          quantity: Number(it.quantity),
        })),
      };

      const response = await fetch(`${API_BASE_URL}/dispatches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create dispatch");
      }

      showToast("Dispatch created successfully! Status is PENDING.");
      setShowCreateModal(false);
      await fetchDispatches();
    } catch (err) {
      console.error("Create dispatch error:", err);
      showToast(err instanceof Error ? err.message : "Failed to create dispatch", "error");
    } finally {
      setCreatingDispatch(false);
    }
  };

  /* =========================================================
     UPDATE DISPATCH STATUS (DISPATCHED or DELIVERED)
  ========================================================= */

  const handleUpdateStatus = async (dispatchId: string, newStatus: "DISPATCHED" | "DELIVERED") => {
    try {
      setUpdatingId(dispatchId);
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/dispatches/${dispatchId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to update status to ${newStatus}`);
      }

      if (newStatus === "DISPATCHED") {
        showToast("Shipment marked as DISPATCHED! Inventory deducted from source warehouse.");
      } else {
        showToast("Shipment marked as DELIVERED! Inventory added to destination warehouse & PO completed.");
      }

      await fetchDispatches();
      if (selectedDispatch && selectedDispatch.id === dispatchId) {
        setSelectedDispatch(null);
      }
    } catch (err) {
      console.error("Status update error:", err);
      showToast(err instanceof Error ? err.message : `Failed to mark as ${newStatus}`, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  /* Filter Dispatches */
  const filteredDispatches = useMemo(() => {
    return dispatches.filter((d) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        d.purchaseOrder?.orderNumber?.toLowerCase().includes(q) ||
        d.purchaseOrder?.buyerCompany?.companyName?.toLowerCase().includes(q) ||
        d.purchaseOrder?.sellerCompany?.companyName?.toLowerCase().includes(q) ||
        d.sourceWarehouse?.warehouseName?.toLowerCase().includes(q) ||
        d.destinationWarehouse?.warehouseName?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dispatches, searchTerm, statusFilter]);

  const pendingCount = dispatches.filter((d) => d.status === "PENDING").length;
  const inTransitCount = dispatches.filter((d) => d.status === "DISPATCHED").length;
  const deliveredCount = dispatches.filter((d) => d.status === "DELIVERED").length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Toast */}
        {toastMessage && (
          <div
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-semibold transition-all ${
              toastType === "success" ? "bg-slate-900 border border-slate-700" : "bg-red-600"
            }`}
          >
            {toastType === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-400" />
            ) : (
              <AlertCircle size={18} className="text-white" />
            )}
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Dispatch & Delivery Management</h1>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
                Logistics Hub
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Track multi-batch pharmaceutical shipments, warehouse deductions on dispatch, and destination additions on delivery.
            </p>
          </div>

          {isPharma && (
            <button
              type="button"
              onClick={openCreateDispatchModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700"
            >
              <Plus size={18} />
              Create New Dispatch
            </button>
          )}
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Truck size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500">Total Dispatches</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{dispatches.length}</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500">Pending Dispatch</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{pendingCount}</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <Truck size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500">In-Transit (Dispatched)</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{inTransitCount}</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500">Successfully Delivered</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{deliveredCount}</h2>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dispatches by order #, warehouse, or company..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-500 focus:bg-white transition"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-purple-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="DISPATCHED">Dispatched (In Transit)</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Dispatch Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Shipment Log</h2>
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredDispatches.length} shipments
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center text-slate-400 text-sm">
              <Loader2 size={18} className="animate-spin mr-2 text-purple-600" />
              Loading shipments...
            </div>
          ) : filteredDispatches.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center p-6 text-center">
              <Truck size={32} className="text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">No dispatches found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isPharma
                  ? "Approved purchase orders can be dispatched to wholesalers."
                  : "Incoming medicine deliveries will show up here once dispatched by pharma manufacturers."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-slate-50 uppercase text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">PO & Date</th>
                    <th className="px-6 py-4">Route (Source &rarr; Destination)</th>
                    <th className="px-6 py-4">Items / Quantity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDispatches.map((d) => {
                    const isSourceOwner = d.sourceWarehouse?.companyId === companyId;
                    const isDestinationOwner = d.destinationWarehouse?.companyId === companyId;

                    return (
                      <tr key={d.id} className="hover:bg-slate-50/75 transition">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 text-sm">
                            {d.purchaseOrder?.orderNumber || "PO"}
                          </span>
                          <p className="text-slate-400 mt-0.5">{formatDate(d.createdAt)}</p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">
                              {d.sourceWarehouse?.warehouseName || "Source"}
                            </span>
                            <ArrowRight size={14} className="text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-700">
                              {d.destinationWarehouse?.warehouseName || "Destination"}
                            </span>
                          </div>
                          <p className="text-slate-400 mt-0.5">
                            {d.purchaseOrder?.sellerCompany?.companyName} &rarr;{" "}
                            {d.purchaseOrder?.buyerCompany?.companyName}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800">
                            {d.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) || 0} units
                          </span>
                          <p className="text-slate-400 mt-0.5">
                            {d.items?.length || 0} batch item(s)
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getDispatchBadge(
                              d.status
                            )}`}
                          >
                            {d.status}
                          </span>
                          {d.status === "DISPATCHED" && d.dispatchedAt && (
                            <p className="text-[11px] text-purple-700 mt-0.5">
                              Left: {formatDate(d.dispatchedAt)}
                            </p>
                          )}
                          {d.status === "DELIVERED" && d.deliveredAt && (
                            <p className="text-[11px] text-emerald-700 mt-0.5">
                              Recv: {formatDate(d.deliveredAt)}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Pharma Mark DISPATCHED Button */}
                            {isSourceOwner && d.status === "PENDING" && (
                              <button
                                type="button"
                                disabled={updatingId === d.id}
                                onClick={() => handleUpdateStatus(d.id, "DISPATCHED")}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition"
                              >
                                {updatingId === d.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Truck size={13} />
                                )}
                                Mark DISPATCHED
                              </button>
                            )}

                            {/* Wholesaler Mark DELIVERED Button */}
                            {isDestinationOwner && d.status === "DISPATCHED" && (
                              <button
                                type="button"
                                disabled={updatingId === d.id}
                                onClick={() => handleUpdateStatus(d.id, "DELIVERED")}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                              >
                                {updatingId === d.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={13} />
                                )}
                                Confirm Delivery
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedDispatch(d)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                              Details
                            </button>
                          </div>
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

      {/* =======================================================
          MODAL: CREATE DISPATCH (PHARMA)
      ======================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
                  <Truck size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Create Shipment Dispatch</h2>
                  <p className="text-xs text-slate-500">
                    Dispatch approved purchase orders from your manufacturing warehouse.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-6 space-y-5">
              {/* Step 1: Select Approved PO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Approved Purchase Order <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPoId}
                  onChange={(e) => handleSelectPO(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-purple-500"
                >
                  <option value="">-- Choose Approved Order --</option>
                  {approvedOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.orderNumber} &bull; {po.buyerCompany?.companyName} ({po.items?.length} items)
                    </option>
                  ))}
                </select>
                {approvedOrders.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No approved purchase orders ready for dispatch. Confirm an order in Purchase Orders first.
                  </p>
                )}
              </div>

              {/* Step 2: Warehouses */}
              {selectedPoId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Source Warehouse (Pharma) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={sourceWarehouseId}
                      onChange={(e) => setSourceWarehouseId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-purple-500"
                    >
                      {myWarehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.warehouseName} {wh.city ? `(${wh.city})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Destination Warehouse (Wholesaler) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={destinationWarehouseId}
                      onChange={(e) => setDestinationWarehouseId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-purple-500"
                    >
                      {destinationWarehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.warehouseName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Batch Items */}
              {selectedPoId && dispatchItemsInput.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Dispatch Quantities per Batch
                  </h4>
                  {dispatchItemsInput.map((it, idx) => (
                    <div
                      key={it.batchId || idx}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{it.medicineName}</p>
                        <p className="text-slate-500">
                          Batch: <span className="font-mono font-bold text-slate-700">{it.batchNumber}</span> &bull; Approved Qty: {it.maxQty}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="font-semibold text-slate-600">Dispatch Qty:</label>
                        <input
                          type="number"
                          min="1"
                          max={it.maxQty}
                          value={it.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setDispatchItemsInput((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, quantity: val } : item))
                            );
                          }}
                          className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-center font-bold text-slate-900 outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Important Inventory Movement Explanation */}
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs text-purple-900 flex gap-3">
                <AlertCircle size={20} className="shrink-0 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-bold">Inventory Deduction Safety Rule:</p>
                  <p className="mt-0.5">
                    Creating this dispatch puts it in <strong>PENDING</strong> status. Your warehouse inventory
                    will only be deducted when you officially click <strong>Mark DISPATCHED</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={creatingDispatch || !selectedPoId}
                onClick={submitCreateDispatch}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50 shadow-sm"
              >
                {creatingDispatch ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Dispatch...
                  </>
                ) : (
                  <>
                    <Truck size={16} />
                    Confirm Dispatch Creation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: VIEW DISPATCH DETAILS
      ======================================================= */}
      {selectedDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Shipment Details</h2>
                <p className="text-xs text-slate-500">
                  PO: {selectedDispatch.purchaseOrder?.orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDispatch(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Route Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Shipment Status:</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 font-bold ${getDispatchBadge(
                      selectedDispatch.status
                    )}`}
                  >
                    {selectedDispatch.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400">Origin (Source Warehouse):</span>
                    <p className="font-bold text-slate-800 text-sm">
                      {selectedDispatch.sourceWarehouse?.warehouseName}
                    </p>
                    <p className="text-slate-500">
                      {selectedDispatch.purchaseOrder?.sellerCompany?.companyName}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">Destination Warehouse:</span>
                    <p className="font-bold text-slate-800 text-sm">
                      {selectedDispatch.destinationWarehouse?.warehouseName}
                    </p>
                    <p className="text-slate-500">
                      {selectedDispatch.purchaseOrder?.buyerCompany?.companyName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400">Dispatched At:</span>
                    <p className="font-semibold text-slate-800">
                      {formatDate(selectedDispatch.dispatchedAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Delivered At:</span>
                    <p className="font-semibold text-slate-800">
                      {formatDate(selectedDispatch.deliveredAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Dispatched Medicines
                </h4>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Medicine</th>
                        <th className="px-4 py-3">Batch Number</th>
                        <th className="px-4 py-3">Expiry</th>
                        <th className="px-4 py-3 text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDispatch.items?.map((it) => (
                        <tr key={it.id}>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {it.batch?.medicine?.medicineName || "Medicine"}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-700">
                            {it.batch?.batchNumber || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {formatDate(it.batch?.expiryDate)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            {it.quantity} units
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
