"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

export default function RainChart({ data, unit, precision = 2, domain }: RainChartProps) {
  if (data.length === 0) {
    return <p className="text-zinc-500">No rain data available.</p>;
  }

  const fmt = (v: number) => v.toFixed(precision);

  return (
    <div data-testid="rain-chart">
      <h3 className="mb-2 text-sm font-medium text-zinc-600">Rain ({unit})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={fmt} domain={domain} />
          <Tooltip formatter={(v) => [fmt(Number(v)), "Rain"]} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            fill="#93c5fd"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
