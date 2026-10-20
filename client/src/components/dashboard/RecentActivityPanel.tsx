import {
  Building2,
  Package,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

function RecentActivityPanel() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold">
          Recent Activity
        </h2>

        <button className="text-blue-600 hover:underline">
          View All
        </button>

      </div>

      <div className="space-y-5">

        <ActivityItem
          icon={<Building2 size={18} />}
          title="New company registered"
          time="5 minutes ago"
        />

        <ActivityItem
          icon={<Package size={18} />}
          title="Inventory updated by MedLife"
          time="18 minutes ago"
        />

        <ActivityItem
          icon={<ShoppingCart size={18} />}
          title="Purchase order generated"
          time="40 minutes ago"
        />

        <ActivityItem
          icon={<UserPlus size={18} />}
          title="New retailer joined"
          time="1 hour ago"
        />

      </div>

    </div>
  );
}

type ActivityItemProps = {
  icon: React.ReactNode;
  title: string;
  time: string;
};

function ActivityItem({
  icon,
  title,
  time,
}: ActivityItemProps) {
  return (
    <div className="flex items-center gap-4 border-b pb-3">

      <div className="bg-blue-100 p-2 rounded-full text-blue-600">
        {icon}
      </div>

      <div className="flex-1">

        <p className="font-medium">
          {title}
        </p>

        <p className="text-sm text-gray-500">
          {time}
        </p>

      </div>

    </div>
  );
}

export default RecentActivityPanel;