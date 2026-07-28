import { NextRequest, NextResponse } from "next/server";
import { getLaps, getLocationForLap } from "@/lib/openf1";

export async function GET(req: NextRequest) {
  try {
    const sessionKey = Number(req.nextUrl.searchParams.get("session_key"));
    const driverNumber = Number(req.nextUrl.searchParams.get("driver_number"));
    const lapNumber = Number(req.nextUrl.searchParams.get("lap_number"));

    if (!sessionKey || !driverNumber || !lapNumber) {
      return NextResponse.json(
        { error: "session_key, driver_number and lap_number required" },
        { status: 400 },
      );
    }

    const laps = await getLaps(sessionKey, driverNumber);
    const lap = laps.find((l) => l.lap_number === lapNumber);
    if (!lap) {
      return NextResponse.json({ error: "Lap not found" }, { status: 404 });
    }

    const points = await getLocationForLap(sessionKey, driverNumber, lap);
    return NextResponse.json({ points });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch location" },
      { status: 502 },
    );
  }
}
