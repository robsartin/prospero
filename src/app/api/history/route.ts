import { type NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { fetchObservationHistory } from "@/lib/tempest";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const stationId = params.get("station_id");
  const timeStart = params.get("time_start");
  const timeEnd = params.get("time_end");

  if (!stationId || !timeStart || !timeEnd) {
    return NextResponse.json(
      { error: "station_id, time_start, and time_end query parameters are required" },
      { status: 400 }
    );
  }

  try {
    const { token } = getConfig();
    const data = await fetchObservationHistory(
      Number(stationId),
      token,
      Number(timeStart),
      Number(timeEnd)
    );
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
