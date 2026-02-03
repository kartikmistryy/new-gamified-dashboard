"use client";

import { useMemo, useRef, useState } from "react";
import type { TooltipState, OwnershipTimeRangeKey, DeveloperPoint } from "@/lib/orgDashboard/ownershipScatterTypes";
import {
  buildOwnershipChartData,
  WIDTH,
  HEIGHT,
  MARGIN,
} from "@/lib/orgDashboard/ownershipScatterUtils";

export type { OwnershipTimeRangeKey } from "@/lib/orgDashboard/ownershipScatterTypes";

type OwnershipScatterProps = {
  data?: DeveloperPoint[];
  range?: OwnershipTimeRangeKey;
};

export function OwnershipScatter({ data, range = "max" }: OwnershipScatterProps) {
  const { points, bandPath, xTicks, yTicks, trendLine } = useMemo(
    () => buildOwnershipChartData(data, range),
    [data, range]
  );

  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-full overflow-visible">
      <div ref={containerRef} className="relative overflow-visible bg-white">
        <svg
          role="img"
          aria-label="Scatterplot of Cumulative KarmaPoints versus Ownership Percentage"
          width={WIDTH}
          height={HEIGHT}
          className="block w-full"
        >
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={WIDTH - MARGIN.left - MARGIN.right}
            height={HEIGHT - MARGIN.top - MARGIN.bottom}
            fill="#f1f5f9"
          />
          {xTicks.map((t, idx) => (
            <line
              key={`v-${idx}`}
              x1={t.x}
              y1={MARGIN.top}
              x2={t.x}
              y2={HEIGHT - MARGIN.bottom}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          ))}
          {yTicks.map((t, idx) => (
            <line
              key={`h-${idx}`}
              x1={MARGIN.left}
              y1={t.y}
              x2={WIDTH - MARGIN.right}
              y2={t.y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          ))}
          {bandPath && (
            <path d={bandPath} fill="rgba(0, 200, 0, 0.2)" stroke="none" />
          )}
          {trendLine && (
            <line
              x1={trendLine.x1}
              y1={trendLine.y1}
              x2={trendLine.x2}
              y2={trendLine.y2}
              stroke="#6b7280"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}
          <g>
            {points.map((p, idx) => (
              <circle
                key={`${p.name}-${idx}`}
                cx={p.cx}
                cy={p.cy}
                r={4.5}
                fill={
                  p.outlierType === "high"
                    ? "#22c55e"
                    : p.outlierType === "low"
                      ? "#ef4444"
                      : "rgba(66, 133, 244, 0.7)"
                }
                fillOpacity={p.inNormalRange ? 1 : 1}
                onMouseEnter={(event) => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  setTooltip({
                    point: p,
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                  });
                }}
                onMouseMove={(event) => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  setTooltip((current) =>
                    current && current.point.name === p.name
                      ? { point: p, x: event.clientX - rect.left, y: event.clientY - rect.top }
                      : current
                  );
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </g>
          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={HEIGHT - MARGIN.bottom}
            y2={HEIGHT - MARGIN.bottom}
            stroke="#d1d5db"
          />
          <line
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={HEIGHT - MARGIN.bottom}
            stroke="#d1d5db"
          />
          {xTicks.map((t, idx) => (
            <g key={idx} transform={`translate(${t.x}, ${HEIGHT - MARGIN.bottom})`}>
              <line y2={6} stroke="#9ca3af" />
              <text y={20} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 10 }}>
                {t.value === 0 ? "0" : `${t.value / 1000}k`}
              </text>
            </g>
          ))}
          {yTicks.map((t, idx) => (
            <g key={idx} transform={`translate(${MARGIN.left}, ${t.y})`}>
              <line x1={-6} stroke="#9ca3af" />
              <text
                x={-10}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-600"
                style={{ fontSize: 10 }}
              >
                {t.value.toFixed(0)}
              </text>
            </g>
          ))}
          <text
            x={WIDTH / 2}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-slate-700"
            style={{ fontSize: 14 }}
          >
            Cumulative KarmaPoints
          </text>
          <text
            x={16}
            y={HEIGHT / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${HEIGHT / 2})`}
            className="fill-slate-700"
            style={{ fontSize: 14 }}
          >
            Ownership %
          </text>
        </svg>
        {tooltip && (
          <div
            className="pointer-events-none absolute rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <div className="font-medium">{tooltip.point.name}</div>
            <div className="text-[11px] text-slate-300">Team: {tooltip.point.team}</div>
            <div className="mt-1 text-[11px]">
              KP: {Math.round(tooltip.point.totalKarmaPoints).toLocaleString()}
              {" • "}
              Ownership: {tooltip.point.ownershipPct.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
      <div
        className="mt-5 pt-6 flex flex-wrap items-center justify-center gap-6 text-slate-700"
        role="list"
        aria-label="Chart legend"
      >
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: "#22c55e" }}
          />
          <span className="text-xs font-medium">Outlier (High Ownership)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ef4444]" />
          <span className="text-xs font-medium">Outlier (Low Ownership)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" preserveAspectRatio="none" aria-hidden>
            <line x1={0} y1={6} x2={12} y2={6} stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 4" />
          </svg>
          <span className="text-xs font-medium">Trend</span>
        </div>
      </div>
    </div>
  );
}
