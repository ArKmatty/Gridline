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

let cachedSnapshot: string | null = null;
let cachedParsed: Favorite[] | null = null;

function getSnapshot() {
  if (cachedSnapshot === null) {
    cachedParsed = readFavorites();
    cachedSnapshot = JSON.stringify(cachedParsed);
  }
  return cachedSnapshot;
}

function invalidateSnapshot() {
  cachedSnapshot = null;
  cachedParsed = null;
}

function subscribe(cb: () => void) {
  const handler = () => {
    invalidateSnapshot();
    cb();
  };
  window.addEventListener("storage", handler);
  window.addEventListener("gridline-favorites", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("gridline-favorites", handler);
  };
}

function getServerSnapshot() {
  return "[]";
}

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Use cached parsed result if available (from getSnapshot), otherwise parse
  const favorites: Favorite[] = cachedParsed ?? (JSON.parse(raw) as Favorite[]);

  const toggle = useCallback((item: Favorite) => {
    const next = toggleFavorite(item, readFavorites());
    writeFavorites(next);
    invalidateSnapshot();
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
