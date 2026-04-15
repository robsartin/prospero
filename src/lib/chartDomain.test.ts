import { tempDomain, pressureDomain, zeroBasedDomain } from "./chartDomain";

describe("tempDomain", () => {
  it("rounds to nearest 5 with padding", () => {
    const data = [{ time: "", value: 18.3 }, { time: "", value: 27.8 }];
    expect(tempDomain(data)).toEqual([10, 35]);
  });

  it("returns defaults for empty data", () => {
    expect(tempDomain([])).toEqual([0, 50]);
  });

  it("handles negative temperatures", () => {
    const data = [{ time: "", value: -8 }, { time: "", value: 3 }];
    expect(tempDomain(data)).toEqual([-15, 10]);
  });

  it("considers heat index, wind chill, and wet bulb series when present", () => {
    const data = [
      { time: "", value: 30, heatIndex: 42, wetBulb: 24 },
      { time: "", value: 32, heatIndex: 45, wetBulb: 26 },
    ];
    expect(tempDomain(data)).toEqual([15, 50]);
  });
});

describe("pressureDomain", () => {
  it("returns default range for empty data", () => {
    expect(pressureDomain([])).toEqual([0, 100]);
  });

  it("brackets metric (mb) pressure values with padding", () => {
    const data = [{ time: "", value: 1010 }, { time: "", value: 1015 }];
    const [min, max] = pressureDomain(data);
    expect(min).toBeLessThan(1010);
    expect(max).toBeGreaterThan(1015);
    // padding reasonable: within a few mb
    expect(1010 - min).toBeLessThan(5);
    expect(max - 1015).toBeLessThan(5);
  });

  it("brackets imperial (inHg) pressure values with scaled padding", () => {
    const data = [{ time: "", value: 29.82 }, { time: "", value: 29.95 }];
    const [min, max] = pressureDomain(data);
    expect(min).toBeLessThan(29.82);
    expect(max).toBeGreaterThan(29.95);
    // padding scales with magnitude — should not be multiple inHg
    expect(29.82 - min).toBeLessThan(0.1);
    expect(max - 29.95).toBeLessThan(0.1);
  });

  it("considers barometric and seaLevel series when present", () => {
    const data = [
      { time: "", value: 1000, barometric: 1001, seaLevel: 1012 },
      { time: "", value: 1002, barometric: 1003, seaLevel: 1014 },
    ];
    const [min, max] = pressureDomain(data);
    expect(min).toBeLessThan(1000);
    expect(max).toBeGreaterThan(1014);
  });
});

describe("zeroBasedDomain", () => {
  it("starts at zero and rounds max up to nearest 5", () => {
    const data = [{ time: "", value: 3 }, { time: "", value: 12 }];
    expect(zeroBasedDomain(data)).toEqual([0, 15]);
  });

  it("returns [0, 5] for small values", () => {
    const data = [{ time: "", value: 0.5 }];
    expect(zeroBasedDomain(data)).toEqual([0, 5]);
  });

  it("returns [0, 5] for all-zero data", () => {
    const data = [{ time: "", value: 0 }];
    expect(zeroBasedDomain(data)).toEqual([0, 5]);
  });

  it("returns defaults for empty data", () => {
    expect(zeroBasedDomain([])).toEqual([0, 10]);
  });
});
