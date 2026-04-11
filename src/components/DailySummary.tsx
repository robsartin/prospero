import type { StationObservation } from "@/lib/types";

interface DailySummaryProps {
  observation: StationObservation;
}

function fmt(value: number | null | undefined): string {
  return value != null ? String(value) : "--";
}

export default function DailySummary({ observation }: DailySummaryProps) {
  return (
    <div
      data-testid="daily-summary"
      className="mb-4 flex flex-wrap gap-6 rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-700"
    >
      <span>
        Temp: <strong>{fmt(observation.air_temperature)}°</strong>
      </span>
      <span>
        Rain: <strong>{fmt(observation.precip_accum_local_day)} mm</strong>
      </span>
      <span>
        Peak Gust: <strong>{fmt(observation.wind_gust)} m/s</strong>
      </span>
    </div>
  );
}
