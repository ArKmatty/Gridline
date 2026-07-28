"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

function Cells({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number | string;
  hours: number | string;
  minutes: number | string;
  seconds: number | string;
}) {
  const cells = [
    { label: "Days", value: days },
    { label: "Hrs", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];

  return (
    <div className="flex gap-2 sm:gap-3">
      {cells.map((c) => (
        <div
          key={c.label}
          className="min-w-[3.5rem] rounded-xl border border-border bg-black/30 px-2 py-2 text-center sm:min-w-[4.25rem]"
        >
          <div className="font-mono text-xl font-bold tabular-nums sm:text-2xl">
            {typeof c.value === "number"
              ? String(c.value).padStart(2, "0")
              : c.value}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const boot = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(boot);
      clearInterval(id);
    };
  }, []);

  if (now === null) {
    return (
      <div role="timer" aria-live="off" aria-label="Countdown loading">
        <Cells days="--" hours="--" minutes="--" seconds="--" />
      </div>
    );
  }

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) {
    return (
      <p className="text-sm font-medium text-accent" role="timer" aria-label="Race weekend has started">
        Race weekend window
      </p>
    );
  }

  const p = parts(diff);
  return (
    <div role="timer" aria-live="off" aria-label={`Countdown: ${p.days} days ${p.hours} hours ${p.minutes} minutes`}>
      <Cells {...p} />
    </div>
  );
}
