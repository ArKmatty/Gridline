"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const SOURCES = ["All", "RaceFans", "Autosport", "BBC Sport"];

export function NewsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "All";

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {SOURCES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => {
            const next = new URLSearchParams(searchParams.toString());
            if (s === "All") next.delete("source");
            else next.set("source", s);
            router.push(`${pathname}?${next.toString()}`);
          }}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium",
            source === s
              ? "border-accent bg-accent-soft text-white"
              : "border-border text-muted hover:text-foreground",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
