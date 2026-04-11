export type UnitSystemId = "metric" | "imperial";

export interface UnitLabels {
  temp: string;
  wind: string;
  pressure: string;
  rain: string;
}

export interface UnitStrategy {
  readonly id: UnitSystemId;
  readonly labels: UnitLabels;
  temp(celsius: number): number;
  wind(ms: number): number;
  pressure(mb: number): number;
  rain(mm: number): number;
}

// Metric is the canonical internal representation — all API data arrives in
// metric units. Identity methods exist to satisfy the UnitStrategy interface
// so consumers don't need to special-case metric vs imperial.
export class MetricUnitStrategy implements UnitStrategy {
  readonly id: UnitSystemId = "metric";
  readonly labels: UnitLabels = {
    temp: "°C",
    wind: "m/s",
    pressure: "mb",
    rain: "mm",
  };

  temp(celsius: number): number {
    return celsius;
  }

  wind(ms: number): number {
    return ms;
  }

  pressure(mb: number): number {
    return mb;
  }

  rain(mm: number): number {
    return mm;
  }
}

export class ImperialUnitStrategy implements UnitStrategy {
  readonly id: UnitSystemId = "imperial";
  readonly labels: UnitLabels = {
    temp: "°F",
    wind: "mph",
    pressure: "inHg",
    rain: "in",
  };

  temp(celsius: number): number {
    return celsius * 9 / 5 + 32;
  }

  wind(ms: number): number {
    return ms * 2.23694;
  }

  pressure(mb: number): number {
    return mb * 0.02953;
  }

  rain(mm: number): number {
    return mm / 25.4;
  }
}

const strategies: Record<UnitSystemId, UnitStrategy> = {
  metric: new MetricUnitStrategy(),
  imperial: new ImperialUnitStrategy(),
};

export function getUnitStrategy(id: UnitSystemId): UnitStrategy {
  return strategies[id];
}
