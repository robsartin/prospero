import type { HistoryDataPoint } from "@/components/HistoryChart";

function floorTo(value: number, step: number): number {
  return Math.floor(value / step) * step;
}

function ceilTo(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

export function tempDomain(data: HistoryDataPoint[]): [number, number] {
  if (data.length === 0) return [0, 50];
  const values = data.map((d) => d.value);
  return [floorTo(Math.min(...values), 5) - 5, ceilTo(Math.max(...values), 5) + 5];
}

export function pressureDomain(data: HistoryDataPoint[]): [number, number] {
  if (data.length === 0) return [980, 1040];
  const values = data.map((d) => d.value);
  return [floorTo(Math.min(...values), 5) - 5, ceilTo(Math.max(...values), 5) + 5];
}

export function zeroBasedDomain(data: HistoryDataPoint[]): [number, number] {
  if (data.length === 0) return [0, 10];
  const max = Math.max(...data.map((d) => d.value));
  return [0, ceilTo(max, 5) || 5];
}
