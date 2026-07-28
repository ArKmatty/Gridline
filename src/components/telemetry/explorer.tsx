"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Flag,
  Gauge,
  History,
  Loader2,
  Map as MapIcon,
  MapPin,
  Timer,
  User,
  GitCompare,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  OpenF1Driver,
  OpenF1Lap,
  OpenF1Meeting,
  OpenF1Session,
  TelemetryPoint,
} from "@/lib/types";
import {
  pushRecentTelemetry,
  readRecentTelemetry,
  type RecentTelemetry,
} from "@/lib/favorites";
import { cn, formatMs } from "@/lib/utils";
import { TrackMap, type MapPoint } from "./track-map";
import { TelemetryExportButton } from "./export-button";

type Step = 1 | 2 | 3;

const STEPS = [
  { id: 1 as const, label: "Weekend", icon: MapPin },
  { id: 2 as const, label: "Session", icon: Flag },
  { id: 3 as const, label: "Driver & lap", icon: User },
];

export function TelemetryExplorer({ years }: { years: number[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bootstrapped = useMemo(() => {
    return {
      year: Number(searchParams.get("year")) || years[0] || 2025,
      meeting: searchParams.get("meeting")
        ? Number(searchParams.get("meeting"))
        : ("" as number | ""),
      session: searchParams.get("session")
        ? Number(searchParams.get("session"))
        : ("" as number | ""),
      driver: searchParams.get("driver")
        ? Number(searchParams.get("driver"))
        : ("" as number | ""),
      lap: searchParams.get("lap")
        ? Number(searchParams.get("lap"))
        : ("" as number | ""),
      compare: searchParams.get("compare")
        ? Number(searchParams.get("compare"))
        : ("" as number | ""),
    };
  }, [searchParams, years]);

  const [step, setStep] = useState<Step>(
    bootstrapStep(bootstrapped.meeting, bootstrapped.session, bootstrapped.driver),
  );
  const [year, setYear] = useState(bootstrapped.year);
  const [meetings, setMeetings] = useState<OpenF1Meeting[]>([]);
  const [meetingKey, setMeetingKey] = useState<number | "">(bootstrapped.meeting);
  const [sessions, setSessions] = useState<OpenF1Session[]>([]);
  const [sessionKey, setSessionKey] = useState<number | "">(bootstrapped.session);
  const [drivers, setDrivers] = useState<OpenF1Driver[]>([]);
  const [driverNumber, setDriverNumber] = useState<number | "">(
    bootstrapped.driver,
  );
  const [compareNumber, setCompareNumber] = useState<number | "">(
    bootstrapped.compare,
  );
  const [showCompare, setShowCompare] = useState(Boolean(bootstrapped.compare));
  const [laps, setLaps] = useState<OpenF1Lap[]>([]);
  const [lapNumber, setLapNumber] = useState<number | "">(bootstrapped.lap);
  const [seriesA, setSeriesA] = useState<TelemetryPoint[]>([]);
  const [seriesB, setSeriesB] = useState<TelemetryPoint[]>([]);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState<RecentTelemetry[]>([]);
  const [urlReady, setUrlReady] = useState(false);

  useEffect(() => {
    setRecent(readRecentTelemetry());
    setUrlReady(true);
  }, []);

  const loadJson = useCallback(async <T,>(url: string): Promise<T> => {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }
    return res.json() as Promise<T>;
  }, []);

  // Sync URL
  useEffect(() => {
    if (!urlReady) return;
    const params = new URLSearchParams();
    params.set("year", String(year));
    if (meetingKey !== "") params.set("meeting", String(meetingKey));
    if (sessionKey !== "") params.set("session", String(sessionKey));
    if (driverNumber !== "") params.set("driver", String(driverNumber));
    if (lapNumber !== "") params.set("lap", String(lapNumber));
    if (showCompare && compareNumber !== "")
      params.set("compare", String(compareNumber));
    const qs = params.toString();
    router.replace(`${pathname}?${qs}`, { scroll: false });
  }, [
    urlReady,
    year,
    meetingKey,
    sessionKey,
    driverNumber,
    lapNumber,
    compareNumber,
    showCompare,
    pathname,
    router,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingMeta(true);
        setError(null);
        const data = await loadJson<OpenF1Meeting[]>(
          `/api/openf1/meetings?year=${year}`,
        );
        if (cancelled) return;
        setMeetings(data);
        if (meetingKey !== "" && !data.some((m) => m.meeting_key === meetingKey)) {
          setMeetingKey("");
          setStep(1);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load races");
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // only reload on year change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, loadJson]);

  useEffect(() => {
    if (meetingKey === "") return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingMeta(true);
        setError(null);
        const data = await loadJson<OpenF1Session[]>(
          `/api/openf1/sessions?meeting_key=${meetingKey}`,
        );
        if (cancelled) return;
        setSessions(data);
        setStep((s) => (s < 2 ? 2 : s));
        if (
          sessionKey !== "" &&
          !data.some((x) => x.session_key === sessionKey)
        ) {
          setSessionKey("");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load sessions");
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingKey, loadJson]);

  useEffect(() => {
    if (sessionKey === "") return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingMeta(true);
        setError(null);
        const data = await loadJson<OpenF1Driver[]>(
          `/api/openf1/drivers?session_key=${sessionKey}`,
        );
        if (cancelled) return;
        setDrivers(data);
        setStep(3);
        if (
          driverNumber !== "" &&
          !data.some((d) => d.driver_number === driverNumber)
        ) {
          setDriverNumber("");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load drivers");
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, loadJson]);

  useEffect(() => {
    if (sessionKey === "" || driverNumber === "") return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingMeta(true);
        const data = await loadJson<OpenF1Lap[]>(
          `/api/openf1/laps?session_key=${sessionKey}&driver_number=${driverNumber}`,
        );
        if (cancelled) return;
        setLaps(data);
        if (
          lapNumber === "" ||
          !data.some((l) => l.lap_number === lapNumber)
        ) {
          const best = [...data].sort(
            (a, b) => (a.lap_duration ?? 999) - (b.lap_duration ?? 999),
          )[0];
          setLapNumber(best?.lap_number ?? data[0]?.lap_number ?? "");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load laps");
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, driverNumber, loadJson]);

  const loadTelemetry = useCallback(async () => {
    if (sessionKey === "" || driverNumber === "" || lapNumber === "") return;
    setLoadingChart(true);
    setError(null);
    try {
      const [a, loc] = await Promise.all([
        loadJson<{ points: TelemetryPoint[] }>(
          `/api/openf1/telemetry?session_key=${sessionKey}&driver_number=${driverNumber}&lap_number=${lapNumber}`,
        ),
        loadJson<{ points: MapPoint[] }>(
          `/api/openf1/location?session_key=${sessionKey}&driver_number=${driverNumber}&lap_number=${lapNumber}`,
        ).catch(() => ({ points: [] as MapPoint[] })),
      ]);
      setSeriesA(a.points);

      // Merge speed onto map points by index proportion
      const withSpeed = loc.points.map((p, i) => {
        const idx = a.points.length
          ? Math.min(
              a.points.length - 1,
              Math.floor((i / Math.max(loc.points.length - 1, 1)) * (a.points.length - 1)),
            )
          : 0;
        return { ...p, speed: a.points[idx]?.speed ?? 0 };
      });
      setMapPoints(withSpeed);

      if (showCompare && compareNumber !== "") {
        const b = await loadJson<{ points: TelemetryPoint[] }>(
          `/api/openf1/telemetry?session_key=${sessionKey}&driver_number=${compareNumber}&lap_number=${lapNumber}`,
        );
        setSeriesB(b.points);
      } else {
        setSeriesB([]);
      }

      const meeting = meetings.find((m) => m.meeting_key === meetingKey);
      const session = sessions.find((s) => s.session_key === sessionKey);
      const driver = drivers.find((d) => d.driver_number === driverNumber);
      if (meeting && session && driver) {
        pushRecentTelemetry({
          year,
          meetingKey: meeting.meeting_key,
          meetingName: meeting.meeting_name,
          sessionKey: session.session_key,
          sessionName: session.session_name,
          driverNumber: driver.driver_number,
          driverName: driver.name_acronym,
          lapNumber: typeof lapNumber === "number" ? lapNumber : undefined,
          savedAt: Date.now(),
        });
        setRecent(readRecentTelemetry());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load telemetry");
      setSeriesA([]);
      setSeriesB([]);
      setMapPoints([]);
    } finally {
      setLoadingChart(false);
    }
  }, [
    sessionKey,
    driverNumber,
    compareNumber,
    lapNumber,
    showCompare,
    loadJson,
    meetings,
    sessions,
    drivers,
    meetingKey,
    year,
  ]);

  useEffect(() => {
    if (step !== 3 || lapNumber === "" || driverNumber === "") return;
    const id = setTimeout(() => {
      void loadTelemetry();
    }, 200);
    return () => clearTimeout(id);
  }, [step, lapNumber, driverNumber, compareNumber, showCompare, loadTelemetry]);

  const selectedMeeting = meetings.find((m) => m.meeting_key === meetingKey);
  const selectedSession = sessions.find((s) => s.session_key === sessionKey);
  const driverA = drivers.find((d) => d.driver_number === driverNumber);
  const driverB = drivers.find((d) => d.driver_number === compareNumber);
  const selectedLap = laps.find((l) => l.lap_number === lapNumber);
  const bestLapNum = useMemo(() => {
    if (!laps.length) return null;
    return [...laps].sort(
      (a, b) => (a.lap_duration ?? 999) - (b.lap_duration ?? 999),
    )[0]?.lap_number;
  }, [laps]);
  const colorA = driverA ? `#${driverA.team_colour}` : "#e10600";
  const colorB = driverB ? `#${driverB.team_colour}` : "#60a5fa";

  const chartData = useMemo(() => {
    if (!seriesA.length) return [];
    const labelA = driverA?.name_acronym ?? "A";
    const labelB = driverB?.name_acronym ?? "B";

    if (!seriesB.length) {
      return seriesA.map((p) => ({
        t: Number(p.t.toFixed(2)),
        [labelA]: p.speed,
        [`${labelA}_thr`]: p.throttle,
        [`${labelA}_brk`]: p.brake,
        [`${labelA}_rpm`]: p.rpm,
        [`${labelA}_gear`]: p.gear,
      }));
    }

    const maxT = Math.max(
      seriesA[seriesA.length - 1]?.t ?? 0,
      seriesB[seriesB.length - 1]?.t ?? 0,
    );
    const steps = 200;
    const rows = [];
    for (let i = 0; i <= steps; i++) {
      const t = (maxT * i) / steps;
      const a = nearestPoint(seriesA, t);
      const b = nearestPoint(seriesB, t);
      rows.push({
        t: Number(t.toFixed(2)),
        [labelA]: a?.speed ?? null,
        [labelB]: b?.speed ?? null,
        [`${labelA}_thr`]: a?.throttle ?? null,
        [`${labelB}_thr`]: b?.throttle ?? null,
        [`${labelA}_brk`]: a?.brake ?? null,
        [`${labelB}_brk`]: b?.brake ?? null,
        [`${labelA}_rpm`]: a?.rpm ?? null,
        [`${labelB}_rpm`]: b?.rpm ?? null,
        [`${labelA}_gear`]: a?.gear ?? null,
        [`${labelB}_gear`]: b?.gear ?? null,
      });
    }
    return rows;
  }, [seriesA, seriesB, driverA, driverB]);

  const labelA = driverA?.name_acronym ?? "Driver";
  const labelB = driverB?.name_acronym ?? "Compare";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const applyRecent = (r: RecentTelemetry) => {
    setYear(r.year);
    setMeetingKey(r.meetingKey);
    setSessionKey(r.sessionKey);
    setDriverNumber(r.driverNumber);
    if (r.lapNumber) setLapNumber(r.lapNumber);
    setStep(3);
  };

  return (
    <div className="space-y-6">
      {recent.length > 0 && step === 1 && (
        <div className="card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
            <History className="h-3.5 w-3.5" /> Recent
          </p>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button
                key={`${r.sessionKey}-${r.driverNumber}-${r.savedAt}`}
                type="button"
                onClick={() => applyRecent(r)}
                className="rounded-full border border-border bg-black/20 px-3 py-1.5 text-xs font-medium hover:border-accent/40"
              >
                {r.meetingName} · {r.sessionName} · {r.driverName}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4 sm:p-5">
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <li
                key={s.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 transition",
                  active && "border-accent/50 bg-accent-soft",
                  done && "border-success/30 bg-success/5",
                  !active && !done && "border-border bg-black/20 opacity-70",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                    active && "border-accent/40 bg-accent text-white",
                    done && "border-success/40 bg-success/20 text-success",
                    !active && !done && "border-border text-muted",
                  )}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">
                    Step {s.id}
                  </p>
                  <p className="text-sm font-semibold">{s.label}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {step === 1 && (
        <div className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            <div>
              <h2 className="font-semibold">Choose a race weekend</h2>
              <p className="text-sm text-muted">
                Historical data from 2023 onward.
              </p>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setYear(y);
                  setMeetingKey("");
                  setSessionKey("");
                  setDriverNumber("");
                  setLapNumber("");
                  setSessions([]);
                  setDrivers([]);
                  setLaps([]);
                  setSeriesA([]);
                  setStep(1);
                }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  year === y
                    ? "border-accent bg-accent-soft text-white"
                    : "border-border text-muted hover:text-foreground",
                )}
              >
                {y}
              </button>
            ))}
          </div>
          {loadingMeta && !meetings.length ? (
            <LoadingBlock label="Loading race weekends…" />
          ) : (
            <div className="grid max-h-[420px] gap-2 overflow-y-auto scrollbar-thin sm:grid-cols-2">
              {meetings.map((m) => (
                <button
                  key={m.meeting_key}
                  type="button"
                  onClick={() => {
                    setMeetingKey(m.meeting_key);
                    setSessionKey("");
                    setDriverNumber("");
                    setLapNumber("");
                    setStep(2);
                  }}
                  className={cn(
                    "rounded-xl border border-border bg-black/20 p-4 text-left transition hover:border-accent/40",
                    meetingKey === m.meeting_key &&
                      "border-accent/50 bg-accent-soft",
                  )}
                >
                  <p className="font-semibold">{m.meeting_name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {m.circuit_short_name} · {m.country_name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="card p-5 sm:p-6">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-accent" />
              <div>
                <h2 className="font-semibold">Choose a session</h2>
                <p className="text-sm text-muted">
                  {selectedMeeting?.meeting_name ?? "Selected weekend"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setMeetingKey("");
              }}
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Change weekend
            </button>
          </div>
          {loadingMeta && !sessions.length ? (
            <LoadingBlock label="Loading sessions…" />
          ) : (
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((s) => (
                <button
                  key={s.session_key}
                  type="button"
                  onClick={() => {
                    setSessionKey(s.session_key);
                    setDriverNumber("");
                    setLapNumber("");
                    setStep(3);
                  }}
                  className={cn(
                    "rounded-xl border border-border bg-black/20 p-4 text-left transition hover:border-accent/40",
                    sessionKey === s.session_key &&
                      "border-accent/50 bg-accent-soft",
                    s.session_name === "Race" &&
                      sessionKey !== s.session_key &&
                      "ring-1 ring-accent/20",
                  )}
                >
                  <p className="font-semibold">{s.session_name}</p>
                  <p className="mt-1 text-xs text-muted">{s.session_type}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step >= 3 && (
        <div className="space-y-6">
          <div className="card p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                <div>
                  <h2 className="font-semibold">Pick a driver and lap</h2>
                  <p className="text-sm text-muted">
                    {selectedMeeting?.meeting_name}
                    {selectedSession ? ` · ${selectedSession.session_name}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-white/5"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setSessionKey("");
                  }}
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Change session
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Driver">
                <select
                  value={driverNumber}
                  onChange={(e) =>
                    setDriverNumber(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="field-select"
                >
                  <option value="">Select driver…</option>
                  {drivers.map((d) => (
                    <option key={d.driver_number} value={d.driver_number}>
                      {d.name_acronym} — {d.full_name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                  Lap
                </span>
                {laps.length > 0 ? (
                  <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto scrollbar-thin">
                    {laps.map((l) => (
                      <button
                        key={l.lap_number}
                        type="button"
                        onClick={() => setLapNumber(l.lap_number)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1.5 font-mono text-xs transition",
                          lapNumber === l.lap_number
                            ? "border-accent bg-accent-soft text-white"
                            : "border-border text-muted hover:text-foreground",
                          bestLapNum === l.lap_number &&
                            lapNumber !== l.lap_number &&
                            "border-purple-500/40 text-purple-300",
                        )}
                        title={
                          bestLapNum === l.lap_number ? "Fastest lap" : undefined
                        }
                      >
                        L{l.lap_number}
                        <span className="ml-1 opacity-70">
                          {formatMs((l.lap_duration ?? 0) * 1000)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Pick a driver first</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowCompare((v) => !v)}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
              >
                <GitCompare className="h-4 w-4" />
                {showCompare ? "Hide compare" : "Compare with another driver"}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition",
                    showCompare && "rotate-180",
                  )}
                />
              </button>
              {showCompare && (
                <div className="mt-3 max-w-md">
                  <Field label="Compare driver">
                    <select
                      value={compareNumber}
                      onChange={(e) =>
                        setCompareNumber(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      className="field-select"
                    >
                      <option value="">None</option>
                      {drivers
                        .filter((d) => d.driver_number !== driverNumber)
                        .map((d) => (
                          <option key={d.driver_number} value={d.driver_number}>
                            {d.name_acronym} — {d.full_name}
                          </option>
                        ))}
                    </select>
                  </Field>
                </div>
              )}
            </div>

            {selectedLap && driverA && (
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-black/20 px-3 py-1">
                  <Timer className="h-3.5 w-3.5 text-accent" />
                  Lap {selectedLap.lap_number}:{" "}
                  <strong className="text-foreground">
                    {formatMs((selectedLap.lap_duration ?? 0) * 1000)}
                  </strong>
                </span>
                <span>
                  S1 {selectedLap.duration_sector_1?.toFixed(3) ?? "—"} · S2{" "}
                  {selectedLap.duration_sector_2?.toFixed(3) ?? "—"} · S3{" "}
                  {selectedLap.duration_sector_3?.toFixed(3) ?? "—"}
                </span>
              </div>
            )}
          </div>

          {/* Speed */}
          <div className="card p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-semibold">
                <Gauge className="h-4 w-4 text-accent" />
                Speed trace
              </h2>
              <div className="flex items-center gap-2">
                {driverA && selectedLap && (
                  <TelemetryExportButton
                    data={seriesA}
                    driverName={driverA.broadcast_name || `Driver ${driverA.driver_number}`}
                    lapNumber={selectedLap.lap_number}
                  />
                )}
                {loadingChart && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-accent">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading…
                  </span>
                )}
              </div>
            </div>
            {error && (
              <div className="mb-4 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
                {error}
                <button
                  type="button"
                  onClick={() => void loadTelemetry()}
                  className="ml-3 font-medium text-accent underline"
                >
                  Retry
                </button>
              </div>
            )}
            <ChartFrame
              empty={!chartData.length && !loadingChart}
              emptyLabel={
                driverNumber === ""
                  ? "Select a driver to load telemetry automatically"
                  : "No telemetry samples for this lap"
              }
              loading={loadingChart && !chartData.length}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} syncId="telemetry">
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="t"
                    stroke="#71717a"
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    width={48}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={labelA}
                    name={`${labelA} speed`}
                    stroke={colorA}
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  {seriesB.length > 0 && (
                    <Line
                      type="monotone"
                      dataKey={labelB}
                      name={`${labelB} speed`}
                      stroke={colorB}
                      dot={false}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      isAnimationActive={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>

          {mapPoints.length > 2 && (
            <div className="card p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <MapIcon className="h-4 w-4 text-accent" />
                Track map
              </h2>
              <TrackMap points={mapPoints} />
            </div>
          )}

          {chartData.length > 0 && (
            <div className="card p-4 sm:p-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Activity className="h-4 w-4 text-accent" />
                  Pedal inputs
                </h2>
                <p className="text-xs text-muted">
                  Throttle 0–100%. Brake is on/off (OpenF1).
                </p>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Throttle (%)
                  </div>
                  <ChartFrame empty={false} loading={false} height={200}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} syncId="telemetry">
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="t"
                          stroke="#71717a"
                          tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />
                        <YAxis
                          stroke="#71717a"
                          tick={{ fill: "#a1a1aa", fontSize: 11 }}
                          width={36}
                          domain={[0, 100]}
                        />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area
                          type="stepAfter"
                          dataKey={`${labelA}_thr`}
                          name={labelA}
                          stroke="#22c55e"
                          fill="#22c55e"
                          fillOpacity={0.25}
                          strokeWidth={1.75}
                          isAnimationActive={false}
                          dot={false}
                        />
                        {seriesB.length > 0 && (
                          <Area
                            type="stepAfter"
                            dataKey={`${labelB}_thr`}
                            name={labelB}
                            stroke="#86efac"
                            fill="#86efac"
                            fillOpacity={0.12}
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            isAnimationActive={false}
                            dot={false}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartFrame>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Brake (on / off)
                  </div>
                  <ChartFrame empty={false} loading={false} height={140}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} syncId="telemetry">
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="t"
                          stroke="#71717a"
                          tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />
                        <YAxis
                          stroke="#71717a"
                          tick={{ fill: "#a1a1aa", fontSize: 11 }}
                          width={36}
                          domain={[0, 100]}
                          ticks={[0, 100]}
                          tickFormatter={(v) => (v === 100 ? "ON" : "OFF")}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value) => {
                            const n = Number(value ?? 0);
                            return [n > 0 ? "ON" : "OFF", "Brake"];
                          }}
                        />
                        <Area
                          type="stepAfter"
                          dataKey={`${labelA}_brk`}
                          name={labelA}
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.35}
                          strokeWidth={1.75}
                          isAnimationActive={false}
                          dot={false}
                        />
                        {seriesB.length > 0 && (
                          <Area
                            type="stepAfter"
                            dataKey={`${labelB}_brk`}
                            name={labelB}
                            stroke="#fcd34d"
                            fill="#fcd34d"
                            fillOpacity={0.15}
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            isAnimationActive={false}
                            dot={false}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartFrame>
                </div>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-white/[0.02]"
              >
                <span className="flex items-center gap-2">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition",
                      showMore && "rotate-180",
                    )}
                  />
                  More traces (RPM & gear)
                </span>
                <ArrowRight className="h-4 w-4 text-muted" />
              </button>
              {showMore && (
                <div className="space-y-6 border-t border-border p-4 sm:p-6">
                  <ChartFrame empty={false} loading={false} height={220}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} syncId="telemetry">
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="t"
                          stroke="#71717a"
                          tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />
                        <YAxis
                          stroke="#71717a"
                          tick={{ fill: "#a1a1aa", fontSize: 11 }}
                          width={48}
                        />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey={`${labelA}_rpm`}
                          name={`${labelA} RPM`}
                          stroke="#60a5fa"
                          dot={false}
                          strokeWidth={1.75}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartFrame>
                  <ChartFrame empty={false} loading={false} height={180}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} syncId="telemetry">
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="t"
                          stroke="#71717a"
                          tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        />
                        <YAxis
                          stroke="#71717a"
                          tick={{ fill: "#a1a1aa", fontSize: 11 }}
                          width={32}
                          domain={[0, 8]}
                          allowDecimals={false}
                        />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="stepAfter"
                          dataKey={`${labelA}_gear`}
                          name={`${labelA} gear`}
                          stroke="#a78bfa"
                          dot={false}
                          strokeWidth={1.75}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartFrame>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && step < 3 && (
        <p className="text-center text-sm text-accent">{error}</p>
      )}

      <style jsx global>{`
        .field-select {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.25);
          padding: 0.65rem 0.85rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
        }
        .field-select:focus {
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}

function bootstrapStep(
  meeting: number | "",
  session: number | "",
  driver: number | "",
): Step {
  if (driver !== "" || session !== "") return 3;
  if (meeting !== "") return 2;
  return 1;
}

const tooltipStyle = {
  background: "#101218",
  border: "1px solid #232632",
  borderRadius: 12,
  fontSize: 12,
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin text-accent" />
      {label}
    </div>
  );
}

function ChartFrame({
  children,
  empty,
  emptyLabel,
  loading,
  height = 320,
}: {
  children?: React.ReactNode;
  empty: boolean;
  emptyLabel?: string;
  loading: boolean;
  height?: number;
}) {
  return (
    <div className="w-full" style={{ height }}>
      {loading ? (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent" />
          Fetching car data…
        </div>
      ) : empty ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 text-center text-sm text-muted">
          <Gauge className="h-8 w-8 opacity-40" />
          {emptyLabel}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function nearestPoint(
  points: TelemetryPoint[],
  t: number,
): TelemetryPoint | null {
  if (!points.length) return null;
  let best = points[0];
  let bestDist = Math.abs(points[0].t - t);
  for (let i = 1; i < points.length; i++) {
    const d = Math.abs(points[i].t - t);
    if (d < bestDist) {
      best = points[i];
      bestDist = d;
    }
  }
  return best;
}
