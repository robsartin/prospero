import type { UnitSystemId } from "../units";
import { getExportMetric } from "./registry";

const MAX_SPAN = 366 * 86400;

export interface ExportParams {
  deviceId: number;
  start: number;
  end: number;
  metricKeys: string[];
  granularity: "daily";
  format: "csv" | "json";
  unitId: UnitSystemId;
  tzOffset: number;
}

export type ParseResult =
  | { ok: true; value: ExportParams }
  | { ok: false; error: string };

export function parseExportParams(params: URLSearchParams): ParseResult {
  const deviceId = params.get("device_id");
  const start = params.get("start");
  const end = params.get("end");
  const metrics = params.get("metrics");

  if (!deviceId || !start || !end || !metrics) {
    return { ok: false, error: "device_id, start, end, and metrics query parameters are required" };
  }

  const startN = Number(start);
  const endN = Number(end);
  if (!Number.isFinite(startN) || !Number.isFinite(endN) || endN <= startN) {
    return { ok: false, error: "end must be greater than start" };
  }
  if (endN - startN > MAX_SPAN) {
    return { ok: false, error: "date range must not exceed 366 days" };
  }

  const metricKeys = metrics.split(",").filter(Boolean);
  if (metricKeys.length === 0) {
    return { ok: false, error: "at least one metric is required" };
  }
  for (const key of metricKeys) {
    if (!getExportMetric(key)) {
      return { ok: false, error: `unknown metric: ${key}` };
    }
  }

  const granularity = params.get("granularity") ?? "daily";
  if (granularity !== "daily") {
    return { ok: false, error: `unsupported granularity: ${granularity}` };
  }

  const format = params.get("format") ?? "csv";
  if (format !== "csv" && format !== "json") {
    return { ok: false, error: `unsupported format: ${format}` };
  }

  const units = params.get("units") ?? "metric";
  if (units !== "metric" && units !== "imperial") {
    return { ok: false, error: `unsupported units: ${units}` };
  }

  const tzOffset = Number(params.get("tz_offset") ?? "0");
  if (!Number.isFinite(tzOffset)) {
    return { ok: false, error: "tz_offset must be a number" };
  }

  return {
    ok: true,
    value: {
      deviceId: Number(deviceId),
      start: startN,
      end: endN,
      metricKeys,
      granularity: "daily",
      format,
      unitId: units,
      tzOffset,
    },
  };
}
