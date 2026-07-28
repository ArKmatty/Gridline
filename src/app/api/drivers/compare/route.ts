import { NextResponse } from "next/server";
import { getSeasonSchedule, getRaceResults } from "@/lib/jolpica";

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const driver1 = searchParams.get("driver1");
  const driver2 = searchParams.get("driver2");

  if (!driver1 || !driver2) {
    return NextResponse.json(
      { error: "Both driver1 and driver2 parameters are required" },
      { status: 400 }
    );
  }

  try {
    const schedule = await getSeasonSchedule();
    const races = [];

    for (const race of schedule) {
      const results = await getRaceResults(race.season, race.round);
      
      if (!results?.Results) {
        races.push({
          round: race.round,
          raceName: race.raceName,
          driver1Position: null,
          driver2Position: null,
        });
        continue;
      }

      const driver1Result = results.Results.find(
        (r) => r.Driver.driverId === driver1
      );
      const driver2Result = results.Results.find(
        (r) => r.Driver.driverId === driver2
      );

      races.push({
        round: race.round,
        raceName: race.raceName,
        driver1Position: driver1Result ? parseInt(driver1Result.position) : null,
        driver2Position: driver2Result ? parseInt(driver2Result.position) : null,
      });
    }

    return NextResponse.json(races);
  } catch (error) {
    console.error("Failed to fetch comparison data:", error);
    return NextResponse.json(
      { error: "Failed to fetch comparison data" },
      { status: 500 }
    );
  }
}
