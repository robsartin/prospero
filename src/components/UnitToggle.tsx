import { type UnitStrategy, getUnitStrategy } from "@/lib/units";

interface UnitToggleProps {
  units: UnitStrategy;
  onChange: (units: UnitStrategy) => void;
}

export default function UnitToggle({ units, onChange }: UnitToggleProps) {
  const nextStrategy = getUnitStrategy(
    units.id === "metric" ? "imperial" : "metric"
  );

  return (
    <button
      onClick={() => onChange(nextStrategy)}
      className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white hover:bg-zinc-700"
      title={`Switch to ${nextStrategy.id}`}
    >
      {units.labels.temp}
    </button>
  );
}
