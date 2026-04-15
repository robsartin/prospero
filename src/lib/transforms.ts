import type { ForecastDay, ForecastHour } from "./types";

/**
 * Tempest ST (station) observation array field indices.
 * See: https://apidocs.tempestwx.com/reference/get_observations-device-device-id
 */
const OBS_FIELDS = {
  TIMESTAMP: 0,
  WIND_LULL: 1,
  WIND_AVG: 2,
  WIND_GUST: 3,
  WIND_DIRECTION: 4,
  WIND_SAMPLE_INTERVAL: 5,
  STATION_PRESSURE: 6,
  AIR_TEMPERATURE: 7,
  RELATIVE_HUMIDITY: 8,
  ILLUMINANCE: 9,
  UV: 10,
  SOLAR_RADIATION: 11,
  RAIN_ACCUMULATED: 12,
  PRECIP_TYPE: 13,
  LIGHTNING_STRIKE_AVG_DISTANCE: 14,
  LIGHTNING_STRIKE_COUNT: 15,
  BATTERY: 16,
  REPORT_INTERVAL: 17,
} as const;

export interface TransformedObservation {
  timestamp: number;
  windLull: number | null;
  windAvg: number | null;
  windGust: number | null;
  windDirection: number | null;
  stationPressure: number | null;
  airTemperature: number | null;
  relativeHumidity: number | null;
  illuminance: number | null;
  uv: number | null;
  solarRadiation: number | null;
  rainAccumulated: number | null;
  precipType: number | null;
  lightningStrikeAvgDistance: number | null;
  lightningStrikeCount: number | null;
  battery: number | null;
  reportInterval: number | null;
  // Optional derived fields, populated by enrichObservation after transform.
  // Null when the formula's domain isn't met or when inputs are missing.
  heatIndexC?: number | null;
  windChillC?: number | null;
  wetBulbC?: number | null;
}

export function transformObservation(raw: (number | null)[]): TransformedObservation {
  return {
    timestamp: raw[OBS_FIELDS.TIMESTAMP] ?? 0,
    windLull: raw[OBS_FIELDS.WIND_LULL] ?? null,
    windAvg: raw[OBS_FIELDS.WIND_AVG] ?? null,
    windGust: raw[OBS_FIELDS.WIND_GUST] ?? null,
    windDirection: raw[OBS_FIELDS.WIND_DIRECTION] ?? null,
    stationPressure: raw[OBS_FIELDS.STATION_PRESSURE] ?? null,
    airTemperature: raw[OBS_FIELDS.AIR_TEMPERATURE] ?? null,
    relativeHumidity: raw[OBS_FIELDS.RELATIVE_HUMIDITY] ?? null,
    illuminance: raw[OBS_FIELDS.ILLUMINANCE] ?? null,
    uv: raw[OBS_FIELDS.UV] ?? null,
    solarRadiation: raw[OBS_FIELDS.SOLAR_RADIATION] ?? null,
    rainAccumulated: raw[OBS_FIELDS.RAIN_ACCUMULATED] ?? null,
    precipType: raw[OBS_FIELDS.PRECIP_TYPE] ?? null,
    lightningStrikeAvgDistance: raw[OBS_FIELDS.LIGHTNING_STRIKE_AVG_DISTANCE] ?? null,
    lightningStrikeCount: raw[OBS_FIELDS.LIGHTNING_STRIKE_COUNT] ?? null,
    battery: raw[OBS_FIELDS.BATTERY] ?? null,
    reportInterval: raw[OBS_FIELDS.REPORT_INTERVAL] ?? null,
  };
}

export interface TransformedForecastDay {
  dayStartLocal: number;
  dayNum: number;
  monthNum: number;
  conditions: string;
  icon: string;
  sunrise: number;
  sunset: number;
  highTemp: number;
  lowTemp: number;
  precipProbability: number;
  precipIcon: string;
  precipType: string;
}

export function transformForecastDay(day: ForecastDay): TransformedForecastDay {
  return {
    dayStartLocal: day.day_start_local,
    dayNum: day.day_num,
    monthNum: day.month_num,
    conditions: day.conditions,
    icon: day.icon,
    sunrise: day.sunrise,
    sunset: day.sunset,
    highTemp: day.air_temp_high,
    lowTemp: day.air_temp_low,
    precipProbability: day.precip_probability,
    precipIcon: day.precip_icon,
    precipType: day.precip_type,
  };
}

export interface TransformedForecastHour {
  time: number;
  conditions: string;
  icon: string;
  temperature: number;
  pressure: number;
  humidity: number;
  precip: number;
  precipProbability: number;
  windAvg: number;
  windDirection: number;
  windGust: number;
  uv: number;
  feelsLike: number;
}

export function transformForecastHour(hour: ForecastHour): TransformedForecastHour {
  return {
    time: hour.time,
    conditions: hour.conditions,
    icon: hour.icon,
    temperature: hour.air_temperature,
    pressure: hour.sea_level_pressure,
    humidity: hour.relative_humidity,
    precip: hour.precip,
    precipProbability: hour.precip_probability,
    windAvg: hour.wind_avg,
    windDirection: hour.wind_direction,
    windGust: hour.wind_gust,
    uv: hour.uv,
    feelsLike: hour.feels_like,
  };
}
