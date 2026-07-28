import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Users, ArrowLeftRight } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { SeasonSelect } from "@/components/ui/season-select";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getDriverStandings, getDrivers } from "@/lib/jolpica";
import { getDriverHeadshots } from "@/lib/openf1";
import { currentSeason, formatPoints } from "@/lib/utils";
import { getTeamColor } from "@/lib/team-colors";
import { DriversFilter } from "@/components/drivers/filter";

export const metadata = {
  title: "Drivers",
};

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string; q?: string }>;
}) {
  const params = await searchParams;
  const season = Number(params.season) || currentSeason();
  const q = (params.q || "").toLowerCase().trim();

  const [drivers, standings, headshots] = await Promise.all([
    getDrivers(season).catch(() => []),
    getDriverStandings(season).catch(() => []),
    getDriverHeadshots(season).catch(() => new Map()),
  ]);

  const standingById = new Map(standings.map((s) => [s.Driver.driverId, s]));

  const list = drivers.length ? drivers : standings.map((s) => s.Driver);

  let sorted = [...list].sort((a, b) => {
    const pa = Number(standingById.get(a.driverId)?.position ?? 99);
    const pb = Number(standingById.get(b.driverId)?.position ?? 99);
    return pa - pb;
  });

  if (q) {
    sorted = sorted.filter((d) =>
      `${d.givenName} ${d.familyName} ${d.code ?? ""} ${d.driverId}`
        .toLowerCase()
        .includes(q),
    );
  }

  return (
    <div>
      <SectionHeader
        icon={Users}
        title="Drivers"
        subtitle={`${season} grid — star favorites, tap for profile.`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/drivers/compare"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition hover:bg-accent/10"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden sm:inline">Confronta</span>
            </Link>
            <Suspense fallback={null}>
              <SeasonSelect value={season} />
            </Suspense>
          </div>
        }
      />

      <Suspense fallback={null}>
        <DriversFilter season={season} initial={params.q || ""} />
      </Suspense>

      {!sorted.length ? (
        <EmptyState icon={Users} title="No drivers found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((driver) => {
            const standing = standingById.get(driver.driverId);
            const team = standing?.Constructors[0];
            const color = getTeamColor(team?.constructorId ?? "");
            const headshot = driver.code ? headshots.get(driver.code) : undefined;
            return (
              <div key={driver.driverId} className="card card-hover relative p-4">
                <div className="absolute right-3 top-3">
                  <FavoriteButton
                    size="sm"
                    item={{
                      type: "driver",
                      id: driver.driverId,
                      name: `${driver.givenName} ${driver.familyName}`,
                      code: driver.code,
                      team: team?.name,
                    }}
                  />
                </div>
                <Link
                  href={`/drivers/${driver.driverId}?season=${season}`}
                  className="block pr-8"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {headshot ? (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: color }}>
                          <Image
                            src={headshot}
                            alt={`${driver.givenName} ${driver.familyName}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      ) : (
                        <span
                          className="h-14 w-14 shrink-0 rounded-full border-2 flex items-center justify-center text-lg font-bold"
                          style={{ backgroundColor: color + "20", borderColor: color, color }}
                        >
                          {driver.code ?? driver.permanentNumber ?? "?"}
                        </span>
                      )}
                      <div>
                        <p className="text-xs font-mono text-muted">
                          {driver.code ?? driver.permanentNumber ?? "—"}
                        </p>
                        <h2 className="font-semibold">
                          {driver.givenName} {driver.familyName}
                        </h2>
                        <p className="text-xs text-muted">
                          {team?.name ?? driver.nationality ?? "—"}
                        </p>
                      </div>
                    </div>
                    {standing && (
                      <div className="text-right">
                        <p className="font-mono text-lg font-bold">
                          {formatPoints(standing.points)}
                        </p>
                        <p className="text-[11px] text-muted">
                          P{standing.position}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
