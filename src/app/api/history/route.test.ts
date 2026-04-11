/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/config", () => ({
  getConfig: () => ({ token: "test-token" }),
}));

const mockFetchHistory = jest.fn();
jest.mock("@/lib/tempest", () => ({
  fetchObservationHistory: (...args: unknown[]) => mockFetchHistory(...args),
}));

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/history", () => {
  beforeEach(() => {
    mockFetchHistory.mockReset();
  });

  it("returns history for valid params", async () => {
    const mockData = {
      station_id: 123,
      obs: [{ air_temperature: 20 }],
      status: { status_code: 0, status_message: "SUCCESS" },
    };
    mockFetchHistory.mockResolvedValue(mockData);

    const response = await GET(
      createRequest("/api/history?station_id=123&time_start=1000&time_end=2000")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.station_id).toBe(123);
    expect(mockFetchHistory).toHaveBeenCalledWith(123, "test-token", 1000, 2000);
  });

  it("returns 400 when params are missing", async () => {
    const response = await GET(createRequest("/api/history?station_id=123"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("returns 500 on API error", async () => {
    mockFetchHistory.mockRejectedValue(new Error("API down"));

    const response = await GET(
      createRequest("/api/history?station_id=123&time_start=1000&time_end=2000")
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("API down");
  });
});
