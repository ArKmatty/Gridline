"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { seasonOptions } from "@/lib/jolpica";

export function SeasonSelect({
  value,
  param = "season",
}: {
  value: number;
  param?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const years = seasonOptions(2018);

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="hidden sm:inline">Season</span>
      <select
        value={value}
        aria-label="Season"
        onChange={(e) => {
          const next = new URLSearchParams(searchParams.toString());
          next.set(param, e.target.value);
          router.push(`${pathname}?${next.toString()}`);
        }}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}
