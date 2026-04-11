import { getSeverity, type Severity } from "./severity";

describe("getSeverity", () => {
  describe("temperature", () => {
    it("returns cold for < 5°C", () => {
      expect(getSeverity("temperature", 3)).toBe("cold");
    });

    it("returns normal for moderate temps", () => {
      expect(getSeverity("temperature", 20)).toBe("normal");
    });

    it("returns warm for > 30°C", () => {
      expect(getSeverity("temperature", 35)).toBe("warm");
    });

    it("returns hot for > 38°C", () => {
      expect(getSeverity("temperature", 40)).toBe("hot");
    });
  });

  describe("uv", () => {
    it("returns low for 0-2", () => {
      expect(getSeverity("uv", 2)).toBe("low");
    });

    it("returns moderate for 3-5", () => {
      expect(getSeverity("uv", 4)).toBe("moderate");
    });

    it("returns high for 6-7", () => {
      expect(getSeverity("uv", 7)).toBe("high");
    });

    it("returns very-high for 8-10", () => {
      expect(getSeverity("uv", 9)).toBe("very-high");
    });

    it("returns extreme for 11+", () => {
      expect(getSeverity("uv", 12)).toBe("extreme");
    });
  });

  describe("wind", () => {
    it("returns normal for low wind", () => {
      expect(getSeverity("wind", 5)).toBe("normal");
    });

    it("returns high for > 15 m/s", () => {
      expect(getSeverity("wind", 18)).toBe("high");
    });

    it("returns extreme for > 25 m/s", () => {
      expect(getSeverity("wind", 30)).toBe("extreme");
    });
  });

  describe("lightning", () => {
    it("returns normal for 0 strikes", () => {
      expect(getSeverity("lightning", 0)).toBe("normal");
    });

    it("returns danger for > 0 strikes", () => {
      expect(getSeverity("lightning", 3)).toBe("danger");
    });
  });
});
