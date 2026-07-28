"use client";

import { useMemo, useState, useRef } from "react";

export type MapPoint = { x: number; y: number; speed?: number };

function speedColor(speed: number, min: number, max: number) {
  const t = max > min ? (speed - min) / (max - min) : 0.5;
  // blue (slow) → green → yellow → red (fast)
  const r = Math.round(255 * Math.min(1, t * 1.5));
  const g = Math.round(255 * (t < 0.5 ? t * 2 : 2 - t * 2));
  const b = Math.round(255 * Math.max(0, 1 - t * 1.5));
  return `rgb(${r},${g},${b})`;
}

export function TrackMap({
  points,
  className,
}: {
  points: MapPoint[];
  className?: string;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<MapPoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const lastMoveRef = useRef(0);

  const { segments, vb, startFinish } = useMemo(() => {
    if (points.length < 2) {
      return {
        segments: [] as { d: string; color: string }[],
        vb: "0 0 100 100",
        startFinish: null,
      };
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 20;
    const w = Math.max(maxX - minX, 1);
    const h = Math.max(maxY - minY, 1);

    // Flip Y for screen coords
    const proj = (p: MapPoint) => ({
      x: pad + ((p.x - minX) / w) * 360,
      y: pad + ((maxY - p.y) / h) * 360,
      speed: p.speed ?? 0,
    });

    const projected = points.map(proj);
    const speeds = projected.map((p) => p.speed);
    const minS = Math.min(...speeds);
    const maxS = Math.max(...speeds);

    const segs: { d: string; color: string }[] = [];
    for (let i = 1; i < projected.length; i++) {
      const a = projected[i - 1];
      const b = projected[i];
      segs.push({
        d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`,
        color: speedColor((a.speed + b.speed) / 2, minS, maxS),
      });
    }

    // Start/finish line (first point)
    const startFinishPoint = projected[0];

    return {
      segments: segs,
      vb: `0 0 ${360 + pad * 2} ${360 + pad * 2}`,
      startFinish: startFinishPoint,
    };
  }, [points]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const now = Date.now();
    if (now - lastMoveRef.current < 50) return;
    lastMoveRef.current = now;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Find closest point
    if (points.length > 0) {
      const svgPoint = svg.createSVGPoint();
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
      const cursorPt = svgPoint.matrixTransform(svg.getScreenCTM()?.inverse());
      
      // Simple distance calculation
      let closestPoint: MapPoint | null = null;
      let minDist = Infinity;
      
      for (const point of points) {
        const dx = point.x - cursorPt.x;
        const dy = point.y - cursorPt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist && dist < 20) {
          minDist = dist;
          closestPoint = point;
        }
      }
      
      setHoveredPoint(closestPoint);
    }
  };

  if (points.length < 2) {
    return (
      <div
        className={`flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted ${className ?? ""}`}
      >
        No track path for this lap
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <svg
          viewBox={vb}
          className="h-72 w-full rounded-xl border border-border bg-black/40"
          role="img"
          aria-label="Track map colored by speed"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {segments.map((s, i) => (
            <path
              key={i}
              d={s.d}
              stroke={s.color}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          
          {/* Start/finish line */}
          {startFinish && (
            <g>
              <line
                x1={startFinish.x - 5}
                y1={startFinish.y - 5}
                x2={startFinish.x + 5}
                y2={startFinish.y + 5}
                stroke="white"
                strokeWidth={2}
                strokeDasharray="2,2"
              />
              <text
                x={startFinish.x + 8}
                y={startFinish.y - 8}
                fill="white"
                fontSize="8"
                fontWeight="bold"
              >
                S/F
              </text>
            </g>
          )}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"
            style={{
              left: mousePos.x + 10,
              top: mousePos.y - 40,
            }}
          >
            <div className="font-semibold">
              Speed: {hoveredPoint.speed?.toFixed(0) ?? "—"} km/h
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
        <span>Slower</span>
        <div
          className="mx-2 h-1.5 flex-1 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #3b82f6, #22c55e, #eab308, #ef4444)",
          }}
        />
        <span>Faster</span>
      </div>
    </div>
  );
}
