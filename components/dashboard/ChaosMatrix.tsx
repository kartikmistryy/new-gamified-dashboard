"use client";

import { useMemo, useRef, useEffect, useId, type MouseEvent, type ReactNode } from "react";
import {
  type ChaosPoint,
  type ChaosCategory,
  type ChaosTimeRangeKey,
  CATEGORY_COLORS,
  categorizeChaos,
  median,
  generateSyntheticChaosPoints,
} from "@/lib/orgDashboard/chaosMatrixData";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";

export type { ChaosTimeRangeKey };

type ChaosMatrixProps = {
  data?: ChaosPoint[];
  range?: ChaosTimeRangeKey;
  /** Optional visibility map keyed by team name; when provided, hidden teams are removed from the plot. */
  visibleTeams?: Record<string, boolean>;
  /** Optional team names used when generating synthetic chaos points so labels match the Teams table. */
  teamNames?: string[];
  tooltipTeamLabel?: string;
  renderPoint?: (
    point: CategorizedPoint & { cx: number; cy: number; stackIndex?: number; stackCount?: number },
    index: number,
    handlers: {
      onMouseEnter: (event: MouseEvent<SVGElement>) => void;
      onMouseMove: (event: MouseEvent<SVGElement>) => void;
      onMouseLeave: () => void;
    }
  ) => ReactNode;
};

type CategorizedPoint = ChaosPoint & { category: ChaosCategory };

const WIDTH = 800;
const HEIGHT = 480;
const MARGIN = { top: 24, right: 24, bottom: 48, left: 96 };

export function ChaosMatrix({
  data,
  range = "max",
  visibleTeams,
  teamNames,
  tooltipTeamLabel = "Team",
  renderPoint,
}: ChaosMatrixProps) {
  const tooltipId = useId().replace(/:/g, "");
  const tooltipRef = useRef<D3TooltipController | null>(null);

  useEffect(() => {
    tooltipRef.current = createChartTooltip(`chaos-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  const chart = useMemo(() => {
    const base = data && data.length > 0 ? data : generateSyntheticChaosPoints(range, teamNames);
    const kpThresh = base.length > 0 ? median(base.map((p) => p.medianWeeklyKp)) : 1000;
    const churnThresh = base.length > 0 ? median(base.map((p) => p.churnRatePct)) : 2;
    const categorized: CategorizedPoint[] = base.map((p) => ({
      ...p,
      category: categorizeChaos(p.medianWeeklyKp, p.churnRatePct, kpThresh, churnThresh),
    }));

    const filtered = visibleTeams
      ? categorized.filter((p) => visibleTeams[p.team] !== false)
      : categorized;

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
      points: filtered.map((p) => ({
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
  }, [data, range, visibleTeams, teamNames]);

  return (
    <div className="w-full overflow-visible">
      <div
        className="flex shrink-0 flex-col items-center justify-center overflow-visible"
        style={{ width: WIDTH }}
      >
      <div className="relative overflow-visible bg-white">
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
          {(() => {
            const buckets = new Map<string, { count: number; used: number }>();
            chart.points.forEach((p) => {
              const key = `${Math.round(p.cx)}:${Math.round(p.cy)}`;
              const bucket = buckets.get(key);
              if (bucket) {
                bucket.count += 1;
              } else {
                buckets.set(key, { count: 1, used: 0 });
              }
            });

            return chart.points.map((p, idx) => {
            const handlers = {
              onMouseEnter: (e: MouseEvent<SVGElement>) => {
                const tooltip = tooltipRef.current;
                if (!tooltip) return;
                tooltip.show(
                  `<div style="font-weight:600; color:#0f172a;">${p.name}</div>` +
                    `<div style="color:#6b7280;">${tooltipTeamLabel}: ${p.team}</div>` +
                    `<div style="margin-top:4px; color:#2563eb;">KP: ${p.medianWeeklyKp} · Churn: ${Math.round(p.churnRatePct)}%</div>`,
                  e.clientX + 12,
                  e.clientY + 12
                );
              },
              onMouseMove: (e: MouseEvent<SVGElement>) => {
                tooltipRef.current?.move(e.clientX + 12, e.clientY + 12);
              },
              onMouseLeave: () => tooltipRef.current?.hide(),
            };

            const bucketKey = `${Math.round(p.cx)}:${Math.round(p.cy)}`;
            const bucket = buckets.get(bucketKey);
            const stackIndex = bucket ? bucket.used++ : 0;
            const stackCount = bucket?.count ?? 1;
            const stackedPoint = { ...p, stackIndex, stackCount };

            if (renderPoint) {
              return (
                <g key={`${p.name}-${idx}`}>
                  {renderPoint(stackedPoint, idx, handlers)}
                </g>
              );
            }

            return (
              <circle
                key={`${p.name}-${idx}`}
                cx={p.cx}
                cy={p.cy}
                r={4}
                fill={CATEGORY_COLORS[p.category]}
                {...handlers}
              />
            );
            });
          })()}
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
