import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold">
            Grid<span className="text-accent">line</span>
          </p>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted">
            Unofficial fan project. Not affiliated with Formula 1, FIA, or any
            team. F1 and related marks are trademarks of their respective owners.
            Data via Jolpica F1 & OpenF1.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <Link href="/standings" className="hover:text-foreground">
            Standings
          </Link>
          <Link href="/calendar" className="hover:text-foreground">
            Calendar
          </Link>
          <Link href="/news" className="hover:text-foreground">
            News
          </Link>
          <Link href="/telemetry" className="hover:text-foreground">
            Telemetry
          </Link>
        </div>
      </div>
    </footer>
  );
}
