import { NextRequest, NextResponse } from "next/server";
import { getMeetings } from "@/lib/openf1";

export async function GET(req: NextRequest) {
  try {
    const year = Number(req.nextUrl.searchParams.get("year") || new Date().getFullYear());
    const meetings = await getMeetings(year);
    return NextResponse.json(meetings);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch meetings" },
      { status: 502 },
    );
  }
}
