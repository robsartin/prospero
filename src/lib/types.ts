// Tempest API response types

export interface Status {
  status_code: number;
  status_message: string;
}

// --- Stations ---

export interface StationMeta {
  share_with_wf: boolean;
  share_with_wu: boolean;
  elevation: number;
}

export interface DeviceMeta {
  agl: number;
  name: string;
  environment: string;
  wifi_network_name: string;
}

export interface Device {
  device_id: number;
  serial_number: string;
  device_meta: DeviceMeta;
  device_type: "HB" | "AR" | "SK" | "ST";
  hardware_revision: string;
  firmware_revision: string;
}

export interface Station {
  location_id: number;
  station_id: number;
  name: string;
  public_name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_offset_minutes: number;
  station_meta: StationMeta;
  last_modified_epoch: number;
  created_epoch: number;
  devices: Device[];
  is_local_mode: boolean;
}

export interface StationsResponse {
  stations: Station[];
  status: Status;
}

// --- Observations ---

export interface ObservationSummary {
  pressure_trend: string;
  strike_count_1h: number;
  strike_count_3h: number;
  precip_total_1h: number;
  strike_last_dist: number;
  strike_last_epoch: number;
  feels_like: number;
  heat_index: number;
  wind_chill: number;
  dew_point: number;
  wet_bulb_temperature: number;
  wet_bulb_globe_temperature: number;
  air_density: number;
  delta_t: number;
}

export interface StationObservation {
  timestamp: number;
  air_temperature: number;
  barometric_pressure: number;
  station_pressure: number;
  sea_level_pressure: number;
  relative_humidity: number;
  precip: number;
  precip_accum_last_1hr: number;
  precip_accum_local_day: number;
  wind_avg: number;
  wind_direction: number;
  wind_gust: number;
  wind_lull: number;
  solar_radiation: number;
  uv: number;
  brightness: number;
  lightning_strike_last_epoch: number;
  lightning_strike_last_distance: number;
  lightning_strike_count: number;
  lightning_strike_count_last_1hr: number;
  lightning_strike_count_last_3hr: number;
  feels_like: number;
  heat_index: number;
  wind_chill: number;
  dew_point: number;
  wet_bulb_temperature: number;
  pressure_trend: string;
}

export interface ObservationsResponse {
  station_id: number;
  station_name: string;
  public_name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  elevation: number;
  obs: StationObservation[];
  status: Status;
}

// --- Forecast ---

export interface ForecastDay {
  day_start_local: number;
  day_num: number;
  month_num: number;
  conditions: string;
  icon: string;
  sunrise: number;
  sunset: number;
  air_temp_high: number;
  air_temp_low: number;
  precip_probability: number;
  precip_icon: string;
  precip_type: string;
}

export interface ForecastHour {
  time: number;
  conditions: string;
  icon: string;
  air_temperature: number;
  sea_level_pressure: number;
  relative_humidity: number;
  precip: number;
  precip_probability: number;
  wind_avg: number;
  wind_direction: number;
  wind_gust: number;
  uv: number;
  feels_like: number;
}

export interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_offset_minutes: number;
  forecast: {
    daily: ForecastDay[];
    hourly: ForecastHour[];
  };
  status: Status;
}
