"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { HistoryDataPoint } from "./HistoryChart";

interface LightningChartProps {
  data: HistoryDataPoint[];
  domain?: [number, number];
}

export default function LightningChart({ data, domain }: LightningChartProps) {
  const totalStrikes = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0 || totalStrikes === 0) {
    return (
      <div data-testid="lightning-chart">
        <h3 className="mb-2 text-sm font-medium text-zinc-600">Lightning (strikes)</h3>
        <p className="text-zinc-500">No lightning strikes in this period.</p>
      </div>
    );
  }

  const fmt = (v: number) => v.toFixed(0);

  return (
    <div data-testid="lightning-chart">
      <h3 className="mb-2 text-sm font-medium text-zinc-600">Lightning (strikes)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={fmt} domain={domain} allowDecimals={false} />
          <Tooltip formatter={(v) => [fmt(Number(v)), "Strikes"]} />
          <Bar dataKey="value" fill="#eab308" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
