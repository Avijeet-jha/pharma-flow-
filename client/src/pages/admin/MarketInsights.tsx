import {
  TrendingUp,
  TrendingDown,
  Pill,
  Trophy,
  MapPin,
  Package,
  AlertTriangle,
  Activity,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useState } from "react";

type Period = "Monthly" | "Quarterly" | "Yearly";

/* =========================
   DEMO DATA
========================= */

const monthlyDemand = [
  { name: "Jan", demand: 4200, sales: 3800 },
  { name: "Feb", demand: 4600, sales: 4100 },
  { name: "Mar", demand: 5100, sales: 4700 },
  { name: "Apr", demand: 5400, sales: 4900 },
  { name: "May", demand: 5900, sales: 5300 },
  { name: "Jun", demand: 6300, sales: 5700 },
  { name: "Jul", demand: 6800, sales: 6200 },
  { name: "Aug", demand: 7200, sales: 6600 },
  { name: "Sep", demand: 7600, sales: 7000 },
  { name: "Oct", demand: 8100, sales: 7500 },
  { name: "Nov", demand: 8500, sales: 7900 },
  { name: "Dec", demand: 9100, sales: 8400 },
];

const quarterlyDemand = [
  { name: "Q1", demand: 13900, sales: 12600 },
  { name: "Q2", demand: 17600, sales: 15900 },
  { name: "Q3", demand: 21600, sales: 19800 },
  { name: "Q4", demand: 25700, sales: 23400 },
];

const yearlyDemand = [
  { name: "2023", demand: 58000, sales: 51000 },
  { name: "2024", demand: 76000, sales: 69000 },
  { name: "2025", demand: 91000, sales: 83000 },
  { name: "2026", demand: 98700, sales: 91700 },
];

const topMedicines = [
  {
    name: "Paracetamol",
    sales: 9200,
    growth: 24,
  },
  {
    name: "Azithromycin",
    sales: 8100,
    growth: 19,
  },
  {
    name: "Amoxicillin",
    sales: 7400,
    growth: 16,
  },
  {
    name: "Ibuprofen",
    sales: 6800,
    growth: 13,
  },
  {
    name: "Cetirizine",
    sales: 5900,
    growth: 11,
  },
  {
    name: "Metformin",
    sales: 5100,
    growth: 9,
  },
];

const topCompanies = [
  {
    name: "Jha Pharma",
    sales: 1840000,
    growth: 28,
  },
  {
    name: "MediCare Industries",
    sales: 1620000,
    growth: 24,
  },
  {
    name: "LifeLine Pharma",
    sales: 1410000,
    growth: 21,
  },
  {
    name: "HealthPlus",
    sales: 1260000,
    growth: 18,
  },
  {
    name: "NovaMed",
    sales: 1090000,
    growth: 15,
  },
];

const categoryData = [
  {
    name: "Antibiotics",
    demand: 32,
  },
  {
    name: "Pain Relief",
    demand: 27,
  },
  {
    name: "Cardiovascular",
    demand: 21,
  },
  {
    name: "Vitamins",
    demand: 16,
  },
  {
    name: "Other",
    demand: 12,
  },
];

const regionalData = [
  {
    name: "Maharashtra",
    demand: 86,
  },
  {
    name: "Gujarat",
    demand: 72,
  },
  {
    name: "Madhya Pradesh",
    demand: 64,
  },
  {
    name: "Rajasthan",
    demand: 57,
  },
  {
    name: "Karnataka",
    demand: 51,
  },
];

/* =========================
   MAIN COMPONENT
========================= */

