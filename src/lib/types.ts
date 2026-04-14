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
  air_temperature: number | null;
  barometric_pressure: number | null;
  station_pressure: number | null;
  sea_level_pressure: number | null;
  relative_humidity: number | null;
  precip: number | null;
  precip_accum_last_1hr: number | null;
  precip_accum_local_day: number | null;
  wind_avg: number | null;
  wind_direction: number | null;
  wind_gust: number | null;
  wind_lull: number | null;
  solar_radiation: number | null;
  uv: number | null;
  brightness: number | null;
  lightning_strike_last_epoch: number | null;
  lightning_strike_last_distance: number | null;
  lightning_strike_count: number | null;
  lightning_strike_count_last_1hr: number | null;
  lightning_strike_count_last_3hr: number | null;
  feels_like: number | null;
  heat_index: number | null;
  wind_chill: number | null;
  dew_point: number | null;
  wet_bulb_temperature: number | null;
  pressure_trend: string | null;
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

export interface DeviceObservationsResponse {
  device_id: number;
  type: string;
  obs: (number | null)[][];
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
