import type { StationObservation } from "@/lib/types";
import { formatValue } from "@/lib/format";

interface DailySummaryProps {
  observation: StationObservation;
}

export default function DailySummary({ observation }: DailySummaryProps) {
  return (
    <div
      data-testid="daily-summary"
      className="mb-4 flex flex-wrap gap-6 rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-700"
    >
      <span>
        Temp: <strong>{formatValue("temperature", observation.air_temperature)}°</strong>
      </span>
      <span>
        Rain: <strong>{formatValue("rain", observation.precip_accum_local_day)} mm</strong>
      </span>
      <span>
        Peak Gust: <strong>{formatValue("wind", observation.wind_gust)} m/s</strong>
      </span>
    </div>
  );
}
