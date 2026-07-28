import Link from "next/link";
import {
  ArrowRight,
  CloudRain,
  Flag,
  Gauge,
  MapPin,
  Thermometer,
  Timer,
  Trophy,
  Wind,
} from "lucide-react";
import { Countdown } from "@/components/countdown";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { LocalDateTime, TimezoneHint } from "@/components/ui/local-time";
import {
  getDriverStandings,
  getLastRaceResults,
  getNextRace,
  getRaceResults,
  getSeasonSchedule,
} from "@/lib/jolpica";
import { getSessions, matchMeetingToRace, getWeather } from "@/lib/openf1";
import { formatPoints } from "@/lib/utils";
import { getTeamColor } from "@/lib/team-colors";
import type { Race, SessionTime } from "@/lib/types";

export const metadata = { title: "Race weekend" };
export const revalidate = 900;

function sessionList(race: Race) {
  const items: { label: string; data: SessionTime }[] = [];
  if (race.FirstPractice)
    items.push({ label: "FP1", data: race.FirstPractice });
  if (race.SecondPractice)
    items.push({ label: "FP2", data: race.SecondPractice });
  if (race.ThirdPractice)
    items.push({ label: "FP3", data: race.ThirdPractice });
  if (race.SprintQualifying || race.SprintShootout)
    items.push({
      label: "Sprint Qualifying",
      data: (race.SprintQualifying ?? race.SprintShootout)!,
    });
  if (race.Sprint) items.push({ label: "Sprint", data: race.Sprint });
  if (race.Qualifying)
    items.push({ label: "Qualifying", data: race.Qualifying });
  items.push({
    label: "Race",
    data: { date: race.date, time: race.time },
  });
  return items;
}

function nextSession(items: { label: string; data: SessionTime }[]) {
  const now = new Date().getTime();
  for (const s of items) {
    const ts = new Date(
      `${s.data.date}T${s.data.time ?? "12:00:00Z"}`,
    ).getTime();
    if (ts > now - 2 * 60 * 60 * 1000) return s;
  }
  return items[items.length - 1] ?? null;
}

