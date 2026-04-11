/**
 * @jest-environment node
 */
import { GET } from "./route";

jest.mock("@/lib/config", () => ({
  getConfig: () => ({ token: "test-token" }),
}));

const mockFetchStations = jest.fn();
jest.mock("@/lib/tempest", () => ({
  fetchStations: (...args: unknown[]) => mockFetchStations(...args),
}));

describe("GET /api/stations", () => {
  beforeEach(() => {
    mockFetchStations.mockReset();
  });

  it("returns stations data with 200", async () => {
    const mockData = {
      stations: [{ station_id: 123, name: "My Station" }],
      status: { status_code: 0, status_message: "SUCCESS" },
    };
    mockFetchStations.mockResolvedValue(mockData);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.stations[0].station_id).toBe(123);
    expect(mockFetchStations).toHaveBeenCalledWith("test-token");
  });

  it("returns 500 on API error", async () => {
    mockFetchStations.mockRejectedValue(new Error("API down"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("API down");
  });
});
