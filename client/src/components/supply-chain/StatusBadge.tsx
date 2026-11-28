
type StatusBadgeProps = {
  status?: string | null;
  className?: string;
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  ACCEPTED: "bg-blue-50 text-blue-700 border-blue-200",
  DISPATCHED: "bg-purple-50 text-purple-700 border-purple-200",
  IN_TRANSIT: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  RETURNED: "bg-orange-50 text-orange-700 border-orange-200",
  OVERDUE: "bg-red-50 text-red-700 border-red-200",
};

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  const normalizedStatus = (status || "UNKNOWN").toUpperCase();

  const style =
    statusStyles[normalizedStatus] ||
    "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${style} ${className}`}
    >
      {normalizedStatus.replaceAll("_", " ")}
    </span>
  );
}
