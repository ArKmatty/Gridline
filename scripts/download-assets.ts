import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const DRIVERS_DIR = path.join(IMAGES_DIR, "drivers");
const TEAMS_DIR = path.join(IMAGES_DIR, "teams");

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
  kick_sauber: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Sauber_Motorsport_logo.svg",
};

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    return true;
  } catch {
    return false;
  }
}

async function downloadTeams() {
  console.log("Downloading team logos...");
  fs.mkdirSync(TEAMS_DIR, { recursive: true });

  const teamLogos: Record<string, string> = {};

  for (const [constructorId, url] of Object.entries(TEAM_LOGOS)) {
    const ext = url.split(".").pop()?.split("?")[0] || "png";
    const filename = `${constructorId}.${ext}`;
    const dest = path.join(TEAMS_DIR, filename);

    if (!fs.existsSync(dest)) {
      const success = await downloadFile(url, dest);
      if (success) {
        console.log(`  ✓ ${constructorId}`);
      } else {
        console.log(`  ✗ ${constructorId} (failed)`);
      }
    } else {
      console.log(`  - ${constructorId} (exists)`);
    }

    teamLogos[constructorId] = filename;
  }

  fs.writeFileSync(
    path.join(TEAMS_DIR, "manifest.json"),
    JSON.stringify(teamLogos, null, 2)
  );
}

async function main() {
  console.log("Starting asset download...\n");
  await downloadTeams();
  console.log("\nDone!");
  console.log("\nNote: Driver headshots must be downloaded manually from OpenF1 API");
  console.log("Place them in public/images/drivers/ with format: {acronym}.{ext}");
}

main().catch(console.error);
