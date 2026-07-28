import { Medal } from "lucide-react";

const PODIUM: Record<string, { color: string; bg: string; label: string }> = {
  "1": { color: "text-amber-400", bg: "bg-amber-400/15", label: "1st place" },
  "2": { color: "text-zinc-300", bg: "bg-zinc-300/15", label: "2nd place" },
  "3": { color: "text-amber-600", bg: "bg-amber-600/15", label: "3rd place" },
};

export function PodiumBadge({ position }: { position: string }) {
  const config = PODIUM[position];
  if (!config) return null;

  return (
    <span
      title={config.label}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${config.bg}`}
    >
      <Medal className={`h-3.5 w-3.5 ${config.color}`} aria-hidden="true" />
    </span>
  );
}
