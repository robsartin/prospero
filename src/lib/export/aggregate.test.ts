import { aggregate } from "./aggregate";
import { getExportMetric } from "./registry";
import { MetricUnitStrategy, ImperialUnitStrategy } from "../units";
import type { TransformedObservation } from "../transforms";

const rain = getExportMetric("rain")!;
// 2026-01-01T00:00:00Z = 1767225600
const obs = (ts: number, r: number | null) =>
  ({ timestamp: ts, rainAccumulated: r } as TransformedObservation);

describe("aggregate", () => {
  it("builds a date column plus one column per metric with unit header", () => {
    const table = aggregate([obs(1767225600, 1)], [rain], new MetricUnitStrategy(), 0);
    expect(table.columns).toEqual([
      { key: "date", header: "date" },
      { key: "rain", header: "Rain (mm)" },
    ]);
  });

  it("sums a day's rain into one row, rounded to precision", () => {
    const table = aggregate(
      [obs(1767225600, 0.1), obs(1767229200, 0.2)],
      [rain],
      new MetricUnitStrategy(),
      0
    );
    expect(table.rows).toEqual([{ date: "2026-01-01", rain: 0.3 }]);
  });

  it("buckets by local day using tz offset (minutes)", () => {
    // 1767268740 = 2026-01-01T11:59:00Z; offset -720 min shifts to prev local day
    const table = aggregate([obs(1767268740, 5)], [rain], new MetricUnitStrategy(), -720);
    expect(table.rows[0].date).toBe("2025-12-31");
  });

  it("emits null when a day has no non-null values", () => {
    const table = aggregate([obs(1767225600, null)], [rain], new MetricUnitStrategy(), 0);
    expect(table.rows).toEqual([{ date: "2026-01-01", rain: null }]);
  });

  it("applies unit conversion before reducing", () => {
    const table = aggregate([obs(1767225600, 25.4)], [rain], new ImperialUnitStrategy(), 0);
    expect(table.columns[1].header).toBe("Rain (in)");
    expect(table.rows[0].rain).toBe(1);
  });

  it("sorts days ascending", () => {
    const table = aggregate(
      [obs(1767312000, 2), obs(1767225600, 1)],
      [rain],
      new MetricUnitStrategy(),
      0
    );
    expect(table.rows.map((r) => r.date)).toEqual(["2026-01-01", "2026-01-02"]);
  });
});
