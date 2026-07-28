import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, MapPin, Zap } from "lucide-react";
import { SeasonSelect } from "@/components/ui/season-select";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { LocalDate, LocalTimeOnly, TimezoneHint } from "@/components/ui/local-time";
import { CalendarExportButton } from "@/components/calendar/export-button";
import { getSeasonSchedule } from "@/lib/jolpica";
import { currentSeason } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Calendar",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const season = Number(params.season) || currentSeason();
  const filter = params.filter ?? "all";
  const races = await getSeasonSchedule(season).catch(() => []);
  const now = new Date().getTime();

  const filtered = races.filter((race) => {
    const raceTs = new Date(
      `${race.date}T${race.time ?? "00:00:00Z"}`,
    ).getTime();
    const done = raceTs < now - 4 * 60 * 60 * 1000;
    if (filter === "upcoming") return !done;
    if (filter === "completed") return done;
    if (filter === "sprint") return Boolean(race.Sprint);
    return true;
  });

  return (
    <div>
      <SectionHeader
        icon={CalendarDays}
        title="Race calendar"
        subtitle={`${season} Formula 1 world championship schedule.`}
        action={
          <div className="flex items-center gap-2">
            <CalendarExportButton races={races} season={season} />
            <Suspense fallback={null}>
              <SeasonSelect value={season} />
            </Suspense>
          </div>
        }
      />
      <TimezoneHint className="mb-4" />

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: "all", label: "All" },
          { id: "upcoming", label: "Upcoming" },
          { id: "completed", label: "Completed" },
          { id: "sprint", label: "Sprint" },
        ].map((f) => (
          <a
            key={f.id}
            href={`/calendar?season=${season}&filter=${f.id}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              filter === f.id
                ? "border-accent bg-accent-soft text-white"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {f.label}
          </a>
        ))}
      </div>

      {!filtered.length ? (
        <EmptyState
          icon={CalendarDays}
          title="No races found"
          description="Try another filter or season."
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((race) => {
            const raceTs = new Date(
              `${race.date}T${race.time ?? "00:00:00Z"}`,
            ).getTime();
            const done = raceTs < now - 4 * 60 * 60 * 1000;
            const upcoming = !done && raceTs - now < 14 * 86400000;

            return (
              <Link
                key={`${race.season}-${race.round}`}
                href={`/races/${race.season}/${race.round}`}
                className="card card-hover flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-black/30">
                    <span className="text-[10px] uppercase text-muted">R</span>
                    <span className="font-mono text-lg font-bold">
                      {race.round}
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{race.raceName}</h2>
                      {done && <Badge>Completed</Badge>}
                      {upcoming && (
                        <Badge className="border-accent/40 bg-accent-soft text-red-200">
                          Soon
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {race.Circuit.circuitName}
                    </p>
                    <p className="text-xs text-muted">
                      {race.Circuit.Location.locality},{" "}
                      {race.Circuit.Location.country}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium">
                    <LocalDate date={race.date} time={race.time} />
                  </p>
                  {race.time && (
                    <p className="text-xs">
                      <LocalTimeOnly date={race.date} time={race.time} />
                    </p>
                  )}
                  {race.Sprint && (
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-warning">
                      <Zap className="h-3 w-3" />
                      Sprint weekend
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
