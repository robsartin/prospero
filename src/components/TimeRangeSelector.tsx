const RANGES = ["1h", "6h", "24h", "5d"] as const;

export type TimeRange = (typeof RANGES)[number];

export interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function TimeRangeSelector({
  selected,
  onChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Time range">
      {RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            selected === range
              ? "bg-blue-500 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
