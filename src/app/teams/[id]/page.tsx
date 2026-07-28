import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { ShareButton } from "@/components/ui/share-button";
import { TeamLogo } from "@/components/ui/team-logo";
import {
  getConstructor,
  getConstructorResults,
  getConstructorStandings,
} from "@/lib/jolpica";
import { currentSeason, formatPoints } from "@/lib/utils";

export const revalidate = 900;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getConstructor(id).catch(() => null);
  return { title: team?.name ?? "Team" };
}

export default async function TeamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const season = Number(sp.season) || currentSeason();

  const [team, results, standings] = await Promise.all([
    getConstructor(id).catch(() => null),
    getConstructorResults(id, season).catch(() => []),
    getConstructorStandings(season).catch(() => []),
  ]);

  if (!team) notFound();

  const standing = standings.find((s) => s.Constructor.constructorId === id);

  const points = results.reduce((sum, race) => {
    return (
      sum +
      (race.Results ?? []).reduce(
        (s, r) => s + (parseFloat(r.points) || 0),
        0,
      )
    );
  }, 0);

  const wins = results.filter((race) =>
    (race.Results ?? []).some((r) => r.position === "1"),
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/teams?season=${season}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Teams
        </Link>
        <div className="mt-3 flex items-start gap-4">
          <TeamLogo teamName={team.name} teamId={team.constructorId} size="lg" />
          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
            <SectionHeader
              className="mb-0"
              title={team.name}
              subtitle={team.nationality ?? undefined}
            />
            <FavoriteButton
              item={{
                type: "team",
                id: team.constructorId,
                name: team.name,
              }}
            />
            <ShareButton
              title={team.name}
              size="sm"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {standing && (
            <Badge>
              P{standing.position} · {formatPoints(standing.points)} pts
            </Badge>
          )}
          <Badge>{season}</Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-muted">
            Season points
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">
            {formatPoints(points)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-muted">
            Race wins
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">{wins}</p>
        </div>
      </div>

      <section className="card p-2 sm:p-4">
        <h2 className="mb-3 px-2 pt-2 font-semibold sm:px-0">
          {season} race results
        </h2>
        {!results.length ? (
          <p className="px-2 py-6 text-sm text-muted">
            No results for this season.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                  <th className="px-3 py-3 font-medium">Rnd</th>
                  <th className="px-3 py-3 font-medium">Grand Prix</th>
                  <th className="px-3 py-3 font-medium">Drivers</th>
                  <th className="px-3 py-3 font-medium text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {results.map((race) => {
                  const racePts = (race.Results ?? []).reduce(
                    (s, r) => s + (parseFloat(r.points) || 0),
                    0,
                  );
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
                      <td className="px-3 py-3 text-xs text-muted">
                        {(race.Results ?? [])
                          .map(
                            (r) =>
                              `${r.Driver.code ?? r.Driver.familyName} P${r.positionText}`,
                          )
                          .join(" · ")}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">
                        {formatPoints(racePts)}
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
