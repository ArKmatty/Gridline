"use client";

import { Download } from "lucide-react";
import type { Race } from "@/lib/types";
import { generateICS, downloadICS } from "@/lib/calendar";

export function CalendarExportButton({ races, season }: { races: Race[]; season: number }) {
  const handleExport = () => {
    const icsContent = generateICS(races);
    downloadICS(`f1-calendar-${season}.ics`, icsContent);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition hover:bg-accent/10"
    >
      <Download className="h-4 w-4" />
      <span>Esporta calendario</span>
    </button>
  );
}
