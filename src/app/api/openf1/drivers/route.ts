import { NextRequest, NextResponse } from "next/server";
import { getSessionDrivers } from "@/lib/openf1";

export async function GET(req: NextRequest) {
  try {
    const sessionKey = Number(req.nextUrl.searchParams.get("session_key"));
    if (!sessionKey) {
      return NextResponse.json({ error: "session_key required" }, { status: 400 });
    }
    const drivers = await getSessionDrivers(sessionKey);
    return NextResponse.json(drivers);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch drivers" },
      { status: 502 },
    );
  }
}
