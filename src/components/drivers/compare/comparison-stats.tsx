"use client";

import type { Driver, DriverStanding } from "@/lib/types";
import { getTeamColor } from "@/lib/team-colors";
import { formatPoints } from "@/lib/utils";
import { Trophy, Flag, Medal, Target } from "lucide-react";

interface ComparisonStatsProps {
  driver1: Driver;
  driver2: Driver;
  standing1: DriverStanding;
  standing2: DriverStanding;
}

export function ComparisonStats({
  driver1,
  driver2,
  standing1,
  standing2,
}: ComparisonStatsProps) {
  const team1 = standing1.Constructors[0];
  const team2 = standing2.Constructors[0];
  const color1 = getTeamColor(team1?.constructorId || "");
  const color2 = getTeamColor(team2?.constructorId || "");

  const stats = [
    {
      label: "Posizione",
      icon: Trophy,
      value1: standing1.position,
      value2: standing2.position,
      better1: parseInt(standing1.position) < parseInt(standing2.position),
    },
    {
      label: "Punti",
      icon: Target,
      value1: formatPoints(standing1.points),
      value2: formatPoints(standing2.points),
      better1: parseFloat(standing1.points) > parseFloat(standing2.points),
    },
    {
      label: "Vittorie",
      icon: Flag,
      value1: standing1.wins,
      value2: standing2.wins,
      better1: parseInt(standing1.wins) > parseInt(standing2.wins),
    },
  ];

  return (
    <div className="card p-6">
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div
            className="mx-auto mb-2 h-12 w-12 rounded-full border-4"
            style={{ borderColor: color1 }}
          />
          <p className="font-semibold">
            {driver1.givenName} {driver1.familyName}
          </p>
          {driver1.code && (
            <p className="text-xs text-muted">{driver1.code}</p>
          )}
        </div>
        <div className="text-center">
          <div
            className="mx-auto mb-2 h-12 w-12 rounded-full border-4"
            style={{ borderColor: color2 }}
          />
          <p className="font-semibold">
            {driver2.givenName} {driver2.familyName}
          </p>
          {driver2.code && (
            <p className="text-xs text-muted">{driver2.code}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="text-right">
              <span
                className={cn(
                  "font-mono text-lg font-bold",
                  stat.better1 && "text-accent"
                )}
              >
                {stat.value1}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-muted" />
              <span className="text-sm text-muted">{stat.label}</span>
            </div>
            <div className="text-left">
              <span
                className={cn(
                  "font-mono text-lg font-bold",
                  !stat.better1 && "text-accent"
                )}
              >
                {stat.value2}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
