"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  FAVORITES_KEY,
  type Favorite,
  isFavorite,
  readFavorites,
  toggleFavorite,
  writeFavorites,
} from "@/lib/favorites";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("gridline-favorites", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("gridline-favorites", cb);
  };
}

function getSnapshot() {
  return JSON.stringify(readFavorites());
}

function getServerSnapshot() {
  return "[]";
}

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const favorites: Favorite[] = JSON.parse(raw) as Favorite[];

  const toggle = useCallback((item: Favorite) => {
    const next = toggleFavorite(item, readFavorites());
    writeFavorites(next);
    window.dispatchEvent(new Event("gridline-favorites"));
  }, []);

  const has = useCallback(
    (type: Favorite["type"], id: string) => isFavorite(favorites, type, id),
    [favorites],
  );

  return { favorites, toggle, has };
}

/** Avoid hydration flash: only show true after mount */
export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export { FAVORITES_KEY };
