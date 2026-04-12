import { formatValue } from "@/lib/format";
import { getWeatherEmoji } from "@/lib/weatherEmoji";

export interface ForecastDayProps {
  dayLabel: string;
  icon: string;
  conditions: string;
  highTemp: number;
  lowTemp: number;
  precipProbability: number;
  rawHighTempC?: number;
}

export function ForecastDay({
  dayLabel,
  icon,
  conditions,
  highTemp,
  lowTemp,
  precipProbability,
  rawHighTempC,
}: ForecastDayProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white p-3 min-w-[90px] shadow-sm">
      <span className="text-xs font-medium text-zinc-500">{dayLabel}</span>
      <span data-testid="weather-emoji" className="text-2xl" title={conditions}>
        {getWeatherEmoji(icon, conditions, rawHighTempC ?? highTemp)}
      </span>
      <div className="flex gap-2 text-sm">
        <span className="font-bold text-zinc-900">{formatValue("temperature", highTemp)}°</span>
        <span className="text-zinc-400">{formatValue("temperature", lowTemp)}°</span>
      </div>
      {precipProbability > 0 && (
        <span data-testid="precip" className="text-xs text-blue-500">
          {precipProbability}%
        </span>
      )}
    </div>
  );
}
