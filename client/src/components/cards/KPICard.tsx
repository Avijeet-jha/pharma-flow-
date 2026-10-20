import React from "react";

type KPICardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

function KPICard({
  title,
  value,
  icon,
  onClick,
  className = "",
}: KPICardProps) {
  const clickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(event) => {
        if (
          clickable &&
          (event.key === "Enter" ||
            event.key === " ")
        ) {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`
        bg-white
        rounded-xl
        shadow-sm
        border
        p-5
        transition-all
        duration-200
        ${
          clickable
            ? "cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-blue-300 active:translate-y-0"
            : ""
        }
        ${className}
      `}
    >
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {value}
          </h3>
        </div>

        {icon && (
          <div className="text-blue-600">
            {icon}
          </div>
        )}

      </div>
    </div>
  );
}

export default KPICard;