export type MetricKind =
  | "temperature"
  | "dew_point"
  | "feels_like"
  | "wind"
  | "pressure"
  | "humidity"
  | "brightness"
  | "lightning"
  | "distance"
  | "uv"
  | "rain";

const PRECISION: Record<MetricKind, number> = {
  temperature: 1,
  dew_point: 1,
  feels_like: 1,
  wind: 1,
  pressure: 1,
  humidity: 0,
  brightness: 0,
  lightning: 0,
  distance: 0,
  uv: 2,
  rain: 2,
};

export function formatValue(kind: MetricKind, value: number): string {
  if (value == null) return "--";
  return value.toFixed(PRECISION[kind]);
}
