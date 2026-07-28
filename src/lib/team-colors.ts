const TEAM_COLORS: Record<string, string> = {
  red_bull: "#3671C6",
  redbull: "#3671C6",
  ferrari: "#E8002D",
  mercedes: "#27F4D2",
  mclaren: "#FF8000",
  alpine: "#FF87BC",
  aston_martin: "#229971",
  astonmartin: "#229971",
  williams: "#64C4FF",
  rb: "#6692FF",
  visa_rb: "#6692FF",
  racing_bulls: "#6692FF",
  sauber: "#52E252",
  kick_sauber: "#52E252",
  stake: "#52E252",
  haas: "#B6BABD",
  alfa: "#C92D4B",
  alphatauri: "#5E8FAA",
  renault: "#FFF500",
  racing_point: "#F596C8",
  force_india: "#F596C8",
  toro_rosso: "#469BFF",
};

export function getTeamColor(constructorIdOrName: string): string {
  const key = constructorIdOrName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  if (TEAM_COLORS[key]) return TEAM_COLORS[key];

  for (const [id, color] of Object.entries(TEAM_COLORS)) {
    if (key.includes(id) || id.includes(key)) return color;
  }

  return "#E10600";
}

export const DRIVER_NUMBER_COLORS: Record<number, string> = {
  1: "#3671C6",
  11: "#3671C6",
  16: "#E8002D",
  44: "#27F4D2",
  63: "#27F4D2",
  4: "#FF8000",
  81: "#FF8000",
  14: "#229971",
  18: "#229971",
  10: "#FF87BC",
  31: "#FF87BC",
  23: "#64C4FF",
  55: "#64C4FF",
  22: "#6692FF",
  30: "#6692FF",
  27: "#52E252",
  5: "#52E252",
  20: "#B6BABD",
  87: "#B6BABD",
};
