import {
  buildUrl,
  fetchStations,
  fetchObservations,
  fetchForecast,
} from "./tempest";

describe("buildUrl", () => {
  it("constructs a Tempest API URL with token", () => {
    const url = buildUrl("/stations", "test-token");
    expect(url).toBe(
      "https://swd.weatherflow.com/swd/rest/stations?token=test-token"
    );
  });

  it("encodes special characters in the token", () => {
    const url = buildUrl("/stations", "token with spaces");
    expect(url).toContain("token=token+with+spaces");
  });
});

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("fetchStations", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

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

    expect(mockFetch).toHaveBeenCalledWith(
      "https://swd.weatherflow.com/swd/rest/forecast/station/789?token=test-token"
    );
    expect(result.forecast.daily[0].air_temp_high).toBe(30);
  });
});
