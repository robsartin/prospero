/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/config", () => ({
  getConfig: () => ({ token: "test-token" }),
}));

const mockFetchDeviceHistory = jest.fn();
jest.mock("@/lib/tempest", () => ({
  fetchDeviceHistory: (...args: unknown[]) => mockFetchDeviceHistory(...args),
}));

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/history", () => {
  beforeEach(() => {
    mockFetchDeviceHistory.mockReset();
  });

  it("returns transformed history for valid params", async () => {
    const mockData = {
      device_id: 456,
      type: "obs_st",
      obs: [[1681000000, 0.5, 1.2, 2.3, 180, 3, 1013, 22.5, 65, 50000, 6, 845, 0, 0, 15, 2, 2.6, 1]],
      status: { status_code: 0, status_message: "SUCCESS" },
    };
    mockFetchDeviceHistory.mockResolvedValue(mockData);

    const response = await GET(
      createRequest("/api/history?device_id=456&time_start=1000&time_end=2000")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockFetchDeviceHistory).toHaveBeenCalledWith(456, "test-token", 1000, 2000);
    // Should return transformed observations, not raw arrays
    expect(body[0].airTemperature).toBe(22.5);
    expect(body[0].timestamp).toBe(1681000000);
  });

  it("returns 400 when params are missing", async () => {
    const response = await GET(createRequest("/api/history?device_id=456"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("returns 500 on API error", async () => {
    mockFetchDeviceHistory.mockRejectedValue(new Error("API down"));

    const response = await GET(
      createRequest("/api/history?device_id=456&time_start=1000&time_end=2000")
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("API down");
  });
});
