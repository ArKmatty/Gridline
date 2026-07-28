import { NextRequest, NextResponse } from "next/server";
import { getSessions } from "@/lib/openf1";

export async function GET(req: NextRequest) {
  try {
    const meetingKey = Number(req.nextUrl.searchParams.get("meeting_key"));
    if (!meetingKey) {
      return NextResponse.json({ error: "meeting_key required" }, { status: 400 });
    }
    const sessions = await getSessions(meetingKey);
    return NextResponse.json(sessions);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch sessions" },
      { status: 502 },
    );
  }
}
