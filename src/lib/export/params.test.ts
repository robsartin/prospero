import { parseExportParams } from "./params";

const qs = (s: string) => new URLSearchParams(s);

describe("parseExportParams", () => {
  it("parses a valid request with defaults", () => {
    const r = parseExportParams(qs("device_id=5&start=1000&end=2000&metrics=rain"));
    expect(r).toEqual({
      ok: true,
      value: {
        deviceId: 5,
        start: 1000,
        end: 2000,
        metricKeys: ["rain"],
        granularity: "daily",
        format: "csv",
        unitId: "metric",
        tzOffset: 0,
      },
    });
  });

  it("honors format, units, and tz_offset", () => {
    const r = parseExportParams(
      qs("device_id=5&start=1000&end=2000&metrics=rain&format=json&units=imperial&tz_offset=-420")
    );
    expect(r).toMatchObject({ ok: true, value: { format: "json", unitId: "imperial", tzOffset: -420 } });
  });

  it("rejects missing required params", () => {
    expect(parseExportParams(qs("device_id=5"))).toMatchObject({ ok: false });
  });

  it("rejects end <= start", () => {
    const r = parseExportParams(qs("device_id=5&start=2000&end=2000&metrics=rain"));
    expect(r).toMatchObject({ ok: false });
    expect((r as { error: string }).error).toContain("start");
  });

  it("rejects spans over 366 days", () => {
    const end = 1000 + 366 * 86400 + 1;
    const r = parseExportParams(qs(`device_id=5&start=1000&end=${end}&metrics=rain`));
    expect(r).toMatchObject({ ok: false });
    expect((r as { error: string }).error).toContain("366");
  });

  it("rejects unknown metric keys", () => {
    const r = parseExportParams(qs("device_id=5&start=1000&end=2000&metrics=rain,zzz"));
    expect(r).toMatchObject({ ok: false });
    expect((r as { error: string }).error).toContain("zzz");
  });

  it("rejects unsupported format, granularity, and units", () => {
    expect(parseExportParams(qs("device_id=5&start=1&end=2&metrics=rain&format=xml"))).toMatchObject({ ok: false });
    expect(parseExportParams(qs("device_id=5&start=1&end=2&metrics=rain&granularity=hourly"))).toMatchObject({ ok: false });
    expect(parseExportParams(qs("device_id=5&start=1&end=2&metrics=rain&units=stone"))).toMatchObject({ ok: false });
  });
});
