"use client";

import { useCallback, useEffect, useState } from "react";
import { ForecastDay } from "./ForecastDay";
import ErrorDisplay from "./ErrorDisplay";
import type { ForecastResponse } from "@/lib/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ForecastStripProps {
  stationId: number | null;
}

async function fetchForecastData(
  stationId: number,
  signal: AbortSignal
): Promise<ForecastResponse> {
  const res = await fetch(`/api/forecast?station_id=${stationId}`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function ForecastStrip({ stationId }: ForecastStripProps) {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: number, signal: AbortSignal) => {
    setPending(true);
    try {
      const json = await fetchForecastData(id, signal);
      if (!signal.aborted) {
        setData(json);
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
  }, []);

  useEffect(() => {
    if (!stationId) return;
    const controller = new AbortController();
    load(stationId, controller.signal);
    return () => controller.abort();
  }, [stationId, load]);

  if (!stationId) {
    return <p className="text-zinc-500">Select a station to view forecast.</p>;
  }

  if (pending) {
    return <p data-testid="loading">Loading forecast...</p>;
  }

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={() => {
          const controller = new AbortController();
          load(stationId, controller.signal);
        }}
      />
    );
  }

  if (!data || !data.forecast?.daily?.length) {
    return <p>No forecast data available.</p>;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2" data-testid="forecast-strip">
      {data.forecast.daily.map((day) => {
        const date = new Date(day.day_start_local * 1000);
        const dayLabel = DAY_NAMES[date.getUTCDay()];
        return (
          <ForecastDay
            key={day.day_start_local}
            dayLabel={dayLabel}
            icon={day.icon}
            conditions={day.conditions}
            highTemp={day.air_temp_high}
            lowTemp={day.air_temp_low}
            precipProbability={day.precip_probability}
          />
        );
      })}
    </div>
  );
}
