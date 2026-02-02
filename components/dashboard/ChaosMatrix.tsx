"use client";

import { useMemo, useRef, useState } from "react";
import {
  type ChaosPoint,
  type ChaosCategory,
  type ChaosTimeRangeKey,
  CATEGORY_COLORS,
  categorizeChaos,
  median,
  generateSyntheticChaosPoints,
} from "@/lib/orgDashboard/chaosMatrixData";

export type { ChaosTimeRangeKey };

type ChaosMatrixProps = {
  data?: ChaosPoint[];
  range?: ChaosTimeRangeKey;
};

type CategorizedPoint = ChaosPoint & { category: ChaosCategory };

const WIDTH = 800;
const HEIGHT = 380;
const MARGIN = { top: 24, right: 24, bottom: 48, left: 96 };

export function ChaosMatrix({ data, range = "max" }: ChaosMatrixProps) {
  const [tooltip, setTooltip] = useState<{
    point: CategorizedPoint;
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chart = useMemo(() => {
    const base = data && data.length > 0 ? data : generateSyntheticChaosPoints(range);
    const kpThresh = base.length > 0 ? median(base.map((p) => p.medianWeeklyKp)) : 1000;
    const churnThresh = base.length > 0 ? median(base.map((p) => p.churnRatePct)) : 2;
    const categorized: CategorizedPoint[] = base.map((p) => ({
      ...p,
      category: categorizeChaos(p.medianWeeklyKp, p.churnRatePct, kpThresh, churnThresh),
    }));

    const xMin = -1000;
    const xMax = 8000;
    const yMin = 0;
    const yMax = 14;
    const innerW = WIDTH - MARGIN.left - MARGIN.right;
    const xScale = (x: number) =>
      ((x - xMin) / (xMax - xMin)) * innerW + MARGIN.left;
    const yScale = (y: number) =>
      HEIGHT - MARGIN.bottom - ((y - yMin) / (yMax - yMin)) * (HEIGHT - MARGIN.top - MARGIN.bottom);

    const vlineX = xScale(kpThresh);
    const hlineY = yScale(churnThresh);
    const rightCenterX = xScale((kpThresh + xMax) / 2);

    return {
      points: categorized.map((p) => ({
        ...p,
        cx: xScale(p.medianWeeklyKp),
        cy: yScale(p.churnRatePct),
      })),
      vlineX,
      hlineY,
      xTicks: [-1000, 0, 2000, 4000, 6000, 8000].map((v) => ({ value: v, x: xScale(v) })),
      yTicks: [0, 2, 4, 6, 8, 10, 12, 14].map((v) => ({ value: v, y: yScale(v) })),
      labels: [
        { x: MARGIN.left + 10, y: MARGIN.top + 20, text: "Low-Skill Dev", color: CATEGORY_COLORS["Low-Skill Developer"] },
        { x: MARGIN.left + 10, y: HEIGHT - MARGIN.bottom - 10, text: "Traditional Dev", color: CATEGORY_COLORS["Traditional Developer"] },
        { x: rightCenterX, y: MARGIN.top + 60, text: "Unskilled AI User", color: CATEGORY_COLORS["Unskilled AI User"] },
        { x: rightCenterX, y: HEIGHT - MARGIN.bottom - 10, text: "Skilled AI User", color: CATEGORY_COLORS["Skilled AI User"] },
      ],
    };
  }, [data, range]);

  return (
    <div className="w-full overflow-visible">
      <div
        className="flex shrink-0 flex-col items-center justify-center overflow-visible"
        style={{ width: WIDTH }}
      >
      <div ref={containerRef} className="relative overflow-visible bg-white">
        <svg
          role="img"
          aria-label="Engineering Chaos Matrix: Median Weekly KP vs Churn Rate"
          width={WIDTH}
          height={HEIGHT}
          className="block w-full"
        >
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={WIDTH - MARGIN.left - MARGIN.right}
            height={HEIGHT - MARGIN.top - MARGIN.bottom}
            fill="#f9fafb"
          />
          <line x1={chart.vlineX} x2={chart.vlineX} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="#9ca3af" strokeWidth={1} strokeDasharray="4 4" />
          <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={chart.hlineY} y2={chart.hlineY} stroke="#9ca3af" strokeWidth={1} strokeDasharray="4 4" />
          {chart.points.map((p, idx) => (
            <circle
              key={`${p.name}-${idx}`}
              cx={p.cx}
              cy={p.cy}
              r={4}
              fill={CATEGORY_COLORS[p.category]}
              onMouseEnter={(e) => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                setTooltip({ point: p, x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseMove={(e) => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                setTooltip((prev) => (prev ? { point: prev.point, x: e.clientX - rect.left, y: e.clientY - rect.top } : null));
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
          <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={HEIGHT - MARGIN.bottom} y2={HEIGHT - MARGIN.bottom} stroke="#d1d5db" />
          <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="#d1d5db" />
          {chart.xTicks.map((t, i) => (
            <g key={i} transform={`translate(${t.x}, ${HEIGHT - MARGIN.bottom})`}>
              <line y2={6} stroke="#9ca3af" />
              <text y={20} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 10 }}>{t.value}</text>
            </g>
          ))}
          {chart.yTicks.map((t, i) => (
            <g key={i} transform={`translate(${MARGIN.left}, ${t.y})`}>
              <line x1={-6} stroke="#9ca3af" />
              <text x={-8} textAnchor="end" dominantBaseline="middle" className="fill-slate-600" style={{ fontSize: 10 }}>{t.value}</text>
            </g>
          ))}
          <text x={WIDTH / 2} y={HEIGHT - 8} textAnchor="middle" className="fill-slate-700" style={{ fontSize: 14 }}>
            Median Weekly KarmaPoints
          </text>
          <text x={14} y={HEIGHT / 2} textAnchor="middle" transform={`rotate(-90 14 ${HEIGHT / 2})`} className="fill-slate-700" style={{ fontSize: 14 }}>
            Churn Rate (%)
          </text>
          <g style={{ isolation: "isolate" }}>
            {chart.labels.map((l, i) => (
              <text
                key={i}
                x={l.x}
                y={l.y}
                textAnchor="start"
                dominantBaseline="middle"
                fill={l.color}
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                {l.text}
              </text>
            ))}
          </g>
        </svg>
        {tooltip && (
          <div className="pointer-events-none absolute rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg" style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}>
            <div className="font-medium">{tooltip.point.name}</div>
            <div className="text-[11px] text-slate-300">Team: {tooltip.point.team}</div>
            <div className="mt-1 text-[11px]">KP: {tooltip.point.medianWeeklyKp} · Churn: {tooltip.point.churnRatePct}%</div>
          </div>
        )}

<div
          className="mt-3 pt-6 flex flex-wrap items-center justify-center gap-6 text-slate-700"
          role="list"
          aria-label="Chart legend"
        >
          {(Object.keys(CATEGORY_COLORS) as ChaosCategory[]).map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
              <span className="text-xs font-medium">{cat}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
