import { useEffect, useMemo, useState, useCallback } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Printer,
  X,
  CreditCard,
  Send,
  Bell,
  Loader2,
  IndianRupee,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

type Company = {
  id: string;
  companyName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  pan?: string;
  companyType?: string;
};

type Warehouse = {
  id: string;
  warehouseName: string;
  city?: string;
  state?: string;
  address?: string;
};

type Medicine = {
  id: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
};

type Batch = {
  id: string;
  batchNumber: string;
  expiryDate: string;
  mrp: number;
};

type InvoiceItem = {
  id: string;
  invoiceId: string;
  medicineId: string;
  batchId: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountPercent: number;
  taxableValue: number;
  gstPercent: number;
  gstAmount: number;
  amount: number;
  medicine?: Medicine;
  batch?: Batch;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  purchaseOrderId?: string;
  sellerCompanyId: string;
  buyerCompanyId: string;
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGst: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status:
    | "DRAFT"
    | "GENERATED"
    | "SENT"
    | "PARTIALLY_PAID"
    | "PAID"
    | "OVERDUE"
    | "CANCELLED";
  invoiceDate: string;
  dueDate?: string;
  paymentTerms?: string;
  placeOfSupply?: string;
  createdAt: string;
  updatedAt: string;

  sellerCompany?: Company;
  buyerCompany?: Company;
  sourceWarehouse?: Warehouse;
  destinationWarehouse?: Warehouse;
  items?: InvoiceItem[];
};

type CurrentUser = {
  id: string;
  companyId: string;
  role: string;
  company?: {
    id: string;
    companyName: string;
    companyType: string;
    state?: string;
  };
};

