import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  FileText,
  Building2,
  AlertCircle,
  Loader2,
  Check,
  Send,
  ShieldCheck,
  AlertTriangle,
  Receipt,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

type Supplier = {
  id: string;
  companyName: string;
  companyType?: string;
  city?: string;
  state?: string;
};

type Medicine = {
  id: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
  availableQuantity?: number;
};

type BatchOption = {
  id: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  mrp: number;
  quantity: number;
};

type PurchaseOrderItem = {
  id: string;
  medicineId: string;
  batchId?: string;
  requestedQuantity: number;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  medicine?: {
    id?: string;
    medicineName: string;
    strength?: string;
    dosageForm?: string;
  };
  batch?: {
    id: string;
    batchNumber: string;
    expiryDate: string;
    mrp: number;
  };
};

type PurchaseOrder = {
  id: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  expectedDate?: string;
  createdAt?: string;
  notes?: string;
  buyerCompanyId?: string;
  sellerCompanyId?: string;

  sellerCompany?: {
    id?: string;
    companyName: string;
    state?: string;
  };

  buyerCompany?: {
    id?: string;
    companyName: string;
    state?: string;
  };

  items?: PurchaseOrderItem[];

  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    totalAmount: number;
  };

  dispatches?: {
    id: string;
    status: string;
  }[];
};

type AvailabilityItem = {
  medicineId: string;
  medicineName: string;
  requestedQuantity: number;
  availableQuantity: number;
  minimumRequiredQuantity: number;
  eligible: boolean;
};

type AvailabilityData = {
  purchaseOrderId: string;
  orderNumber: string;
  status: string;
  buyerCompany: string;
  sellerCompany: string;
  items: AvailabilityItem[];
};

