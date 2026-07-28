import Link from "next/link";
import type { RaceResult } from "@/lib/types";
import { formatPoints } from "@/lib/utils";
import { getTeamColor } from "@/lib/team-colors";
import { TeamLogo } from "@/components/ui/team-logo";
import { PodiumBadge } from "@/components/ui/podium-badge";

function isRetired(positionText: string): boolean {
  return !/^\d+$/.test(positionText);
}

export function ResultsTable({ results }: { results: RaceResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-border bg-card text-xs uppercase tracking-wider text-muted">
            <th className="sticky top-0 bg-card px-3 py-3 font-medium">Pos</th>
            <th className="sticky top-0 bg-card px-3 py-3 font-medium">Driver</th>
            <th className="sticky top-0 bg-card px-3 py-3 font-medium">Team</th>
            <th className="sticky top-0 bg-card px-3 py-3 font-medium text-right">Grid</th>
            <th className="sticky top-0 bg-card px-3 py-3 font-medium text-right">Laps</th>
            <th className="sticky top-0 bg-card px-3 py-3 font-medium">Time / Status</th>
            <th className="sticky top-0 bg-card px-3 py-3 font-medium text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const color = getTeamColor(r.Constructor.constructorId);
            const timeOrStatus = r.Time?.time ?? r.status;
            const retired = isRetired(r.positionText);
            const isPodium = ["1", "2", "3"].includes(r.positionText);
            return (
              <tr
                key={`${r.Driver.driverId}-${r.position}`}
                className={`table-row-hover border-b border-border/60 ${retired ? "bg-red-500/5" : ""}`}
              >
                <td className="px-3 py-3 font-mono font-semibold tabular-nums">
                  {isPodium ? (
                    <PodiumBadge position={r.positionText} />
                  ) : (
                    <span className={retired ? "text-red-400" : ""}>
                      {r.positionText}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/drivers/${r.Driver.driverId}`}
                    className="flex items-center gap-3 hover:text-accent"
                  >
                    <span
                      className="h-8 w-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium">
                      {r.Driver.givenName} {r.Driver.familyName}
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-muted">
                  <Link
                    href={`/teams/${r.Constructor.constructorId}`}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    <TeamLogo teamName={r.Constructor.name} teamId={r.Constructor.constructorId} size="sm" />
                    <span className="hidden sm:inline">{r.Constructor.name}</span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-muted">
                  {r.grid}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-muted">
                  {r.laps}
                </td>
                <td className={`px-3 py-3 font-mono text-xs sm:text-sm ${retired ? "text-red-400" : ""}`}>
                  {timeOrStatus}
                  {r.FastestLap?.rank === "1" && (
                    <span className="ml-2 rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">
                      FL
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums">
                  {formatPoints(r.points)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
