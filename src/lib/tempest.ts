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

async function fetchTempest<T>(path: string, token: string): Promise<T> {
  const url = buildUrl(path, token);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Tempest API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
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
  return fetchTempest<ForecastResponse>(
    `/forecast/station/${stationId}`,
    token
  );
}

export function fetchObservationHistory(
  stationId: number,
  token: string,
  timeStart: number,
  timeEnd: number
): Promise<ObservationsResponse> {
  return fetchTempest<ObservationsResponse>(
    `/observations/station/${stationId}?time_start=${timeStart}&time_end=${timeEnd}`,
    token
  );
}
