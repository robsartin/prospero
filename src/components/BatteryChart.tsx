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

interface BatteryChartProps {
  data: HistoryDataPoint[];
}

export default function BatteryChart({ data }: BatteryChartProps) {
  if (data.length === 0) {
    return (
      <div data-testid="battery-chart">
        <h3 className="mb-2 text-sm font-medium text-zinc-600">Battery (%)</h3>
        <p className="text-zinc-500">No battery data available.</p>
      </div>
    );
  }

  const fmt = (v: number) => v.toFixed(0);

  return (
    <div data-testid="battery-chart">
      <h3 className="mb-2 text-sm font-medium text-zinc-600">Battery (%)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={fmt} domain={[0, 100]} />
          <Tooltip formatter={(v) => [`${fmt(Number(v))}%`, "Battery"]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
