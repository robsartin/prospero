const BAROMETRIC_CONSTANT = 0.03416;

const ELEVATION_MIN_M = -500;
const ELEVATION_MAX_M = 10000;
const AGL_MIN_M = 0;
const AGL_MAX_M = 100;
const TEMP_MIN_C = -80;
const TEMP_MAX_C = 60;

function adjustDown(pressureMb: number, deltaDownMeters: number, tempC: number): number {
  const tempK = tempC + 273.15;
  return pressureMb * Math.exp((BAROMETRIC_CONSTANT * deltaDownMeters) / tempK);
}

function inRange(v: number, min: number, max: number): boolean {
  return v >= min && v <= max;
}

export function seaLevelPressureMb(
  stationPressureMb: number | null,
  elevationM: number | null,
  tempC: number | null
): number | null {
  if (stationPressureMb == null || elevationM == null || tempC == null) return null;
  if (!inRange(elevationM, ELEVATION_MIN_M, ELEVATION_MAX_M)) return null;
  if (!inRange(tempC, TEMP_MIN_C, TEMP_MAX_C)) return null;
  return adjustDown(stationPressureMb, elevationM, tempC);
}

export function barometricPressureMb(
  stationPressureMb: number | null,
  deviceAglM: number | null,
  tempC: number | null
): number | null {
  if (stationPressureMb == null || deviceAglM == null || tempC == null) return null;
  if (!inRange(deviceAglM, AGL_MIN_M, AGL_MAX_M)) return null;
  if (!inRange(tempC, TEMP_MIN_C, TEMP_MAX_C)) return null;
  return adjustDown(stationPressureMb, deviceAglM, tempC);
}
