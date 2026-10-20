import {
  Building2,
  Users,
  PieChart,
  CreditCard,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { useState } from "react";

// ==========================================
// TYPES
// ==========================================

type Period = "Monthly" | "Quarterly" | "Yearly";

type CompanyGrowthItem = {
  month?: string;
  quarter?: string;
  year?: number;
  companies: number;
};

type UserGrowthItem = {
  month?: string;
  quarter?: string;
  year?: number;
  users: number;
};

type UserDistributionItem = {
  role: string;
  users: number;
};

type PlatformAnalyticsData = {
  companyGrowth: {
    monthly: CompanyGrowthItem[];
    quarterly: CompanyGrowthItem[];
    yearly: CompanyGrowthItem[];
  };

  userGrowth: {
    monthly: UserGrowthItem[];
    quarterly: UserGrowthItem[];
    yearly: UserGrowthItem[];
  };

  userDistribution: UserDistributionItem[];

  subscriptionOverview: null;
};

type PlatformAnalyticsProps = {
  analytics: PlatformAnalyticsData | null;
};

// ==========================================
// PIE COLORS
// ==========================================

const pieColors = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
];

// ==========================================
// COMPONENT
// ==========================================

function PlatformAnalytics({
  analytics,
}: PlatformAnalyticsProps) {

  const [period, setPeriod] =
    useState<Period>("Monthly");

  // ==========================================
  // COMPANY GROWTH DATA
  // ==========================================

  const getCompanyData = () => {

    if (!analytics) {
      return [];
    }

    if (period === "Quarterly") {

      return analytics.companyGrowth.quarterly.map(
        (item) => ({
          name: item.quarter,
          registered: item.companies,
        })
      );

    }

    if (period === "Yearly") {

      return analytics.companyGrowth.yearly.map(
        (item) => ({
          name: String(item.year),
          registered: item.companies,
        })
      );

    }

    return analytics.companyGrowth.monthly.map(
      (item) => ({
        name: item.month,
        registered: item.companies,
      })
    );
  };

  // ==========================================
  // USER GROWTH DATA
  // ==========================================

  const getUserData = () => {

    if (!analytics) {
      return [];
    }

    if (period === "Quarterly") {

      return analytics.userGrowth.quarterly.map(
        (item) => ({
          name: item.quarter,
          users: item.users,
        })
      );

    }

    if (period === "Yearly") {

      return analytics.userGrowth.yearly.map(
        (item) => ({
          name: String(item.year),
          users: item.users,
        })
      );

    }

    return analytics.userGrowth.monthly.map(
      (item) => ({
        name: item.month,
        users: item.users,
      })
    );
  };

  // ==========================================
  // USER DISTRIBUTION
  // ==========================================

  const userDistributionData =
    analytics?.userDistribution.map(
      (item) => ({
        name: item.role,
        value: item.users,
      })
    ) ?? [];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-gray-800">
          📈 Platform Analytics
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Monitor the overall growth and performance
          of the PharmaFlow platform.
        </p>

      </div>


      {/* =====================================
          ANALYTICS GRID
      ===================================== */}

      <div className="grid grid-cols-2 gap-6">


        {/* ===================================
            COMPANY GROWTH
        =================================== */}

        <div className="border rounded-xl p-5">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-3">

              <div className="text-blue-600">
                <Building2 size={28} />
              </div>

              <div>

                <h3 className="text-lg font-semibold">
                  Company Growth
                </h3>

                <p className="text-gray-500 text-sm">
                  New companies registered
                </p>

              </div>

            </div>


            {/* PERIOD BUTTONS */}

            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">

              {(
                [
                  "Monthly",
                  "Quarterly",
                  "Yearly",
                ] as Period[]
              ).map((item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setPeriod(item)
                  }
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    period === item
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>


          {/* COMPANY GRAPH */}

          <div className="w-full h-[300px]">

            {!analytics ? (

              <div className="h-full flex items-center justify-center text-gray-400">
                Loading analytics...
              </div>

            ) : getCompanyData().length === 0 ? (

              <div className="h-full flex items-center justify-center text-gray-400">
                No company growth data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={getCompanyData()}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="name"
                  />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="registered"
                    name="Registered Companies"
                    fill="#2563eb"
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* ===================================
            USER GROWTH
        =================================== */}

        <div className="border rounded-xl p-5">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-3">

              <div className="text-blue-600">
                <Users size={28} />
              </div>

              <div>

                <h3 className="text-lg font-semibold">
                  User Growth
                </h3>

                <p className="text-gray-500 text-sm">
                  Registered platform users
                </p>

              </div>

            </div>

          </div>


          <div className="w-full h-[300px]">

            {!analytics ? (

              <div className="h-full flex items-center justify-center text-gray-400">
                Loading analytics...
              </div>

            ) : getUserData().length === 0 ? (

              <div className="h-full flex items-center justify-center text-gray-400">
                No user growth data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={getUserData()}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="name"
                  />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="users"
                    name="Registered Users"
                    fill="#7c3aed"
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* ===================================
            USER DISTRIBUTION
        =================================== */}

        <div className="border rounded-xl p-5">

          <div className="flex items-center gap-3 mb-3">

            <div className="text-blue-600">
              <PieChart size={28} />
            </div>

            <div>

              <h3 className="text-lg font-semibold">
                User Distribution
              </h3>

              <p className="text-gray-500 text-sm">
                Pharma • Wholesaler • Retailer
              </p>

            </div>

          </div>


          <div className="w-full h-[300px]">

            {userDistributionData.length === 0 ? (

              <div className="h-full flex items-center justify-center text-gray-400">
                No user distribution data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    label={({
                      name,
                      percent,
                    }) =>
                      `${name} ${(
                        (percent || 0) *
                        100
                      ).toFixed(0)}%`
                    }
                  >

                    {userDistributionData.map(
                      (_, index) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={
                            pieColors[
                              index %
                                pieColors.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* ===================================
            SUBSCRIPTION OVERVIEW
        =================================== */}

        <div className="border rounded-xl p-5">

          <div className="flex items-center gap-3 mb-5">

            <div className="text-blue-600">
              <CreditCard size={28} />
            </div>

            <div>

              <h3 className="text-lg font-semibold">
                Subscription Overview
              </h3>

              <p className="text-gray-500 text-sm">
                Subscription system
              </p>

            </div>

          </div>


          {/* CURRENTLY UNAVAILABLE */}

          <div className="h-[300px] flex flex-col items-center justify-center text-center">

            <CreditCard
              size={42}
              className="text-gray-300 mb-4"
            />

            <h4 className="text-lg font-semibold text-gray-600">
              Subscription Analytics
            </h4>

            <p className="text-sm text-gray-400 mt-2 max-w-sm">
              Subscription tracking will appear here
              once the PharmaFlow subscription system
              is implemented.
            </p>

            <span className="mt-4 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
              Coming Soon
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PlatformAnalytics;