import { useRef } from "react";
import type { D3TooltipController } from "@/lib/chartTooltip";
import type { OrgPerformanceDataPoint } from "@/lib/orgDashboard/orgPerformanceChartData";
import type { OrgPerformanceChartGeometry } from "@/lib/orgDashboard/orgPerformanceChartUtils";
import { PERFORMANCE_ZONES, PERFORMANCE_BASELINES } from "@/lib/orgDashboard/orgPerformanceChartData";
import { MARGIN } from "@/lib/orgDashboard/orgPerformanceChartUtils";
import { formatXAxis } from "@/lib/orgDashboard/performanceChartHelpers";

type PerformanceChartSVGProps = {
  width: number;
  height: number;
  geom: OrgPerformanceChartGeometry;
  filteredData: OrgPerformanceDataPoint[];
  tooltipRef: React.MutableRefObject<D3TooltipController | null>;
  ariaLabel: string;
};

export function PerformanceChartSVG({
  width,
  height,
  geom,
  filteredData,
  tooltipRef,
  ariaLabel,
}: PerformanceChartSVGProps) {
  const plotLeft = MARGIN.left;
  const plotRight = width - MARGIN.right;
  const plotTop = MARGIN.top;
  const plotBottom = height - MARGIN.bottom;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
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

      {filteredData.map((d, i) => {
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
              const tooltip = tooltipRef.current;
              if (!tooltip) return;
              const dateLabel = new Date(d.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              tooltip.show(
                `<div style=\"font-weight:600; color:#0f172a;\">${dateLabel}</div>` +
                  `<div style=\"color:#2563eb;\">Percentile: ${d.value}</div>`,
                e.clientX + 12,
                e.clientY + 12
              );
            }}
            onMouseMove={(e) => {
              tooltipRef.current?.move(e.clientX + 12, e.clientY + 12);
            }}
            onMouseLeave={() => tooltipRef.current?.hide()}
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
  );
}
