import type { HistoryDataPoint } from "@/components/HistoryChart";

function floorTo(value: number, step: number): number {
  return Math.floor(value / step) * step;
}

function ceilTo(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

const TEMP_SERIES_KEYS = ["value", "heatIndex", "windChill", "wetBulb"] as const;

export function tempDomain(data: HistoryDataPoint[]): [number, number] {
  if (data.length === 0) return [0, 50];
  const values: number[] = [];
  for (const d of data) {
    for (const k of TEMP_SERIES_KEYS) {
      const v = d[k];
      if (typeof v === "number") values.push(v);
    }
  }
  if (values.length === 0) return [0, 50];
  return [floorTo(Math.min(...values), 5) - 5, ceilTo(Math.max(...values), 5) + 5];
}

const PRESSURE_SERIES_KEYS = ["value", "barometric", "seaLevel"] as const;

export function pressureDomain(data: HistoryDataPoint[]): [number, number] {
  if (data.length === 0) return [0, 100];
  const values: number[] = [];
  for (const d of data) {
    for (const k of PRESSURE_SERIES_KEYS) {
      const v = d[k];
      if (typeof v === "number") values.push(v);
    }
  }
  if (values.length === 0) return [0, 100];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.2, min * 0.001);
  return [min - pad, max + pad];
}

export function zeroBasedDomain(data: HistoryDataPoint[]): [number, number] {
  if (data.length === 0) return [0, 10];
  const max = Math.max(...data.map((d) => d.value));
  return [0, ceilTo(max, 5) || 5];
}
