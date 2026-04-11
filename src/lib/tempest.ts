import type {
  StationsResponse,
  ObservationsResponse,
  ForecastResponse,
} from "./types";

const TEMPEST_BASE_URL = "https://swd.weatherflow.com/swd/rest";

export function buildUrl(path: string, token: string): string {
  const url = new URL(`${TEMPEST_BASE_URL}${path}`);
  url.searchParams.set("token", token);
  return url.toString();
}

async function fetchUrl<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Tempest API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function fetchTempest<T>(path: string, token: string): Promise<T> {
  return fetchUrl<T>(buildUrl(path, token));
}

export function fetchStations(token: string): Promise<StationsResponse> {
  return fetchTempest<StationsResponse>("/stations", token);
}

export function fetchObservations(
  stationId: number,
  token: string
): Promise<ObservationsResponse> {
  return fetchTempest<ObservationsResponse>(
    `/observations/station/${stationId}`,
    token
  );
}

export function fetchForecast(
  stationId: number,
  token: string
): Promise<ForecastResponse> {
  const url = buildUrl("/better_forecast", token);
  const parsed = new URL(url);
  parsed.searchParams.set("station_id", String(stationId));
  return fetchUrl<ForecastResponse>(parsed.toString());
}

export function fetchObservationHistory(
  stationId: number,
  token: string,
  timeStart: number,
  timeEnd: number
): Promise<ObservationsResponse> {
  const url = buildUrl(`/observations/station/${stationId}`, token);
  const parsed = new URL(url);
  parsed.searchParams.set("time_start", String(timeStart));
  parsed.searchParams.set("time_end", String(timeEnd));
  return fetchUrl<ObservationsResponse>(parsed.toString());
}
