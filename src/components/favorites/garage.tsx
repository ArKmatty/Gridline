"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useFavorites, useHasMounted } from "@/hooks/use-favorites";
import { formatPoints } from "@/lib/utils";
import { getTeamColor } from "@/lib/team-colors";

export function GarageStrip({
  driverMeta,
  teamMeta,
}: {
  driverMeta: Record<
    string,
    { position: string; points: string; team?: string; teamId?: string }
  >;
  teamMeta: Record<string, { position: string; points: string }>;
}) {
  const { favorites } = useFavorites();
  const mounted = useHasMounted();

  if (!mounted || !favorites.length) return null;

  return (
    <section aria-labelledby="garage-heading" className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="icon-tile !h-8 !w-8">
          <Star className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <h2 id="garage-heading" className="font-semibold">Your garage</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((f) => {
          if (f.type === "driver") {
            const meta = driverMeta[f.id];
            const color = getTeamColor(meta?.teamId ?? f.team ?? "");
            return (
              <Link
                key={`d-${f.id}`}
                href={`/drivers/${f.id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-black/20 px-3 py-3 hover:border-accent/40"
              >
                <span
                  className="h-8 w-1 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted">
                    {meta
                      ? `P${meta.position} · ${formatPoints(meta.points)} pts`
                      : f.team ?? "Driver"}
                  </p>
                </div>
                <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" aria-hidden="true" />
              </Link>
            );
          }

          const meta = teamMeta[f.id];
          const color = getTeamColor(f.id);
          return (
            <Link
              key={`t-${f.id}`}
              href={`/teams/${f.id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-black/20 px-3 py-3 hover:border-accent/40"
            >
              <span
                className="h-8 w-1 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{f.name}</p>
                <p className="text-xs text-muted">
                  {meta
                    ? `P${meta.position} · ${formatPoints(meta.points)} pts`
                    : "Team"}
                </p>
              </div>
              <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
