import {
  buildUrl,
  fetchStations,
  fetchObservations,
  fetchForecast,
  fetchDeviceHistory,
} from "./tempest";

describe("buildUrl", () => {
  it("constructs a Tempest API URL with token", () => {
    const url = buildUrl("/stations", "test-token");
    expect(url.toString()).toBe(
      "https://swd.weatherflow.com/swd/rest/stations?token=test-token"
    );
  });

  it("returns a URL object for further manipulation", () => {
    const url = buildUrl("/stations", "test-token");
    expect(url).toBeInstanceOf(URL);
    expect(url.searchParams.get("token")).toBe("test-token");
  });

  it("encodes special characters in the token", () => {
    const url = buildUrl("/stations", "token with spaces");
    expect(url.toString()).toContain("token=token+with+spaces");
  });
});

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchStations", () => {
  it("fetches stations and returns typed response", async () => {
    const mockResponse = {
      stations: [{ station_id: 123, name: "My Station" }],
      status: { status_code: 0, status_message: "SUCCESS" },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await fetchStations("test-token");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://swd.weatherflow.com/swd/rest/stations?token=test-token"
    );
    expect(result.stations[0].station_id).toBe(123);
  });

  it("throws on non-200 response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    } as Response);

    await expect(fetchStations("bad-token")).rejects.toThrow(
      "Tempest API error: 401 Unauthorized"
    );
  });
});

describe("fetchObservations", () => {
  it("fetches observations for a station", async () => {
    const mockResponse = {
      station_id: 456,
      obs: [{ air_temperature: 22.5 }],
      status: { status_code: 0, status_message: "SUCCESS" },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await fetchObservations(456, "test-token");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://swd.weatherflow.com/swd/rest/observations/station/456?token=test-token"
    );
    expect(result.station_id).toBe(456);
  });
});

describe("fetchForecast", () => {
  it("fetches forecast for a station", async () => {
    const mockResponse = {
      forecast: {
        daily: [{ air_temp_high: 30, air_temp_low: 20 }],
        hourly: [],
      },
      status: { status_code: 0, status_message: "SUCCESS" },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await fetchForecast(789, "test-token");

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe("/swd/rest/better_forecast");
    expect(calledUrl.searchParams.get("station_id")).toBe("789");
    expect(calledUrl.searchParams.get("token")).toBe("test-token");
    expect(result.forecast.daily[0].air_temp_high).toBe(30);
  });
});

describe("fetchDeviceHistory", () => {
  it("calls the device endpoint with time range params", async () => {
    const mockResponse = {
      device_id: 456,
      type: "obs_st",
      obs: [[1681000000, 0.5, 1.2, 2.3, 180, 3, 1013, 22.5, 65, 50000, 6, 845, 0, 0, 15, 2, 2.6, 1]],
      status: { status_code: 0, status_message: "SUCCESS" },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await fetchDeviceHistory(456, "test-token", 1000, 2000);

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe("/swd/rest/observations/device/456");
    expect(calledUrl.searchParams.get("token")).toBe("test-token");
    expect(calledUrl.searchParams.get("time_start")).toBe("1000");
    expect(calledUrl.searchParams.get("time_end")).toBe("2000");
    expect(result.device_id).toBe(456);
    expect(result.obs[0]).toBeInstanceOf(Array);
  });
});
