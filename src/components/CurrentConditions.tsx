"use client";

import { useCallback, useEffect, useState } from "react";
import { MetricCard } from "./MetricCard";
import ErrorDisplay from "./ErrorDisplay";
import type { ObservationsResponse } from "@/lib/types";

interface CurrentConditionsProps {
  stationId: number | null;
}

async function fetchConditions(
  stationId: number,
  signal: AbortSignal
): Promise<ObservationsResponse> {
  const res = await fetch(`/api/observations?station_id=${stationId}`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

const REFRESH_INTERVAL = 60000;

export default function CurrentConditions({ stationId }: CurrentConditionsProps) {
  const [data, setData] = useState<ObservationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (id: number, signal: AbortSignal) => {
    setPending(true);
    try {
      const json = await fetchConditions(id, signal);
      if (!signal.aborted) {
        setData(json);
        setError(null);
        setLastUpdated(new Date());
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

    const interval = setInterval(() => {
      load(stationId, controller.signal);
    }, REFRESH_INTERVAL);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [stationId, load]);

  if (!stationId) {
    return <p className="text-zinc-500">Select a station to view conditions.</p>;
  }

  if (pending) {
    return <p data-testid="loading">Loading conditions...</p>;
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

  if (!data || !data.obs || data.obs.length === 0) {
    return <p>No observation data available.</p>;
  }

  const obs = data.obs[0];

  return (
    <div>
      {lastUpdated && (
        <p data-testid="last-updated" className="mb-3 text-xs text-zinc-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
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
    </div>
  );
}
