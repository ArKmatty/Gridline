"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { ConstructorStanding, DriverStanding } from "@/lib/types";
import { formatPoints } from "@/lib/utils";
import { getTeamColor } from "@/lib/team-colors";
import { TeamLogo } from "@/components/ui/team-logo";
import { PodiumBadge } from "@/components/ui/podium-badge";
import { cn } from "@/lib/utils";

type SortField = "position" | "name" | "team" | "wins" | "points";
type SortDirection = "asc" | "desc";

function gapLabel(gap: number): string {
  if (gap === 0) return "—";
  return formatPoints(gap);
}

function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = currentField === field;
  return (
    <th
      className={cn(
        "sticky top-0 bg-card px-3 py-3 font-medium cursor-pointer select-none transition hover:bg-white/5",
        align === "right" && "text-right"
      )}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          direction === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        )}
      </span>
    </th>
  );
}

export function DriverStandingsTable({
  standings,
  teamFilter,
}: {
  standings: DriverStanding[];
  teamFilter?: string;
}) {
  const [sortField, setSortField] = useState<SortField>("position");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "name" || field === "team" ? "asc" : "desc");
    }
  };

  const filtered = useMemo(() => {
    const base = teamFilter
      ? standings.filter((s) =>
          s.Constructors.some((c) => c.constructorId === teamFilter),
        )
      : standings;

    return [...base].sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;

      switch (sortField) {
        case "position":
          return (parseInt(a.position) - parseInt(b.position)) * multiplier;
        case "name":
          return (
            `${a.Driver.givenName} ${a.Driver.familyName}`.localeCompare(
              `${b.Driver.givenName} ${b.Driver.familyName}`
            ) * multiplier
          );
        case "team": {
          const teamA = a.Constructors[0]?.name ?? "";
          const teamB = b.Constructors[0]?.name ?? "";
          return teamA.localeCompare(teamB) * multiplier;
        }
        case "wins":
          return (parseInt(a.wins) - parseInt(b.wins)) * multiplier;
        case "points":
          return (parseFloat(a.points) - parseFloat(b.points)) * multiplier;
        default:
          return 0;
      }
    });
  }, [standings, teamFilter, sortField, sortDirection]);

  if (!standings.length) {
    return (
      <p className="text-sm text-muted">
        No driver standings for this season yet.
      </p>
    );
  }

  const leaderPts = parseFloat(standings[0]?.points ?? "0") || 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-border bg-card text-xs uppercase tracking-wider text-muted">
            <SortableHeader
              label="Pos"
              field="position"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Driver"
              field="name"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Team"
              field="team"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Wins"
              field="wins"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
              align="right"
            />
            <SortableHeader
              label="Pts"
              field="points"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
              align="right"
            />
            <th className="sticky top-0 bg-card px-3 py-3 font-medium text-right">Gap</th>
            <th className="sticky top-0 bg-card px-3 py-3 font-medium text-right">Interval</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, idx) => {
            const team = row.Constructors[0];
            const color = getTeamColor(team?.constructorId ?? team?.name ?? "");
            const pts = parseFloat(row.points) || 0;
            const prevPts =
              idx > 0 ? parseFloat(filtered[idx - 1].points) || 0 : pts;
            const isPodium = ["1", "2", "3"].includes(row.position);
            return (
              <tr
                key={row.Driver.driverId}
                className="table-row-hover border-b border-border/60"
              >
                <td className="px-3 py-2.5 font-mono font-semibold tabular-nums">
                  {isPodium ? (
                    <PodiumBadge position={row.position} />
                  ) : (
                    row.position
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/drivers/${row.Driver.driverId}`}
                    className="group flex items-center gap-3"
                  >
                    <span
                      className="h-8 w-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span>
                      <span className="font-medium group-hover:text-accent">
                        {row.Driver.givenName} {row.Driver.familyName}
                      </span>
                      {row.Driver.code && (
                        <span className="ml-2 font-mono text-xs text-muted">
                          {row.Driver.code}
                        </span>
                      )}
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-muted">
                  {team ? (
                    <Link
                      href={`/teams/${team.constructorId}`}
                      className="flex items-center gap-2 hover:text-foreground"
                    >
                      <TeamLogo teamName={team.name} teamId={team.constructorId} size="sm" />
                      <span className="hidden sm:inline">{team.name}</span>
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted">
                  {row.wins}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {formatPoints(row.points)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted">
                  {gapLabel(leaderPts - pts)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted">
                  {idx === 0 ? "—" : gapLabel(prevPts - pts)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ConstructorStandingsTable({
  standings,
}: {
  standings: ConstructorStanding[];
}) {
  const [sortField, setSortField] = useState<SortField>("position");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    }
  };

  const sorted = useMemo(() => {
    return [...standings].sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;

      switch (sortField) {
        case "position":
          return (parseInt(a.position) - parseInt(b.position)) * multiplier;
        case "name":
          return a.Constructor.name.localeCompare(b.Constructor.name) * multiplier;
        case "wins":
          return (parseInt(a.wins) - parseInt(b.wins)) * multiplier;
        case "points":
          return (parseFloat(a.points) - parseFloat(b.points)) * multiplier;
        default:
          return 0;
      }
    });
  }, [standings, sortField, sortDirection]);

  if (!standings.length) {
    return (
      <p className="text-sm text-muted">
        No constructor standings for this season yet.
      </p>
    );
  }

  const max = Math.max(
    ...standings.map((s) => parseFloat(s.points) || 0),
    1,
  );
  const leaderPts = parseFloat(standings[0]?.points ?? "0") || 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-border bg-card text-xs uppercase tracking-wider text-muted">
            <SortableHeader
              label="Pos"
              field="position"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Constructor"
              field="name"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <th className="sticky top-0 bg-card px-3 py-3 font-medium">Points</th>
            <SortableHeader
              label="Wins"
              field="wins"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
              align="right"
            />
            <SortableHeader
              label="Pts"
              field="points"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
              align="right"
            />
            <th className="sticky top-0 bg-card px-3 py-3 font-medium text-right">Gap</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => {
            const color = getTeamColor(row.Constructor.constructorId);
            const pts = parseFloat(row.points) || 0;
            const width = `${(pts / max) * 100}%`;
            const isPodium = ["1", "2", "3"].includes(row.position);
            return (
              <tr
                key={row.Constructor.constructorId}
                className="table-row-hover border-b border-border/60"
              >
                <td className="px-3 py-2.5 font-mono font-semibold tabular-nums">
                  {isPodium ? (
                    <PodiumBadge position={row.position} />
                  ) : (
                    row.position
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/teams/${row.Constructor.constructorId}`}
                    className="flex items-center gap-3 font-medium hover:text-accent"
                  >
                    <TeamLogo teamName={row.Constructor.name} teamId={row.Constructor.constructorId} size="sm" />
                    {row.Constructor.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5">
                  <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width, backgroundColor: color }}
                    />
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted">
                  {row.wins}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {formatPoints(row.points)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted">
                  {idx === 0 ? "—" : gapLabel(leaderPts - pts)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
