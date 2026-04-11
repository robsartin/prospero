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
});

describe("pressureDomain", () => {
  it("rounds to nearest 5 with padding around data range", () => {
    const data = [{ time: "", value: 1008 }, { time: "", value: 1022 }];
    expect(pressureDomain(data)).toEqual([1000, 1030]);
  });

  it("returns defaults for empty data", () => {
    expect(pressureDomain([])).toEqual([980, 1040]);
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
