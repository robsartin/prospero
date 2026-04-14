import { seaLevelPressureMb, barometricPressureMb } from "./pressureDerivations";

describe("seaLevelPressureMb", () => {
  it("returns station pressure unchanged at sea level", () => {
    expect(seaLevelPressureMb(1013, 0, 15)).toBeCloseTo(1013, 1);
  });

  it("is higher than station pressure at altitude", () => {
    const sea = seaLevelPressureMb(900, 1000, 10);
    expect(sea).toBeGreaterThan(900);
    expect(sea).toBeLessThan(1050);
  });

  it("~12 mb higher at 100m elevation, 15°C", () => {
    expect(seaLevelPressureMb(1000, 100, 15)).toBeCloseTo(1012, 0);
  });

  it("increases monotonically with elevation", () => {
    const t = 15;
    expect(seaLevelPressureMb(1000, 200, t)!).toBeGreaterThan(
      seaLevelPressureMb(1000, 100, t)!
    );
  });

  it("returns null for null inputs", () => {
    expect(seaLevelPressureMb(null, 100, 15)).toBeNull();
    expect(seaLevelPressureMb(1000, null, 15)).toBeNull();
    expect(seaLevelPressureMb(1000, 100, null)).toBeNull();
  });

  it("returns null for implausible elevation", () => {
    expect(seaLevelPressureMb(1000, 20000, 15)).toBeNull();
    expect(seaLevelPressureMb(1000, -2000, 15)).toBeNull();
  });

  it("returns null for implausible temperature", () => {
    expect(seaLevelPressureMb(1000, 100, -100)).toBeNull();
    expect(seaLevelPressureMb(1000, 100, 100)).toBeNull();
  });
});

describe("barometricPressureMb", () => {
  it("returns station pressure unchanged when AGL is 0", () => {
    expect(barometricPressureMb(1013, 0, 15)).toBeCloseTo(1013, 1);
  });

  it("is slightly higher than station pressure for positive AGL", () => {
    const baro = barometricPressureMb(1013, 3, 15)!;
    expect(baro).toBeGreaterThan(1013);
    expect(baro - 1013).toBeLessThan(1);
  });

  it("returns null for null inputs", () => {
    expect(barometricPressureMb(null, 2, 15)).toBeNull();
    expect(barometricPressureMb(1000, null, 15)).toBeNull();
  });

  it("returns null for implausible AGL", () => {
    expect(barometricPressureMb(1000, 1000, 15)).toBeNull();
    expect(barometricPressureMb(1000, -5, 15)).toBeNull();
  });
});
