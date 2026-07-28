import type {
  Constructor,
  ConstructorStanding,
  Driver,
  DriverStanding,
  Race,
  RaceWithResults,
} from "./types";
import { currentSeason } from "./utils";

const BASE = "https://api.jolpi.ca/ergast/f1";

async function jolpicaFetch<T>(path: string, revalidate = 3600): Promise<T> {
  const url = `${BASE}${path}.json`;
  const res = await fetch(url, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Jolpica ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MRData = any;

function seasonPath(season?: number | string) {
  return season ? `/${season}` : "/current";
}

export async function getDriverStandings(
  season?: number | string,
): Promise<DriverStanding[]> {
  const data = await jolpicaFetch<MRData>(
    `${seasonPath(season)}/driverStandings`,
    1800,
  );
  const tables = data?.MRData?.StandingsTable?.StandingsLists ?? [];
  return tables[0]?.DriverStandings ?? [];
}

export async function getConstructorStandings(
  season?: number | string,
): Promise<ConstructorStanding[]> {
  const data = await jolpicaFetch<MRData>(
    `${seasonPath(season)}/constructorStandings`,
    1800,
  );
  const tables = data?.MRData?.StandingsTable?.StandingsLists ?? [];
  return tables[0]?.ConstructorStandings ?? [];
}

export async function getSeasonSchedule(
  season?: number | string,
): Promise<Race[]> {
  const data = await jolpicaFetch<MRData>(`${seasonPath(season)}`, 86400);
  return data?.MRData?.RaceTable?.Races ?? [];
}

export async function getRaceResults(
  season: number | string,
  round: number | string,
): Promise<RaceWithResults | null> {
  const data = await jolpicaFetch<MRData>(
    `/${season}/${round}/results`,
    3600,
  );
  const races = data?.MRData?.RaceTable?.Races ?? [];
  return races[0] ?? null;
}

export async function getQualifyingResults(
  season: number | string,
  round: number | string,
) {
  const data = await jolpicaFetch<MRData>(
    `/${season}/${round}/qualifying`,
    3600,
  );
  const races = data?.MRData?.RaceTable?.Races ?? [];
  return races[0] ?? null;
}

export async function getSprintResults(
  season: number | string,
  round: number | string,
) {
  try {
    const data = await jolpicaFetch<MRData>(
      `/${season}/${round}/sprint`,
      3600,
    );
    const races = data?.MRData?.RaceTable?.Races ?? [];
    return races[0] ?? null;
  } catch {
    return null;
  }
}

export async function getDrivers(
  season?: number | string,
): Promise<Driver[]> {
  const data = await jolpicaFetch<MRData>(
    `${seasonPath(season)}/drivers`,
    86400,
  );
  return data?.MRData?.DriverTable?.Drivers ?? [];
}

export async function getDriver(driverId: string): Promise<Driver | null> {
  const data = await jolpicaFetch<MRData>(`/drivers/${driverId}`, 86400);
  const drivers = data?.MRData?.DriverTable?.Drivers ?? [];
  return drivers[0] ?? null;
}

export async function getDriverResults(
  driverId: string,
  season?: number | string,
): Promise<RaceWithResults[]> {
  const path = season
    ? `/${season}/drivers/${driverId}/results`
    : `/drivers/${driverId}/results`;
  const data = await jolpicaFetch<MRData>(`${path}?limit=100`, 3600);
  return data?.MRData?.RaceTable?.Races ?? [];
}

export async function getConstructors(
  season?: number | string,
): Promise<Constructor[]> {
  const data = await jolpicaFetch<MRData>(
    `${seasonPath(season)}/constructors`,
    86400,
  );
  return data?.MRData?.ConstructorTable?.Constructors ?? [];
}

export async function getConstructor(
  constructorId: string,
): Promise<Constructor | null> {
  const data = await jolpicaFetch<MRData>(
    `/constructors/${constructorId}`,
    86400,
  );
  const list = data?.MRData?.ConstructorTable?.Constructors ?? [];
  return list[0] ?? null;
}

export async function getConstructorResults(
  constructorId: string,
  season?: number | string,
): Promise<RaceWithResults[]> {
  const path = season
    ? `/${season}/constructors/${constructorId}/results`
    : `/constructors/${constructorId}/results`;
  const data = await jolpicaFetch<MRData>(`${path}?limit=100`, 3600);
  return data?.MRData?.RaceTable?.Races ?? [];
}

export async function getLastRaceResults(
  season?: number | string,
): Promise<RaceWithResults | null> {
  try {
    const data = await jolpicaFetch<MRData>(
      `${seasonPath(season)}/last/results`,
      1800,
    );
    const races = data?.MRData?.RaceTable?.Races ?? [];
    return races[0] ?? null;
  } catch {
    return null;
  }
}

export function getNextRace(races: Race[]): Race | null {
  const now = Date.now();
  const upcoming = races
    .map((r) => ({
      race: r,
      ts: new Date(`${r.date}T${r.time ?? "00:00:00Z"}`).getTime(),
    }))
    .filter((x) => x.ts >= now - 3 * 60 * 60 * 1000)
    .sort((a, b) => a.ts - b.ts);

  return upcoming[0]?.race ?? races[races.length - 1] ?? null;
}

export function seasonOptions(from = 2018): number[] {
  const end = currentSeason();
  const years: number[] = [];
  for (let y = end; y >= from; y--) years.push(y);
  return years;
}
