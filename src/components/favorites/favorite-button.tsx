"use client";

import { Star } from "lucide-react";
import { useFavorites, useHasMounted } from "@/hooks/use-favorites";
import type { Favorite } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  item,
  className,
  size = "md",
}: {
  item: Favorite;
  className?: string;
  size?: "sm" | "md";
}) {
  const { has, toggle } = useFavorites();
  const mounted = useHasMounted();
  const active = mounted && has(item.type, item.id);

  return (
    <button
      type="button"
      aria-label={active ? "Remove favorite" : "Add favorite"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={cn(
        "rounded-lg border border-border p-1.5 transition hover:bg-white/5",
        active && "border-warning/40 bg-warning/10 text-warning",
        !active && "text-muted",
        size === "sm" && "p-1",
        className,
      )}
    >
      <Star
        aria-hidden="true"
        className={cn(
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
          active && "fill-current",
        )}
      />
    </button>
  );
}
