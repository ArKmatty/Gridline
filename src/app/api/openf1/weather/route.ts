import { NextRequest, NextResponse } from "next/server";
import { getWeather } from "@/lib/openf1";

export async function GET(req: NextRequest) {
  try {
    const sessionKey = Number(req.nextUrl.searchParams.get("session_key"));
    if (!sessionKey) {
      return NextResponse.json({ error: "session_key required" }, { status: 400 });
    }
    const weather = await getWeather(sessionKey);
    return NextResponse.json(weather);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch weather" },
      { status: 502 },
    );
  }
}
