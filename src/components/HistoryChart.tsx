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
import { WindArrow } from "./WindArrow";

export interface HistoryDataPoint {
  time: string;
  value: number;
  direction?: number | null;
}

export interface HistoryChartProps {
  data: HistoryDataPoint[];
  label: string;
  unit: string;
  color?: string;
  precision?: number;
  domain?: [number, number];
  showWindArrows?: boolean;
}

const ARROW_SAMPLE_INTERVAL = 10;

export default function HistoryChart({
  data,
  label,
  unit,
  color = "#3b82f6",
  precision = 1,
  domain,
  showWindArrows = false,
}: HistoryChartProps) {
  if (data.length === 0) {
    return <p className="text-zinc-500">No history data available.</p>;
  }

  const fmt = (v: number) => v.toFixed(precision);

  return (
    <div data-testid="history-chart">
      <h3 className="mb-2 text-sm font-medium text-zinc-600">
        {label} ({unit})
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={fmt} domain={domain} />
          <Tooltip formatter={(v) => [fmt(Number(v)), label]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            dot={showWindArrows
              ? (props: { cx?: number; cy?: number; index?: number; payload?: HistoryDataPoint }) => {
                  const { cx, cy, index, payload } = props;
                  if (!cx || !cy || index == null || index % ARROW_SAMPLE_INTERVAL !== 0) return <></>;
                  return <WindArrow cx={cx} cy={cy} direction={payload?.direction ?? null} />;
                }
              : false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
