// Team logos from Wikimedia Commons
const TEAM_LOGOS: Record<string, string> = {
  mercedes: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Mercedes-AMG_Petronas_F1_Team_logo_%282026%29.svg",
  red_bull: "https://upload.wikimedia.org/wikipedia/it/c/cb/Oracle_Red_Bull_Racing_2026.jpg",
  ferrari: "https://upload.wikimedia.org/wikipedia/it/9/91/Scuderia_Ferrari_HP.png",
  mclaren: "https://upload.wikimedia.org/wikipedia/commons/2/20/McLaren_Racing_logo.png",
  alpine: "https://upload.wikimedia.org/wikipedia/commons/4/4a/BWT_Alpine_F1_Team_Logo.png",
  aston_martin: "https://upload.wikimedia.org/wikipedia/it/7/7d/Aston_Martin_2024_Logo.svg",
  williams: "https://upload.wikimedia.org/wikipedia/commons/1/12/Atlassian_Williams_F1_Team_logo.svg",
  rb: "https://upload.wikimedia.org/wikipedia/it/a/a3/RB-Racing_Bulls_Logo.png",
  audi: "https://upload.wikimedia.org/wikipedia/commons/0/03/Audif1.com_logo17_%28cropped%29.svg",
  haas: "https://upload.wikimedia.org/wikipedia/commons/1/18/TGR_Haas_F1_Team_Logo_%282026%29.svg",
  cadillac: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Cadillac_Formula_1_Team_logo.png",
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
