"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Gauge,
  Loader2,
  Map as MapIcon,
} from "lucide-react";
import type { OpenF1Driver, TelemetryPoint } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrackMap, type MapPoint } from "./track-map";
import { TelemetryExportButton } from "./export-button";
import type { OpenF1Lap } from "@/lib/types";

const tooltipStyle = {
  background: "#101218",
  border: "1px solid #232632",
  borderRadius: 12,
  fontSize: 12,
};

function ChartFrame({
  children,
  empty,
  emptyLabel,
  loading,
  height = 320,
}: {
  children?: React.ReactNode;
  empty: boolean;
  emptyLabel?: string;
  loading: boolean;
  height?: number;
}) {
  return (
    <div className="w-full" style={{ height }}>
      {loading ? (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent" />
          Fetching car data…
        </div>
      ) : empty ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 text-center text-sm text-muted">
          <Gauge className="h-8 w-8 opacity-40" />
          {emptyLabel}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function TelemetryCharts({
  chartData,
  seriesA,
  seriesB,
  mapPoints,
  driverA,
  driverB,
  selectedLap,
  loadingChart,
  error,
  onRetry,
}: {
  chartData: Record<string, unknown>[];
  seriesA: TelemetryPoint[];
  seriesB: TelemetryPoint[];
  mapPoints: MapPoint[];
  driverA: OpenF1Driver | undefined;
  driverB: OpenF1Driver | undefined;
  selectedLap: OpenF1Lap | undefined;
  loadingChart: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const labelA = driverA?.name_acronym ?? "Driver";
  const labelB = driverB?.name_acronym ?? "Compare";
  const colorA = driverA ? `#${driverA.team_colour}` : "#e10600";
  const colorB = driverB ? `#${driverB.team_colour}` : "#60a5fa";

  return (
    <>
      <div className="card p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <Gauge className="h-4 w-4 text-accent" />
            Speed trace
          </h2>
          <div className="flex items-center gap-2">
            {driverA && selectedLap && (
              <TelemetryExportButton
                data={seriesA}
                driverName={driverA.broadcast_name || `Driver ${driverA.driver_number}`}
                lapNumber={selectedLap.lap_number}
              />
            )}
            {loadingChart && (
              <span className="inline-flex items-center gap-1.5 text-xs text-accent">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading…
              </span>
            )}
          </div>
        </div>
        {error && (
          <div className="mb-4 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
            {error}
            <button
              type="button"
              onClick={onRetry}
              className="ml-3 font-medium text-accent underline"
            >
              Retry
            </button>
          </div>
        )}
        <ChartFrame
          empty={!chartData.length && !loadingChart}
          emptyLabel="No telemetry samples for this lap"
          loading={loadingChart && !chartData.length}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} syncId="telemetry">
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="t"
                stroke="#71717a"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                width={48}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey={labelA}
                name={`${labelA} speed`}
                stroke={colorA}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              {seriesB.length > 0 && (
                <Line
                  type="monotone"
                  dataKey={labelB}
                  name={`${labelB} speed`}
                  stroke={colorB}
                  dot={false}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
      </div>

      {mapPoints.length > 2 && (
        <div className="card p-4 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <MapIcon className="h-4 w-4 text-accent" />
            Track map
          </h2>
          <TrackMap points={mapPoints} />
        </div>
      )}

      {chartData.length > 0 && (
        <div className="card p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h2 className="flex items-center gap-2 font-semibold">
              <Activity className="h-4 w-4 text-accent" />
              Pedal inputs
            </h2>
            <p className="text-xs text-muted">
              Throttle 0–100%. Brake is on/off (OpenF1).
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Throttle (%)
              </div>
              <ChartFrame empty={false} loading={false} height={200}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} syncId="telemetry">
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="t"
                      stroke="#71717a"
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#71717a"
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      width={36}
                      domain={[0, 100]}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="stepAfter"
                      dataKey={`${labelA}_thr`}
                      name={labelA}
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.25}
                      strokeWidth={1.75}
                      isAnimationActive={false}
                      dot={false}
                    />
                    {seriesB.length > 0 && (
                      <Area
                        type="stepAfter"
                        dataKey={`${labelB}_thr`}
                        name={labelB}
                        stroke="#86efac"
                        fill="#86efac"
                        fillOpacity={0.12}
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        isAnimationActive={false}
                        dot={false}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </ChartFrame>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Brake (on / off)
              </div>
              <ChartFrame empty={false} loading={false} height={140}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} syncId="telemetry">
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="t"
                      stroke="#71717a"
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#71717a"
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      width={36}
                      domain={[0, 100]}
                      ticks={[0, 100]}
                      tickFormatter={(v) => (v === 100 ? "ON" : "OFF")}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => {
                        const n = Number(value ?? 0);
                        return [n > 0 ? "ON" : "OFF", "Brake"];
                      }}
                    />
                    <Area
                      type="stepAfter"
                      dataKey={`${labelA}_brk`}
                      name={labelA}
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.35}
                      strokeWidth={1.75}
                      isAnimationActive={false}
                      dot={false}
                    />
                    {seriesB.length > 0 && (
                      <Area
                        type="stepAfter"
                        dataKey={`${labelB}_brk`}
                        name={labelB}
                        stroke="#fcd34d"
                        fill="#fcd34d"
                        fillOpacity={0.15}
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        isAnimationActive={false}
                        dot={false}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </ChartFrame>
            </div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <MoreTraces chartData={chartData} labelA={labelA} />
      )}
    </>
  );
}

function MoreTraces({
  chartData,
  labelA,
}: {
  chartData: Record<string, unknown>[];
  labelA: string;
}) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-white/[0.02]"
      >
        <span className="flex items-center gap-2">
          <ChevronDown
            className={cn("h-4 w-4 transition", showMore && "rotate-180")}
          />
          More traces (RPM & gear)
        </span>
        <ArrowRight className="h-4 w-4 text-muted" />
      </button>
      {showMore && (
        <div className="space-y-6 border-t border-border p-4 sm:p-6">
          <ChartFrame empty={false} loading={false} height={220}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} syncId="telemetry">
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="t"
                  stroke="#71717a"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  width={48}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey={`${labelA}_rpm`}
                  name={`${labelA} RPM`}
                  stroke="#60a5fa"
                  dot={false}
                  strokeWidth={1.75}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
          <ChartFrame empty={false} loading={false} height={180}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} syncId="telemetry">
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="t"
                  stroke="#71717a"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  width={32}
                  domain={[0, 8]}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="stepAfter"
                  dataKey={`${labelA}_gear`}
                  name={`${labelA} gear`}
                  stroke="#a78bfa"
                  dot={false}
                  strokeWidth={1.75}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </div>
      )}
    </div>
  );
}
