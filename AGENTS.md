<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Gridline

Unofficial F1 fan hub. Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type check (no script in package.json)
- No test suite exists

## Architecture

**Data flow**: Server components fetch directly from APIs. API routes exist for client-side data needs (search, news, OpenF1 telemetry).

**Three data sources**:
- `src/lib/jolpica.ts` — Ergast API replacement. Standings, schedule, results. Uses `fetch` with `next: { revalidate }`.
- `src/lib/openf1.ts` — Historical telemetry (2023+ only). Meetings, sessions, laps, car data, location, weather.
- `src/lib/news.ts` — RSS feeds (RaceFans, Autosport, BBC). Uses `rss-parser`.

**API routes** (`src/app/api/`):
- `/api/news` — aggregated news
- `/api/openf1/*` — telemetry endpoints (meetings, sessions, drivers, laps, telemetry, location, weather)
- `/api/search` — driver/team search

**Static data**: `src/data/curiosities.json` — curated trivia, rotated daily by day-of-year index.

**Client state**: Favorites and recent telemetry in `localStorage` (`src/lib/favorites.ts`). Use `useSyncExternalStore` with `getServerSnapshot` returning `"[]"` to avoid hydration mismatches.

**Styling**: Tailwind v4 with `@tailwindcss/postcss`. Custom theme via CSS variables in `src/app/globals.css` (dark mode only, F1 red accent `#e10600`). No `tailwind.config.js` — theme defined inline in CSS with `@theme inline`.

**Images**: Remote hostnames must be registered in `images.remotePatterns` in `next.config.ts`. Currently configured for news sources (racefans, autosport, bbc, motorsport.com, wp.com, cloudfront, unsplash).

**Path alias**: `@/*` → `./src/*`

## Gotchas

- OpenF1 free tier covers 2023+ only. Live session streaming requires sponsor plan.
- Page components export `revalidate` constant for ISR (e.g., `export const revalidate = 900`).
- Jolpica API returns nested `MRData` structure — lib functions unwrap it.
- Telemetry data is downsampled to ~400 points per lap in `getCarDataForLap`.
- `useHasMounted()` hook prevents hydration flash for localStorage-dependent UI.
