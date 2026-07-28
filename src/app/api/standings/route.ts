import { NextResponse } from "next/server";
import { getDriverStandings } from "@/lib/jolpica";

export const revalidate = 1800;

export async function GET() {
  try {
    const standings = await getDriverStandings();
    return NextResponse.json(standings);
  } catch (error) {
    console.error("Failed to fetch standings:", error);
    return NextResponse.json(
      { error: "Failed to fetch standings" },
      { status: 500 }
    );
  }
}
