import { type NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { fetchForecast } from "@/lib/tempest";

export async function GET(request: NextRequest) {
  const stationId = request.nextUrl.searchParams.get("station_id");

  if (!stationId) {
    return NextResponse.json(
      { error: "station_id query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const { token } = getConfig();
    const data = await fetchForecast(Number(stationId), token);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
