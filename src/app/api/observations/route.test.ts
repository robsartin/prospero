/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/config", () => ({
  getConfig: () => ({ token: "test-token" }),
}));

const mockFetchObservations = jest.fn();
jest.mock("@/lib/tempest", () => ({
  fetchObservations: (...args: unknown[]) => mockFetchObservations(...args),
}));

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/observations", () => {
  beforeEach(() => {
    mockFetchObservations.mockReset();
  });

  it("returns observations for a valid station_id", async () => {
    const mockData = {
      station_id: 456,
      obs: [{ air_temperature: 22.5 }],
      status: { status_code: 0, status_message: "SUCCESS" },
    };
    mockFetchObservations.mockResolvedValue(mockData);

    const response = await GET(createRequest("/api/observations?station_id=456"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.station_id).toBe(456);
    expect(mockFetchObservations).toHaveBeenCalledWith(456, "test-token");
  });

  it("returns 400 when station_id is missing", async () => {
    const response = await GET(createRequest("/api/observations"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("station_id query parameter is required");
  });

  it("returns 500 on API error", async () => {
    mockFetchObservations.mockRejectedValue(new Error("Timeout"));

    const response = await GET(createRequest("/api/observations?station_id=456"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Timeout");
  });
});
