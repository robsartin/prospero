"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { HistoryDataPoint } from "./HistoryChart";

interface RainChartProps {
  data: HistoryDataPoint[];
  unit: string;
  precision?: number;
  domain?: [number, number];
}

function precipTypeLabel(t: number | null | undefined): string | null {
  if (t == null || t === 0) return null;
  if (t === 1) return "rain";
  if (t === 2) return "hail";
  if (t === 3) return "rain + hail";
  return null;
}

export default function RainChart({ data, unit, precision = 2, domain }: RainChartProps) {
  if (data.length === 0) {
    return <p className="text-zinc-500">No rain data available.</p>;
  }

  const fmt = (v: number) => v.toFixed(precision);
  const hasHail = data.some((d) => d.precipType === 2 || d.precipType === 3);
  const hailMarkers = hasHail
    ? data.filter((d) => d.precipType === 2 || d.precipType === 3)
    : [];

  return (
    <div data-testid="rain-chart">
      <h3 className="mb-2 text-sm font-medium text-zinc-600">Rain ({unit})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={fmt} domain={domain} />
          <Tooltip
            formatter={(v, _name, item) => {
              const label = precipTypeLabel(item?.payload?.precipType);
              return [
                `${fmt(Number(v))}${label ? ` (${label})` : ""}`,
                "Rain",
              ];
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            fill="#93c5fd"
            strokeWidth={2}
          />
          {hasHail && (
            <Scatter data={hailMarkers} dataKey="value" fill="#dc2626" shape="triangle" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {hasHail && (
        <p data-testid="hail-legend" className="mt-1 text-xs text-zinc-500">
          <span className="inline-block text-red-600">▲</span> hail
        </p>
      )}
    </div>
  );
}
