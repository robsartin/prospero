import type { UnitStrategy, UnitSystemId } from "@/lib/units";

interface UnitToggleProps {
  units: UnitStrategy;
  onChange: (id: UnitSystemId) => void;
}

export default function UnitToggle({ units, onChange }: UnitToggleProps) {
  const nextId: UnitSystemId = units.id === "metric" ? "imperial" : "metric";

  return (
    <button
      onClick={() => onChange(nextId)}
      className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white hover:bg-zinc-700"
      title={`Switch to ${nextId}`}
    >
      {units.labels.temp}
    </button>
  );
}
