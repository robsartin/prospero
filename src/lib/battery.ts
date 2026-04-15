const FULL_V = 2.8;
const EMPTY_V = 2.4;

export function voltageToPercent(voltage: number): number;
export function voltageToPercent(voltage: null): null;
export function voltageToPercent(voltage: number | null): number | null;
export function voltageToPercent(voltage: number | null): number | null {
  if (voltage == null) return null;
  if (voltage >= FULL_V) return 100;
  if (voltage <= EMPTY_V) return 0;
  return Math.round(((voltage - EMPTY_V) / (FULL_V - EMPTY_V)) * 100);
}
