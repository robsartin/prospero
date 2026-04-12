const HEAT_INDEX_MIN_C = 27;
const WIND_CHILL_MAX_C = 10;
const WIND_CHILL_MIN_MS = 1.34;

export function heatIndexC(tempC: number | null, rh: number | null): number | null {
  if (tempC == null || rh == null) return null;
  if (tempC < HEAT_INDEX_MIN_C) return null;

  const t = tempC * 9 / 5 + 32;
  const hi =
    -42.379 +
    2.04901523 * t +
    10.14333127 * rh -
    0.22475541 * t * rh -
    0.00683783 * t * t -
    0.05481717 * rh * rh +
    0.00122874 * t * t * rh +
    0.00085282 * t * rh * rh -
    0.00000199 * t * t * rh * rh;

  return (hi - 32) * 5 / 9;
}

export function windChillC(tempC: number | null, windMs: number | null): number | null {
  if (tempC == null || windMs == null) return null;
  if (tempC > WIND_CHILL_MAX_C) return null;
  if (windMs < WIND_CHILL_MIN_MS) return null;

  const vKmh = windMs * 3.6;
  const v16 = Math.pow(vKmh, 0.16);
  return 13.12 + 0.6215 * tempC - 11.37 * v16 + 0.3965 * tempC * v16;
}

export function wetBulbC(tempC: number | null, rh: number | null): number | null {
  if (tempC == null || rh == null) return null;

  return (
    tempC * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(tempC + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035
  );
}
