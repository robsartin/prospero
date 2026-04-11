"use client";

import { useCallback, useEffect, useState } from "react";
import TimeRangeSelector, { type TimeRange } from "./TimeRangeSelector";
import HistoryChart, { type HistoryDataPoint } from "./HistoryChart";
import RainChart from "./RainChart";
import { MetricUnitStrategy, type UnitStrategy } from "@/lib/units";
import { tempDomain, pressureDomain, zeroBasedDomain } from "@/lib/chartDomain";
import type { TransformedObservation } from "@/lib/transforms";

interface HistoryViewProps {
  deviceId: number | null;
  units?: UnitStrategy;
}

const RANGE_SECONDS: Record<TimeRange, number> = {
  "1h": 3600,
  "6h": 21600,
  "24h": 86400,
  "5d": 432000,
};

function formatTime(epoch: number, range: TimeRange): string {
  const date = new Date(epoch * 1000);
  if (range === "1h" || range === "6h") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "24h") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function toChartData(
  obs: TransformedObservation[],
  field: keyof TransformedObservation,
  range: TimeRange,
  convert: (v: number) => number = (v) => v
): HistoryDataPoint[] {
  return obs
    .filter((o) => o[field] != null)
    .map((o) => ({
      time: formatTime(o.timestamp, range),
      value: convert(o[field] as number),
    }));
}

const DEFAULT_UNITS = new MetricUnitStrategy();

export default function HistoryView({ deviceId, units = DEFAULT_UNITS }: HistoryViewProps) {
  const [range, setRange] = useState<TimeRange>("24h");
  const [obs, setObs] = useState<TransformedObservation[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (id: number, timeRange: TimeRange, signal: AbortSignal) => {
      setPending(true);
      const now = Math.floor(Date.now() / 1000);
      const start = now - RANGE_SECONDS[timeRange];
      try {
        const res = await fetch(
          `/api/history?device_id=${id}&time_start=${start}&time_end=${now}`,
          { signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: TransformedObservation[] = await res.json();
        if (!signal.aborted) {
          setObs(data);
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
  const windData = toChartData(obs, "windAvg", range, units.wind);
  const humidityData = toChartData(obs, "relativeHumidity", range);
  const rainData = toChartData(obs, "rainAccumulated", range, units.rain);

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
            precision={1}
            domain={tempDomain(tempData)}
          />
          <HistoryChart
            data={pressureData}
            label="Pressure"
            unit={units.labels.pressure}
            color="#3b82f6"
            precision={1}
            domain={pressureDomain(pressureData)}
          />
          <HistoryChart
            data={windData}
            label="Wind"
            unit={units.labels.wind}
            color="#10b981"
            precision={1}
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
        </div>
      )}
    </div>
  );
}
