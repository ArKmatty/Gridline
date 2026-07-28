import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Badge } from "@/components/ui/badge";
import { PodiumBadge } from "@/components/ui/podium-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { ShareButton } from "@/components/ui/share-button";
import {
  getDriver,
  getDriverResults,
  getDriverStandings,
} from "@/lib/jolpica";
import { getDriverHeadshots } from "@/lib/openf1";
import { currentSeason, formatPoints } from "@/lib/utils";
import { getTeamColor } from "@/lib/team-colors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driver = await getDriver(id).catch(() => null);
  return {
    title: driver
      ? `${driver.givenName} ${driver.familyName}`
      : "Driver",
  };
}

export default async function DriverDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const season = Number(sp.season) || currentSeason();

  const [driver, results, standings, headshots] = await Promise.all([
    getDriver(id).catch(() => null),
    getDriverResults(id, season).catch(() => []),
    getDriverStandings(season).catch(() => []),
    getDriverHeadshots(season).catch(() => new Map()),
  ]);

  if (!driver) notFound();

  const standing = standings.find((s) => s.Driver.driverId === id);
  const team = standing?.Constructors[0];
  const color = getTeamColor(team?.constructorId ?? "");
  const headshot = driver.code ? headshots.get(driver.code) : undefined;

  const points = results.reduce((sum, race) => {
    const r = race.Results?.[0];
    return sum + (r ? parseFloat(r.points) || 0 : 0);
  }, 0);

  const wins = results.filter((race) => race.Results?.[0]?.position === "1")
    .length;
  const podiums = results.filter((race) => {
    const pos = Number(race.Results?.[0]?.position);
    return pos >= 1 && pos <= 3;
  }).length;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/drivers?season=${season}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Drivers
        </Link>
        <div className="mt-3 flex items-start gap-4">
          {headshot ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-3" style={{ borderColor: color, borderWidth: "3px" }}>
              <Image
                src={headshot}
                alt={`${driver.givenName} ${driver.familyName}`}
                fill
                className="object-cover"
                sizes="80px"
                priority
              />
            </div>
          ) : (
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-3 text-2xl font-bold"
              style={{ backgroundColor: color + "20", borderColor: color, color, borderWidth: "3px" }}
            >
              {driver.code ?? driver.permanentNumber ?? "?"}
            </div>
          )}
          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
            <SectionHeader
              className="mb-0"
              title={`${driver.givenName} ${driver.familyName}`}
              subtitle={[
                driver.nationality,
                driver.dateOfBirth
                  ? `Born ${driver.dateOfBirth}`
                  : null,
                team?.name,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
            <FavoriteButton
              item={{
                type: "driver",
                id: driver.driverId,
                name: `${driver.givenName} ${driver.familyName}`,
                code: driver.code,
                team: team?.name,
              }}
            />
            <ShareButton
              title={`${driver.givenName} ${driver.familyName}`}
              size="sm"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {driver.code && <Badge>{driver.code}</Badge>}
          {driver.permanentNumber && (
            <Badge>#{driver.permanentNumber}</Badge>
          )}
          {standing && <Badge>P{standing.position} · {season}</Badge>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Season points", value: formatPoints(points) },
          { label: "Wins", value: String(wins) },
          { label: "Podiums", value: String(podiums) },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs uppercase tracking-wider text-muted">
              {stat.label}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="card p-2 sm:p-4">
        <h2 className="mb-3 px-2 pt-2 font-semibold sm:px-0">
          {season} results
        </h2>
        {!results.length ? (
          <p className="px-2 py-6 text-sm text-muted">
            No results for this season.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                  <th className="px-3 py-3 font-medium">Rnd</th>
                  <th className="px-3 py-3 font-medium">Grand Prix</th>
                  <th className="px-3 py-3 font-medium text-right">Grid</th>
                  <th className="px-3 py-3 font-medium text-right">Finish</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {results.map((race) => {
                  const r = race.Results?.[0];
                  if (!r) return null;
                  const isPodium = ["1", "2", "3"].includes(r.position);
                  return (
                    <tr
                      key={`${race.season}-${race.round}`}
                      className="table-row-hover border-b border-border/60"
                    >
                      <td className="px-3 py-3 font-mono text-muted">
                        {race.round}
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/races/${race.season}/${race.round}`}
                          className="font-medium hover:text-accent"
                        >
                          {race.raceName}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted">
                        {r.grid}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold">
                        {isPodium ? (
                          <div className="flex items-center justify-end gap-2">
                            <PodiumBadge position={r.position} />
                            <span>{r.positionText}</span>
                          </div>
                        ) : (
                          r.positionText
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">
                        {r.Time?.time ?? r.status}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums font-semibold">
                        {formatPoints(r.points)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
