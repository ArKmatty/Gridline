# Local Images

This directory contains locally-hosted images for faster loading.

## Team Logos

Team logos are stored in `public/images/teams/`. Run `npm run build:assets` to download from Wikimedia.

Failed downloads must be done manually:
- aston_martin.svg
- williams.svg  
- rb.png
- haas.svg
- cadillac.png
- kick_sauber.svg

Download from Wikimedia Commons and place in this directory.

## Driver Headshots

Driver headshots are stored in `public/images/drivers/`.

Format: `{driver_acronym_lowercase}.{ext}` (e.g., `ver.jpg`, `ham.png`)

To download:
1. Visit https://openf1.org
2. Use the API to get headshot URLs
3. Download and save with the driver's acronym as filename

Current drivers (2026 season):
- VER, HAM, LEC, NOR, PIA, RUS, ALO, GAS, OCO, STR
- ALB, HUL, MAG, BEA, COL, HAD, LAW, LIN, ANT, BOR
