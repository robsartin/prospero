import type { UnitSystem } from "@/lib/units";

interface UnitToggleProps {
  system: UnitSystem;
  onChange: (system: UnitSystem) => void;
}

export default function UnitToggle({ system, onChange }: UnitToggleProps) {
  const toggle = () => onChange(system === "metric" ? "imperial" : "metric");

  return (
    <button
      onClick={toggle}
      className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white hover:bg-zinc-700"
      title={`Switch to ${system === "metric" ? "imperial" : "metric"}`}
    >
      {system === "metric" ? "°C" : "°F"}
    </button>
  );
}
