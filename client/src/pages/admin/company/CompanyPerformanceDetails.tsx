import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";

type PerformanceData = {
  company: {
    id: string;
    companyName: string;
    companyType: string;
    status: string;
  };

  summary: {
    totalSales: number;
    totalPurchaseValue: number;
    inventoryValue: number;
    totalInventoryUnits: number;
    totalWarehouses: number;
    totalMedicines: number;
    completedSales: number;
    pendingPurchaseOrders: number;
  };

  monthlySales: {
    month: string;
    amount: number;
  }[];

  monthlyPurchases: {
    month: string;
    amount: number;
  }[];

  topSellingMedicines: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    revenue: number;
  }[];

  transactionSummary: {
    PURCHASE: number;
    SALE: number;
    DISPATCH: number;
    RETURN: number;
    EXPIRY: number;
    DAMAGE: number;
    ADJUSTMENT: number;
  };
};

const API_URL = "http://localhost:5000";

function CompanyPerformanceDetails() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const [data, setData] =
    useState<PerformanceData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchPerformance =
    useCallback(async () => {
      if (!id) {
        throw new Error(
          "Company ID not found"
        );
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const response = await fetch(
        `${API_URL}/api/companies/${id}/performance`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to fetch company performance"
        );
      }

      setData(result.data);
    }, [id]);

  useEffect(() => {
    const loadPerformance =
      async () => {
        try {
          setLoading(true);
          setError("");

          await fetchPerformance();
        } catch (err) {
          console.error(
            "Company performance error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load company performance"
          );
        } finally {
          setLoading(false);
        }
      };

    loadPerformance();
  }, [fetchPerformance]);

  const formatCurrency = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  };

  if (loading) {
    return (
      <MainLayout role="admin">
        <div className="p-8 text-center">
          Loading company performance...
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout role="admin">
        <div className="space-y-6">

          <button
            onClick={() =>
              navigate(
                "/admin/company-management/performance"
              )
            }
            className="text-blue-600 hover:underline"
          >
            ← Back to Company Performance
          </button>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
            {error}
          </div>

        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout role="admin">
        <div className="p-8 text-center text-gray-500">
          No performance data available.
        </div>
      </MainLayout>
    );
  }

  const {
    company,
    summary,
    monthlySales,
    monthlyPurchases,
    topSellingMedicines,
    transactionSummary,
  } = data;

  const maxSales = Math.max(
    ...monthlySales.map(
      (item) => item.amount
    ),
    1
  );

  const maxPurchases = Math.max(
    ...monthlyPurchases.map(
      (item) => item.amount
    ),
    1
  );

  return (
    <MainLayout role="admin">

      <div className="space-y-6">

        <div>

          <button
            onClick={() =>
              navigate(
                "/admin/company-management/performance"
              )
            }
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Company Performance
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h1 className="text-3xl font-bold text-gray-800">
                Company Performance
              </h1>

              <p className="text-gray-500 mt-1">
                {company.companyName}
              </p>

            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                company.status ===
                "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : company.status ===
                      "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {company.status}
            </span>

          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Total Sales
            </p>

            <p className="text-2xl font-bold text-gray-800 mt-2">
              {formatCurrency(
                summary.totalSales
              )}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Completed sales
            </p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Purchase Value
            </p>

            <p className="text-2xl font-bold text-gray-800 mt-2">
              {formatCurrency(
                summary.totalPurchaseValue
              )}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Purchase orders
            </p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Inventory Value
            </p>

            <p className="text-2xl font-bold text-gray-800 mt-2">
              {formatCurrency(
                summary.inventoryValue
              )}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Current stock value
            </p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Inventory Units
            </p>

            <p className="text-2xl font-bold text-gray-800 mt-2">
              {summary.totalInventoryUnits.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Current stock
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Warehouses
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.totalWarehouses}
            </p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Medicines
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.totalMedicines}
            </p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Completed Sales
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.completedSales}
            </p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Pending Orders
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {summary.pendingPurchaseOrders}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl border shadow-sm p-6">

            <h2 className="text-xl font-semibold text-gray-800">
              Monthly Sales
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Sales performance over time
            </p>

            {monthlySales.length === 0 ? (

              <div className="py-12 text-center text-gray-400">
                No sales data available.
              </div>

            ) : (

              <div className="mt-6 space-y-4">

                {monthlySales.map(
                  (item) => (
                    <div
                      key={item.month}
                    >

                      <div className="flex justify-between text-sm mb-2">

                        <span className="text-gray-600">
                          {item.month}
                        </span>

                        <span className="font-semibold text-gray-800">
                          {formatCurrency(
                            item.amount
                          )}
                        </span>

                      </div>

                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.amount /
                                maxSales) *
                                100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>
                  )
                )}

              </div>

            )}

          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">

            <h2 className="text-xl font-semibold text-gray-800">
              Monthly Purchases
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Purchase value over time
            </p>

            {monthlyPurchases.length === 0 ? (

              <div className="py-12 text-center text-gray-400">
                No purchase data available.
              </div>

            ) : (

              <div className="mt-6 space-y-4">

                {monthlyPurchases.map(
                  (item) => (
                    <div
                      key={item.month}
                    >

                      <div className="flex justify-between text-sm mb-2">

                        <span className="text-gray-600">
                          {item.month}
                        </span>

                        <span className="font-semibold text-gray-800">
                          {formatCurrency(
                            item.amount
                          )}
                        </span>

                      </div>

                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.amount /
                                maxPurchases) *
                                100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>
                  )
                )}

              </div>

            )}

          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl border shadow-sm p-6">

            <h2 className="text-xl font-semibold text-gray-800">
              Top Selling Medicines
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Best performing medicines
            </p>

            {topSellingMedicines.length === 0 ? (

              <div className="py-12 text-center text-gray-400">
                No sales data available.
              </div>

            ) : (

              <div className="mt-5 divide-y">

                {topSellingMedicines.map(
                  (
                    medicine,
                    index
                  ) => (

                    <div
                      key={
                        medicine.medicineId
                      }
                      className="py-4 flex items-center justify-between gap-4"
                    >

                      <div className="flex items-center gap-4">

                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>

                        <div>

                          <p className="font-semibold text-gray-800">
                            {
                              medicine.medicineName
                            }
                          </p>

                          <p className="text-sm text-gray-500">
                            {medicine.quantity.toLocaleString(
                              "en-IN"
                            )}{" "}
                            units sold
                          </p>

                        </div>

                      </div>

                      <p className="font-semibold text-gray-800">
                        {formatCurrency(
                          medicine.revenue
                        )}
                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">

            <h2 className="text-xl font-semibold text-gray-800">
              Inventory Movement
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Stock transaction summary
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  Purchases
                </p>

                <p className="text-2xl font-bold text-green-800 mt-1">
                  {
                    transactionSummary.PURCHASE
                  }
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  Sales
                </p>

                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {
                    transactionSummary.SALE
                  }
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-700">
                  Dispatch
                </p>

                <p className="text-2xl font-bold text-indigo-800 mt-1">
                  {
                    transactionSummary.DISPATCH
                  }
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-700">
                  Returns
                </p>

                <p className="text-2xl font-bold text-orange-800 mt-1">
                  {
                    transactionSummary.RETURN
                  }
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  Expiry
                </p>

                <p className="text-2xl font-bold text-red-800 mt-1">
                  {
                    transactionSummary.EXPIRY
                  }
                </p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Damage
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {
                    transactionSummary.DAMAGE
                  }
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default CompanyPerformanceDetails;