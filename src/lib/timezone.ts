export function raceDate(date: string, time?: string): Date {
  return new Date(`${date}T${time ?? "12:00:00Z"}`);
}

export function formatLocalDateTime(
  date: string,
  time?: string,
  opts?: Intl.DateTimeFormatOptions,
): string {
  const d = raceDate(date, time);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: time ? "2-digit" : undefined,
    minute: time ? "2-digit" : undefined,
    ...opts,
  });
}

export function formatLocalTime(date: string, time?: string): string {
  if (!time) return "";
  const d = raceDate(date, time);
  if (Number.isNaN(d.getTime())) return time;
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUtcTime(date: string, time?: string): string {
  if (!time) return "";
  const d = raceDate(date, time);
  if (Number.isNaN(d.getTime())) return `${time} UTC`;
  return (
    d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: false,
    }) + " UTC"
  );
}

export function formatLocalDate(date: string, time?: string): string {
  const d = raceDate(date, time);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timezoneLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "local time";
  }
}
