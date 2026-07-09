import type { TransformedObservation } from "../transforms";
import type { UnitStrategy } from "../units";
import type { ExportMetric } from "./registry";

export interface ExportColumn {
  key: string;
  header: string;
}

export interface ExportTable {
  columns: ExportColumn[];
  rows: Record<string, string | number | null>[];
}

function localDay(timestamp: number, tzOffsetMinutes: number): string {
  const localMs = (timestamp + tzOffsetMinutes * 60) * 1000;
  return new Date(localMs).toISOString().slice(0, 10);
}

function round(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function aggregate(
  obs: TransformedObservation[],
  metrics: ExportMetric[],
  units: UnitStrategy,
  tzOffsetMinutes: number
): ExportTable {
  const columns: ExportColumn[] = [{ key: "date", header: "date" }];
  for (const m of metrics) {
    for (const suffix of m.reduce.suffixes) {
      columns.push({
        key: `${m.key}${suffix}`,
        header: `${m.label}${suffix} (${m.unit(units)})`,
      });
    }
  }

  const byDay = new Map<string, TransformedObservation[]>();
  for (const o of obs) {
    const day = localDay(o.timestamp, tzOffsetMinutes);
    const bucket = byDay.get(day);
    if (bucket) bucket.push(o);
    else byDay.set(day, [o]);
  }

  const rows = [...byDay.keys()].sort().map((day) => {
    const row: Record<string, string | number | null> = { date: day };
    for (const m of metrics) {
      const values = byDay
        .get(day)!
        .map((o) => m.extract(o))
        .filter((v): v is number => v != null)
        .map((v) => m.convert(units, v));
      if (values.length === 0) {
        for (const suffix of m.reduce.suffixes) row[`${m.key}${suffix}`] = null;
      } else {
        const results = m.reduce.apply(values);
        m.reduce.suffixes.forEach((suffix, i) => {
          row[`${m.key}${suffix}`] = round(results[i], m.precision);
        });
      }
    }
    return row;
  });

  return { columns, rows };
}
