import { useNavigate } from "react-router-dom";
import {
  Pill,
  Package,
  TrendingUp,
  Trophy,
  ChevronRight,
} from "lucide-react";

function AnalyticsPanel() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Business Insights
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Monitor medicine usage, inventory movement and company performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <InsightCard
          title="Most Used Medicines"
          description="View medicines ranked by platform-wide usage."
          icon={<Pill size={28} />}
          onClick={() =>
            navigate(
              "/admin/analytics/medicine-usage"
            )
          }
        />

        <InsightCard
          title="Overall Inventory Movement"
          description="Track stock movement across all companies."
          icon={<Package size={28} />}
          onClick={() =>
            navigate(
              "/admin/analytics/inventory-movement"
            )
          }
        />

        <InsightCard
          title="Demand Trends"
          description="Monitor AI predicted medicine demand."
          icon={<TrendingUp size={28} />}
          onClick={() =>
            navigate(
              "/admin/analytics/demand-trends"
            )
          }
        />

        <InsightCard
          title="Top Performing Companies"
          description="Rank companies by overall performance."
          icon={<Trophy size={28} />}
          onClick={() =>
            navigate(
              "/admin/analytics/company-ranking"
            )
          }
        />
      </div>
    </div>
  );
}

type InsightCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

function InsightCard({
  title,
  description,
  icon,
  onClick,
}: InsightCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        border
        rounded-xl
        p-5
        text-left
        cursor-pointer
        hover:shadow-lg
        hover:border-blue-500
        hover:-translate-y-1
        active:translate-y-0
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      "
    >
      <div className="flex justify-between items-start">
        <div className="text-blue-600">
          {icon}
        </div>

        <ChevronRight
          size={18}
          className="text-gray-400"
        />
      </div>

      <h3 className="font-semibold text-lg mt-5">
        {title}
      </h3>

      <p className="text-gray-500 text-sm mt-2">
        {description}
      </p>
    </button>
  );
}

export default AnalyticsPanel;