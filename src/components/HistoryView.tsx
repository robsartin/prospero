"use client";

import { useCallback, useEffect, useState } from "react";
import TimeRangeSelector from "./TimeRangeSelector";
import HistoryChart, { type HistoryDataPoint } from "./HistoryChart";
import RainChart from "./RainChart";
import LightningChart from "./LightningChart";
import IlluminanceChart from "./IlluminanceChart";
import { MetricUnitStrategy, type UnitStrategy } from "@/lib/units";
import { tempDomain, pressureDomain, zeroBasedDomain } from "@/lib/chartDomain";
import { getTimeRange, chunkTimeRange, type TimeRange } from "@/lib/timeRanges";
import type { TransformedObservation } from "@/lib/transforms";

interface HistoryViewProps {
  deviceId: number | null;
  units?: UnitStrategy;
}

function formatTime(epoch: number, range: TimeRange): string {
  const date = new Date(epoch * 1000);
  if (range === "today") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "week" || range === "last-month") {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  if (range === "month") {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString([], { month: "short", year: "2-digit" });
}

function toChartData(
  obs: TransformedObservation[],
  field: keyof TransformedObservation,
  range: TimeRange,
  convert: (v: number) => number = (v) => v,
  directionField?: keyof TransformedObservation
): HistoryDataPoint[] {
  return obs
    .filter((o) => o[field] != null)
    .map((o) => ({
      time: formatTime(o.timestamp, range),
      value: convert(o[field] as number),
      direction: directionField ? (o[directionField] as number | null) : undefined,
    }));
}

async function fetchChunk(
  deviceId: number,
  start: number,
  end: number,
  signal: AbortSignal
): Promise<TransformedObservation[]> {
  const res = await fetch(
    `/api/history?device_id=${deviceId}&time_start=${start}&time_end=${end}`,
    { signal }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const DEFAULT_UNITS = new MetricUnitStrategy();

export default function HistoryView({ deviceId, units = DEFAULT_UNITS }: HistoryViewProps) {
  const [range, setRange] = useState<TimeRange>("today");
  const [obs, setObs] = useState<TransformedObservation[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (id: number, timeRange: TimeRange, signal: AbortSignal) => {
      setPending(true);
      try {
        const [start, end] = getTimeRange(timeRange);
        const chunks = chunkTimeRange(start, end);

        const results = await Promise.all(
          chunks.map(([s, e]) => fetchChunk(id, s, e, signal))
        );

        if (!signal.aborted) {
          setObs(results.flat());
          setError(null);
        }
      } catch (err) {
        if (!signal.aborted && err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!signal.aborted) {
          setPending(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!deviceId) return;
    const controller = new AbortController();
    load(deviceId, range, controller.signal);
    return () => controller.abort();
  }, [deviceId, range, load]);

  if (!deviceId) {
    return <p className="text-zinc-500">Select a station to view history.</p>;
  }

  const tempData = toChartData(obs, "airTemperature", range, units.temp);
  const pressureData = toChartData(obs, "stationPressure", range, units.pressure);
  const windData = toChartData(obs, "windAvg", range, units.wind, "windDirection");
  const humidityData = toChartData(obs, "relativeHumidity", range);
  const rainData = toChartData(obs, "rainAccumulated", range, units.rain);
  const lightningData = toChartData(obs, "lightningStrikeCount", range);
  const illuminanceData = toChartData(obs, "illuminance", range);

  return (
    <div className="space-y-6">
      <TimeRangeSelector selected={range} onChange={setRange} />

      {pending && <p data-testid="loading">Loading history...</p>}
      {error && <p data-testid="error" className="text-red-500">Error: {error}</p>}

      {!pending && !error && (
        <div className="space-y-8">
          <HistoryChart
            data={tempData}
            label="Temperature"
            unit={units.labels.temp}
            color="#ef4444"
            precision={0}
            domain={tempDomain(tempData)}
          />
          <HistoryChart
            data={pressureData}
            label="Pressure"
            unit={units.labels.pressure}
            color="#3b82f6"
            precision={1}
            domain={pressureDomain()}
          />
          <HistoryChart
            data={windData}
            label="Wind"
            unit={units.labels.wind}
            color="#10b981"
            precision={1}
            showWindArrows
            domain={zeroBasedDomain(windData)}
          />
          <HistoryChart
            data={humidityData}
            label="Humidity"
            unit="%"
            color="#8b5cf6"
            precision={0}
            domain={zeroBasedDomain(humidityData)}
          />
          <RainChart
            data={rainData}
            unit={units.labels.rain}
            precision={2}
            domain={zeroBasedDomain(rainData)}
          />
          <LightningChart
            data={lightningData}
            domain={zeroBasedDomain(lightningData)}
          />
          <IlluminanceChart
            data={illuminanceData}
            domain={zeroBasedDomain(illuminanceData)}
          />
        </div>
      )}
    </div>
  );
}
