import { voltageToPercent } from "./battery";

describe("voltageToPercent", () => {
  it("returns 100 at or above 2.80V", () => {
    expect(voltageToPercent(2.8)).toBe(100);
    expect(voltageToPercent(3.0)).toBe(100);
  });

  it("returns 0 at or below 2.40V", () => {
    expect(voltageToPercent(2.4)).toBe(0);
    expect(voltageToPercent(2.1)).toBe(0);
  });

  it("interpolates linearly between 2.40V and 2.80V", () => {
    expect(voltageToPercent(2.6)).toBe(50);
    expect(voltageToPercent(2.5)).toBe(25);
    expect(voltageToPercent(2.7)).toBe(75);
  });

  it("returns an integer", () => {
    expect(Number.isInteger(voltageToPercent(2.63))).toBe(true);
    expect(Number.isInteger(voltageToPercent(2.51))).toBe(true);
  });

  it("returns null for null input, never 0", () => {
    expect(voltageToPercent(null)).toBeNull();
    expect(voltageToPercent(null)).not.toBe(0);
  });

  it("typed overload: non-null input returns non-null number", () => {
    const pct: number = voltageToPercent(2.6);
    expect(pct).toBe(50);
  });
});
