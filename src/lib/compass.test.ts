import { degreesToCompass } from "./compass";

describe("degreesToCompass", () => {
  it("returns N for 0°", () => {
    expect(degreesToCompass(0)).toBe("N");
  });

  it("returns N for 360°", () => {
    expect(degreesToCompass(360)).toBe("N");
  });

  it("returns NNE for 22.5°", () => {
    expect(degreesToCompass(22.5)).toBe("NNE");
  });

  it("returns NE for 45°", () => {
    expect(degreesToCompass(45)).toBe("NE");
  });

  it("returns E for 90°", () => {
    expect(degreesToCompass(90)).toBe("E");
  });

  it("returns S for 180°", () => {
    expect(degreesToCompass(180)).toBe("S");
  });

  it("returns SW for 225°", () => {
    expect(degreesToCompass(225)).toBe("SW");
  });

  it("returns W for 270°", () => {
    expect(degreesToCompass(270)).toBe("W");
  });

  it("returns NW for 315°", () => {
    expect(degreesToCompass(315)).toBe("NW");
  });

  it("returns NNW for 337.5°", () => {
    expect(degreesToCompass(337.5)).toBe("NNW");
  });

  it("rounds to nearest compass point", () => {
    expect(degreesToCompass(350)).toBe("N");
    expect(degreesToCompass(10)).toBe("N");
    expect(degreesToCompass(170)).toBe("S");
    expect(degreesToCompass(260)).toBe("W");
  });

  it("handles values > 360", () => {
    expect(degreesToCompass(450)).toBe("E");
  });

  it("handles negative values", () => {
    expect(degreesToCompass(-90)).toBe("W");
  });
});
