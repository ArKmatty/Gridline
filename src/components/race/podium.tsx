import Image from "next/image";
import Link from "next/link";
import type { RaceResult } from "@/lib/types";
import { getTeamColor } from "@/lib/team-colors";
import { PodiumBadge } from "@/components/ui/podium-badge";

function PodiumCard({ result, position, headshot }: { result: RaceResult; position: "1" | "2" | "3"; headshot?: string }) {
  const color = getTeamColor(result.Constructor.constructorId);
  const isP1 = position === "1";

  return (
    <Link
      href={`/drivers/${result.Driver.driverId}`}
      className="group relative flex flex-col items-center rounded-2xl border border-border bg-black/20 p-4 transition hover:border-accent/40 hover:bg-black/30"
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <PodiumBadge position={position} />
      </div>

      {headshot ? (
        <div className={`relative overflow-hidden rounded-full border-2 transition group-hover:scale-105 ${isP1 ? "h-20 w-20" : "h-16 w-16"}`} style={{ borderColor: color }}>
          <Image src={headshot} alt={`${result.Driver.givenName} ${result.Driver.familyName}`} fill className="object-cover" />
        </div>
      ) : (
        <div
          className={`mt-2 flex h-16 w-16 items-center justify-center rounded-full border-2 text-lg font-bold transition group-hover:scale-105 ${isP1 ? "h-20 w-20 text-xl" : ""}`}
          style={{
            backgroundColor: color + "20",
            borderColor: color,
            color,
          }}
        >
          {result.Driver.code ?? result.Driver.permanentNumber ?? "?"}
        </div>
      )}

      <div className="mt-3 text-center">
        <p className={`font-semibold ${isP1 ? "text-base" : "text-sm"}`}>
          {result.Driver.givenName}
        </p>
        <p className={`font-bold ${isP1 ? "text-lg" : "text-base"}`}>
          {result.Driver.familyName}
        </p>
        <p className="mt-1 text-xs text-muted">{result.Constructor.name}</p>
        <p className="mt-2 font-mono text-xs text-muted">
          {result.Time?.time ?? result.status}
        </p>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
        style={{ backgroundColor: color }}
      />
    </Link>
  );
}

export function RacePodium({ results, headshots }: { results: RaceResult[]; headshots?: Map<string, string> }) {
  const podium = results.filter((r) => ["1", "2", "3"].includes(r.position));
  if (podium.length < 3) return null;

  const p1 = podium.find((r) => r.position === "1")!;
  const p2 = podium.find((r) => r.position === "2")!;
  const p3 = podium.find((r) => r.position === "3")!;

  return (
    <div className="grid grid-cols-3 items-end gap-3">
      <div className="translate-y-4">
        <PodiumCard result={p2} position="2" headshot={p2.Driver.code ? headshots?.get(p2.Driver.code) : undefined} />
      </div>
      <div>
        <PodiumCard result={p1} position="1" headshot={p1.Driver.code ? headshots?.get(p1.Driver.code) : undefined} />
      </div>
      <div className="translate-y-6">
        <PodiumCard result={p3} position="3" headshot={p3.Driver.code ? headshots?.get(p3.Driver.code) : undefined} />
      </div>
    </div>
  );
}
