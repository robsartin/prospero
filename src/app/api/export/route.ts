import { type NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { fetchDeviceHistory } from "@/lib/tempest";
import { transformObservation } from "@/lib/transforms";
import { enrichObservation } from "@/lib/enrichObservation";
import { chunkTimeRange } from "@/lib/timeRanges";
import { getUnitStrategy } from "@/lib/units";
import { parseExportParams } from "@/lib/export/params";
import { getExportMetric } from "@/lib/export/registry";
import { aggregate } from "@/lib/export/aggregate";
import { toCsv, toJson } from "@/lib/export/serialize";

function isoDate(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const parsed = parseExportParams(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { deviceId, start, end, metricKeys, format, unitId, tzOffset } = parsed.value;

  try {
    const { token } = getConfig();
    const chunks = chunkTimeRange(start, end);
    const responses = await Promise.all(
      chunks.map(([s, e]) => fetchDeviceHistory(deviceId, token, s, e))
    );
    const obs = responses
      .flatMap((r) => r.obs ?? [])
      .map(transformObservation)
      .map(enrichObservation);

    const metrics = metricKeys.map((key) => getExportMetric(key)!);
    const table = aggregate(obs, metrics, getUnitStrategy(unitId), tzOffset);
    const body = format === "csv" ? toCsv(table) : toJson(table);

    const prefix = metricKeys.length === 1 ? metricKeys[0] : "export";
    const filename = `${prefix}_${isoDate(start)}_${isoDate(end)}_daily.${format}`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": format === "csv" ? "text/csv" : "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
