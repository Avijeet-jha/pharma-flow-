import {
  Building2,
  ClipboardCheck,
  FileText,
  TrendingUp,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

import MainLayout from "../../layouts/MainLayout";

function CompanyManagement() {
  return (
    <MainLayout role="admin">
      <div className="space-y-8">

        {/* Header */}

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Company Management
          </h1>

          <p className="text-gray-500 mt-2">
            Manage every company registered on the PharmaFlow platform.
          </p>

        </div>

        {/* Module Cards */}

        <div className="grid grid-cols-2 gap-6">

          <ModuleCard
            title="Companies"
            description="View and manage all registered companies."
            count="248 Companies"
            icon={<Building2 size={32} />}
          />

          <ModuleCard
            title="Company Approvals"
            description="Review pending company registrations."
            count="18 Pending"
            icon={<ClipboardCheck size={32} />}
          />

          <ModuleCard
            title="Company Documents"
            description="Verify licenses and company documents."
            count="248 Records"
            icon={<FileText size={32} />}
          />

          <ModuleCard
            title="Company Performance"
            description="Analyze growth and company performance."
            count="Analytics"
            icon={<TrendingUp size={32} />}
          />

        </div>

        <ModuleCard
          title="Register Company"
          description="Register a new pharmaceutical company."
          count="Quick Action"
          icon={<PlusCircle size={32} />}
          fullWidth
        />

      </div>
    </MainLayout>
  );
}

type ModuleCardProps = {
  title: string;
  description: string;
  count: string;
  icon: React.ReactNode;
  fullWidth?: boolean;
};

function ModuleCard({
  title,
  description,
  count,
  icon,
  fullWidth = false,
}: ModuleCardProps) {
  return (
    <button
      className={`
        bg-white
        rounded-xl
        shadow-md
        p-6
        text-left
        hover:shadow-xl
        hover:border-blue-500
        border
        transition-all
        duration-200
        ${fullWidth ? "w-full" : ""}
      `}
    >

      <div className="flex justify-between">

        <div className="text-blue-600">
          {icon}
        </div>

        <ArrowRight size={20} />

      </div>

      <h2 className="text-xl font-semibold mt-6">
        {title}
      </h2>

      <p className="text-gray-500 mt-2">
        {description}
      </p>

      <p className="text-blue-600 font-medium mt-6">
        {count}
      </p>

    </button>
  );
}

export default CompanyManagement;   