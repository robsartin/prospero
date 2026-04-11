"use client";

import { useCallback, useEffect, useState } from "react";
import TimeRangeSelector, { type TimeRange } from "./TimeRangeSelector";
import HistoryChart, { type HistoryDataPoint } from "./HistoryChart";
import RainChart from "./RainChart";
import { MetricUnitStrategy, type UnitStrategy } from "@/lib/units";
import type { TransformedObservation } from "@/lib/transforms";

interface HistoryViewProps {
  deviceId: number | null;
  units?: UnitStrategy;
}

const RANGE_SECONDS: Record<TimeRange, number> = {
  "24h": 86400,
  "7d": 604800,
  "30d": 2592000,
  "1y": 31536000,
};

function formatTime(epoch: number, range: TimeRange): string {
  const date = new Date(epoch * 1000);
  if (range === "24h") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "7d" || range === "30d") {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString([], { month: "short", year: "2-digit" });
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

  return (
    <div className="space-y-6">
      <TimeRangeSelector selected={range} onChange={setRange} />

      {pending && <p data-testid="loading">Loading history...</p>}
      {error && <p data-testid="error" className="text-red-500">Error: {error}</p>}

      {!pending && !error && (
        <div className="space-y-8">
          <HistoryChart
            data={toChartData(obs, "airTemperature", range, units.temp)}
            label="Temperature"
            unit={units.labels.temp}
            color="#ef4444"
            precision={1}
          />
          <HistoryChart
            data={toChartData(obs, "stationPressure", range, units.pressure)}
            label="Pressure"
            unit={units.labels.pressure}
            color="#3b82f6"
            precision={1}
          />
          <HistoryChart
            data={toChartData(obs, "windAvg", range, units.wind)}
            label="Wind"
            unit={units.labels.wind}
            color="#10b981"
            precision={1}
          />
          <HistoryChart
            data={toChartData(obs, "relativeHumidity", range)}
            label="Humidity"
            unit="%"
            color="#8b5cf6"
            precision={0}
          />
          <RainChart
            data={toChartData(obs, "rainAccumulated", range, units.rain)}
            unit={units.labels.rain}
            precision={2}
          />
        </div>
      )}
    </div>
  );
}
