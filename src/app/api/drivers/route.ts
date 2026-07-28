import { NextResponse } from "next/server";
import { getDrivers } from "@/lib/jolpica";

export const revalidate = 3600;

export async function GET() {
  try {
    const drivers = await getDrivers();
    return NextResponse.json(drivers);
  } catch (error) {
    console.error("Failed to fetch drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
