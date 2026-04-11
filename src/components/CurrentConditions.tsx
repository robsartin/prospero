"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "./MetricCard";
import type { ObservationsResponse } from "@/lib/types";

interface CurrentConditionsProps {
  stationId: number | null;
}

export default function CurrentConditions({ stationId }: CurrentConditionsProps) {
  const [data, setData] = useState<ObservationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/observations?station_id=${stationId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stationId]);

  if (!stationId) {
    return <p className="text-zinc-500">Select a station to view conditions.</p>;
  }

  if (loading) {
    return <p data-testid="loading">Loading conditions...</p>;
  }

  if (error) {
    return <p data-testid="error" className="text-red-500">Error: {error}</p>;
  }

  if (!data || !data.obs || data.obs.length === 0) {
    return <p>No observation data available.</p>;
  }

  const obs = data.obs[0];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <MetricCard
        label="Temperature"
        value={obs.air_temperature ?? "--"}
        unit="°C"
        secondary={obs.feels_like != null ? `Feels ${obs.feels_like}°` : undefined}
      />
      <MetricCard
        label="Wind"
        value={obs.wind_avg ?? "--"}
        unit="m/s"
        secondary={obs.wind_gust != null ? `Gust ${obs.wind_gust}` : undefined}
      />
      <MetricCard
        label="Humidity"
        value={obs.relative_humidity ?? "--"}
        unit="%"
        secondary={obs.dew_point != null ? `Dew ${obs.dew_point}°` : undefined}
      />
      <MetricCard
        label="Pressure"
        value={obs.sea_level_pressure ?? "--"}
        unit="mb"
        secondary={obs.pressure_trend ?? undefined}
      />
      <MetricCard
        label="UV Index"
        value={obs.uv ?? "--"}
        unit=""
        secondary={obs.solar_radiation != null ? `${obs.solar_radiation} W/m²` : undefined}
      />
      <MetricCard
        label="Rain Today"
        value={obs.precip_accum_local_day ?? "--"}
        unit="mm"
      />
      <MetricCard
        label="Lightning"
        value={obs.lightning_strike_count ?? 0}
        unit="strikes"
        secondary={
          obs.lightning_strike_last_distance != null
            ? `Last ${obs.lightning_strike_last_distance} km`
            : undefined
        }
      />
      <MetricCard
        label="Brightness"
        value={obs.brightness ?? "--"}
        unit="lux"
      />
    </div>
  );
}
