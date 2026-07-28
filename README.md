# Gridline

Unofficial Formula 1 fan hub built with **Next.js** and **TypeScript**.

## Features

- Championship standings (drivers & constructors)
- Season calendar and race weekend details
- Race, sprint, and qualifying results
- Driver and team profiles
- Aggregated F1 news (RSS)
- Curiosities / trivia (curated + season-derived)
- Historical telemetry explorer (OpenF1)

## Data sources

| Source | Use |
|--------|-----|
| [Jolpica F1](https://api.jolpi.ca/ergast/f1/) | Standings, schedule, results, drivers, constructors |
| [OpenF1](https://openf1.org/) | Historical sessions, laps, car telemetry |
| RSS | RaceFans, Autosport, BBC Sport F1 |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Notes

- This is an unofficial fan project and is not affiliated with Formula 1, the FIA, or any team.
- OpenF1 free access covers historical data (from 2023). Live session streaming requires an OpenF1 sponsor plan.
- External APIs have rate limits; Gridline caches server responses where possible.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- rss-parser
