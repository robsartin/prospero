"use client";

import { useEffect, useState } from "react";
import { ForecastDay } from "./ForecastDay";
import type { ForecastResponse } from "@/lib/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ForecastStripProps {
  stationId: number | null;
}

export default function ForecastStrip({ stationId }: ForecastStripProps) {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/forecast?station_id=${stationId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stationId]);

  if (!stationId) {
    return <p className="text-zinc-500">Select a station to view forecast.</p>;
  }

  if (loading) {
    return <p data-testid="loading">Loading forecast...</p>;
  }

  if (error) {
    return <p data-testid="error" className="text-red-500">Error: {error}</p>;
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
