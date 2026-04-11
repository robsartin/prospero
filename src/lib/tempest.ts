import type {
  StationsResponse,
  ObservationsResponse,
  DeviceObservationsResponse,
  ForecastResponse,
} from "./types";

const TEMPEST_BASE_URL = "https://swd.weatherflow.com/swd/rest";

export function buildUrl(path: string, token: string): URL {
  const url = new URL(`${TEMPEST_BASE_URL}${path}`);
  url.searchParams.set("token", token);
  return url;
}

async function fetchUrl<T>(url: URL): Promise<T> {
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Tempest API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function fetchStations(token: string): Promise<StationsResponse> {
  return fetchUrl<StationsResponse>(buildUrl("/stations", token));
}

export function fetchObservations(
  stationId: number,
  token: string
): Promise<ObservationsResponse> {
  return fetchUrl<ObservationsResponse>(
    buildUrl(`/observations/station/${stationId}`, token)
  );
}

export function fetchForecast(
  stationId: number,
  token: string
): Promise<ForecastResponse> {
  const url = buildUrl("/better_forecast", token);
  url.searchParams.set("station_id", String(stationId));
  return fetchUrl<ForecastResponse>(url);
}

export function fetchDeviceHistory(
  deviceId: number,
  token: string,
  timeStart: number,
  timeEnd: number
): Promise<DeviceObservationsResponse> {
  const url = buildUrl(`/observations/device/${deviceId}`, token);
  url.searchParams.set("time_start", String(timeStart));
  url.searchParams.set("time_end", String(timeEnd));
  return fetchUrl<DeviceObservationsResponse>(url);
}
