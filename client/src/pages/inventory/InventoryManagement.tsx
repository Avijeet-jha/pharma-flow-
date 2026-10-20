import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Package,
  Warehouse,
  AlertTriangle,
  CalendarDays,
  IndianRupee,
  RefreshCw,
  X,
  History,
  Settings2,
} from "lucide-react";

const API_URL = "http://localhost:5000";

type WarehouseType = {
  id: string;
  warehouseName: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

type Medicine = {
  id: string;
  medicineName: string;
  genericName?: string;
  strength: string;
  dosageForm: string;
  isActive: boolean;
};

type Batch = {
  id: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  mrp: string | number;
  quantity: number;
  medicine: Medicine;
};

type InventoryItem = {
  id: string;
  warehouseId: string;
  batchId: string;
  quantity: number;
  warehouse: WarehouseType;
  batch: Batch;
  createdAt: string;
  updatedAt: string;
  stockStatus?: "HEALTHY" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
};

type Transaction = {
  id: string;
  inventoryId: string;
  type:
    | "PURCHASE"
    | "SALE"
    | "DISPATCH"
    | "RETURN"
    | "EXPIRY"
    | "DAMAGE"
    | "ADJUSTMENT";
  quantity: number;
  referenceId?: string;
  notes?: string;
  createdAt: string;
  inventory: InventoryItem;
};

type Notification = {
  message: string;
  success: boolean;
};

function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedInventory, setSelectedInventory] =
    useState<InventoryItem | null>(null);

  const [showDetails, setShowDetails] = useState(false);

  const [showAdjustment, setShowAdjustment] = useState(false);

  const [adjustmentType, setAdjustmentType] = useState<"ADJUSTMENT" | "DAMAGE">(
    "ADJUSTMENT",
  );

  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");

  const [adjustmentNotes, setAdjustmentNotes] = useState("");

  const [notification, setNotification] = useState<Notification | null>(null);

  /* =====================================================
     TOKEN
  ===================================================== */

  const getToken = () => {
    return (
      localStorage.getItem("token") || localStorage.getItem("authToken") || ""
    );
  };

  /* =====================================================
     NOTIFICATION
  ===================================================== */

  const showNotification = (message: string, success = true) => {
    setNotification({
      message,
      success,
    });

    window.setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  /* =====================================================
     FETCH INVENTORY
  ===================================================== */

  const fetchInventory = async () => {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/api/inventory`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch inventory");
    }

    return result.data || [];
  };

  /* =====================================================
     FETCH WAREHOUSES
  ===================================================== */

  const fetchWarehouses = async () => {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/api/warehouses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch warehouses");
    }

    return result.data || [];
  };

  /* =====================================================
     FETCH TRANSACTIONS
  ===================================================== */

  const fetchTransactions = async () => {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/api/inventory-transactions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch transactions");
    }

    return result.data || [];
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const [inventoryData, warehouseData, transactionData] =
          await Promise.all([
            fetchInventory(),
            fetchWarehouses(),
            fetchTransactions(),
          ]);

        if (!cancelled) {
          setInventory(inventoryData);
          setWarehouses(warehouseData);
          setTransactions(transactionData);
        }
      } catch (error) {
        console.error("Inventory initial load error:", error);

        if (!cancelled) {
          showNotification("Unable to load inventory data", false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
     REFRESH
  ===================================================== */

  const refreshData = async () => {
    try {
      setRefreshing(true);

      const [inventoryData, warehouseData, transactionData] = await Promise.all(
        [fetchInventory(), fetchWarehouses(), fetchTransactions()],
      );

      setInventory(inventoryData);
      setWarehouses(warehouseData);
      setTransactions(transactionData);

      showNotification("Inventory refreshed successfully");
    } catch (error) {
      console.error("Refresh inventory error:", error);

      showNotification("Unable to refresh inventory", false);
    } finally {
      setRefreshing(false);
    }
  };

  /* =====================================================
     INVENTORY STATUS
  ===================================================== */

  const getStockStatus = (item: InventoryItem) => {
    if (item.stockStatus) {
      return item.stockStatus;
    }

    if (item.quantity <= 0) {
      return "OUT_OF_STOCK";
    }

    if (item.quantity <= 10) {
      return "CRITICAL";
    }

    if (item.quantity <= 50) {
      return "LOW";
    }

    return "HEALTHY";
  };

  /* =====================================================
     EXPIRY STATUS
  ===================================================== */

  const getExpiryDays = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    const difference = expiry.getTime() - today.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  /* =====================================================
     FILTERED INVENTORY
  ===================================================== */

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const medicineName = item.batch?.medicine?.medicineName || "";

      const genericName = item.batch?.medicine?.genericName || "";

      const batchNumber = item.batch?.batchNumber || "";

      const warehouseName = item.warehouse?.warehouseName || "";

      const searchableText =
        `${medicineName} ${genericName} ${batchNumber} ${warehouseName}`.toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());

      const matchesWarehouse =
        warehouseFilter === "ALL" || item.warehouseId === warehouseFilter;

      const stockStatus = getStockStatus(item);

      const matchesStatus =
        statusFilter === "ALL" || statusFilter === stockStatus;

      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }, [inventory, search, warehouseFilter, statusFilter]);

  /* =====================================================
     KPI DATA
  ===================================================== */

  const totalStock = inventory.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const lowStockItems = inventory.filter(
    (item) => getStockStatus(item) === "LOW",
  ).length;

  const outOfStockItems = inventory.filter(
    (item) => getStockStatus(item) === "OUT_OF_STOCK",
  ).length;

  const expiringSoonItems = inventory.filter((item) => {
    const days = getExpiryDays(item.batch.expiryDate);

    return days >= 0 && days <= 30;
  }).length;

  /* =====================================================
     VIEW DETAILS
  ===================================================== */

  const openDetails = (item: InventoryItem) => {
    setSelectedInventory(item);
    setShowDetails(true);
  };

  /* =====================================================
     OPEN ADJUSTMENT
  ===================================================== */

  const openAdjustment = (item: InventoryItem) => {
    setSelectedInventory(item);

    setAdjustmentType("ADJUSTMENT");
    setAdjustmentQuantity(String(item.quantity));
    setAdjustmentNotes("");

    setShowAdjustment(true);
  };

  /* =====================================================
     ADJUST INVENTORY
  ===================================================== */

  const saveAdjustment = async () => {
    if (!selectedInventory) {
      return;
    }

    const quantity = Number(adjustmentQuantity);

    if (!adjustmentQuantity || Number.isNaN(quantity) || quantity <= 0) {
      showNotification("Please enter a valid quantity", false);

      return;
    }

    try {
      const token = getToken();

      if (!token) {
        showNotification("Inventory change unsuccessful", false);

        return;
      }

      const response = await fetch(`${API_URL}/api/inventory/adjust`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inventoryId: selectedInventory.id,
          quantity,
          type: adjustmentType,
          notes: adjustmentNotes || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Inventory update failed");
      }

      setShowAdjustment(false);

      showNotification(
        adjustmentType === "DAMAGE"
          ? "Damage stock updated successfully"
          : "Stock adjusted successfully",
      );

      const [inventoryData, transactionData] = await Promise.all([
        fetchInventory(),
        fetchTransactions(),
      ]);

      setInventory(inventoryData);
      setTransactions(transactionData);

      const updatedItem = inventoryData.find(
        (item: InventoryItem) => item.id === selectedInventory.id,
      );

      if (updatedItem) {
        setSelectedInventory(updatedItem);
      }
    } catch (error) {
      console.error("Inventory adjustment error:", error);

      showNotification("Inventory change unsuccessful", false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="space-y-6">
      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification && (
        <div
          className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-lg shadow-xl text-white ${
            notification.success ? "bg-slate-900" : "bg-red-600"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Inventory Management
          </h1>

          <p className="text-slate-500 mt-1">
            Monitor and manage medicine stock across your warehouses.
          </p>
        </div>

        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={<Package size={22} />}
          title="Total Stock"
          value={totalStock.toLocaleString()}
          description="Units across warehouses"
        />

        <KpiCard
          icon={<AlertTriangle size={22} />}
          title="Low Stock"
          value={lowStockItems}
          description="Items needing attention"
        />

        <KpiCard
          icon={<Package size={22} />}
          title="Out of Stock"
          value={outOfStockItems}
          description="Items currently unavailable"
        />

        <KpiCard
          icon={<CalendarDays size={22} />}
          title="Expiring Soon"
          value={expiringSoonItems}
          description="Within next 30 days"
        />
      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search medicine, batch or warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Warehouses</option>

            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.warehouseName}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Stock Status</option>

            <option value="HEALTHY">Healthy</option>

            <option value="LOW">Low Stock</option>

            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* =================================================
          INVENTORY TABLE
      ================================================= */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Inventory Stock
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {filteredInventory.length} inventory item
                {filteredInventory.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />

            <h3 className="text-lg font-semibold text-slate-700">
              No inventory found
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Medicine
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Batch
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Warehouse
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Quantity
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    MRP
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Expiry
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item);

                  const expiryDays = getExpiryDays(item.batch.expiryDate);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Package size={18} />
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {item.batch.medicine.medicineName}
                            </p>

                            <p className="text-xs text-slate-500">
                              {item.batch.medicine.strength} •{" "}
                              {item.batch.medicine.dosageForm}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {item.batch.batchNumber}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Warehouse size={16} className="text-slate-400" />

                          <span className="text-sm text-slate-700">
                            {item.warehouse.warehouseName}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-900">
                          {item.quantity.toLocaleString()}
                        </span>

                        <span className="text-xs text-slate-400 ml-1">
                          units
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                          <IndianRupee size={14} />

                          {item.batch.mrp}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {formatDate(item.batch.expiryDate)}
                        </p>

                        {expiryDays >= 0 && expiryDays <= 30 && (
                          <p className="text-xs text-amber-600 mt-1">
                            {expiryDays === 0
                              ? "Expires today"
                              : `${expiryDays} days left`}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StockStatus status={status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openDetails(item)}
                            title="View inventory"
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => openAdjustment(item)}
                            title="Adjust stock"
                            className="p-2 border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-600"
                          >
                            <Settings2 size={16} />
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

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {showDetails && selectedInventory && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Inventory Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedInventory.batch.medicine.medicineName}
                </p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Medicine */}

              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <Package size={24} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">
                      {selectedInventory.batch.medicine.medicineName}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {selectedInventory.batch.medicine.genericName ||
                        "Generic name not available"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <DetailItem
                    label="Strength"
                    value={selectedInventory.batch.medicine.strength}
                  />

                  <DetailItem
                    label="Dosage Form"
                    value={selectedInventory.batch.medicine.dosageForm}
                  />

                  <DetailItem
                    label="Batch"
                    value={selectedInventory.batch.batchNumber}
                  />

                  <DetailItem
                    label="Warehouse"
                    value={selectedInventory.warehouse.warehouseName}
                  />
                </div>
              </div>

              {/* Stock */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox
                  title="Current Stock"
                  value={selectedInventory.quantity.toLocaleString()}
                  subtitle="Units available"
                />

                <StatBox
                  title="MRP"
                  value={`₹${selectedInventory.batch.mrp}`}
                  subtitle="Per unit"
                />

                <StatBox
                  title="Expiry"
                  value={formatDate(selectedInventory.batch.expiryDate)}
                  subtitle={`${getExpiryDays(
                    selectedInventory.batch.expiryDate,
                  )} days remaining`}
                />
              </div>

              {/* Transactions */}

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <History size={19} className="text-blue-600" />

                  <h3 className="text-lg font-bold text-slate-900">
                    Transaction History
                  </h3>
                </div>

                {transactions.filter(
                  (transaction) =>
                    transaction.inventoryId === selectedInventory.id,
                ).length === 0 ? (
                  <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center">
                    <History
                      size={35}
                      className="mx-auto text-slate-300 mb-3"
                    />

                    <p className="font-medium text-slate-700">
                      No transactions found
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions
                      .filter(
                        (transaction) =>
                          transaction.inventoryId === selectedInventory.id,
                      )
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="border border-slate-200 rounded-xl p-4"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">
                                  {transaction.type}
                                </span>

                                <span className="text-xs text-slate-400">
                                  {formatDateTime(transaction.createdAt)}
                                </span>
                              </div>

                              {transaction.notes && (
                                <p className="text-sm text-slate-500 mt-1">
                                  {transaction.notes}
                                </p>
                              )}
                            </div>

                            <span
                              className={`font-semibold ${
                                ["PURCHASE", "RETURN", "ADJUSTMENT"].includes(
                                  transaction.type,
                                )
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {["PURCHASE", "RETURN", "ADJUSTMENT"].includes(
                                transaction.type,
                              )
                                ? "+"
                                : "-"}
                              {transaction.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowDetails(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setShowDetails(false);
                  openAdjustment(selectedInventory);
                }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Adjust Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ADJUSTMENT MODAL
      ================================================= */}

      {showAdjustment && selectedInventory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Stock Adjustment
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedInventory.batch.medicine.medicineName} •{" "}
                  {selectedInventory.batch.batchNumber}
                </p>
              </div>

              <button
                onClick={() => setShowAdjustment(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">Current Stock</p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {selectedInventory.quantity.toLocaleString()} units
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Action
                </label>

                <select
                  value={adjustmentType}
                  onChange={(e) =>
                    setAdjustmentType(e.target.value as "ADJUSTMENT" | "DAMAGE")
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADJUSTMENT">Correct / Set Stock</option>

                  <option value="DAMAGE">Record Damaged Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {adjustmentType === "DAMAGE"
                    ? "Damaged Quantity"
                    : "Actual Stock Quantity"}
                </label>

                <input
                  type="number"
                  min="1"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

                {adjustmentType === "ADJUSTMENT" && (
                  <p className="text-xs text-slate-500 mt-2">
                    This will set the inventory quantity to the entered value.
                  </p>
                )}

                {adjustmentType === "DAMAGE" && (
                  <p className="text-xs text-slate-500 mt-2">
                    This quantity will be deducted from the current stock.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="Optional notes..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowAdjustment(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={saveAdjustment}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   KPI CARD
===================================================== */

function KpiCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">{icon}</div>
      </div>

      <p className="text-sm text-slate-500 mt-4">{title}</p>

      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>

      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );
}

/* =====================================================
   STOCK STATUS
===================================================== */

function StockStatus({
  status,
}: {
  status: "HEALTHY" | "LOW" | "OUT_OF_STOCK";
}) {
  const config = {
    HEALTHY: {
      label: "Healthy",
      className: "bg-green-100 text-green-700",
    },

    LOW: {
      label: "Low Stock",
      className: "bg-amber-100 text-amber-700",
    },

    OUT_OF_STOCK: {
      label: "Out of Stock",
      className: "bg-red-100 text-red-700",
    },
  };

  const current = config[status];

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

/* =====================================================
   DETAIL ITEM
===================================================== */

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="font-medium text-slate-800 mt-1">{value}</p>
    </div>
  );
}

/* =====================================================
   STAT BOX
===================================================== */

function StatBox({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>

      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

/* =====================================================
   DATE
===================================================== */

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =====================================================
   DATE + TIME
===================================================== */

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default InventoryManagement;
