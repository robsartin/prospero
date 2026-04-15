import { enrichObservation } from "./enrichObservation";
import type { TransformedObservation } from "./transforms";

function obs(partial: Partial<TransformedObservation>): TransformedObservation {
  return {
    timestamp: 0,
    windLull: null,
    windAvg: null,
    windGust: null,
    windDirection: null,
    stationPressure: null,
    airTemperature: null,
    relativeHumidity: null,
    illuminance: null,
    uv: null,
    solarRadiation: null,
    rainAccumulated: null,
    precipType: null,
    lightningStrikeAvgDistance: null,
    lightningStrikeCount: null,
    battery: null,
    reportInterval: null,
    ...partial,
  };
}

describe("enrichObservation", () => {
  it("adds heatIndexC for hot, humid conditions", () => {
    const o = obs({ airTemperature: 32, relativeHumidity: 70 });
    const e = enrichObservation(o);
    expect(e.heatIndexC).not.toBeNull();
    expect(e.heatIndexC!).toBeGreaterThan(38);
  });

  it("leaves heatIndexC null for cool conditions", () => {
    const o = obs({ airTemperature: 20, relativeHumidity: 50 });
    expect(enrichObservation(o).heatIndexC).toBeNull();
  });

  it("adds windChillC for cold, windy conditions", () => {
    const o = obs({ airTemperature: -5, relativeHumidity: 50, windAvg: 5 });
    const e = enrichObservation(o);
    expect(e.windChillC).not.toBeNull();
    expect(e.windChillC!).toBeLessThan(-5);
  });

  it("adds wetBulbC for any valid temp + humidity", () => {
    const o = obs({ airTemperature: 25, relativeHumidity: 60 });
    const e = enrichObservation(o);
    expect(e.wetBulbC).not.toBeNull();
    expect(e.wetBulbC!).toBeLessThan(25);
  });

  it("preserves all original fields", () => {
    const o = obs({ airTemperature: 25, relativeHumidity: 60, battery: 2.7 });
    const e = enrichObservation(o);
    expect(e.airTemperature).toBe(25);
    expect(e.relativeHumidity).toBe(60);
    expect(e.battery).toBe(2.7);
  });
});
