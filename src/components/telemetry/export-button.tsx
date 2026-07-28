"use client";

import { Download } from "lucide-react";
import type { TelemetryPoint } from "@/lib/types";

interface TelemetryExportButtonProps {
  data: TelemetryPoint[];
  driverName: string;
  lapNumber: number;
  className?: string;
}

export function TelemetryExportButton({
  data,
  driverName,
  lapNumber,
  className,
}: TelemetryExportButtonProps) {
  const handleExport = () => {
    if (!data.length) return;

    // Convert to CSV
    const headers = ["Time (s)", "Speed (km/h)", "Throttle (%)", "Brake (%)", "RPM", "Gear"];
    const rows = data.map((point) => [
      point.t.toFixed(3),
      point.speed.toString(),
      point.throttle.toString(),
      point.brake.toString(),
      point.rpm.toString(),
      point.gear.toString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `telemetry_${driverName.replace(/\s+/g, "_")}_lap${lapNumber}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data.length}
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
    >
      <Download className="h-4 w-4" />
      <span>Esporta CSV</span>
    </button>
  );
}