type ConfirmItemInput = {
  purchaseOrderItemId: string;
  medicineId: string;
  medicineName: string;
  requestedQuantity: number;
  batchId: string;
  approvedQuantity: number;
  unitPrice: number;
  discountPercent: number;
  gstPercent: number;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
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
  });
}

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusClass(status?: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "APPROVED":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "DISPATCHED":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default function PurchaseOrderManagement() {
  const navigate = useNavigate();
  const userRole = getUserRole();
  const companyId = getCompanyId();
  const isPharma = userRole === "PHARMA";

  /* =========================================================
     PURCHASE ORDERS
  ========================================================= */

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [directionFilter, setDirectionFilter] = useState(
    isPharma ? "INCOMING" : "OUTGOING"
  );

  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  /* Toast Notification */
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    window.setTimeout(() => setToastMessage(""), 3500);
  };

  /* =========================================================
     STOCK AVAILABILITY CHECK (1/3 Rule)
  ========================================================= */

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);

  /* =========================================================
     ORDER CONFIRMATION (Pharma)
  ========================================================= */

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<PurchaseOrder | null>(null);
  const [confirmInputs, setConfirmInputs] = useState<ConfirmItemInput[]>([]);
  const [medicineBatchesMap, setMedicineBatchesMap] = useState<Record<string, BatchOption[]>>({});
  const [loadingBatches, setLoadingBatches] = useState(false);

  /* =========================================================
     PAYMENT REMINDER
  ========================================================= */

  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  /* =========================================================
     CREATE PURCHASE REQUEST (Wholesaler)
  ========================================================= */

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierMedicines, setSupplierMedicines] = useState<Medicine[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState("");
  const [requirement, setRequirement] = useState("");
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  /* =========================================================
     FETCH PURCHASE ORDERS
  ========================================================= */

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const token = getToken();

      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/purchase-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse<PurchaseOrder[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch purchase orders");
      }

      setPurchaseOrders(result.data || []);
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error);
      setPurchaseOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPurchaseOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchPurchaseOrders]);

  /* =========================================================
     CHECK STOCK AVAILABILITY (1/3 Rule)
  ========================================================= */

  const handleCheckAvailability = async (orderId: string) => {
    try {
      setCheckingAvailability(true);
      setShowAvailabilityModal(true);
      setAvailabilityData(null);

      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/purchase-orders/${orderId}/availability`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to check availability");
      }

      setAvailabilityData(result.data);
    } catch (error) {
      console.error("Availability check failed:", error);
      showToast(error instanceof Error ? error.message : "Availability check failed", "error");
      setShowAvailabilityModal(false);
    } finally {
      setCheckingAvailability(false);
    }
  };

  /* =========================================================
     OPEN ORDER CONFIRMATION MODAL
  ========================================================= */

  const openConfirmModal = async (order: PurchaseOrder) => {
    setOrderToConfirm(order);
    setShowAvailabilityModal(false);
    setShowConfirmModal(true);
    setLoadingBatches(true);

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      // Initialize confirmInputs with default values
      const initialInputs: ConfirmItemInput[] = (order.items || []).map((item) => ({
        purchaseOrderItemId: item.id,
        medicineId: item.medicineId || item.medicine?.id || "",
        medicineName: item.medicine?.medicineName || "Medicine",
        requestedQuantity: item.requestedQuantity,
        batchId: item.batchId || "",
        approvedQuantity: item.requestedQuantity,
        unitPrice: Number(item.unitPrice) || 25,
        discountPercent: 0,
        gstPercent: 12,
      }));

      setConfirmInputs(initialInputs);

      // Fetch batches for each medicine
      const batchesMap: Record<string, BatchOption[]> = {};

      for (const item of order.items || []) {
        const medId = item.medicineId || item.medicine?.id;
        if (!medId) continue;

        try {
          const bRes = await fetch(`${API_BASE_URL}/medicine-batches/medicine/${medId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const bData = await bRes.json();
          if (bRes.ok && bData.success && Array.isArray(bData.data)) {
            batchesMap[medId] = bData.data;

            // Auto-select first batch if available and not already set
            if (bData.data.length > 0) {
              setConfirmInputs((prev) =>
                prev.map((inp) =>
                  inp.medicineId === medId && !inp.batchId
                    ? {
                        ...inp,
                        batchId: bData.data[0].id,
                        unitPrice: Number(bData.data[0].mrp) || inp.unitPrice,
                      }
                    : inp
                )
              );
            }
          }
        } catch (e) {
          console.error(`Failed to load batches for medicine ${medId}:`, e);
        }
      }

      setMedicineBatchesMap(batchesMap);
    } catch (err) {
      console.error("Error setting up confirmation modal:", err);
      showToast("Unable to initialize order confirmation", "error");
    } finally {
      setLoadingBatches(false);
    }
  };

  /* =========================================================
     SUBMIT ORDER CONFIRMATION
  ========================================================= */

  const submitOrderConfirmation = async () => {
    if (!orderToConfirm) return;

    try {
      setConfirmingOrder(true);
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      // Validate inputs
      for (const item of confirmInputs) {
        if (!item.batchId) {
          throw new Error(`Please select a batch for ${item.medicineName}`);
        }
        if (!item.approvedQuantity || item.approvedQuantity <= 0) {
          throw new Error(`Please enter a valid approved quantity for ${item.medicineName}`);
        }
        if (item.approvedQuantity > item.requestedQuantity) {
          throw new Error(
            `Approved quantity for ${item.medicineName} cannot exceed requested quantity (${item.requestedQuantity})`
          );
        }
        if (item.unitPrice <= 0) {
          throw new Error(`Please enter a valid unit price for ${item.medicineName}`);
        }
      }

      const payload = {
        items: confirmInputs.map((item) => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          batchId: item.batchId,
          approvedQuantity: Number(item.approvedQuantity),
          unitPrice: Number(item.unitPrice),
          discountPercent: Number(item.discountPercent || 0),
          gstPercent: Number(item.gstPercent || 12),
        })),
      };

      const response = await fetch(`${API_BASE_URL}/purchase-orders/${orderToConfirm.id}/confirm`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to confirm purchase order");
      }

      showToast("Order confirmed successfully! Invoice generated & Wholesaler notified.");
      setShowConfirmModal(false);
      setOrderToConfirm(null);
      await fetchPurchaseOrders();
    } catch (err) {
      console.error("Confirmation error:", err);
      showToast(err instanceof Error ? err.message : "Failed to confirm order", "error");
    } finally {
      setConfirmingOrder(false);
    }
  };

  /* =========================================================
     SEND PAYMENT REMINDER
  ========================================================= */

  const handleSendPaymentReminder = async (orderId: string) => {
    try {
      setSendingReminderId(orderId);
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/purchase-orders/${orderId}/payment-reminder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send payment reminder");
      }

      showToast("Payment reminder sent successfully to the buyer!");
    } catch (err) {
      console.error("Reminder error:", err);
      showToast(err instanceof Error ? err.message : "Failed to send reminder", "error");
    } finally {
      setSendingReminderId(null);
    }
  };

  /* =========================================================
     FETCH SUPPLIERS (For Wholesaler request)
  ========================================================= */

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/supply-chain/partners`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse<Supplier[]> = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to fetch suppliers");

      setSuppliers(result.data || []);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchSupplierCatalog = async (supplierId: string) => {
    try {
      setLoadingMedicines(true);
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/supply-chain/partners/${supplierId}/catalog`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to fetch supplier catalog");

      let medicines: Medicine[] = [];
      if (Array.isArray(result.data)) {
        medicines = result.data;
      } else if (Array.isArray(result.data?.medicines)) {
        medicines = result.data.medicines;
      } else if (Array.isArray(result.medicines)) {
        medicines = result.medicines;
      }

      setSupplierMedicines(medicines);
    } catch (error) {
      console.error("Failed to fetch catalog:", error);
      setSupplierMedicines([]);
    } finally {
      setLoadingMedicines(false);
    }
  };

  const openCreatePurchaseOrder = () => {
    setCreateStep(1);
    setSelectedSupplier(null);
    setSelectedMedicine(null);
    setSupplierMedicines([]);
    setQuantity("");
    setRequirement("");
    setPreferredDeliveryDate("");
    setSubmitError("");
    setSubmitSuccess("");
    setSubmittingRequest(false);
    setShowCreateModal(true);
    void fetchSuppliers();
  };

  const closeCreatePurchaseOrder = () => {
    if (submittingRequest) return;
    setShowCreateModal(false);
  };

  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSelectedMedicine(null);
    setSupplierMedicines([]);
    void fetchSupplierCatalog(supplier.id);
  };

  const submitPurchaseRequest = async () => {
    try {
      setSubmittingRequest(true);
      setSubmitError("");
      setSubmitSuccess("");

      const token = getToken();
      if (!token) throw new Error("Authentication required");
      if (!selectedSupplier) throw new Error("Please select a supplier.");
      if (!selectedMedicine) throw new Error("Please select a medicine.");

      const parsedQuantity = Number(quantity);
      if (!quantity || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
        throw new Error("Please enter a valid whole number greater than 0.");
      }

      const response = await fetch(`${API_BASE_URL}/purchase-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerCompanyId: selectedSupplier.id,
          preferredDeliveryDate: preferredDeliveryDate || undefined,
          requirement: requirement.trim() || undefined,
          items: [
            {
              medicineId: selectedMedicine.id,
              requestedQuantity: parsedQuantity,
            },
          ],
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to send purchase request");

      setSubmitSuccess(result.message || "Purchase request sent successfully.");
      showToast("Purchase request sent successfully!");
      await fetchPurchaseOrders();
      setTimeout(() => setShowCreateModal(false), 1200);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to send purchase request");
    } finally {
      setSubmittingRequest(false);
    }
  };

  /* =========================================================
     FILTER ORDERS
  ========================================================= */

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((order) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        !search ||
        order.orderNumber?.toLowerCase().includes(search) ||
        order.sellerCompany?.companyName?.toLowerCase().includes(search) ||
        order.buyerCompany?.companyName?.toLowerCase().includes(search);

      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

      let matchesDirection = true;
      if (directionFilter === "OUTGOING") {
        matchesDirection = order.buyerCompanyId === companyId;
      } else if (directionFilter === "INCOMING") {
        matchesDirection = order.sellerCompanyId === companyId;
      }

      return matchesSearch && matchesStatus && matchesDirection;
    });
  }, [purchaseOrders, searchTerm, statusFilter, directionFilter, companyId]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter((o) => o.status === "PENDING").length;
  const approvedOrders = filteredOrders.filter((o) => o.status === "APPROVED").length;
  const deliveredOrders = filteredOrders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            TOAST NOTIFICATION
        ===================================================== */}
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

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  isPharma ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {isPharma ? "Pharma Supplier Center" : "Wholesale Buyer Center"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {isPharma
                ? "Review incoming purchase orders, verify 1/3 availability, approve batches & pricing."
                : "Manage wholesale purchase orders and request medicines from pharmaceutical manufacturers."}
            </p>
          </div>

          {!isPharma && (
            <button
              type="button"
              onClick={openCreatePurchaseOrder}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Purchase Request
            </button>
          )}
        </div>

        {/* =====================================================
            STAT CARDS
        ===================================================== */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FileText size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500">Total Orders</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{totalOrders}</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500">Pending Review</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{pendingOrders}</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500">Approved Orders</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{approvedOrders}</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Truck size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500">Delivered</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{deliveredOrders}</h2>
          </div>
        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number or company..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">All Directions</option>
              <option value="INCOMING">Incoming Orders (To Me)</option>
              <option value="OUTGOING">Outgoing Orders (Placed by Me)</option>
            </select>
          </div>
        </div>

        {/* =====================================================
            ORDER TABLE
        ===================================================== */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Purchase Order Records</h2>
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredOrders.length} orders
            </span>
          </div>

          {loadingOrders ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin text-blue-600" />
                Loading purchase orders...
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
                <Package size={28} />
              </div>
              <h3 className="font-semibold text-slate-800">No purchase orders found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {isPharma
                  ? "Incoming purchase orders from wholesalers will appear here."
                  : "Create a purchase request to order from Pharma suppliers."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">Order #</th>
                    <th className="px-6 py-4">Counterparty</th>
                    <th className="px-6 py-4">Items / Qty</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const isSeller = order.sellerCompanyId === companyId;
                    const isPending = order.status === "PENDING";
                    const isApproved = order.status === "APPROVED";

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/75 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">
                            {order.orderNumber || `#${order.id.slice(0, 8)}`}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                              <Building2 size={16} />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-slate-800">
                                {isSeller
                                  ? order.buyerCompany?.companyName || "Wholesaler"
                                  : order.sellerCompany?.companyName || "Pharma"}
                              </span>
                              <div className="text-xs text-slate-400">
                                {isSeller ? "Buyer" : "Supplier"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-800">
                            {order.items?.length || 0} medicine item(s)
                          </div>
                          <div className="text-xs text-slate-500">
                            Req Qty:{" "}
                            {order.items?.reduce((acc, it) => acc + (it.requestedQuantity || 0), 0) || 0}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          {order.invoice && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <Receipt size={12} />
                              Inv: {order.invoice.invoiceNumber}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status || "UNKNOWN"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Pharma review actions on PENDING */}
                            {isSeller && isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCheckAvailability(order.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition"
                                >
                                  <ShieldCheck size={14} />
                                  Check 1/3 Stock
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openConfirmModal(order)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                                >
                                  <Check size={14} />
                                  Confirm Order
                                </button>
                              </>
                            )}

                            {/* Pharma payment reminder on APPROVED/DELIVERED */}
                            {isSeller && (isApproved || order.status === "DELIVERED" || order.status === "DISPATCHED") && (
                              <button
                                type="button"
                                disabled={sendingReminderId === order.id}
                                onClick={() => handleSendPaymentReminder(order.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition"
                              >
                                {sendingReminderId === order.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Send size={13} />
                                )}
                                Remind Pay
                              </button>
                            )}

                            {/* Wholesaler quick actions */}
                            {!isSeller && isApproved && (
                              <button
                                type="button"
                                onClick={() => navigate("/wholesaler/supply-chain/invoices")}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                              >
                                <Receipt size={13} />
                                Invoice
                              </button>
                            )}

                            {!isSeller && order.status === "DISPATCHED" && (
                              <button
                                type="button"
                                onClick={() => navigate("/wholesaler/supply-chain/dispatches")}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition"
                              >
                                <Truck size={13} />
                                Track Delivery
                              </button>
                            )}

                            {/* General View Details Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
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
          MODAL 1: CHECK STOCK AVAILABILITY (1/3 RULE)
      ======================================================= */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Stock Availability Verification
                  </h2>
                  <p className="text-xs text-slate-500">
                    Applying PharmaFlow 1/3 Stock Availability Rule
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAvailabilityModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {checkingAvailability ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin text-purple-600" />
                    Checking warehouse stock & calculating eligibility...
                  </div>
                </div>
              ) : availabilityData ? (
                <div className="space-y-6">
                  {/* Explanation Banner */}
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-700">
                      1/3 Business Rule Standard
                    </p>
                    <p className="mt-1 text-sm text-purple-900">
                      Minimum Required Quantity = <code className="font-bold">CEIL(Requested Quantity / 3)</code>.
                      Fulfillment is eligible when Available Stock &ge; Minimum Required Quantity.
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                    <div>
                      <span className="text-slate-500">Order Number:</span>
                      <p className="font-bold text-slate-800">{availabilityData.orderNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Buyer:</span>
                      <p className="font-bold text-slate-800">{availabilityData.buyerCompany}</p>
                    </div>
                  </div>

                  {/* Items Availability Table */}
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-semibold text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Medicine</th>
                          <th className="px-4 py-3 text-center">Requested</th>
                          <th className="px-4 py-3 text-center">Available Stock</th>
                          <th className="px-4 py-3 text-center">Min (1/3)</th>
                          <th className="px-4 py-3 text-center">Eligibility</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {availabilityData.items.map((it) => (
                          <tr key={it.medicineId} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {it.medicineName}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-700">
                              {it.requestedQuantity}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-700">
                              {it.availableQuantity}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-purple-700">
                              {it.minimumRequiredQuantity}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {it.eligible ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                                  <Check size={12} />
                                  Eligible
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 font-bold text-rose-800">
                                  <AlertTriangle size={12} />
                                  Insufficient
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-slate-500">No availability details available.</p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowAvailabilityModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>

              {availabilityData && (
                <button
                  type="button"
                  onClick={() => {
                    const matched = purchaseOrders.find(
                      (o) => o.id === availabilityData.purchaseOrderId
                    );
                    if (matched) {
                      openConfirmModal(matched);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm"
                >
                  <Check size={16} />
                  Proceed to Approve & Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 2: CONFIRM ORDER (PHARMA PRICE & BATCH CONTROL)
      ======================================================= */}
      {showConfirmModal && orderToConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Confirm Purchase Order & Generate Invoice
                </h2>
                <p className="text-xs text-slate-500">
                  Select batch, determine approved quantity, unit selling price, discount and GST.
                </p>
              </div>
              <button
                type="button"
                disabled={confirmingOrder}
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-6 space-y-5">
              {loadingBatches ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin text-blue-600" />
                    Loading available batches...
                  </div>
                </div>
              ) : (
                confirmInputs.map((inp, idx) => {
                  const availableBatches = medicineBatchesMap[inp.medicineId] || [];

                  return (
                    <div
                      key={inp.purchaseOrderItemId}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <h4 className="font-bold text-slate-900">{inp.medicineName}</h4>
                          <span className="text-xs text-slate-500">
                            Wholesaler Requested:{" "}
                            <strong className="text-slate-700">{inp.requestedQuantity} units</strong>
                          </span>
                        </div>
                        <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          Item #{idx + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Select Batch */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Assign Medicine Batch <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={inp.batchId}
                            onChange={(e) => {
                              const bId = e.target.value;
                              const selectedBatch = availableBatches.find((b) => b.id === bId);
                              setConfirmInputs((prev) =>
                                prev.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        batchId: bId,
                                        unitPrice: selectedBatch?.mrp ? Number(selectedBatch.mrp) : item.unitPrice,
                                      }
                                    : item
                                )
                              );
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                          >
                            <option value="">-- Choose Batch --</option>
                            {availableBatches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.batchNumber} (Avail: {b.quantity}, Exp: {formatDate(b.expiryDate)})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Approved Quantity */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Approved Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={inp.requestedQuantity}
                            value={inp.approvedQuantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setConfirmInputs((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, approvedQuantity: val } : item
                                )
                              );
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Unit Selling Price */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Unit Price (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            value={inp.unitPrice}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setConfirmInputs((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, unitPrice: val } : item
                                )
                              );
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Discount % */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={inp.discountPercent}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setConfirmInputs((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, discountPercent: val } : item
                                )
                              );
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* GST % */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            GST Rate (%)
                          </label>
                          <select
                            value={inp.gstPercent}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setConfirmInputs((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, gstPercent: val } : item
                                )
                              );
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                          >
                            <option value={0}>0% (Nil)</option>
                            <option value={5}>5%</option>
                            <option value={12}>12% (Standard Pharma)</option>
                            <option value={18}>18%</option>
                          </select>
                        </div>

                        {/* Line Total Live Preview */}
                        <div className="flex flex-col justify-end">
                          <span className="text-xs text-slate-500">Estimated Total:</span>
                          <span className="text-base font-bold text-emerald-700">
                            {formatCurrency(
                              inp.approvedQuantity *
                                inp.unitPrice *
                                (1 - inp.discountPercent / 100) *
                                (1 + inp.gstPercent / 100)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Automatic Workflow Notice */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900 flex gap-3">
                <AlertCircle size={20} className="shrink-0 text-blue-600 mt-0.5" />
                <p>
                  Confirming this order executes a single atomic transaction that: updates status to{" "}
                  <strong>APPROVED</strong>, generates an official <strong>GST Invoice</strong>, calculates
                  CGST/SGST or IGST based on states, increments Customer Balance, and sends an instant
                  notification to the buyer.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                disabled={confirmingOrder}
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={confirmingOrder || loadingBatches}
                onClick={submitOrderConfirmation}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
              >
                {confirmingOrder ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating Invoice & Approving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Confirm & Generate Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 3: ORDER DETAILS
      ======================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Purchase Order Details</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {selectedOrder.orderNumber || selectedOrder.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 font-medium">Status</p>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 font-medium">Pharma Supplier</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {selectedOrder.sellerCompany?.companyName || "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 font-medium">Wholesale Buyer</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {selectedOrder.buyerCompany?.companyName || "-"}
                  </p>
                </div>
              </div>

              {selectedOrder.invoice && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <Receipt className="text-emerald-600" size={24} />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Invoice Generated
                      </p>
                      <p className="text-sm font-semibold text-emerald-900">
                        Invoice #{selectedOrder.invoice.invoiceNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrder(null);
                      navigate(
                        isPharma
                          ? "/pharma/supply-chain/invoices"
                          : "/wholesaler/supply-chain/invoices"
                      );
                    }}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    View Invoice
                  </button>
                </div>
              )}

              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-900">Ordered Items</h3>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Medicine</th>
                        <th className="px-4 py-3">Batch Assigned</th>
                        <th className="px-4 py-3 text-center">Req Qty</th>
                        <th className="px-4 py-3 text-center">Approved Qty</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {item.medicine?.medicineName || "Medicine"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.batch?.batchNumber ? (
                              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
                                {item.batch.batchNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Not Assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600">
                            {item.requestedQuantity}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-800">
                            {item.quantity || item.requestedQuantity}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-600">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            {formatCurrency(item.totalPrice ?? item.quantity * item.unitPrice)}
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

      {/* =======================================================
          MODAL 4: CREATE PURCHASE REQUEST (WHOLESALER)
      ======================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create Purchase Request</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Request medicine from a Pharma manufacturer.
                </p>
              </div>
              <button
                type="button"
                disabled={submittingRequest}
                onClick={closeCreatePurchaseOrder}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            {/* Steps */}
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          createStep >= step
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {step}
                      </div>
                      <span
                        className={`ml-2 hidden text-xs font-bold sm:block ${
                          createStep >= step ? "text-blue-600" : "text-slate-400"
                        }`}
                      >
                        {step === 1 ? "Supplier" : step === 2 ? "Medicine" : step === 3 ? "Details" : "Review"}
                      </span>
                    </div>
                    {step !== 4 && (
                      <div
                        className={`mx-3 h-px flex-1 ${
                          createStep > step ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[58vh] overflow-y-auto p-6">
              {createStep === 1 && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Select Pharma Supplier</h3>
                  <p className="text-xs text-slate-500 mb-4">Choose from verified pharma partners.</p>

                  {loadingSuppliers ? (
                    <div className="flex min-h-[180px] items-center justify-center text-slate-400 text-sm">
                      <Loader2 size={18} className="animate-spin mr-2" /> Loading suppliers...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {suppliers.map((sup) => (
                        <button
                          key={sup.id}
                          type="button"
                          onClick={() => handleSelectSupplier(sup)}
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                            selectedSupplier?.id === sup.id
                              ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-100"
                              : "border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <Building2 className="text-blue-600 shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{sup.companyName}</p>
                            <p className="text-xs text-slate-500">
                              {sup.city ? `${sup.city}, ${sup.state || ""}` : "Pharma Manufacturer"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {createStep === 2 && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Select Medicine</h3>
                  <p className="text-xs text-slate-500 mb-4">Catalog from {selectedSupplier?.companyName}</p>

                  {loadingMedicines ? (
                    <div className="flex min-h-[180px] items-center justify-center text-slate-400 text-sm">
                      <Loader2 size={18} className="animate-spin mr-2" /> Loading catalog...
                    </div>
                  ) : supplierMedicines.length === 0 ? (
                    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                      No medicines currently listed in this supplier's catalog.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {supplierMedicines.map((med) => (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => setSelectedMedicine(med)}
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                            selectedMedicine?.id === med.id
                              ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-100"
                              : "border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <Package className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{med.medicineName}</p>
                            <p className="text-xs text-slate-500">
                              {med.genericName} • {med.strength}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {createStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Requested Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 300"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Delivery Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={preferredDeliveryDate}
                      onChange={(e) => setPreferredDeliveryDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Special Requirements / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={requirement}
                      onChange={(e) => setRequirement(e.target.value)}
                      placeholder="e.g. Standard monthly replenishment"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                    <strong>Rule Reminder:</strong> You request medicine and quantity. The Pharma manufacturer
                    controls the selling price, assigns the specific batch, and determines final approved quantity.
                  </div>
                </div>
              )}

              {createStep === 4 && (
                <div className="space-y-4">
                  {submitError && (
                    <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{submitError}</div>
                  )}
                  {submitSuccess && (
                    <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                      {submitSuccess}
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Supplier:</span>
                      <span className="font-bold text-slate-800">{selectedSupplier?.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Medicine:</span>
                      <span className="font-bold text-slate-800">{selectedMedicine?.medicineName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Requested Quantity:</span>
                      <span className="font-bold text-slate-800">{quantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Preferred Date:</span>
                      <span className="font-bold text-slate-800">
                        {preferredDeliveryDate ? formatDate(preferredDeliveryDate) : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                disabled={createStep === 1 || submittingRequest}
                onClick={() => setCreateStep((p) => p - 1)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeCreatePurchaseOrder}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                {createStep < 4 ? (
                  <button
                    type="button"
                    disabled={
                      (createStep === 1 && !selectedSupplier) ||
                      (createStep === 2 && !selectedMedicine) ||
                      (createStep === 3 && (!quantity || Number(quantity) <= 0))
                    }
                    onClick={() => setCreateStep((p) => p + 1)}
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submittingRequest}
                    onClick={submitPurchaseRequest}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submittingRequest ? "Sending..." : "Submit Purchase Request"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

