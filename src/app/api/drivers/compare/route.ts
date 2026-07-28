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
    const results = await Promise.allSettled(
      schedule.map((race) => getRaceResults(race.season, race.round))
    );

    const races = schedule.map((race, i) => {
      const data = results[i].status === "fulfilled" ? results[i].value : null;

      if (!data?.Results) {
        return {
          round: race.round,
          raceName: race.raceName,
          driver1Position: null,
          driver2Position: null,
        };
      }

      const driver1Result = data.Results.find(
        (r) => r.Driver.driverId === driver1
      );
      const driver2Result = data.Results.find(
        (r) => r.Driver.driverId === driver2
      );

      return {
        round: race.round,
        raceName: race.raceName,
        driver1Position: driver1Result ? parseInt(driver1Result.position) : null,
        driver2Position: driver2Result ? parseInt(driver2Result.position) : null,
      };
    });

    return NextResponse.json(races);
  } catch (error) {
    console.error("Failed to fetch comparison data:", error);
    return NextResponse.json(
      { error: "Failed to fetch comparison data" },
      { status: 500 }
    );
  }
}
