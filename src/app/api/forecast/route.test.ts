/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/config", () => ({
  getConfig: () => ({ token: "test-token" }),
}));

const mockFetchForecast = jest.fn();
jest.mock("@/lib/tempest", () => ({
  fetchForecast: (...args: unknown[]) => mockFetchForecast(...args),
}));

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/forecast", () => {
  beforeEach(() => {
    mockFetchForecast.mockReset();
  });

  it("returns forecast for a valid station_id", async () => {
    const mockData = {
      forecast: { daily: [{ air_temp_high: 28 }], hourly: [] },
      status: { status_code: 0, status_message: "SUCCESS" },
    };
    mockFetchForecast.mockResolvedValue(mockData);

    const response = await GET(createRequest("/api/forecast?station_id=789"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.forecast.daily[0].air_temp_high).toBe(28);
    expect(mockFetchForecast).toHaveBeenCalledWith(789, "test-token");
  });

  it("returns 400 when station_id is missing", async () => {
    const response = await GET(createRequest("/api/forecast"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("station_id query parameter is required");
  });

  it("returns 500 on API error", async () => {
    mockFetchForecast.mockRejectedValue(new Error("Network error"));

    const response = await GET(createRequest("/api/forecast?station_id=789"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Network error");
  });
});