export default async function WeekendPage() {
  const [schedule, standings, lastRace] = await Promise.all([
    getSeasonSchedule().catch(() => []),
    getDriverStandings().catch(() => []),
    getLastRaceResults().catch(() => null),
  ]);

  const race = getNextRace(schedule);
  if (!race) {
    return (
      <div>
        <SectionHeader
          icon={Flag}
          title="Race weekend"
          subtitle="No upcoming race found for this season."
        />
      </div>
    );
  }

  const sessions = sessionList(race);
  const upcoming = nextSession(sessions);
  const nextIso = upcoming
    ? `${upcoming.data.date}T${upcoming.data.time ?? "14:00:00Z"}`
    : `${race.date}T${race.time ?? "14:00:00Z"}`;

  const prevYear = Number(race.season) - 1;
  const lastYearResult = await getRaceResults(prevYear, race.round).catch(
    () => null,
  );
  const lastYearWinner = lastYearResult?.Results?.[0];

  const openf1Meeting = await matchMeetingToRace(
    Number(race.season),
    race.Circuit.Location.country,
    race.Circuit.circuitName,
  );

  let weather: Awaited<ReturnType<typeof getWeather>> = null;
  let telemetryHref = "/telemetry";
  if (openf1Meeting) {
    const ofSessions = await getSessions(openf1Meeting.meeting_key).catch(
      () => [],
    );
    const raceSession =
      ofSessions.find((s) => s.session_name === "Race") ??
      ofSessions[ofSessions.length - 1];
    if (raceSession) {
      weather = await getWeather(raceSession.session_key);
      telemetryHref = `/telemetry?year=${openf1Meeting.year}&meeting=${openf1Meeting.meeting_key}&session=${raceSession.session_key}`;
    } else {
      telemetryHref = `/telemetry?year=${openf1Meeting.year}&meeting=${openf1Meeting.meeting_key}`;
    }
  }

  const top = standings.slice(0, 5);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Flag}
        title="Race weekend hub"
        subtitle="Your companion for the next Grand Prix — sessions, standings, and shortcuts."
      />
      <TimezoneHint />

      <section className="card shine-border relative overflow-hidden p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge className="border-accent/40 bg-accent-soft text-red-200">
                Round {race.round}
              </Badge>
              {race.Sprint && (
                <Badge className="border-warning/40 text-warning">
                  Sprint weekend
                </Badge>
              )}
            </div>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              {race.raceName}
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-3.5 w-3.5" />
              {race.Circuit.circuitName} · {race.Circuit.Location.locality},{" "}
              {race.Circuit.Location.country}
            </p>
            <p className="mt-2 text-sm">
              <LocalDateTime date={race.date} time={race.time} />
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/races/${race.season}/${race.round}`}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
              >
                Full weekend <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={telemetryHref}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-white/5"
              >
                <Gauge className="h-4 w-4" />
                Telemetry
              </Link>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-white/5"
              >
                News
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-black/30 p-5">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
              <Timer className="h-3.5 w-3.5 text-accent" />
              Next: {upcoming?.label ?? "Race"}
            </p>
            <div className="mt-3">
              <Countdown target={nextIso} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Timer className="h-4 w-4 text-accent" />
            Session timeline
          </h3>
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-black/20 px-3 py-2.5"
              >
                <span className="text-sm font-medium">{s.label}</span>
                <span className="text-right text-xs sm:text-sm">
                  <LocalDateTime date={s.data.date} time={s.data.time} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {weather && (
            <div className="card p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <CloudRain className="h-4 w-4 text-accent" />
                Track conditions
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border bg-black/20 p-3">
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <Thermometer className="h-3 w-3" /> Air
                  </p>
                  <p className="mt-1 font-mono text-lg font-semibold">
                    {weather.air_temperature ?? "—"}°C
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-black/20 p-3">
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <Thermometer className="h-3 w-3" /> Track
                  </p>
                  <p className="mt-1 font-mono text-lg font-semibold">
                    {weather.track_temperature ?? "—"}°C
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-black/20 p-3">
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <Wind className="h-3 w-3" /> Wind
                  </p>
                  <p className="mt-1 font-mono text-lg font-semibold">
                    {weather.wind_speed ?? "—"} m/s
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-black/20 p-3">
                  <p className="text-xs text-muted">Rain</p>
                  <p className="mt-1 font-semibold">
                    {weather.rainfall ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted">
                From latest OpenF1 session sample when available.
              </p>
            </div>
          )}

          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Trophy className="h-4 w-4 text-accent" />
              Championship snapshot
            </h3>
            <div className="space-y-2">
              {top.map((row) => {
                const team = row.Constructors[0];
                const color = getTeamColor(team?.constructorId ?? "");
                return (
                  <Link
                    key={row.Driver.driverId}
                    href={`/drivers/${row.Driver.driverId}`}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-5 font-mono text-muted">
                      {row.position}
                    </span>
                    <span
                      className="h-6 w-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="flex-1 font-medium">
                      {row.Driver.familyName}
                    </span>
                    <span className="font-mono tabular-nums">
                      {formatPoints(row.points)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {lastYearWinner && (
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-muted">
                Last year · Round {race.round}
              </h3>
              <p className="font-semibold">
                {lastYearWinner.Driver.givenName}{" "}
                {lastYearWinner.Driver.familyName}
              </p>
              <p className="text-xs text-muted">
                {lastYearWinner.Constructor.name} ·{" "}
                {lastYearWinner.Time?.time ?? lastYearWinner.status}
              </p>
            </div>
          )}

          {lastRace && (
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-muted">
                Previous race
              </h3>
              <Link
                href={`/races/${lastRace.season}/${lastRace.round}`}
                className="font-semibold hover:text-accent"
              >
                {lastRace.raceName}
              </Link>
              <p className="mt-1 text-xs text-muted">
                Winner: {lastRace.Results[0]?.Driver.givenName}{" "}
                {lastRace.Results[0]?.Driver.familyName}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
