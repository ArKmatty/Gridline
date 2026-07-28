import type {
  OpenF1CarData,
  OpenF1Driver,
  OpenF1Lap,
  OpenF1Meeting,
  OpenF1Session,
  TelemetryPoint,
} from "./types";

const BASE = "https://api.openf1.org/v1";

async function openf1Fetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
  revalidate = 3600,
): Promise<T> {
  const url = new URL(`${BASE}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`OpenF1 ${res.status}: ${endpoint}`);
  }

  return res.json() as Promise<T>;
}

export async function getMeetings(year: number): Promise<OpenF1Meeting[]> {
  const data = await openf1Fetch<OpenF1Meeting[]>("meetings", { year }, 86400);
  return data.sort(
    (a, b) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );
}

export async function getSessions(
  meetingKey: number,
): Promise<OpenF1Session[]> {
  const data = await openf1Fetch<OpenF1Session[]>(
    "sessions",
    { meeting_key: meetingKey },
    3600,
  );
  return data.sort(
    (a, b) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );
}

export async function getSessionDrivers(
  sessionKey: number,
): Promise<OpenF1Driver[]> {
  const data = await openf1Fetch<OpenF1Driver[]>(
    "drivers",
    { session_key: sessionKey },
    3600,
  );
  return data.sort((a, b) => a.driver_number - b.driver_number);
}

export async function getLaps(
  sessionKey: number,
  driverNumber: number,
): Promise<OpenF1Lap[]> {
  const data = await openf1Fetch<OpenF1Lap[]>(
    "laps",
    { session_key: sessionKey, driver_number: driverNumber },
    3600,
  );
  return data
    .filter((l) => l.lap_duration != null && !l.is_pit_out_lap)
    .sort((a, b) => a.lap_number - b.lap_number);
}

export async function getCarDataForLap(
  sessionKey: number,
  driverNumber: number,
  lap: OpenF1Lap,
): Promise<TelemetryPoint[]> {
  if (!lap.date_start || lap.lap_duration == null) return [];

  const start = new Date(lap.date_start);
  const end = new Date(start.getTime() + lap.lap_duration * 1000 + 500);

  const data = await openf1Fetch<OpenF1CarData[]>(
    "car_data",
    {
      session_key: sessionKey,
      driver_number: driverNumber,
      "date>": start.toISOString(),
      "date<": end.toISOString(),
    },
    86400,
  );

  if (!data.length) return [];

  const t0 = new Date(data[0].date).getTime();
  const points: TelemetryPoint[] = data.map((d) => ({
    t: (new Date(d.date).getTime() - t0) / 1000,
    speed: d.speed ?? 0,
    throttle: clampPct(d.throttle),
    brake: normalizeBrake(d.brake),
    rpm: d.rpm ?? 0,
    gear: d.n_gear ?? 0,
  }));

  return downsample(points, 400);
}

export type LocationPoint = {
  x: number;
  y: number;
  speed: number;
};

export async function getLocationForLap(
  sessionKey: number,
  driverNumber: number,
  lap: OpenF1Lap,
): Promise<LocationPoint[]> {
  if (!lap.date_start || lap.lap_duration == null) return [];

  const start = new Date(lap.date_start);
  const end = new Date(start.getTime() + lap.lap_duration * 1000 + 500);

  type Loc = {
    x: number | null;
    y: number | null;
    z?: number | null;
    date: string;
  };

  const data = await openf1Fetch<Loc[]>(
    "location",
    {
      session_key: sessionKey,
      driver_number: driverNumber,
      "date>": start.toISOString(),
      "date<": end.toISOString(),
    },
    86400,
  );

  const pts = data
    .filter((p) => p.x != null && p.y != null)
    .map((p) => ({ x: p.x as number, y: p.y as number, speed: 0 }));

  if (pts.length <= 300) return pts;

  const step = pts.length / 300;
  const out: LocationPoint[] = [];
  for (let i = 0; i < 300; i++) {
    out.push(pts[Math.floor(i * step)]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export async function getWeather(sessionKey: number) {
  try {
    const data = await openf1Fetch<
      {
        air_temperature: number | null;
        track_temperature: number | null;
        humidity: number | null;
        rainfall: number | null;
        wind_speed: number | null;
      }[]
    >("weather", { session_key: sessionKey }, 1800);
    return data[data.length - 1] ?? null;
  } catch {
    return null;
  }
}

export async function matchMeetingToRace(
  year: number,
  country: string,
  circuitName: string,
): Promise<OpenF1Meeting | null> {
  try {
    const meetings = await getMeetings(year);
    const c = country.toLowerCase();
    const circuit = circuitName.toLowerCase();
    return (
      meetings.find(
        (m) =>
          m.country_name?.toLowerCase().includes(c) ||
          c.includes(m.country_name?.toLowerCase() ?? "___") ||
          m.circuit_short_name?.toLowerCase().includes(circuit.slice(0, 6)) ||
          m.meeting_name?.toLowerCase().includes(c),
      ) ?? null
    );
  } catch {
    return null;
  }
}

function clampPct(value: number | null | undefined): number {
  if (value == null || Number.isNaN(Number(value))) return 0;
  return Math.min(100, Math.max(0, Number(value)));
}

function normalizeBrake(value: number | boolean | null | undefined): number {
  if (value === true) return 100;
  if (value === false || value == null) return 0;
  const n = Number(value);
  if (Number.isNaN(n) || n <= 0) return 0;
  return n >= 100 ? 100 : n > 1 ? clampPct(n) : 100;
}

function downsample(points: TelemetryPoint[], max: number): TelemetryPoint[] {
  if (points.length <= max) return points;
  const bucket = points.length / max;
  const result: TelemetryPoint[] = [];

  for (let i = 0; i < max; i++) {
    const start = Math.floor(i * bucket);
    const end = Math.max(start + 1, Math.floor((i + 1) * bucket));
    const slice = points.slice(start, end);
    const mid = slice[Math.floor(slice.length / 2)] ?? points[start];
    const brakeOn = slice.some((p) => p.brake > 0);
    const maxThrottle = Math.max(...slice.map((p) => p.throttle));
    const maxSpeed = Math.max(...slice.map((p) => p.speed));

    result.push({
      ...mid,
      t: mid.t,
      speed: maxSpeed,
      throttle: maxThrottle,
      brake: brakeOn ? 100 : 0,
    });
  }

  return result;
}

export async function getYearsWithData(): Promise<number[]> {
  const years: number[] = [];
  const end = new Date().getFullYear();
  for (let y = end; y >= 2023; y--) years.push(y);
  return years;
}

export async function getDriverHeadshots(
  year: number,
): Promise<Map<string, string>> {
  try {
    const meetings = await getMeetings(year);
    if (!meetings.length) return new Map();

    const firstMeeting = meetings[0];
    const sessions = await getSessions(firstMeeting.meeting_key);
    if (!sessions.length) return new Map();

    const raceSession = sessions.find((s) => s.session_type === "Race") || sessions[0];
    const drivers = await getSessionDrivers(raceSession.session_key);

    const headshots = new Map<string, string>();
    for (const driver of drivers) {
      if (driver.headshot_url && driver.name_acronym) {
        headshots.set(driver.name_acronym, driver.headshot_url);
      }
    }

    return headshots;
  } catch {
    return new Map();
  }
}
