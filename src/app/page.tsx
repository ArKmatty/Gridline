import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import {
  ArrowRight,
  CalendarDays,
  Flag,
  Gauge,
  MapPin,
  Newspaper,
  Sparkles,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { Countdown } from "@/components/countdown";
import { GarageStrip } from "@/components/favorites/garage";
import { NewsThumbRow } from "@/components/news/news-card";
import { Badge } from "@/components/ui/badge";
import { LocalDateTime } from "@/components/ui/local-time";
import { PodiumBadge } from "@/components/ui/podium-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getConstructorStandings,
  getDriverStandings,
  getLastRaceResults,
  getNextRace,
  getSeasonSchedule,
} from "@/lib/jolpica";
import { getDriverHeadshots } from "@/lib/openf1";
import { getNews } from "@/lib/news";
import { currentSeason, formatPoints } from "@/lib/utils";
import { getTeamColor } from "@/lib/team-colors";
import curiosities from "@/data/curiosities.json";

export const revalidate = 900;

async function HeroSection() {
  const [schedule] = await Promise.all([
    getSeasonSchedule().catch(() => []),
  ]);
  const nextRace = getNextRace(schedule);
  const nextRaceIso = nextRace
    ? `${nextRace.date}T${nextRace.time ?? "14:00:00Z"}`
    : null;

  return (
    <section className="card shine-border relative overflow-hidden p-6 sm:p-8">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <Badge className="mb-4 border-accent/40 bg-accent-soft text-red-200">
            <span className="pulse-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Unofficial F1 fan hub
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Stay on the <span className="gradient-text">Gridline</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Standings, race weekends, results, news, curiosities, and historical
            telemetry — everything a fan needs between lights out and the next
            podium.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/weekend"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              <Flag className="h-4 w-4" />
              Race weekend
            </Link>
            <Link
              href="/standings"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              <Trophy className="h-4 w-4" />
              Standings
            </Link>
            <Link
              href="/telemetry"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              <Gauge className="h-4 w-4" />
              Telemetry
            </Link>
          </div>
        </div>

        {nextRace && nextRaceIso && (
          <div className="rounded-2xl border border-border bg-black/30 p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
              <Timer className="h-3.5 w-3.5 text-accent" />
              Next up · Round {nextRace.round}
            </div>
            <h2 className="mt-2 text-xl font-bold">{nextRace.raceName}</h2>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {nextRace.Circuit.circuitName} ·{" "}
              {nextRace.Circuit.Location.locality},{" "}
              {nextRace.Circuit.Location.country}
            </p>
            <p className="mt-2 text-xs">
              <LocalDateTime date={nextRace.date} time={nextRace.time} />
            </p>
            <div className="mt-4">
              <Countdown target={nextRaceIso} />
            </div>
            <Link
              href="/weekend"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              Weekend hub <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

async function StandingsSection() {
  const [standings, constructors, headshots] = await Promise.all([
    getDriverStandings().catch(() => []),
    getConstructorStandings().catch(() => []),
    getDriverHeadshots(currentSeason()).catch(() => new Map()),
  ]);
  const topDrivers = standings.slice(0, 5);

  const driverMeta: Record<
    string,
    { position: string; points: string; team?: string; teamId?: string }
  > = {};
  for (const s of standings) {
    driverMeta[s.Driver.driverId] = {
      position: s.position,
      points: s.points,
      team: s.Constructors[0]?.name,
      teamId: s.Constructors[0]?.constructorId,
    };
  }
  const teamMeta: Record<string, { position: string; points: string }> = {};
  for (const s of constructors) {
    teamMeta[s.Constructor.constructorId] = {
      position: s.position,
      points: s.points,
    };
  }

  return (
    <>
      <GarageStrip driverMeta={driverMeta} teamMeta={teamMeta} />
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <span className="icon-tile !h-8 !w-8">
                <Trophy className="h-3.5 w-3.5" />
              </span>
              Drivers championship
            </h2>
            <Link
              href="/standings"
              className="text-xs text-muted hover:text-foreground"
            >
              Full table
            </Link>
          </div>
          <div className="space-y-2">
            {topDrivers.length === 0 && (
              <p className="text-sm text-muted">
                Standings unavailable right now.
              </p>
            )}
            {topDrivers.map((row) => {
              const team = row.Constructors[0];
              const color = getTeamColor(team?.constructorId ?? "");
              const isPodium = ["1", "2", "3"].includes(row.position);
              const headshot = row.Driver.code ? headshots.get(row.Driver.code) : undefined;
              return (
                <Link
                  key={row.Driver.driverId}
                  href={`/drivers/${row.Driver.driverId}`}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 hover:border-border hover:bg-white/[0.03]"
                >
                  <span className="w-6">
                    {isPodium ? (
                      <PodiumBadge position={row.position} />
                    ) : (
                      <span className="font-mono text-sm text-muted">{row.position}</span>
                    )}
                  </span>
                  {headshot ? (
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border" style={{ borderColor: color }}>
                      <Image
                        src={headshot}
                        alt={`${row.Driver.givenName} ${row.Driver.familyName}`}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <span
                      className="h-8 w-8 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: color + "20", borderColor: color, color }}
                    >
                      {row.Driver.code ?? "?"}
                    </span>
                  )}
                  <span className="flex-1 text-sm font-medium">
                    {row.Driver.givenName} {row.Driver.familyName}
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {formatPoints(row.points)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <LastRaceSection />
      </section>
    </>
  );
}

async function LastRaceSection() {
  const [lastRace, headshots] = await Promise.all([
    getLastRaceResults().catch(() => null),
    getDriverHeadshots(currentSeason()).catch(() => new Map()),
  ]);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <span className="icon-tile !h-8 !w-8">
            <Flag className="h-3.5 w-3.5" />
          </span>
          Latest race
        </h2>
        {lastRace && (
          <Link
            href={`/races/${lastRace.season}/${lastRace.round}`}
            className="text-xs text-muted hover:text-foreground"
          >
            Full results
          </Link>
        )}
      </div>
      {lastRace ? (
        <>
          <p className="text-sm font-semibold">{lastRace.raceName}</p>
          <p className="text-xs text-muted">
            Round {lastRace.round} · {lastRace.Circuit.Location.country}
          </p>
          <div className="mt-4 space-y-2">
            {lastRace.Results.slice(0, 5).map((r) => {
              const isPodium = ["1", "2", "3"].includes(r.position);
              const headshot = r.Driver.code ? headshots.get(r.Driver.code) : undefined;
              return (
                <div
                  key={r.Driver.driverId}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-6">
                    {isPodium ? (
                      <PodiumBadge position={r.position} />
                    ) : (
                      <span className="font-mono text-muted">{r.position}</span>
                    )}
                  </span>
                  {headshot ? (
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border">
                      <Image
                        src={headshot}
                        alt={`${r.Driver.givenName} ${r.Driver.familyName}`}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/20 text-xs font-bold text-muted">
                      {r.Driver.code ?? "?"}
                    </span>
                  )}
                <span className="flex-1">
                  {r.Driver.givenName} {r.Driver.familyName}
                </span>
                <span className="font-mono text-xs text-muted">
                  {r.Time?.time ?? r.status}
                </span>
              </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">No completed race results yet.</p>
      )}
    </div>
  );
}

async function NewsCuriositySection() {
  const [news] = await Promise.all([getNews(5).catch(() => [])]);
  const dayIndex =
    Math.floor(new Date().getTime() / 86_400_000) % curiosities.length;
  const curiosity = curiosities[dayIndex];

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <span className="icon-tile !h-8 !w-8">
              <Newspaper className="h-3.5 w-3.5" />
            </span>
            Latest news
          </h2>
          <Link
            href="/news"
            className="text-xs text-muted hover:text-foreground"
          >
            All news
          </Link>
        </div>
        <div className="divide-y divide-border">
          {news.length === 0 && (
            <p className="py-4 text-sm text-muted">News feeds unavailable.</p>
          )}
          {news.map((item) => (
            <NewsThumbRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <span className="icon-tile !h-8 !w-8">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          Curiosity of the day
        </h2>
        <Badge className="mb-3">{curiosity.category}</Badge>
        <h3 className="text-lg font-semibold">{curiosity.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {curiosity.body}
        </p>
        <Link
          href="/curiosities"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          More curiosities <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card space-y-3 p-5" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-5 w-32" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Suspense
        fallback={
          <div className="card space-y-4 p-6 sm:p-8" aria-busy="true" aria-label="Loading">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        }
      >
        <HeroSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionSkeleton lines={5} />
            <SectionSkeleton lines={5} />
          </div>
        }
      >
        <StandingsSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <SectionSkeleton lines={5} />
            <SectionSkeleton lines={4} />
          </div>
        }
      >
        <NewsCuriositySection />
      </Suspense>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            href: "/weekend",
            title: "Weekend hub",
            desc: "Sessions, weather, shortcuts",
            icon: Flag,
          },
          {
            href: "/calendar",
            title: "Race calendar",
            desc: "Full season schedule",
            icon: CalendarDays,
          },
          {
            href: "/drivers",
            title: "Drivers",
            desc: "Profiles and season form",
            icon: Users,
          },
          {
            href: "/telemetry",
            title: "Telemetry",
            desc: "Traces + track map",
            icon: Gauge,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card card-hover group p-5"
          >
            <span className="icon-tile mb-3 transition group-hover:scale-105">
              <item.icon className="h-4 w-4" />
            </span>
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-xs text-muted">{item.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
