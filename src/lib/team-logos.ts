// Team logos from Wikimedia Commons
const TEAM_LOGOS: Record<string, string> = {
  mercedes: "/images/teams/mercedes.svg",
  red_bull: "/images/teams/red_bull.png",
  ferrari: "/images/teams/ferrari.png",
  mclaren: "/images/teams/mclaren.png",
  alpine: "/images/teams/alpine.png",
  aston_martin: "/images/teams/aston_martin.svg",
  williams: "/images/teams/williams.svg",
  rb: "/images/teams/rb.png",
  audi: "/images/teams/audi.svg",
  haas: "/images/teams/haas.svg",
  cadillac: "/images/teams/cadillac.png",
  kick_sauber: "/images/teams/kick_sauber.svg",
};

export function getTeamLogo(constructorId: string): string | undefined {
  const normalizedId = constructorId.toLowerCase().replace(/[^a-z0-9]/g, "_");
  
  // Direct match
  if (TEAM_LOGOS[normalizedId]) {
    return TEAM_LOGOS[normalizedId];
  }
  
  // Partial match
  for (const [key, url] of Object.entries(TEAM_LOGOS)) {
    if (normalizedId.includes(key) || key.includes(normalizedId)) {
      return url;
    }
  }
  
  return undefined;
}

export function getTeamInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

export function getTeamShortName(name: string): string {
  const nameMap: Record<string, string> = {
    "Red Bull Racing": "RB",
    "Scuderia Ferrari": "FER",
    "Mercedes-AMG Petronas F1 Team": "MER",
    "McLaren F1 Team": "MCL",
    "BWT Alpine F1 Team": "ALP",
    "Aston Martin Aramco F1 Team": "AMR",
    "Williams Racing": "WIL",
    "Visa Cash App RB F1 Team": "RB",
    "Kick Sauber F1 Team": "SAU",
    "MoneyGram Haas F1 Team": "HAS",
  };

  if (nameMap[name]) return nameMap[name];
  return getTeamInitials(name);
}
