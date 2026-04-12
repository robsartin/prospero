"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { HistoryDataPoint } from "./HistoryChart";

interface IlluminanceChartProps {
  data: HistoryDataPoint[];
  domain?: [number, number];
}

export default function IlluminanceChart({ data, domain }: IlluminanceChartProps) {
  if (data.length === 0) {
    return (
      <div data-testid="illuminance-chart">
        <h3 className="mb-2 text-sm font-medium text-zinc-600">Illuminance (lux)</h3>
        <p className="text-zinc-500">No illuminance data available.</p>
      </div>
    );
  }

  const fmt = (v: number) => v.toFixed(0);

  return (
    <div data-testid="illuminance-chart">
      <h3 className="mb-2 text-sm font-medium text-zinc-600">Illuminance (lux)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={fmt} domain={domain} />
          <Tooltip formatter={(v) => [fmt(Number(v)), "Illuminance"]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
