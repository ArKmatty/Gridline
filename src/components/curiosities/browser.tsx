"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Cpu,
  Flag,
  History,
  Lightbulb,
  Map,
  Medal,
  Radio,
  Scale,
  Shield,
  Shuffle,
  Sparkles,
  Timer,
  Trophy,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Curiosity } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  History: History,
  Traditions: Flag,
  Tech: Cpu,
  Safety: Shield,
  Strategy: Wrench,
  Rules: Scale,
  Circuits: Map,
  "Race day": Timer,
  Broadcast: Radio,
  Championship: Trophy,
  "This season": Medal,
  All: Sparkles,
};

function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Lightbulb;
}

export function CuriositiesBrowser({
  items,
  derived,
}: {
  items: Curiosity[];
  derived: Curiosity[];
}) {
  const all = useMemo(() => [...derived, ...items], [derived, items]);
  const categories = useMemo(() => {
    const set = new Set(all.map((i) => i.category));
    return ["All", ...Array.from(set).sort()];
  }, [all]);

  const [category, setCategory] = useState("All");
  const [seed, setSeed] = useState(0);

  const filtered = useMemo(() => {
    return category === "All"
      ? all
      : all.filter((i) => i.category === category);
  }, [all, category]);

  const shuffled = useMemo(() => {
    const arr = [...filtered];
    if (!seed) return arr;
    let s = seed || 1;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 16807 + 7) % 2147483647;
      const j = s % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [filtered, seed]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const Icon = categoryIcon(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  category === c
                    ? "border-accent bg-accent-soft text-white"
                    : "border-border text-muted hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {c}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-white/5"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {shuffled.map((item) => {
          const Icon = categoryIcon(item.category);
          return (
            <article key={item.id} className="card card-hover p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="icon-tile !h-8 !w-8">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <Badge>{item.category}</Badge>
              </div>
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </article>
          );
        })}
      </div>

      {!shuffled.length && (
        <div className="card flex flex-col items-center py-12 text-center">
          <BookOpen className="mb-3 h-8 w-8 text-muted" />
          <p className="text-sm text-muted">No curiosities in this category.</p>
        </div>
      )}
    </div>
  );
}
