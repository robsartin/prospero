import type { TransformedObservation } from "../transforms";
import type { UnitStrategy } from "../units";
import { type DailyReducer, sum } from "./reducers";

export interface ExportMetric {
  key: string;
  label: string;
  precision: number;
  unit: (u: UnitStrategy) => string;
  extract: (o: TransformedObservation) => number | null;
  convert: (u: UnitStrategy, v: number) => number;
  reduce: DailyReducer;
}

export const EXPORT_METRICS: ExportMetric[] = [
  {
    key: "rain",
    label: "Rain",
    precision: 2,
    unit: (u) => u.labels.rain,
    extract: (o) => o.rainAccumulated,
    convert: (u, v) => u.rain(v),
    reduce: sum,
  },
];

export function getExportMetric(key: string): ExportMetric | undefined {
  return EXPORT_METRICS.find((m) => m.key === key);
}
