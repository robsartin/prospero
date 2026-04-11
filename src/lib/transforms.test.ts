import {
  transformObservation,
  transformForecastDay,
  transformForecastHour,
} from "./transforms";
import type { ForecastDay, ForecastHour } from "./types";

describe("transformObservation", () => {
  it("maps a raw observation array to named fields", () => {
    // Indices: 0=ts, 1=windLull, 2=windAvg, 3=windGust, 4=windDir, 5=interval,
    //          6=pressure, 7=temp, 8=humidity, 9=illuminance, 10=uv, 11=solar,
    //          12=rain, 13=precipType, 14=lightningDist, 15=lightningCount,
    //          16=battery, 17=reportInterval
    const raw = [
      1681000000, 0.5, 1.2, 2.3, 180, 3, 1013.25, 22.5, 65, 50000, 6, 845,
      0.0, 0, 15, 2, 2.6, 1,
    ];

    const result = transformObservation(raw);

    expect(result.timestamp).toBe(1681000000);
    expect(result.airTemperature).toBe(22.5);
    expect(result.relativeHumidity).toBe(65);
    expect(result.windAvg).toBe(1.2);
    expect(result.windGust).toBe(2.3);
    expect(result.windDirection).toBe(180);
    expect(result.stationPressure).toBe(1013.25);
    expect(result.uv).toBe(6);
    expect(result.solarRadiation).toBe(845);
    expect(result.rainAccumulated).toBe(0.0);
    expect(result.lightningStrikeCount).toBe(2);
    expect(result.lightningStrikeAvgDistance).toBe(15);
    expect(result.battery).toBe(2.6);
  });

  it("handles null values in array positions", () => {
    const raw = [1681000000, null, null, null, null, null, null, null, null];

    const result = transformObservation(raw);

    expect(result.timestamp).toBe(1681000000);
    expect(result.windAvg).toBeNull();
    expect(result.airTemperature).toBeNull();
    expect(result.battery).toBeNull();
  });

  it("handles short arrays gracefully", () => {
    const raw = [1681000000, 0.5];

    const result = transformObservation(raw);

    expect(result.timestamp).toBe(1681000000);
    expect(result.windLull).toBe(0.5);
    expect(result.windAvg).toBeNull();
    expect(result.airTemperature).toBeNull();
  });
});

describe("transformForecastDay", () => {
  it("maps API forecast day to camelCase fields", () => {
    const day: ForecastDay = {
      day_start_local: 1681000000,
      day_num: 11,
      month_num: 4,
      conditions: "Partly Cloudy",
      icon: "partly-cloudy-day",
      sunrise: 1681020000,
      sunset: 1681060000,
      air_temp_high: 28,
      air_temp_low: 18,
      precip_probability: 30,
      precip_icon: "chance-rain",
      precip_type: "rain",
    };

    const result = transformForecastDay(day);

    expect(result.highTemp).toBe(28);
    expect(result.lowTemp).toBe(18);
    expect(result.conditions).toBe("Partly Cloudy");
    expect(result.precipProbability).toBe(30);
    expect(result.dayNum).toBe(11);
  });
});

describe("transformForecastHour", () => {
  it("maps API forecast hour to camelCase fields", () => {
    const hour: ForecastHour = {
      time: 1681000000,
      conditions: "Clear",
      icon: "clear-day",
      air_temperature: 25,
      sea_level_pressure: 1015,
      relative_humidity: 55,
      precip: 0,
      precip_probability: 0,
      wind_avg: 3.5,
      wind_direction: 270,
      wind_gust: 5.2,
      uv: 8,
      feels_like: 26,
    };

    const result = transformForecastHour(hour);

    expect(result.temperature).toBe(25);
    expect(result.pressure).toBe(1015);
    expect(result.humidity).toBe(55);
    expect(result.windAvg).toBe(3.5);
    expect(result.feelsLike).toBe(26);
  });
});
