import {
  Server,
  Database,
  Brain,
  Bell,
} from "lucide-react";

function PlatformHealthPanel() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold">
          Platform Health
        </h2>

        <span className="text-green-600 font-medium">
          Healthy
        </span>

      </div>

      <div className="space-y-4">

        <HealthItem
          icon={<Server size={18} />}
          title="Server"
          status="Online"
        />

        <HealthItem
          icon={<Database size={18} />}
          title="Database"
          status="Connected"
        />

        <HealthItem
          icon={<Brain size={18} />}
          title="Prediction Engine"
          status="Running"
        />

        <HealthItem
          icon={<Bell size={18} />}
          title="Alert Service"
          status="Active"
        />

      </div>

    </div>
  );
}

type HealthItemProps = {
  icon: React.ReactNode;
  title: string;
  status: string;
};

function HealthItem({
  icon,
  title,
  status,
}: HealthItemProps) {
  return (
    <div className="flex items-center justify-between border-b pb-3">

      <div className="flex items-center gap-3">

        <div className="text-green-600">
          {icon}
        </div>

        <span>{title}</span>

      </div>

      <span className="text-green-600 font-medium">
        {status}
      </span>

    </div>
  );
}

export default PlatformHealthPanel;