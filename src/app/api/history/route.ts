import { type NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { fetchDeviceHistory } from "@/lib/tempest";
import { transformObservation } from "@/lib/transforms";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const deviceId = params.get("device_id");
  const timeStart = params.get("time_start");
  const timeEnd = params.get("time_end");

  if (!deviceId || !timeStart || !timeEnd) {
    return NextResponse.json(
      { error: "device_id, time_start, and time_end query parameters are required" },
      { status: 400 }
    );
  }

  try {
    const { token } = getConfig();
    const data = await fetchDeviceHistory(
      Number(deviceId),
      token,
      Number(timeStart),
      Number(timeEnd)
    );
    const transformed = (data.obs ?? []).map(transformObservation);
    return NextResponse.json(transformed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
