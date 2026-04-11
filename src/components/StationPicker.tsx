"use client";

import { useCallback, useEffect, useState } from "react";
import type { Station, StationsResponse } from "@/lib/types";

interface StationPickerProps {
  onStationChange: (stationId: number) => void;
  selectedStationId: number | null;
}

async function fetchStationList(signal: AbortSignal): Promise<Station[]> {
  const res = await fetch("/api/stations", { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: StationsResponse = await res.json();
  return data.stations;
}

export default function StationPicker({
  onStationChange,
  selectedStationId,
}: StationPickerProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal: AbortSignal) => {
    setPending(true);
    try {
      const result = await fetchStationList(signal);
      if (!signal.aborted) {
        setStations(result);
        setError(null);
        if (!selectedStationId && result.length > 0) {
          onStationChange(result[0].station_id);
        }
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
  }, [selectedStationId, onStationChange]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (pending) {
    return <span data-testid="station-loading" className="text-sm text-zinc-400">Loading...</span>;
  }

  if (error) {
    return <span data-testid="station-error" className="text-sm text-red-400">Error loading stations</span>;
  }

  return (
    <select
      aria-label="Select station"
      value={selectedStationId ?? ""}
      onChange={(e) => onStationChange(Number(e.target.value))}
      className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white"
    >
      <option value="" disabled>
        Select a station
      </option>
      {stations.map((station) => (
        <option key={station.station_id} value={station.station_id}>
          {station.name}
        </option>
      ))}
    </select>
  );
}
