import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Flag, MapPin } from "lucide-react";
import { ResultsTable } from "@/components/race/results-table";
import { RacePodium } from "@/components/race/podium";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { ShareButton } from "@/components/ui/share-button";
import { LocalDateTime, TimezoneHint } from "@/components/ui/local-time";
import {
  getQualifyingResults,
  getRaceResults,
  getSeasonSchedule,
  getSprintResults,
} from "@/lib/jolpica";
import { getDriverHeadshots } from "@/lib/openf1";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ season: string; round: string }>;
}) {
  const { season, round } = await params;
  return { title: `Round ${round} · ${season}` };
}

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ season: string; round: string }>;
}) {
  const { season, round } = await params;

  const [race, schedule, qualifying, sprint, headshots] = await Promise.all([
    getRaceResults(season, round).catch(() => null),
    getSeasonSchedule(season).catch(() => []),
    getQualifyingResults(season, round).catch(() => null),
    getSprintResults(season, round).catch(() => null),
    getDriverHeadshots(Number(season)).catch(() => new Map()),
  ]);

  const meta =
    race ?? schedule.find((r) => r.round === String(Number(round)));

  if (!meta) notFound();

  const sessions = [
    { label: "FP1", data: meta.FirstPractice },
    { label: "FP2", data: meta.SecondPractice },
    { label: "FP3", data: meta.ThirdPractice },
    { label: "Sprint Qualifying", data: meta.SprintQualifying ?? meta.SprintShootout },
    { label: "Sprint", data: meta.Sprint },
    { label: "Qualifying", data: meta.Qualifying },
    {
      label: "Race",
      data: { date: meta.date, time: meta.time },
    },
  ].filter((s) => s.data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qualiResults: any[] = qualifying?.QualifyingResults ?? [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/calendar?season=${season}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Calendar
        </Link>
        <SectionHeader
          className="mt-3"
          icon={Flag}
          title={meta.raceName}
          subtitle={`${meta.Circuit.circuitName} · ${meta.Circuit.Location.locality}, ${meta.Circuit.Location.country}`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Season {season}</Badge>
          <Badge>Round {round}</Badge>
          <Badge>
            <LocalDateTime date={meta.date} time={meta.time} showUtc={false} />
          </Badge>
          <ShareButton
            title={`${meta.raceName} - ${season} Round ${round}`}
            className="ml-auto"
          />
        </div>
        <TimezoneHint className="mt-2" />
      </div>

      <section className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4 text-accent" />
          Weekend sessions
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-black/20 px-3 py-3"
            >
              <p className="text-xs uppercase tracking-wider text-muted">
                {s.label}
              </p>
              <p className="mt-1 text-sm font-medium">
                {s.data && (
                  <LocalDateTime date={s.data.date} time={s.data.time} />
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-2 sm:p-4">
        <h2 className="mb-3 flex items-center gap-2 px-2 pt-2 font-semibold sm:px-0">
          <MapPin className="h-4 w-4 text-accent" />
          Race results
        </h2>
        {race?.Results?.length ? (
          <>
            <div className="mb-4 px-2 sm:px-0">
              <RacePodium results={race.Results} headshots={headshots} />
            </div>
            <ResultsTable results={race.Results} />
          </>
        ) : (
          <EmptyState
            icon={Flag}
            title="Results not available"
            description="This race may not have been run yet, or results are still being published."
          />
        )}
      </section>

      {sprint?.SprintResults?.length > 0 && (
        <section className="card p-2 sm:p-4">
          <h2 className="mb-3 px-2 pt-2 font-semibold sm:px-0">
            Sprint results
          </h2>
          <ResultsTable results={sprint.SprintResults} />
        </section>
      )}

      {qualiResults.length > 0 && (
        <section className="card p-2 sm:p-4">
          <h2 className="mb-3 px-2 pt-2 font-semibold sm:px-0">Qualifying</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                  <th className="px-3 py-3 font-medium">Pos</th>
                  <th className="px-3 py-3 font-medium">Driver</th>
                  <th className="px-3 py-3 font-medium">Q1</th>
                  <th className="px-3 py-3 font-medium">Q2</th>
                  <th className="px-3 py-3 font-medium">Q3</th>
                </tr>
              </thead>
              <tbody>
                {qualiResults.map((q) => (
                  <tr
                    key={q.Driver.driverId}
                    className="table-row-hover border-b border-border/60"
                  >
                    <td className="px-3 py-3 font-mono">{q.position}</td>
                    <td className="px-3 py-3 font-medium">
                      <Link
                        href={`/drivers/${q.Driver.driverId}`}
                        className="hover:text-accent"
                      >
                        {q.Driver.givenName} {q.Driver.familyName}
                      </Link>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted">
                      {q.Q1 ?? "—"}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted">
                      {q.Q2 ?? "—"}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted">
                      {q.Q3 ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
