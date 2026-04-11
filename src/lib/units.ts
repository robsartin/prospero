export type UnitSystem = "metric" | "imperial";

export function convertTemp(celsius: number, system: UnitSystem): number {
  if (system === "imperial") return celsius * 9 / 5 + 32;
  return celsius;
}

export function convertWind(ms: number, system: UnitSystem): number {
  if (system === "imperial") return ms * 2.23694;
  return ms;
}

export function convertPressure(mb: number, system: UnitSystem): number {
  if (system === "imperial") return mb * 0.02953;
  return mb;
}

export function convertRain(mm: number, system: UnitSystem): number {
  if (system === "imperial") return mm / 25.4;
  return mm;
}

export const UNIT_LABELS: Record<UnitSystem, {
  temp: string;
  wind: string;
  pressure: string;
  rain: string;
}> = {
  metric: { temp: "°C", wind: "m/s", pressure: "mb", rain: "mm" },
  imperial: { temp: "°F", wind: "mph", pressure: "inHg", rain: "in" },
};
