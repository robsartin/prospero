import { formatValue } from "./format";

describe("formatValue", () => {
  describe("temperature (integer)", () => {
    it("rounds to integer", () => {
      expect(formatValue("temperature", 22.456)).toBe("22");
    });

    it("rounds up at .5", () => {
      expect(formatValue("temperature", 22.5)).toBe("23");
    });
  });

  describe("dew_point (integer)", () => {
    it("rounds to integer", () => {
      expect(formatValue("dew_point", 15.678)).toBe("16");
    });
  });

  describe("feels_like (integer)", () => {
    it("rounds to integer", () => {
      expect(formatValue("feels_like", 24.321)).toBe("24");
    });
  });

  describe("wind (1 decimal)", () => {
    it("formats to 1 decimal place", () => {
      expect(formatValue("wind", 3.567)).toBe("3.6");
    });
  });

  describe("pressure (1 decimal)", () => {
    it("formats to 1 decimal place", () => {
      expect(formatValue("pressure", 1013.256)).toBe("1013.3");
    });
  });

  describe("humidity (integer)", () => {
    it("rounds to integer", () => {
      expect(formatValue("humidity", 65.4)).toBe("65");
    });

    it("rounds up at .5", () => {
      expect(formatValue("humidity", 65.5)).toBe("66");
    });
  });

  describe("brightness (integer)", () => {
    it("rounds to integer", () => {
      expect(formatValue("brightness", 50123.7)).toBe("50124");
    });
  });

  describe("lightning (integer)", () => {
    it("rounds to integer", () => {
      expect(formatValue("lightning", 3.0)).toBe("3");
    });
  });

  describe("distance (integer)", () => {
    it("rounds to integer", () => {
      expect(formatValue("distance", 14.8)).toBe("15");
    });
  });

  describe("uv (2 decimals)", () => {
    it("formats to 2 decimal places", () => {
      expect(formatValue("uv", 6.789)).toBe("6.79");
    });

    it("preserves 2 decimals when exact", () => {
      expect(formatValue("uv", 3.0)).toBe("3.00");
    });
  });

  describe("rain (2 decimals)", () => {
    it("formats to 2 decimal places", () => {
      expect(formatValue("rain", 0.456)).toBe("0.46");
    });

    it("preserves 2 decimals when exact", () => {
      expect(formatValue("rain", 2.5)).toBe("2.50");
    });
  });

  describe("null handling", () => {
    it("returns '--' for null", () => {
      expect(formatValue("temperature", null)).toBe("--");
    });

    it("returns '--' for undefined", () => {
      expect(formatValue("temperature", undefined)).toBe("--");
    });
  });
});
