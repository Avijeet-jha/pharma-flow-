import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import InventoryTable from "../components/InventoryTable";

type DashboardOverview = {
  totalMedicines: number;
  totalInventory: number;
  inventoryValue: number;
  completedSalesAmount: number;
  completedSalesCount: number;
  activePurchaseOrders: number;
  lowStockCount: number;
  expiringBatchesCount: number;
};

function Dashboard() {
  const [dashboardData, setDashboardData] =
    useState<DashboardOverview | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(
          "http://localhost:5000/api/dashboard/overview",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch dashboard data"
          );
        }

        setDashboardData(result.data);
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
          flex: 1,
        }}
      >
        <h1>Welcome to PharmaFlow</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "30px",
          flex: 1,
        }}
      >
        <h1>Welcome to PharmaFlow</h1>

        <div
          style={{
            padding: "15px",
            marginTop: "20px",
            border: "1px solid #ff4d4f",
            borderRadius: "8px",
          }}
        >
          <strong>Failed to load dashboard</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        flex: 1,
      }}
    >
      <h1>Welcome to PharmaFlow</h1>

      <InventoryTable />

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
          flexWrap: "wrap",
        }}
      >
        <StatCard
          title="Total Medicines"
          value={dashboardData?.totalMedicines ?? 0}
        />

        <StatCard
          title="Low Stock"
          value={dashboardData?.lowStockCount ?? 0}
        />

        <StatCard
          title="Pending Orders"
          value={dashboardData?.activePurchaseOrders ?? 0}
        />

        <StatCard
          title="Total Inventory"
          value={dashboardData?.totalInventory ?? 0}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <StatCard
          title="Completed Sales"
          value={`₹${Number(dashboardData?.completedSalesAmount ?? 0)}`}        />

        <StatCard
          title="Sales Count"
          value={dashboardData?.completedSalesCount ?? 0}
        />

        <StatCard
          title="Expiring Batches"
          value={dashboardData?.expiringBatchesCount ?? 0}
        />

        <StatCard
          title="Inventory Value"
          value={`₹${Number(dashboardData?.inventoryValue ?? 0)}`}        />
      </div>
    </div>
  );
}

export default Dashboard;