import { downsampleObs } from "./downsample";
import type { TransformedObservation } from "./transforms";

function obs(t: number, partial: Partial<TransformedObservation> = {}): TransformedObservation {
  return {
    timestamp: t,
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

describe("downsampleObs", () => {
  it("returns input unchanged when length <= targetBuckets", () => {
    const input = [obs(1), obs(2), obs(3)];
    expect(downsampleObs(input, 10)).toEqual(input);
  });

  it("reduces input to roughly targetBuckets in length", () => {
    const input = Array.from({ length: 1000 }, (_, i) => obs(i));
    const result = downsampleObs(input, 100);
    expect(result.length).toBeGreaterThanOrEqual(95);
    expect(result.length).toBeLessThanOrEqual(105);
  });

  it("averages mean fields within each bucket", () => {
    const input = [
      obs(1, { airTemperature: 10 }),
      obs(2, { airTemperature: 20 }),
      obs(3, { airTemperature: 30 }),
      obs(4, { airTemperature: 40 }),
    ];
    const result = downsampleObs(input, 2);
    expect(result).toHaveLength(2);
    expect(result[0].airTemperature).toBe(15);
    expect(result[1].airTemperature).toBe(35);
  });

  it("sums rain accumulation within each bucket", () => {
    const input = [
      obs(1, { rainAccumulated: 0.1 }),
      obs(2, { rainAccumulated: 0.2 }),
      obs(3, { rainAccumulated: 0 }),
      obs(4, { rainAccumulated: 0.3 }),
    ];
    const result = downsampleObs(input, 2);
    expect(result[0].rainAccumulated).toBeCloseTo(0.3, 5);
    expect(result[1].rainAccumulated).toBeCloseTo(0.3, 5);
  });

  it("sums lightning strike count within each bucket", () => {
    const input = [
      obs(1, { lightningStrikeCount: 0 }),
      obs(2, { lightningStrikeCount: 5 }),
      obs(3, { lightningStrikeCount: 2 }),
      obs(4, { lightningStrikeCount: 0 }),
    ];
    const result = downsampleObs(input, 2);
    expect(result[0].lightningStrikeCount).toBe(5);
    expect(result[1].lightningStrikeCount).toBe(2);
  });

  it("preserves any non-zero precip type within a bucket", () => {
    const input = [
      obs(1, { precipType: 0 }),
      obs(2, { precipType: 2 }),
      obs(3, { precipType: 0 }),
      obs(4, { precipType: 0 }),
    ];
    const result = downsampleObs(input, 2);
    expect(result[0].precipType).toBe(2);
    expect(result[1].precipType).toBe(0);
  });

  it("ignores nulls when computing mean", () => {
    const input = [
      obs(1, { airTemperature: 10 }),
      obs(2, { airTemperature: null }),
      obs(3, { airTemperature: 20 }),
      obs(4, { airTemperature: null }),
    ];
    const result = downsampleObs(input, 2);
    expect(result[0].airTemperature).toBe(10);
    expect(result[1].airTemperature).toBe(20);
  });

  it("returns null for a bucket where all values are null", () => {
    const input = [
      obs(1, { airTemperature: null }),
      obs(2, { airTemperature: null }),
    ];
    const result = downsampleObs(input, 1);
    expect(result[0].airTemperature).toBeNull();
  });

  it("uses bucket midpoint timestamp for even bucket sizes", () => {
    const input = [obs(100), obs(200), obs(300), obs(400)];
    const result = downsampleObs(input, 2);
    expect(result[0].timestamp).toBe(150);
    expect(result[1].timestamp).toBe(350);
  });

  it("uses bucket midpoint timestamp for odd bucket sizes", () => {
    const input = [obs(100), obs(200), obs(300)];
    const result = downsampleObs(input, 1);
    expect(result[0].timestamp).toBe(200);
  });

  it("uses true time midpoint for irregularly spaced obs", () => {
    const input = [obs(100), obs(110), obs(120), obs(500)];
    const result = downsampleObs(input, 1);
    expect(result[0].timestamp).toBe(300);
  });

  it("returns empty array for empty input", () => {
    expect(downsampleObs([], 100)).toEqual([]);
  });

  it("preserves pre-derived heat index (mean of HI, not HI of mean)", () => {
    const spike = [
      obs(1, { airTemperature: 25, relativeHumidity: 50, heatIndexC: null }),
      obs(2, { airTemperature: 33, relativeHumidity: 70, heatIndexC: 43 }),
      obs(3, { airTemperature: 25, relativeHumidity: 50, heatIndexC: null }),
      obs(4, { airTemperature: 33, relativeHumidity: 70, heatIndexC: 43 }),
    ];
    const [bucket] = downsampleObs(spike, 1);
    expect(bucket.heatIndexC).toBeCloseTo(43, 0);
  });

  it("averages windChillC and wetBulbC across a bucket", () => {
    const input = [
      obs(1, { windChillC: -10, wetBulbC: 15 }),
      obs(2, { windChillC: -20, wetBulbC: 17 }),
    ];
    const [bucket] = downsampleObs(input, 1);
    expect(bucket.windChillC).toBe(-15);
    expect(bucket.wetBulbC).toBe(16);
  });
});
