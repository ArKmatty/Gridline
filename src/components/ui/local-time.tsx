"use client";

import { useEffect, useState } from "react";
import {
  formatLocalDate,
  formatLocalDateTime,
  formatLocalTime,
  formatUtcTime,
  timezoneLabel,
} from "@/lib/timezone";
import { cn } from "@/lib/utils";

function isoDateTime(date: string, time?: string) {
  if (!time) return date;
  return `${date}T${time.replace("Z", "")}`;
}

export function LocalDateTime({
  date,
  time,
  className,
  showUtc = true,
}: {
  date: string;
  time?: string;
  className?: string;
  showUtc?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <time dateTime={isoDateTime(date, time)} className={cn("tabular-nums", className)}>
        {date}
        {time ? ` · ${time.replace("Z", "")} UTC` : ""}
      </time>
    );
  }

  return (
    <time dateTime={isoDateTime(date, time)} className={cn("tabular-nums", className)}>
      <span>{formatLocalDateTime(date, time)}</span>
      {showUtc && time && (
        <span className="ml-1.5 text-muted">({formatUtcTime(date, time)})</span>
      )}
    </time>
  );
}

export function LocalDate({
  date,
  time,
  className,
}: {
  date: string;
  time?: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <time dateTime={date} className={className}>{date}</time>;
  }

  return <time dateTime={isoDateTime(date, time)} className={className}>{formatLocalDate(date, time)}</time>;
}

export function LocalTimeOnly({
  date,
  time,
  className,
}: {
  date: string;
  time?: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!time) return null;
  if (!mounted) {
    return (
      <time dateTime={isoDateTime(date, time)} className={cn("text-muted", className)}>
        {time.replace("Z", "")} UTC
      </time>
    );
  }

  return (
    <time dateTime={isoDateTime(date, time)} className={className}>
      {formatLocalTime(date, time)}
      <span className="ml-1 text-muted">({formatUtcTime(date, time)})</span>
    </time>
  );
}

export function TimezoneHint({ className }: { className?: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => setLabel(timezoneLabel()), []);
  if (!label) return null;
  return (
    <p className={cn("text-xs text-muted", className)}>
      Times shown in your timezone ({label})
    </p>
  );
}
