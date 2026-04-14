import type { TransformedObservation } from "./transforms";

const SUM_FIELDS: (keyof TransformedObservation)[] = [
  "rainAccumulated",
  "lightningStrikeCount",
];

const ANY_NONZERO_FIELDS: (keyof TransformedObservation)[] = ["precipType"];

const NUMERIC_FIELDS: (keyof TransformedObservation)[] = [
  "windLull",
  "windAvg",
  "windGust",
  "windDirection",
  "stationPressure",
  "airTemperature",
  "relativeHumidity",
  "illuminance",
  "uv",
  "solarRadiation",
  "lightningStrikeAvgDistance",
  "battery",
  "reportInterval",
];

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function sum(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0);
}

function aggregateBucket(bucket: TransformedObservation[]): TransformedObservation {
  const midIdx = Math.floor(bucket.length / 2);
  const timestamp =
    bucket.length % 2 === 0
      ? (bucket[midIdx - 1].timestamp + bucket[midIdx].timestamp) / 2
      : bucket[midIdx].timestamp;

  const out: TransformedObservation = {
    timestamp,
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
  };

  for (const field of NUMERIC_FIELDS) {
    const values = bucket.map((o) => o[field]).filter((v): v is number => v != null);
    (out[field] as number | null) = mean(values);
  }

  for (const field of SUM_FIELDS) {
    const values = bucket.map((o) => o[field]).filter((v): v is number => v != null);
    (out[field] as number | null) = sum(values);
  }

  for (const field of ANY_NONZERO_FIELDS) {
    const nonZero = bucket
      .map((o) => o[field])
      .find((v): v is number => v != null && v !== 0);
    (out[field] as number | null) = nonZero ?? 0;
  }

  return out;
}

export function downsampleObs(
  obs: TransformedObservation[],
  targetBuckets: number
): TransformedObservation[] {
  if (obs.length === 0) return [];
  if (obs.length <= targetBuckets) return obs;

  const bucketSize = Math.ceil(obs.length / targetBuckets);
  const result: TransformedObservation[] = [];

  for (let i = 0; i < obs.length; i += bucketSize) {
    result.push(aggregateBucket(obs.slice(i, i + bucketSize)));
  }

  return result;
}
