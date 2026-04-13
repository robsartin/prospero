const BAROMETRIC_CONSTANT = 0.03416;

function adjustDown(pressureMb: number, deltaDownMeters: number, tempC: number): number {
  const tempK = tempC + 273.15;
  return pressureMb * Math.exp((BAROMETRIC_CONSTANT * deltaDownMeters) / tempK);
}

export function seaLevelPressureMb(
  stationPressureMb: number | null,
  elevationM: number | null,
  tempC: number | null
): number | null {
  if (stationPressureMb == null || elevationM == null || tempC == null) return null;
  return adjustDown(stationPressureMb, elevationM, tempC);
}

export function barometricPressureMb(
  stationPressureMb: number | null,
  deviceAglM: number | null,
  tempC: number | null
): number | null {
  if (stationPressureMb == null || deviceAglM == null || tempC == null) return null;
  return adjustDown(stationPressureMb, deviceAglM, tempC);
}
