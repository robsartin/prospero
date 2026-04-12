import { heatIndexC, windChillC, wetBulbC } from "./comfortMetrics";

describe("heatIndexC", () => {
  it("returns null when temp is below 27°C (formula undefined)", () => {
    expect(heatIndexC(20, 70)).toBeNull();
    expect(heatIndexC(26.9, 80)).toBeNull();
  });

  it("computes heat index at hot, humid conditions", () => {
    // 32°C / 70% RH ≈ 41°C (known reference from NWS tables)
    const hi = heatIndexC(32, 70);
    expect(hi).not.toBeNull();
    expect(hi!).toBeGreaterThan(38);
    expect(hi!).toBeLessThan(44);
  });

  it("is monotonic in humidity at fixed temp", () => {
    const low = heatIndexC(30, 40)!;
    const high = heatIndexC(30, 80)!;
    expect(high).toBeGreaterThan(low);
  });
});

describe("windChillC", () => {
  it("returns null when temp is above 10°C (formula undefined)", () => {
    expect(windChillC(15, 5)).toBeNull();
    expect(windChillC(10.1, 10)).toBeNull();
  });

  it("returns null when wind is below 1.34 m/s (~3 mph)", () => {
    expect(windChillC(0, 1)).toBeNull();
  });

  it("computes wind chill at cold, windy conditions", () => {
    // -5°C, 5 m/s wind → roughly -10°C wind chill
    const wc = windChillC(-5, 5);
    expect(wc).not.toBeNull();
    expect(wc!).toBeLessThan(-5);
    expect(wc!).toBeGreaterThan(-15);
  });

  it("decreases as wind increases at fixed cold temp", () => {
    const light = windChillC(0, 2)!;
    const strong = windChillC(0, 10)!;
    expect(strong).toBeLessThan(light);
  });
});

describe("wetBulbC", () => {
  it("returns T when RH is 100%", () => {
    expect(wetBulbC(25, 100)).toBeCloseTo(25, 0);
  });

  it("is below air temp when RH < 100%", () => {
    expect(wetBulbC(30, 50)!).toBeLessThan(30);
  });

  it("is monotonic in RH at fixed temp", () => {
    expect(wetBulbC(25, 80)!).toBeGreaterThan(wetBulbC(25, 40)!);
  });

  it("returns null for null inputs", () => {
    expect(wetBulbC(null, 50)).toBeNull();
    expect(wetBulbC(25, null)).toBeNull();
  });
});
