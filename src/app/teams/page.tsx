import Link from "next/link";
import { Suspense } from "react";
import { Building2 } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { SeasonSelect } from "@/components/ui/season-select";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { TeamLogo } from "@/components/ui/team-logo";
import {
  getConstructorStandings,
  getConstructors,
} from "@/lib/jolpica";
import { currentSeason, formatPoints } from "@/lib/utils";
import { getTeamColor } from "@/lib/team-colors";

export const metadata = {
  title: "Teams",
};

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const params = await searchParams;
  const season = Number(params.season) || currentSeason();

  const [constructors, standings] = await Promise.all([
    getConstructors(season).catch(() => []),
    getConstructorStandings(season).catch(() => []),
  ]);

  const standingById = new Map(
    standings.map((s) => [s.Constructor.constructorId, s]),
  );

  const list = constructors.length
    ? constructors
    : standings.map((s) => s.Constructor);

  const sorted = [...list].sort((a, b) => {
    const pa = Number(standingById.get(a.constructorId)?.position ?? 99);
    const pb = Number(standingById.get(b.constructorId)?.position ?? 99);
    return pa - pb;
  });

  return (
    <div>
      <SectionHeader
        icon={Building2}
        title="Teams"
        subtitle={`${season} constructors — star your favorites.`}
        action={
          <Suspense fallback={null}>
            <SeasonSelect value={season} />
          </Suspense>
        }
      />

      {!sorted.length ? (
        <EmptyState icon={Building2} title="No teams found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((team) => {
            const standing = standingById.get(team.constructorId);
            const color = getTeamColor(team.constructorId);
            return (
              <div
                key={team.constructorId}
                className="card card-hover relative overflow-hidden"
              >
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: color }}
                />
                <div className="absolute right-3 top-4">
                  <FavoriteButton
                    size="sm"
                    item={{
                      type: "team",
                      id: team.constructorId,
                      name: team.name,
                    }}
                  />
                </div>
                <Link
                  href={`/teams/${team.constructorId}?season=${season}`}
                  className="block p-4 pr-12"
                >
                  <div className="flex items-start gap-3">
                    <TeamLogo teamName={team.name} teamId={team.constructorId} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold">{team.name}</h2>
                      <p className="mt-1 text-xs text-muted">
                        {team.nationality ?? "—"}
                      </p>
                    </div>
                    {standing && (
                      <div className="text-right">
                        <p className="font-mono text-lg font-bold">
                          {formatPoints(standing.points)}
                        </p>
                        <p className="text-[11px] text-muted">
                          P{standing.position} · {standing.wins} wins
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
