import {
  buildUrl,
  fetchStations,
  fetchObservations,
  fetchForecast,
  fetchObservationHistory,
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

describe("fetchObservationHistory", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("fetches historical observations with time range", async () => {
    const mockResponse = {
      station_id: 123,
      obs: [{ air_temperature: 20 }],
      status: { status_code: 0, status_message: "SUCCESS" },
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await fetchObservationHistory(123, "test-token", 1000, 2000);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("observations/station/123")
    );
    expect(result.station_id).toBe(123);
  });

  it("constructs a valid URL with all params as query strings", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ obs: [] }),
    } as Response);

    await fetchObservationHistory(123, "tok", 1000, 2000);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    const url = new URL(calledUrl);
    expect(url.searchParams.get("token")).toBe("tok");
    expect(url.searchParams.get("time_start")).toBe("1000");
    expect(url.searchParams.get("time_end")).toBe("2000");
    // no double ? in URL
    expect(calledUrl.split("?").length).toBe(2);
  });
});
