import { getWeatherEmoji } from "./weatherEmoji";

describe("getWeatherEmoji", () => {
  describe("icon-based mapping", () => {
    it("returns sun for clear-day", () => {
      expect(getWeatherEmoji("clear-day", "Clear")).toBe("☀️");
    });

    it("returns moon for clear-night", () => {
      expect(getWeatherEmoji("clear-night", "Clear")).toBe("🌙");
    });

    it("returns cloud-sun for partly-cloudy-day", () => {
      expect(getWeatherEmoji("partly-cloudy-day", "Partly Cloudy")).toBe("⛅");
    });

    it("returns cloud-moon for partly-cloudy-night", () => {
      expect(getWeatherEmoji("partly-cloudy-night", "Partly Cloudy")).toBe("🌤️");
    });

    it("returns cloud for cloudy", () => {
      expect(getWeatherEmoji("cloudy", "Cloudy")).toBe("☁️");
    });

    it("returns rain for rainy", () => {
      expect(getWeatherEmoji("rainy", "Rain")).toBe("🌧️");
    });

    it("returns thunderstorm for thunderstorm", () => {
      expect(getWeatherEmoji("thunderstorm", "Thunderstorm")).toBe("⛈️");
    });

    it("returns snow for snow", () => {
      expect(getWeatherEmoji("snow", "Snow")).toBe("🌨️");
    });

    it("returns ice for sleet", () => {
      expect(getWeatherEmoji("sleet", "Sleet")).toBe("🧊");
    });

    it("returns fog for foggy", () => {
      expect(getWeatherEmoji("foggy", "Fog")).toBe("🌫️");
    });

    it("returns wind for windy", () => {
      expect(getWeatherEmoji("windy", "Windy")).toBe("💨");
    });
  });

  describe("conditions-based fallback", () => {
    it("matches rain in conditions text", () => {
      expect(getWeatherEmoji("unknown-icon", "Light Rain")).toBe("🌧️");
    });

    it("matches snow in conditions text", () => {
      expect(getWeatherEmoji("unknown-icon", "Heavy Snow")).toBe("🌨️");
    });

    it("matches thunder in conditions text", () => {
      expect(getWeatherEmoji("unknown-icon", "Thunderstorms Likely")).toBe("⛈️");
    });

    it("matches fog in conditions text", () => {
      expect(getWeatherEmoji("unknown-icon", "Foggy Morning")).toBe("🌫️");
    });

    it("matches cloud in conditions text", () => {
      expect(getWeatherEmoji("unknown-icon", "Mostly Cloudy")).toBe("☁️");
    });

    it("matches clear in conditions text", () => {
      expect(getWeatherEmoji("unknown-icon", "Clear Skies")).toBe("☀️");
    });
  });

  describe("temperature overrides", () => {
    it("returns freezing emoji when high < 0°C", () => {
      expect(getWeatherEmoji("clear-day", "Clear", -5)).toBe("🥶");
    });

    it("returns hot emoji when high > 38°C", () => {
      expect(getWeatherEmoji("clear-day", "Clear", 42)).toBe("🥵");
    });

    it("does not override for normal temps", () => {
      expect(getWeatherEmoji("clear-day", "Clear", 25)).toBe("☀️");
    });

  });

  describe("fallback", () => {
    it("returns neutral emoji for unknown icon and conditions", () => {
      expect(getWeatherEmoji("unknown", "Unknown Condition")).toBe("🌤️");
    });
  });
});
