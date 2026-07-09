/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/config", () => ({ getConfig: () => ({ token: "test-token" }) }));

const mockFetchDeviceHistory = jest.fn();
jest.mock("@/lib/tempest", () => ({
  fetchDeviceHistory: (...args: unknown[]) => mockFetchDeviceHistory(...args),
}));

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

// One ST obs row: index 0 = timestamp, index 12 = rain accumulated.
function obsRow(ts: number, rain: number) {
  const row = new Array(18).fill(0);
  row[0] = ts;
  row[12] = rain;
  return row;
}

describe("GET /api/export", () => {
  beforeEach(() => mockFetchDeviceHistory.mockReset());

  it("returns a CSV attachment of daily rain totals", async () => {
    mockFetchDeviceHistory.mockResolvedValue({
      obs: [obsRow(1767225600, 0.2), obsRow(1767229200, 0.3)],
      status: { status_code: 0, status_message: "SUCCESS" },
    });

    const res = await GET(
      createRequest("/api/export?device_id=9&start=1767225600&end=1767250000&metrics=rain&format=csv")
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain('filename="rain_2026-01-01_');
    expect(await res.text()).toBe("date,Rain (mm)\n2026-01-01,0.5");
  });

  it("returns JSON when format=json", async () => {
    mockFetchDeviceHistory.mockResolvedValue({ obs: [obsRow(1767225600, 1)], status: {} });
    const res = await GET(
      createRequest("/api/export?device_id=9&start=1767225600&end=1767250000&metrics=rain&format=json")
    );
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(await res.text())).toEqual([{ date: "2026-01-01", rain: 1 }]);
  });

  it("fans out across 5-day chunks", async () => {
    mockFetchDeviceHistory.mockResolvedValue({ obs: [], status: {} });
    // 12-day span -> 3 chunks of <=5 days.
    const start = 1767225600;
    const end = start + 12 * 86400;
    await GET(createRequest(`/api/export?device_id=9&start=${start}&end=${end}&metrics=rain`));
    expect(mockFetchDeviceHistory).toHaveBeenCalledTimes(3);
  });

  it("returns 400 on invalid params without calling Tempest", async () => {
    const res = await GET(createRequest("/api/export?device_id=9"));
    expect(res.status).toBe(400);
    expect(mockFetchDeviceHistory).not.toHaveBeenCalled();
  });

  it("returns 500 when the fetch fails", async () => {
    mockFetchDeviceHistory.mockRejectedValue(new Error("API down"));
    const res = await GET(
      createRequest("/api/export?device_id=9&start=1767225600&end=1767250000&metrics=rain")
    );
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("API down");
  });
});
