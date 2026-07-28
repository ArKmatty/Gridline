export type FavoriteDriver = {
  type: "driver";
  id: string;
  name: string;
  code?: string;
  team?: string;
};

export type FavoriteTeam = {
  type: "team";
  id: string;
  name: string;
};

export type Favorite = FavoriteDriver | FavoriteTeam;

export const FAVORITES_KEY = "gridline-favorites";
export const RECENT_TELEMETRY_KEY = "gridline-recent-telemetry";

export type RecentTelemetry = {
  year: number;
  meetingKey: number;
  meetingName: string;
  sessionKey: number;
  sessionName: string;
  driverNumber: number;
  driverName: string;
  lapNumber?: number;
  savedAt: number;
};

export function readFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Favorite[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFavorites(items: Favorite[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items.slice(0, 20)));
}

export function toggleFavorite(item: Favorite, list: Favorite[]): Favorite[] {
  const exists = list.some((f) => f.type === item.type && f.id === item.id);
  if (exists) {
    return list.filter((f) => !(f.type === item.type && f.id === item.id));
  }
  return [item, ...list].slice(0, 20);
}

export function isFavorite(
  list: Favorite[],
  type: Favorite["type"],
  id: string,
): boolean {
  return list.some((f) => f.type === type && f.id === id);
}

export function readRecentTelemetry(): RecentTelemetry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_TELEMETRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentTelemetry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushRecentTelemetry(item: RecentTelemetry) {
  if (typeof window === "undefined") return;
  const prev = readRecentTelemetry().filter(
    (r) =>
      !(
        r.meetingKey === item.meetingKey &&
        r.sessionKey === item.sessionKey &&
        r.driverNumber === item.driverNumber
      ),
  );
  const next = [item, ...prev].slice(0, 5);
  localStorage.setItem(RECENT_TELEMETRY_KEY, JSON.stringify(next));
}
