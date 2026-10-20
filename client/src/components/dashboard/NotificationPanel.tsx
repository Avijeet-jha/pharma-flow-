import { Bell } from "lucide-react";

function NotificationPanel() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold">
          Notifications
        </h2>

        <button className="text-blue-600 hover:underline">
          View All
        </button>

      </div>

      <div className="space-y-4">

        <NotificationItem
          message="5 new companies are waiting for approval."
          time="5 min ago"
        />

        <NotificationItem
          message="Low stock alerts generated for 12 medicines."
          time="18 min ago"
        />

        <NotificationItem
          message="Monthly analytics report is ready."
          time="1 hour ago"
        />

      </div>

    </div>
  );
}

type NotificationItemProps = {
  message: string;
  time: string;
};

function NotificationItem({
  message,
  time,
}: NotificationItemProps) {
  return (
    <div className="flex gap-3 border-b pb-3">

      <Bell className="text-blue-600 mt-1" size={20} />

      <div>

        <p className="text-sm font-medium">
          {message}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {time}
        </p>

      </div>

    </div>
  );
}

export default NotificationPanel;