import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMs(ms: number | null | undefined): string {
  if (ms == null || Number.isNaN(ms)) return "—";
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
  }
  return seconds.toFixed(3);
}

export function formatPoints(points: string | number): string {
  const n = typeof points === "string" ? parseFloat(points) : points;
  if (Number.isNaN(n)) return String(points);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function currentSeason(): number {
  return new Date().getFullYear();
}
