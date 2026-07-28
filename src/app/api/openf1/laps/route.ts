import { NextRequest, NextResponse } from "next/server";
import { getLaps } from "@/lib/openf1";

export async function GET(req: NextRequest) {
  try {
    const sessionKey = Number(req.nextUrl.searchParams.get("session_key"));
    const driverNumber = Number(req.nextUrl.searchParams.get("driver_number"));
    if (!sessionKey || !driverNumber) {
      return NextResponse.json(
        { error: "session_key and driver_number required" },
        { status: 400 },
      );
    }
    const laps = await getLaps(sessionKey, driverNumber);
    return NextResponse.json(laps);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch laps" },
      { status: 502 },
    );
  }
}
