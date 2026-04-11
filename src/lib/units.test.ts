import {
  MetricUnitStrategy,
  ImperialUnitStrategy,
  getUnitStrategy,
  type UnitStrategy,
} from "./units";

describe("MetricUnitStrategy", () => {
  const metric: UnitStrategy = new MetricUnitStrategy();

  it("returns celsius unchanged", () => {
    expect(metric.temp(22.5)).toBe(22.5);
  });

  it("returns m/s unchanged", () => {
    expect(metric.wind(3.5)).toBe(3.5);
  });

  it("returns mb unchanged", () => {
    expect(metric.pressure(1013)).toBe(1013);
  });

  it("returns mm unchanged", () => {
    expect(metric.rain(2.5)).toBe(2.5);
  });

  it("has metric labels", () => {
    expect(metric.labels.temp).toBe("°C");
    expect(metric.labels.wind).toBe("m/s");
    expect(metric.labels.pressure).toBe("mb");
    expect(metric.labels.rain).toBe("mm");
  });

  it("has id 'metric'", () => {
    expect(metric.id).toBe("metric");
  });
});

describe("ImperialUnitStrategy", () => {
  const imperial: UnitStrategy = new ImperialUnitStrategy();

  it("converts C to F", () => {
    expect(imperial.temp(0)).toBeCloseTo(32);
    expect(imperial.temp(100)).toBeCloseTo(212);
    expect(imperial.temp(22.5)).toBeCloseTo(72.5);
  });

  it("converts m/s to mph", () => {
    expect(imperial.wind(1)).toBeCloseTo(2.237);
    expect(imperial.wind(10)).toBeCloseTo(22.37);
  });

  it("converts mb to inHg", () => {
    expect(imperial.pressure(1013.25)).toBeCloseTo(29.92, 1);
  });

  it("converts mm to in", () => {
    expect(imperial.rain(25.4)).toBeCloseTo(1.0);
  });

  it("has imperial labels", () => {
    expect(imperial.labels.temp).toBe("°F");
    expect(imperial.labels.wind).toBe("mph");
    expect(imperial.labels.pressure).toBe("inHg");
    expect(imperial.labels.rain).toBe("in");
  });

  it("has id 'imperial'", () => {
    expect(imperial.id).toBe("imperial");
  });
});

describe("getUnitStrategy", () => {
  it("returns MetricUnitStrategy for 'metric'", () => {
    expect(getUnitStrategy("metric")).toBeInstanceOf(MetricUnitStrategy);
  });

  it("returns ImperialUnitStrategy for 'imperial'", () => {
    expect(getUnitStrategy("imperial")).toBeInstanceOf(ImperialUnitStrategy);
  });
});
