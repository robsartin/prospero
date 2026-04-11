"use client";

import { useCallback, useEffect, useState } from "react";
import TimeRangeSelector, { type TimeRange } from "./TimeRangeSelector";
import HistoryChart, { type HistoryDataPoint } from "./HistoryChart";
import type { ObservationsResponse, StationObservation } from "@/lib/types";

interface HistoryViewProps {
  stationId: number | null;
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
  obs: StationObservation[],
  field: keyof StationObservation,
  range: TimeRange
): HistoryDataPoint[] {
  return obs
    .filter((o) => o[field] != null)
    .map((o) => ({
      time: formatTime(o.timestamp, range),
      value: o[field] as number,
    }));
}

export default function HistoryView({ stationId }: HistoryViewProps) {
  const [range, setRange] = useState<TimeRange>("24h");
  const [obs, setObs] = useState<StationObservation[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (id: number, timeRange: TimeRange, signal: AbortSignal) => {
      setPending(true);
      const now = Math.floor(Date.now() / 1000);
      const start = now - RANGE_SECONDS[timeRange];
      try {
        const res = await fetch(
          `/api/history?station_id=${id}&time_start=${start}&time_end=${now}`,
          { signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ObservationsResponse = await res.json();
        if (!signal.aborted) {
          setObs(data.obs ?? []);
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
    if (!stationId) return;
    const controller = new AbortController();
    load(stationId, range, controller.signal);
    return () => controller.abort();
  }, [stationId, range, load]);

  if (!stationId) {
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
            data={toChartData(obs, "air_temperature", range)}
            label="Temperature"
            unit="°C"
            color="#ef4444"
          />
          <HistoryChart
            data={toChartData(obs, "sea_level_pressure", range)}
            label="Pressure"
            unit="mb"
            color="#3b82f6"
          />
          <HistoryChart
            data={toChartData(obs, "wind_avg", range)}
            label="Wind"
            unit="m/s"
            color="#10b981"
          />
        </div>
      )}
    </div>
  );
}