export default function InvoiceManagement() {
  const [currentUser] = useState<CurrentUser | null>(() => {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as CurrentUser;
    } catch {
      console.error("Failed to parse user from localStorage");
      return null;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "SELLER" | "BUYER">("ALL");

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const token = localStorage.getItem("token") || "";

  const loadInvoices = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setInvoices(data.data);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInvoices();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadInvoices]);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Status badge helper
  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Paid
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Partially Paid
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Send className="w-3.5 h-3.5 text-blue-600" />
            Sent
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Overdue
          </span>
        );
      case "GENERATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            Generated
          </span>
        );
      case "DRAFT":
      case "CANCELLED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            {status === "CANCELLED" ? "Cancelled" : "Draft"}
          </span>
        );
    }
  };

  // Actions
  const handleSendInvoice = async (invoiceId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/send`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send invoice");
      }
      showFeedback("success", "Invoice sent successfully!");
      loadInvoices();
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Error sending invoice");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReminder = async (purchaseOrderId: string) => {
    if (!purchaseOrderId) {
      showFeedback("error", "No linked purchase order found for this invoice.");
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/payment-reminder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send payment reminder");
      }
      showFeedback("success", "Payment reminder notification sent to buyer!");
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Error sending reminder");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.balanceDue > 0 ? String(inv.balanceDue) : "");
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      showFeedback("error", "Please enter a valid payment amount greater than 0");
      return;
    }
    if (amount > selectedInvoice.balanceDue) {
      showFeedback("error", `Payment amount cannot exceed the balance due (₹${selectedInvoice.balanceDue.toLocaleString()})`);
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/invoices/${selectedInvoice.id}/payment`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentAmount: amount }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to record payment");
      }
      showFeedback("success", `Payment of ₹${amount.toLocaleString()} recorded successfully!`);
      setIsPaymentModalOpen(false);
      loadInvoices();
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Error recording payment");
    } finally {
      setActionLoading(false);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let paidCount = 0;
    let overdueCount = 0;

    invoices.forEach((inv) => {
      totalInvoiced += Number(inv.totalAmount) || 0;
      totalPaid += Number(inv.paidAmount) || 0;
      totalOutstanding += Number(inv.balanceDue) || 0;
      if (inv.status === "PAID") paidCount++;
      if (inv.status === "OVERDUE") overdueCount++;
    });

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      paidCount,
      overdueCount,
      totalCount: invoices.length,
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const isSeller = currentUser?.companyId === inv.sellerCompanyId;
      const isBuyer = currentUser?.companyId === inv.buyerCompanyId;

      if (roleFilter === "SELLER" && !isSeller) return false;
      if (roleFilter === "BUYER" && !isBuyer) return false;

      if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const invNum = inv.invoiceNumber.toLowerCase();
        const sellerName = inv.sellerCompany?.companyName?.toLowerCase() || "";
        const buyerName = inv.buyerCompany?.companyName?.toLowerCase() || "";
        const medNames = inv.items?.map((it) => it.medicine?.medicineName?.toLowerCase() || "").join(" ") || "";
        return (
          invNum.includes(q) ||
          sellerName.includes(q) ||
          buyerName.includes(q) ||
          medNames.includes(q)
        );
      }

      return true;
    });
  }, [invoices, currentUser, roleFilter, statusFilter, searchQuery]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${
            feedback.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium text-sm">{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Tax Invoices & Payments
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Generate, track, and reconcile compliant GST pharmaceutical invoices across your supply chain.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadInvoices}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium text-sm transition shadow-sm"
          >
            <Loader2 className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Invoiced</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              ₹{kpis.totalInvoiced.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{kpis.totalCount} total invoices</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Total Collected</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">
              ₹{kpis.totalPaid.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-emerald-600/80 mt-1">{kpis.paidCount} fully paid</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Outstanding Balance</p>
            <h3 className="text-2xl font-bold text-amber-700 mt-1">
              ₹{kpis.totalOutstanding.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-amber-600/80 mt-1">Pending clearance</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Overdue Invoices</p>
            <h3 className="text-2xl font-bold text-rose-700 mt-1">{kpis.overdueCount}</h3>
            <p className="text-xs text-rose-600/80 mt-1">Requiring immediate action</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "DRAFT", "GENERATED", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === status
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "ALL" ? "All Statuses" : status.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setRoleFilter("ALL")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                roleFilter === "ALL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}
            >
              All Invoices
            </button>
            <button
              onClick={() => setRoleFilter("SELLER")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                roleFilter === "SELLER" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}
            >
              Outgoing (Sales)
            </button>
            <button
              onClick={() => setRoleFilter("BUYER")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                roleFilter === "BUYER" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}
            >
              Incoming (Bills)
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by inv #, party, medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <FileText className="w-12 h-12 stroke-[1.5] text-slate-300 mb-2" />
            <p className="text-base font-semibold text-slate-600">No invoices found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing filters or generate an invoice from an approved purchase order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Invoice Number</th>
                  <th className="py-3.5 px-6">Counterparty</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Payment Progress</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInvoices.map((inv) => {
                  const isSeller = currentUser?.companyId === inv.sellerCompanyId;
                  const counterparty = isSeller ? inv.buyerCompany : inv.sellerCompany;
                  const percentPaid = inv.totalAmount > 0 ? Math.min(100, Math.round((inv.paidAmount / inv.totalAmount) * 100)) : 0;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/75 transition">
                      {/* Invoice Number & Date */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{inv.invoiceNumber}</span>
                          {isSeller ? (
                            <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200">
                              Issued
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-200">
                              Received
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(inv.invoiceDate).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Counterparty */}
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {counterparty?.companyName || "Unknown Party"}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          GSTIN: {counterparty?.gstin || "N/A"} • {counterparty?.state || "N/A"}
                        </div>
                      </td>

                      {/* Total Amount & Tax */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">
                          ₹{Number(inv.totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Tax: ₹{Number(inv.totalGst).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          {inv.igstAmount > 0 ? " (IGST)" : " (CGST+SGST)"}
                        </div>
                      </td>

                      {/* Payment Progress */}
                      <td className="py-4 px-6 min-w-[160px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-emerald-700 font-medium">
                            ₹{Number(inv.paidAmount).toLocaleString("en-IN")}
                          </span>
                          <span className="text-slate-400">{percentPaid}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              percentPaid === 100
                                ? "bg-emerald-500"
                                : percentPaid > 0
                                ? "bg-amber-500"
                                : "bg-slate-300"
                            }`}
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                        {inv.balanceDue > 0 && (
                          <div className="text-[11px] text-amber-700 font-medium mt-1">
                            Due: ₹{Number(inv.balanceDue).toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Immediate"}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {getStatusBadge(inv.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View / Print Tax Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Send invoice button if seller and status is GENERATED */}
                          {isSeller && inv.status === "GENERATED" && (
                            <button
                              onClick={() => handleSendInvoice(inv.id)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition border border-blue-200 flex items-center gap-1"
                              title="Send Invoice to Buyer"
                            >
                              <Send className="w-3 h-3" />
                              Send
                            </button>
                          )}

                          {/* Payment reminder if seller and balance due */}
                          {isSeller && inv.balanceDue > 0 && inv.purchaseOrderId && (
                            <button
                              onClick={() => handleSendReminder(inv.purchaseOrderId!)}
                              disabled={actionLoading}
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Send Payment Reminder"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          )}

                          {/* Record payment if balance due */}
                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => handleOpenPayment(inv)}
                              className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition shadow-sm flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              Pay
                            </button>
                          )}
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

      {/* ========================================================= */}
      {/* MODAL 1: VIEW & PRINT COMPLIANT TAX INVOICE              */}
      {/* ========================================================= */}
      {isDetailModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-bold">Tax Invoice: {selectedInvoice.invoiceNumber}</h2>
                  <p className="text-xs text-slate-400">
                    PharmaFlow Verified GST Pharmaceutical Invoice
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  <Printer className="w-4 h-4" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 printable-area">
              {/* Top Banner: Seller & Buyer Details */}
              <div className="grid grid-cols-2 gap-8 pb-6 border-b border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Issued By (Seller)</p>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedInvoice.sellerCompany?.companyName || "Seller Pharma"}
                  </h3>
                  <div className="text-xs text-slate-600 space-y-0.5 mt-1">
                    <p>{selectedInvoice.sellerCompany?.address || "Registered Pharma Facility"}</p>
                    <p>
                      {selectedInvoice.sellerCompany?.city}, {selectedInvoice.sellerCompany?.state}
                    </p>
                    <p className="font-semibold text-slate-800">
                      GSTIN: {selectedInvoice.sellerCompany?.gstin || "27AAPCS1234F1Z5"}
                    </p>
                    {selectedInvoice.sellerCompany?.phone && <p>Tel: {selectedInvoice.sellerCompany?.phone}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Billed To (Buyer)</p>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedInvoice.buyerCompany?.companyName || "Buyer Distributor"}
                  </h3>
                  <div className="text-xs text-slate-600 space-y-0.5 mt-1">
                    <p>{selectedInvoice.buyerCompany?.address || "Distribution Hub"}</p>
                    <p>
                      {selectedInvoice.buyerCompany?.city}, {selectedInvoice.buyerCompany?.state}
                    </p>
                    <p className="font-semibold text-slate-800">
                      GSTIN: {selectedInvoice.buyerCompany?.gstin || "10AABCT5678G1Z2"}
                    </p>
                    <p className="text-blue-600 font-medium">
                      Place of Supply: {selectedInvoice.placeOfSupply || selectedInvoice.buyerCompany?.state || "Inter-State"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Meta details */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl text-xs border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Invoice Date</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Due Date</span>
                  <span className="font-bold text-slate-800">
                    {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : "Net 30 Days"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Payment Terms</span>
                  <span className="font-bold text-slate-800">{selectedInvoice.paymentTerms || "Credit 30 Days"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Invoice Status</span>
                  <div className="mt-0.5">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Itemized Breakdown</h4>
                <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Medicine & Strength</th>
                      <th className="p-3">Batch #</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Disc %</th>
                      <th className="p-3 text-right">Taxable Val</th>
                      <th className="p-3 text-right">GST %</th>
                      <th className="p-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((it) => (
                        <tr key={it.id}>
                          <td className="p-3 font-semibold text-slate-900">
                            {it.medicine?.medicineName}
                            {it.medicine?.strength && (
                              <span className="text-slate-500 font-normal ml-1">({it.medicine.strength})</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 font-mono">{it.batch?.batchNumber || "BCH-001"}</td>
                          <td className="p-3 text-right font-medium">{it.quantity}</td>
                          <td className="p-3 text-right">₹{Number(it.unitPrice).toFixed(2)}</td>
                          <td className="p-3 text-right">{it.discountPercent}%</td>
                          <td className="p-3 text-right font-medium">₹{Number(it.taxableValue).toFixed(2)}</td>
                          <td className="p-3 text-right">{it.gstPercent}%</td>
                          <td className="p-3 text-right font-bold text-slate-900">₹{Number(it.amount).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-400">
                          No line items recorded for this invoice.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="flex justify-end">
                <div className="w-80 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{Number(selectedInvoice.subtotal).toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount:</span>
                      <span>-₹{Number(selectedInvoice.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-700 font-medium pt-1 border-t border-slate-200">
                    <span>Taxable Amount:</span>
                    <span>₹{Number(selectedInvoice.taxableAmount).toFixed(2)}</span>
                  </div>
                  {selectedInvoice.cgstAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>CGST:</span>
                      <span>₹{Number(selectedInvoice.cgstAmount).toFixed(2)}</span>
                    </div>
                  )}
                  {selectedInvoice.sgstAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>SGST:</span>
                      <span>₹{Number(selectedInvoice.sgstAmount).toFixed(2)}</span>
                    </div>
                  )}
                  {selectedInvoice.igstAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST (Inter-State):</span>
                      <span>₹{Number(selectedInvoice.igstAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-300">
                    <span>Grand Total:</span>
                    <span className="text-blue-600">₹{Number(selectedInvoice.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Amount Paid:</span>
                    <span>₹{Number(selectedInvoice.paidAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-700 font-bold text-xs pt-1 border-t border-slate-200">
                    <span>Balance Due:</span>
                    <span>₹{Number(selectedInvoice.balanceDue).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Declaration:</p>
                <p>
                  We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                  Goods once sold are subject to standard pharmaceutical storage and compliance regulations.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold transition"
              >
                Close
              </button>

              {selectedInvoice.balanceDue > 0 && (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenPayment(selectedInvoice);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-md"
                >
                  <CreditCard className="w-4 h-4" />
                  Record Payment (₹{selectedInvoice.balanceDue.toLocaleString()})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: RECORD PAYMENT                                  */}
      {/* ========================================================= */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
                  <p className="text-xs text-slate-400">Invoice: {selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Balances summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Invoice Value:</span>
                <span className="font-semibold text-slate-800">
                  ₹{Number(selectedInvoice.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Already Paid:</span>
                <span className="font-semibold">
                  ₹{Number(selectedInvoice.paidAmount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold text-sm pt-2 border-t border-slate-200">
                <span>Current Balance Due:</span>
                <span>₹{Number(selectedInvoice.balanceDue).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment Input Form */}
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Payment Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={selectedInvoice.balanceDue}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 text-base"
                    placeholder="Enter amount to pay"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentAmount(String(Math.round(selectedInvoice.balanceDue * 0.25)))}
                  className="flex-1 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(String(Math.round(selectedInvoice.balanceDue * 0.5)))}
                  className="flex-1 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(String(selectedInvoice.balanceDue))}
                  className="flex-1 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition border border-emerald-200"
                >
                  Full (100%)
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