function MarketInsights() {
  const [period, setPeriod] =
    useState<Period>("Monthly");

  const getDemandData = () => {
    if (period === "Quarterly") {
      return quarterlyDemand;
    }

    if (period === "Yearly") {
      return yearlyDemand;
    }

    return monthlyDemand;
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <p className="text-sm text-gray-500 mb-2">
          Dashboard &gt; Market Intelligence
        </p>

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Market Insights
            </h1>

            <p className="text-gray-500 mt-1">
              Understand pharmaceutical market demand,
              trends, performance and emerging opportunities.
            </p>
          </div>

          <div className="flex gap-2 bg-white border rounded-lg p-1">

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
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  period === item
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

        </div>
      </div>

      {/* MARKET KPI CARDS */}

      <div className="grid grid-cols-5 gap-4">

        <MarketKPI
          title="Market Demand"
          value="98.7K"
          subtitle="Total demand"
          icon={<Activity size={24} />}
          trend="+18.4%"
          positive
        />

        <MarketKPI
          title="Demand Growth"
          value="18.4%"
          subtitle="Compared to last period"
          icon={<TrendingUp size={24} />}
          trend="+4.2%"
          positive
        />

        <MarketKPI
          title="Top Medicine"
          value="Paracetamol"
          subtitle="Highest selling"
          icon={<Pill size={24} />}
          trend="+24%"
          positive
        />

        <MarketKPI
          title="Market Leaders"
          value="5"
          subtitle="Top performing companies"
          icon={<Trophy size={24} />}
          trend="+12%"
          positive
        />

        <MarketKPI
          title="Supply Risk"
          value="8"
          subtitle="Medicines at risk"
          icon={<AlertTriangle size={24} />}
          trend="+2"
          positive={false}
        />

      </div>

      {/* MARKET DEMAND + ALERTS */}

      <div className="grid grid-cols-3 gap-6">

        <div className="col-span-2 bg-white rounded-xl shadow-md p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Market Demand & Sales
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Compare market demand with actual sales.
              </p>
            </div>

            <BarChart3
              className="text-blue-600"
              size={26}
            />

          </div>

          <div className="h-[350px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={getDemandData()}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="demand"
                  name="Market Demand"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Actual Sales"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* MARKET ALERTS */}

        <div className="bg-white rounded-xl shadow-md p-6">

          <h2 className="text-xl font-bold text-gray-800">
            Market Alerts
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Important market movements.
          </p>

          <div className="space-y-4">

            <MarketAlert
              type="warning"
              title="Supply Risk"
              text="8 medicines have high demand but limited inventory."
            />

            <MarketAlert
              type="success"
              title="Trending"
              text="Paracetamol demand increased by 24%."
            />

            <MarketAlert
              type="info"
              title="Market Growth"
              text="Overall pharmaceutical demand increased by 18.4%."
            />

            <MarketAlert
              type="warning"
              title="Demand Spike"
              text="Antibiotic demand is rising rapidly."
            />

          </div>

        </div>

      </div>

      {/* TOP MEDICINES + TOP COMPANIES */}

      <div className="grid grid-cols-2 gap-6">

        {/* TOP SELLING MEDICINES */}

        <div className="bg-white rounded-xl shadow-md p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Top Selling Medicines
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Highest performing medicines across the platform.
              </p>
            </div>

            <Pill
              className="text-blue-600"
              size={26}
            />

          </div>

          <div className="h-[340px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={topMedicines}
                layout="vertical"
                margin={{
                  left: 20,
                  right: 20,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis type="number" />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                />

                <Tooltip />

                <Bar
                  dataKey="sales"
                  name="Units Sold"
                  fill="#2563eb"
                  radius={[
                    0,
                    5,
                    5,
                    0,
                  ]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* TOP PERFORMING COMPANIES */}

        <div className="bg-white rounded-xl shadow-md p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Top Performing Companies
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Companies leading the pharmaceutical market.
              </p>
            </div>

            <Trophy
              className="text-yellow-500"
              size={26}
            />

          </div>

          <div className="space-y-4">

            {topCompanies.map(
              (company, index) => (
                <div
                  key={company.name}
                  className="flex items-center gap-4 border rounded-xl p-4 hover:shadow-md transition"
                >

                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1">

                    <h3 className="font-semibold text-gray-800">
                      {company.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      ₹
                      {(
                        company.sales /
                        100000
                      ).toFixed(1)}
                      L sales
                    </p>

                  </div>

                  <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <TrendingUp size={16} />
                    {company.growth}%
                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </div>

      {/* CATEGORY + REGIONAL DEMAND */}

      <div className="grid grid-cols-2 gap-6">

        {/* CATEGORY */}

        <div className="bg-white rounded-xl shadow-md p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="text-blue-600">
              <Package size={26} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Medicine Category Trends
              </h2>

              <p className="text-sm text-gray-500">
                Demand distribution by category.
              </p>
            </div>

          </div>

          <div className="space-y-5">

            {categoryData.map(
              (category) => (
                <div
                  key={category.name}
                >

                  <div className="flex justify-between mb-2">

                    <span className="text-sm font-medium">
                      {category.name}
                    </span>

                    <span className="text-sm text-gray-500">
                      {category.demand}%
                    </span>

                  </div>

                  <div className="h-2 bg-gray-200 rounded-full">

                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{
                        width: `${category.demand * 2.5}%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* REGIONAL */}

        <div className="bg-white rounded-xl shadow-md p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="text-blue-600">
              <MapPin size={26} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Regional Demand
              </h2>

              <p className="text-sm text-gray-500">
                High-demand regions across the platform.
              </p>
            </div>

          </div>

          <div className="space-y-5">

            {regionalData.map(
              (region) => (
                <div
                  key={region.name}
                >

                  <div className="flex justify-between mb-2">

                    <span className="text-sm font-medium">
                      {region.name}
                    </span>

                    <span className="text-sm text-gray-500">
                      {region.demand}
                    </span>

                  </div>

                  <div className="h-2 bg-gray-200 rounded-full">

                    <div
                      className="h-2 bg-indigo-500 rounded-full"
                      style={{
                        width: `${region.demand}%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </div>

      {/* FASTEST GROWING MEDICINES */}

      <div className="bg-white rounded-xl shadow-md p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Fastest Growing Medicines
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Products showing the strongest demand growth.
            </p>
          </div>

          <ArrowUpRight
            className="text-green-600"
            size={26}
          />

        </div>

        <div className="grid grid-cols-3 gap-5">

          {topMedicines
            .slice(0, 3)
            .map((medicine) => (
              <div
                key={medicine.name}
                className="border rounded-xl p-5 hover:shadow-md transition"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {medicine.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Current market trend
                    </p>
                  </div>

                  <TrendingUp
                    className="text-green-600"
                    size={22}
                  />

                </div>

                <p className="text-3xl font-bold text-green-600 mt-5">
                  +{medicine.growth}%
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Demand growth
                </p>

              </div>
            ))}

        </div>

      </div>

    </div>
  );
}

/* =========================
   MARKET KPI
========================= */

type MarketKPIProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend: string;
  positive: boolean;
};

function MarketKPI({
  title,
  value,
  subtitle,
  icon,
  trend,
  positive,
}: MarketKPIProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-5 hover:shadow-lg transition">

      <div className="flex items-start justify-between">

        <div className="text-blue-600">
          {icon}
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-semibold ${
            positive
              ? "text-green-600"
              : "text-red-600"
          }`}
        >

          {positive ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}

          {trend}

        </div>

      </div>

      <p className="text-sm text-gray-500 mt-4">
        {title}
      </p>

      <p className="text-2xl font-bold text-gray-800 mt-1">
        {value}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        {subtitle}
      </p>

    </div>
  );
}

/* =========================
   MARKET ALERT
========================= */

type MarketAlertProps = {
  type: "warning" | "success" | "info";
  title: string;
  text: string;
};

function MarketAlert({
  type,
  title,
  text,
}: MarketAlertProps) {

  const styles = {
    warning:
      "bg-orange-50 border-orange-200 text-orange-700",

    success:
      "bg-green-50 border-green-200 text-green-700",

    info:
      "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div
      className={`border rounded-xl p-4 ${styles[type]}`}
    >

      <p className="font-semibold text-sm">
        {title}
      </p>

      <p className="text-xs mt-1 opacity-80">
        {text}
      </p>

    </div>
  );
}

export default MarketInsights;