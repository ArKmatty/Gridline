"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";

export function DriversFilter({
  season,
  initial,
}: {
  season: number;
  initial: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initial);
  const [pending, startTransition] = useTransition();

  function updateFilter(value: string) {
    setQ(value);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set("season", String(season));
      if (value.trim()) params.set("q", value.trim());
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <label className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <Search className="h-4 w-4 shrink-0 text-muted" />
      <input
        value={q}
        onChange={(e) => updateFilter(e.target.value)}
        placeholder="Filter drivers…"
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
      />
      {q && (
        <button
          type="button"
          onClick={() => updateFilter("")}
          className="rounded p-0.5 text-muted hover:text-foreground"
          aria-label="Clear filter"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {pending && (
        <span className="text-[10px] text-muted">…</span>
      )}
    </label>
  );
}
