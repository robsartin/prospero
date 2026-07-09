import { EXPORT_METRICS, getExportMetric } from "./registry";
import { MetricUnitStrategy, ImperialUnitStrategy } from "../units";
import type { TransformedObservation } from "../transforms";

const obs = (rain: number | null) =>
  ({ rainAccumulated: rain } as TransformedObservation);

describe("export registry", () => {
  it("includes a rain metric", () => {
    expect(getExportMetric("rain")).toBeDefined();
    expect(EXPORT_METRICS.map((m) => m.key)).toContain("rain");
  });

  it("returns undefined for unknown keys", () => {
    expect(getExportMetric("nope")).toBeUndefined();
  });

  it("rain extracts rainAccumulated and reduces by sum", () => {
    const rain = getExportMetric("rain")!;
    expect(rain.extract(obs(0.5))).toBe(0.5);
    expect(rain.extract(obs(null))).toBeNull();
    expect(rain.reduce.suffixes).toEqual([""]);
  });

  it("rain unit and conversion are strategy-driven", () => {
    const rain = getExportMetric("rain")!;
    expect(rain.unit(new MetricUnitStrategy())).toBe("mm");
    expect(rain.unit(new ImperialUnitStrategy())).toBe("in");
    expect(rain.convert(new MetricUnitStrategy(), 25.4)).toBeCloseTo(25.4);
    expect(rain.convert(new ImperialUnitStrategy(), 25.4)).toBeCloseTo(1);
  });
});
