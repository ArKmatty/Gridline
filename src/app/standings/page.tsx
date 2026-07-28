import { Suspense } from "react";
import { Building2, Trophy, Users } from "lucide-react";
import {
  ConstructorStandingsTable,
  DriverStandingsTable,
} from "@/components/standings/table";
import { SeasonSelect } from "@/components/ui/season-select";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getConstructorStandings,
  getDriverStandings,
} from "@/lib/jolpica";
import { currentSeason, cn } from "@/lib/utils";

export const metadata = {
  title: "Standings",
};

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string; tab?: string; team?: string }>;
}) {
  const params = await searchParams;
  const season = Number(params.season) || currentSeason();
  const tab = params.tab === "constructors" ? "constructors" : "drivers";
  const teamFilter = params.team || undefined;

  const [drivers, constructors] = await Promise.all([
    getDriverStandings(season).catch(() => []),
    getConstructorStandings(season).catch(() => []),
  ]);

  const teams = constructors.map((c) => c.Constructor);

  return (
    <div>
      <SectionHeader
        icon={Trophy}
        title="Championship standings"
        subtitle={`Driver and constructor leaderboards for the ${season} season. Gaps show points to leader / car ahead.`}
        action={
          <Suspense fallback={null}>
            <SeasonSelect value={season} />
          </Suspense>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <TabLink
          href={`/standings?season=${season}&tab=drivers`}
          active={tab === "drivers"}
          label="Drivers"
          icon={Users}
        />
        <TabLink
          href={`/standings?season=${season}&tab=constructors`}
          active={tab === "constructors"}
          label="Constructors"
          icon={Building2}
        />
      </div>

      {tab === "drivers" && teams.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <a
            href={`/standings?season=${season}&tab=drivers`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              !teamFilter
                ? "border-accent bg-accent-soft text-white"
                : "border-border text-muted",
            )}
          >
            All teams
          </a>
          {teams.map((t) => (
            <a
              key={t.constructorId}
              href={`/standings?season=${season}&tab=drivers&team=${t.constructorId}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                teamFilter === t.constructorId
                  ? "border-accent bg-accent-soft text-white"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              {t.name}
            </a>
          ))}
        </div>
      )}

      <div className="card p-2 sm:p-4">
        {tab === "drivers" ? (
          <DriverStandingsTable standings={drivers} teamFilter={teamFilter} />
        ) : (
          <ConstructorStandingsTable standings={constructors} />
        )}
      </div>
    </div>
  );
}

function TabLink({
  href,
  active,
  label,
  icon: Icon,
}: {
  href: string;
  active: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-white"
          : "inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}
