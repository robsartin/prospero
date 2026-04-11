import type { TimeRange } from "@/lib/timeRanges";

const RANGES: { id: TimeRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "Past Month" },
  { id: "last-month", label: "Last Month" },
  { id: "year", label: "Past Year" },
];

export interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function TimeRangeSelector({
  selected,
  onChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Time range">
      {RANGES.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            selected === id
              ? "bg-blue-500 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
