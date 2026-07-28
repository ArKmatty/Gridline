"use client";

import { useState, useEffect } from "react";
import type { Driver, DriverStanding } from "@/lib/types";
import { getTeamColor } from "@/lib/team-colors";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

interface HeadToHeadChartProps {
  driver1: Driver;
  driver2: Driver;
  standing1: DriverStanding;
  standing2: DriverStanding;
}

interface RaceResult {
  round: string;
  raceName: string;
  driver1Position: number | null;
  driver2Position: number | null;
}

export function HeadToHeadChart({ driver1, driver2, standing1, standing2 }: HeadToHeadChartProps) {
  const [races, setRaces] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRaces() {
      try {
        const res = await fetch(
          `/api/drivers/compare?driver1=${driver1.driverId}&driver2=${driver2.driverId}`
        );
        const data = await res.json();
        setRaces(data);
      } catch (error) {
        console.error("Failed to fetch race data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRaces();
  }, [driver1.driverId, driver2.driverId]);

  const team1 = standing1.Constructors[0];
  const team2 = standing2.Constructors[0];
  const color1 = getTeamColor(team1?.constructorId || "");
  const color2 = getTeamColor(team2?.constructorId || "");

  const driver1Wins = races.filter(
    (r) =>
      r.driver1Position !== null &&
      r.driver2Position !== null &&
      r.driver1Position < r.driver2Position
  ).length;

  const driver2Wins = races.filter(
    (r) =>
      r.driver1Position !== null &&
      r.driver2Position !== null &&
      r.driver2Position < r.driver1Position
  ).length;

  if (loading) {
    return (
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">Head-to-Head</h3>
        </div>
        <div className="text-center text-sm text-muted">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-accent" />
        <h3 className="font-semibold">Head-to-Head</h3>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ color: color1 }}>
            {driver1Wins}
          </p>
          <p className="text-sm text-muted">Vittorie</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ color: color2 }}>
            {driver2Wins}
          </p>
          <p className="text-sm text-muted">Vittorie</p>
        </div>
      </div>

      <div className="space-y-2">
        {races.map((race) => {
          const maxPos = 20;
          const pos1 = race.driver1Position || maxPos;
          const pos2 = race.driver2Position || maxPos;
          const winner1 =
            race.driver1Position !== null &&
            race.driver2Position !== null &&
            race.driver1Position < race.driver2Position;
          const winner2 =
            race.driver1Position !== null &&
            race.driver2Position !== null &&
            race.driver2Position < race.driver1Position;

          return (
            <div key={race.round} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>R{race.round}</span>
                <span>{race.raceName}</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-8 text-right font-mono text-sm",
                      winner1 && "font-bold"
                    )}
                    style={{ color: winner1 ? color1 : undefined }}
                  >
                    {race.driver1Position ? `P${race.driver1Position}` : "—"}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${((maxPos - pos1) / maxPos) * 100}%`,
                        backgroundColor: color1,
                        opacity: winner1 ? 1 : 0.5,
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted">vs</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${((maxPos - pos2) / maxPos) * 100}%`,
                        backgroundColor: color2,
                        opacity: winner2 ? 1 : 0.5,
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      "w-8 font-mono text-sm",
                      winner2 && "font-bold"
                    )}
                    style={{ color: winner2 ? color2 : undefined }}
                  >
                    {race.driver2Position ? `P${race.driver2Position}` : "—"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
