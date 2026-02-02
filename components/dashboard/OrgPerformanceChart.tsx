"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChartEvent, ChartAnnotation } from "@/lib/orgDashboard/types";
import type { OrgPerformanceDataPoint } from "@/lib/orgDashboard/orgPerformanceChartData";
import {
  generateOrgPerformanceData,
  ORG_PERFORMANCE_HOLIDAYS,
  ORG_PERFORMANCE_ANNOTATIONS,
  PERFORMANCE_ZONES,
  PERFORMANCE_BASELINES,
} from "@/lib/orgDashboard/orgPerformanceChartData";
import {
  buildOrgPerformanceChartGeometry,
  CHART_HEIGHT,
  MARGIN,
} from "@/lib/orgDashboard/orgPerformanceChartUtils";

type OrgPerformanceChartProps = {
  className?: string;
  /** When provided, use API/real data; otherwise use mock. Same shape = same behavior. */
  data?: OrgPerformanceDataPoint[];
  holidays?: ChartEvent[];
  annotations?: ChartAnnotation[];
};

function formatXAxis(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function OrgPerformanceChart({
  className = "",
  data: dataProp,
  holidays = ORG_PERFORMANCE_HOLIDAYS,
  annotations = ORG_PERFORMANCE_ANNOTATIONS,
}: OrgPerformanceChartProps) {
  const data = useMemo(
    () => (dataProp != null && dataProp.length > 0 ? dataProp : generateOrgPerformanceData()),
    [dataProp]
  );
  const [tooltip, setTooltip] = useState<{ date: string; value: number; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: CHART_HEIGHT });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? {};
      if (typeof width === "number" && width > 0) setChartSize((s) => ({ ...s, width }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geom = useMemo(
    () =>
      buildOrgPerformanceChartGeometry(
        data,
        holidays,
        annotations,
        chartSize.width || undefined,
        chartSize.height
      ),
    [data, holidays, annotations, chartSize.width, chartSize.height]
  );

  const width = chartSize.width > 0 ? chartSize.width : geom.innerWidth + MARGIN.left + MARGIN.right;
  const height = chartSize.height;

  if (!data.length) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full h-[420px] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const plotLeft = MARGIN.left;
  const plotRight = width - MARGIN.right;
  const plotTop = MARGIN.top;
  const plotBottom = height - MARGIN.bottom;

  return (
    <div ref={containerRef} className={`w-full overflow-visible ${className}`}>
      <div className="relative overflow-visible bg-white">
        <svg
          role="img"
          aria-label="Percentile normalized to rolling average over time"
          width={width}
          height={height}
          className="block w-full"
        >
          <rect x={plotLeft} y={plotTop} width={geom.innerWidth} height={geom.innerHeight} fill="#fafafa" />
          <rect x={plotLeft} y={geom.yScale(100)} width={geom.innerWidth} height={geom.yScale(70) - geom.yScale(100)} fill={PERFORMANCE_ZONES.excellent.color} />
          <rect x={plotLeft} y={geom.yScale(70)} width={geom.innerWidth} height={geom.yScale(60) - geom.yScale(70)} fill={PERFORMANCE_ZONES.aboveAvg.color} />
          <rect x={plotLeft} y={geom.yScale(40)} width={geom.innerWidth} height={geom.yScale(30) - geom.yScale(40)} fill={PERFORMANCE_ZONES.belowAvg.color} />
          <rect x={plotLeft} y={geom.yScale(30)} width={geom.innerWidth} height={plotBottom - geom.yScale(30)} fill={PERFORMANCE_ZONES.concerning.color} />

          {geom.yTicks.map((t) => (
            <line key={t} x1={plotLeft} x2={plotRight} y1={geom.yScale(t)} y2={geom.yScale(t)} stroke="#e5e7eb" strokeDasharray="3 3" strokeWidth={1} />
          ))}

          <line x1={plotLeft} x2={plotRight} y1={geom.yScale(60)} y2={geom.yScale(60)} stroke={PERFORMANCE_BASELINES.p60.color} strokeDasharray="8 4" strokeWidth={1.5} />
          <line x1={plotLeft} x2={plotRight} y1={geom.yScale(40)} y2={geom.yScale(40)} stroke={PERFORMANCE_BASELINES.p40.color} strokeDasharray="8 4" strokeWidth={1.5} />

          {geom.holidays.map((h, i) => (
            <g key={`holiday-${i}`}>
              <line x1={h.x} x2={h.x} y1={plotTop} y2={plotBottom} stroke="#CA3A31" strokeDasharray="4 3" strokeWidth={1} strokeOpacity={0.6} />
              <text x={h.x} y={plotTop - 8} textAnchor="start" fontSize={9} fill="#CA3A31" fontWeight={500} transform={`rotate(-45, ${h.x}, ${plotTop - 8})`}>{h.label}</text>
            </g>
          ))}

          {geom.annotations.map((ann, i) => {
            const labelY = ann.dataPoint.value > 50 ? ann.y - 25 : ann.y + 25;
            const textWidth = Math.max(ann.label.length * 6 + 12, 60);
            return (
              <g key={`ann-${i}`}>
                <line x1={ann.x} y1={ann.y} x2={ann.x} y2={labelY} stroke="#6b7280" strokeWidth={1} />
                <rect x={ann.x - textWidth / 2} y={labelY - 9} width={textWidth} height={18} fill="white" stroke="#d1d5db" strokeWidth={1} rx={3} />
                <text x={ann.x} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight={500} fill="#374151">{ann.label}</text>
              </g>
            );
          })}

          <path d={geom.linePath} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {data.map((d, i) => {
            const cx = geom.xScale(d.date);
            const cy = geom.yScale(d.value);
            return (
              <circle
                key={`pt-${i}`}
                cx={cx}
                cy={cy}
                r={3}
                fill="#2563eb"
                stroke="#2563eb"
                onMouseEnter={(e) => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  setTooltip({ date: d.date, value: d.value, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseMove={(e) => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  setTooltip((prev) => (prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null));
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

          <line x1={plotLeft} x2={plotRight} y1={plotBottom} y2={plotBottom} stroke="#9ca3af" strokeWidth={1} />
          <line x1={plotLeft} x2={plotLeft} y1={plotTop} y2={plotBottom} stroke="#9ca3af" strokeWidth={1} />

          {geom.xTicks.map((tickDate, i) => {
            const x = geom.xScale(tickDate);
            return (
              <g key={i} transform={`translate(${x}, ${plotBottom})`}>
                <line y2={6} stroke="#9ca3af" />
                <text y={20} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 11 }}>{formatXAxis(tickDate)}</text>
              </g>
            );
          })}
          <text x={width / 2} y={height - 8} textAnchor="middle" className="fill-slate-700" style={{ fontSize: 12, fontWeight: 500 }}>Week</text>

          {geom.yTicks.map((t, i) => (
            <g key={i} transform={`translate(${plotLeft}, ${geom.yScale(t)})`}>
              <line x1={-6} x2={0} stroke="#9ca3af" />
              <text x={-10} textAnchor="end" dominantBaseline="middle" className="fill-slate-600" style={{ fontSize: 11 }}>{t}</text>
            </g>
          ))}
          <text x={16} y={height / 2} textAnchor="middle" transform={`rotate(-90 16 ${height / 2})`} className="fill-slate-700" style={{ fontSize: 12, fontWeight: 500 }}>Percentile (Normalized to Rolling Avg)</text>
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none absolute rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-sm"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <p className="font-medium text-gray-900">{new Date(tooltip.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            <p className="text-blue-600">Percentile: {tooltip.value}</p>
          </div>
        )}
      </div>

      <div
        className="mt-4 w-full max-w-xs shrink-0 gap-x-4 gap-y-2 text-xs mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          minWidth: "20rem",
        }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="w-4 h-3 shrink-0 rounded-sm" style={{ backgroundColor: PERFORMANCE_ZONES.excellent.color }} />
          <span className="truncate text-gray-600">{PERFORMANCE_ZONES.excellent.label}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="w-4 h-3 shrink-0 rounded-sm" style={{ backgroundColor: PERFORMANCE_ZONES.aboveAvg.color }} />
          <span className="truncate text-gray-600">{PERFORMANCE_ZONES.aboveAvg.label}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="w-4 h-3 shrink-0 rounded-sm" style={{ backgroundColor: PERFORMANCE_ZONES.belowAvg.color }} />
          <span className="truncate text-gray-600">{PERFORMANCE_ZONES.belowAvg.label}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="w-4 h-3 shrink-0 rounded-sm" style={{ backgroundColor: PERFORMANCE_ZONES.concerning.color }} />
          <span className="truncate text-gray-600">{PERFORMANCE_ZONES.concerning.label}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <svg width="20" height="2" className="shrink-0 overflow-visible">
            <line x1="0" y1="1" x2="20" y2="1" stroke={PERFORMANCE_BASELINES.p60.color} strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <span className="truncate text-gray-600">{PERFORMANCE_BASELINES.p60.label}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <svg width="20" height="2" className="shrink-0 overflow-visible">
            <line x1="0" y1="1" x2="20" y2="1" stroke={PERFORMANCE_BASELINES.p40.color} strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <span className="truncate text-gray-600">{PERFORMANCE_BASELINES.p40.label}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <svg width="24" height="8" className="shrink-0 overflow-visible">
            <line x1="0" y1="4" x2="16" y2="4" stroke="#2563eb" strokeWidth="2" />
            <circle cx="20" cy="4" r="3" fill="#2563eb" />
          </svg>
          <span className="truncate text-gray-600">Normalized Median</span>
        </div>
      </div>
    </div>
  );
}
