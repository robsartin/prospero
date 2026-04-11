import { convertTemp, convertWind, convertPressure, convertRain } from "./units";

describe("convertTemp", () => {
  it("converts C to F", () => {
    expect(convertTemp(0, "imperial")).toBeCloseTo(32);
    expect(convertTemp(100, "imperial")).toBeCloseTo(212);
    expect(convertTemp(22.5, "imperial")).toBeCloseTo(72.5);
  });

  it("returns C unchanged for metric", () => {
    expect(convertTemp(22.5, "metric")).toBe(22.5);
  });
});

describe("convertWind", () => {
  it("converts m/s to mph", () => {
    expect(convertWind(1, "imperial")).toBeCloseTo(2.237);
    expect(convertWind(10, "imperial")).toBeCloseTo(22.37);
  });

  it("returns m/s unchanged for metric", () => {
    expect(convertWind(3.5, "metric")).toBe(3.5);
  });
});

describe("convertPressure", () => {
  it("converts mb to inHg", () => {
    expect(convertPressure(1013.25, "imperial")).toBeCloseTo(29.92, 1);
  });

  it("returns mb unchanged for metric", () => {
    expect(convertPressure(1013, "metric")).toBe(1013);
  });
});

describe("convertRain", () => {
  it("converts mm to in", () => {
    expect(convertRain(25.4, "imperial")).toBeCloseTo(1.0);
  });

  it("returns mm unchanged for metric", () => {
    expect(convertRain(2.5, "metric")).toBe(2.5);
  });
});
