"use client";

import { useState } from "react";
import { EXPORT_METRICS } from "@/lib/export/registry";
import { MetricUnitStrategy, type UnitStrategy } from "@/lib/units";

const DEFAULT_UNITS = new MetricUnitStrategy();

interface DownloadPanelProps {
  deviceId: number | null;
  units?: UnitStrategy;
  tzOffsetMinutes?: number;
}

function toStartEpoch(date: string, tzOffsetMinutes: number): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000) - tzOffsetMinutes * 60;
}
function toEndEpoch(date: string, tzOffsetMinutes: number): number {
  return Math.floor(Date.parse(`${date}T23:59:59Z`) / 1000) - tzOffsetMinutes * 60;
}

export default function DownloadPanel({
  deviceId,
  units = DEFAULT_UNITS,
  tzOffsetMinutes = 0,
}: DownloadPanelProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(EXPORT_METRICS.map((m) => m.key))
  );
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [error, setError] = useState<string | null>(null);

  const startEpoch = start ? toStartEpoch(start, tzOffsetMinutes) : null;
  const endEpoch = end ? toEndEpoch(end, tzOffsetMinutes) : null;
  const datesOk = startEpoch != null && endEpoch != null && endEpoch > startEpoch;
  const canDownload = deviceId != null && datesOk && selected.size > 0;

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const download = async () => {
    if (!canDownload || deviceId == null || startEpoch == null || endEpoch == null) return;
    setError(null);
    const metrics = EXPORT_METRICS.filter((m) => selected.has(m.key)).map((m) => m.key);
    const url =
      `/api/export?device_id=${deviceId}&start=${startEpoch}&end=${endEpoch}` +
      `&metrics=${metrics.join(",")}&granularity=daily&format=${format}` +
      `&units=${units.id}&tz_offset=${tzOffsetMinutes}`;

    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setError(body.error ?? `HTTP ${res.status}`);
      return;
    }
    const blob = await res.blob();
    const prefix = metrics.length === 1 ? metrics[0] : "export";
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `${prefix}_${start}_${end}_daily.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Download data</h2>

      <div className="flex gap-4">
        <label className="flex flex-col text-sm">
          Start date
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col text-sm">
          End date
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">Metrics</legend>
        {EXPORT_METRICS.map((m) => (
          <label key={m.key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.has(m.key)}
              onChange={() => toggle(m.key)}
            />
            {m.label} ({m.unit(units)})
          </label>
        ))}
      </fieldset>

      <fieldset className="flex gap-4 text-sm">
        <legend className="text-sm font-medium">Format</legend>
        {(["csv", "json"] as const).map((f) => (
          <label key={f} className="flex items-center gap-1">
            <input
              type="radio"
              name="format"
              checked={format === f}
              onChange={() => setFormat(f)}
            />
            {f.toUpperCase()}
          </label>
        ))}
      </fieldset>

      <p className="text-xs text-zinc-500">Granularity: Daily</p>

      <button
        onClick={download}
        disabled={!canDownload}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        Download
      </button>
      {!canDownload && deviceId != null && (
        <span className="ml-2 text-xs text-zinc-500">
          Pick a valid start/end date and at least one metric.
        </span>
      )}

      {error && (
        <p role="alert" className="text-red-500">
          Error: {error}
        </p>
      )}
    </div>
  );
}
