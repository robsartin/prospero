export interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon?: string;
  secondary?: string;
  className?: string;
  severityColor?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  icon,
  secondary,
  className = "",
  severityColor,
}: MetricCardProps) {
  const borderClass = severityColor ?? "border-gray-200";
  return (
    <div
      className={`rounded-xl border ${borderClass} bg-white p-4 shadow-sm ${className}`.trim()}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span data-testid="metric-card-icon" className="text-2xl">
            {icon}
          </span>
        )}
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-lg text-gray-500">{unit}</span>
      </div>
      {secondary && (
        <p
          data-testid="metric-card-secondary"
          className="mt-1 text-sm text-gray-400"
        >
          {secondary}
        </p>
      )}
    </div>
  );
}
