import { NextRequest, NextResponse } from "next/server";
import {
  getConstructors,
  getDrivers,
  getSeasonSchedule,
} from "@/lib/jolpica";
import { currentSeason } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const season = currentSeason();

  try {
    const [drivers, teams, races] = await Promise.all([
      getDrivers(season).catch(() => []),
      getConstructors(season).catch(() => []),
      getSeasonSchedule(season).catch(() => []),
    ]);

    const results: {
      type: string;
      id: string;
      title: string;
      subtitle?: string;
      href: string;
    }[] = [];

    for (const d of drivers) {
      const name = `${d.givenName} ${d.familyName}`;
      const hay = `${name} ${d.code ?? ""} ${d.driverId}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          type: "driver",
          id: d.driverId,
          title: name,
          subtitle: d.code ?? d.nationality,
          href: `/drivers/${d.driverId}`,
        });
      }
    }

    for (const t of teams) {
      const hay = `${t.name} ${t.constructorId}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          type: "team",
          id: t.constructorId,
          title: t.name,
          subtitle: t.nationality,
          href: `/teams/${t.constructorId}`,
        });
      }
    }

    for (const r of races) {
      const hay =
        `${r.raceName} ${r.Circuit.circuitName} ${r.Circuit.Location.country} ${r.Circuit.Location.locality}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          type: "race",
          id: `${r.season}-${r.round}`,
          title: r.raceName,
          subtitle: `R${r.round} · ${r.Circuit.Location.country}`,
          href: `/races/${r.season}/${r.round}`,
        });
      }
    }

    return NextResponse.json(results.slice(0, 12), {
      headers: { "Cache-Control": "s-maxage=300" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Search failed" },
      { status: 502 },
    );
  }
}
