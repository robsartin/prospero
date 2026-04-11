import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { fetchStations } from "@/lib/tempest";

export async function GET() {
  try {
    const { token } = getConfig();
    const data = await fetchStations(token);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
