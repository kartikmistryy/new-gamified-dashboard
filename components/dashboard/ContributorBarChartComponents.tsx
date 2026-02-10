/** Sub-components for ContributorPerformanceBarChart */

import type { MouseEvent, MutableRefObject } from "react";
import type { D3TooltipController } from "@/lib/chartTooltip";

const MARGIN = { top: 40, right: 60, bottom: 120, left: 80 };
const BAR_WIDTH = 32;
const BAR_GAP = 12;

export type MedianLinesProps = {
  medianLines: Array<{
    type: "team" | "org";
    additionsY: number;
    deletionsY: number;
    label: string;
    color: string;
  }>;
  innerWidth: number;
};

export function MedianLines({ medianLines, innerWidth }: MedianLinesProps) {
  return (
    <>
      {medianLines.map((median, index) => (
        <g key={`${median.type}-${index}`}>
          <line
            x1={MARGIN.left}
            x2={MARGIN.left + innerWidth}
            y1={median.additionsY}
            y2={median.additionsY}
            stroke={median.color}
            strokeWidth={2}
            strokeDasharray="8 4"
            opacity={0.7}
          />
          <line
            x1={MARGIN.left}
            x2={MARGIN.left + innerWidth}
            y1={median.deletionsY}
            y2={median.deletionsY}
            stroke={median.color}
            strokeWidth={2}
            strokeDasharray="8 4"
            opacity={0.7}
          />
          <text
            x={MARGIN.left + innerWidth + 8}
            y={median.additionsY}
            dominantBaseline="middle"
            className="fill-slate-600"
            style={{ fontSize: 10, fontWeight: 500 }}
            fill={median.color}
          >
            {median.label}
          </text>
        </g>
      ))}
    </>
  );
}

export type YAxisTicksProps = {
  ticks: Array<{ y: number; value: number; isZero: boolean }>;
  innerHeight: number;
};

export function YAxisTicks({ ticks, innerHeight }: YAxisTicksProps) {
  return (
    <>
      <line
        x1={MARGIN.left}
        x2={MARGIN.left}
        y1={MARGIN.top}
        y2={MARGIN.top + innerHeight}
        stroke="#d1d5db"
        strokeWidth={1}
      />
      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={MARGIN.left - 6}
            x2={MARGIN.left}
            y1={tick.y}
            y2={tick.y}
            stroke={tick.isZero ? "#1f2937" : "#9ca3af"}
            strokeWidth={tick.isZero ? 2 : 1}
          />
          <text
            x={MARGIN.left - 10}
            y={tick.y}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-slate-600"
            style={{ fontSize: 11 }}
          >
            {tick.isZero ? "0" : tick.value.toLocaleString()}
          </text>
        </g>
      ))}
      <text
        x={20}
        y={MARGIN.top - 10}
        textAnchor="start"
        className="fill-green-600"
        style={{ fontSize: 12, fontWeight: 600 }}
      >
        Additions
      </text>
      <text
        x={20}
        y={MARGIN.top + innerHeight + 15}
        textAnchor="start"
        className="fill-red-600"
        style={{ fontSize: 12, fontWeight: 600 }}
      >
        Deletions
      </text>
    </>
  );
}

export type BarGroupProps = {
  bar: {
    contributorName: string;
    groupX: number;
    additionsBar: { x: number; y: number; height: number; value: number };
    deletionsBar: { x: number; y: number; height: number; value: number };
  };
  tooltipRef: MutableRefObject<D3TooltipController | null>;
  innerHeight: number;
};

export function BarGroup({ bar, tooltipRef, innerHeight }: BarGroupProps) {
  const createHandlers = (value: number, name: string, color: string, prefix: string) => ({
    onMouseEnter: (e: MouseEvent<SVGElement>) => {
      tooltipRef.current?.show(
        `<div style="font-weight:600; color:${color};">${prefix}${value.toLocaleString()} ${name}</div>` +
          `<div style="color:#6b7280; margin-top:4px;">${bar.contributorName}</div>`,
        e.clientX + 12,
        e.clientY + 12
      );
    },
    onMouseMove: (e: MouseEvent<SVGElement>) => tooltipRef.current?.move(e.clientX + 12, e.clientY + 12),
    onMouseLeave: () => tooltipRef.current?.hide(),
  });

  return (
    <g>
      <rect
        x={bar.deletionsBar.x}
        y={bar.deletionsBar.y}
        width={BAR_WIDTH}
        height={bar.deletionsBar.height}
        fill="#ef4444"
        className="cursor-pointer transition-opacity hover:opacity-80"
        {...createHandlers(bar.deletionsBar.value, "deletions", "#ef4444", "-")}
      />
      <rect
        x={bar.additionsBar.x}
        y={bar.additionsBar.y}
        width={BAR_WIDTH}
        height={bar.additionsBar.height}
        fill="#10b981"
        className="cursor-pointer transition-opacity hover:opacity-80"
        {...createHandlers(bar.additionsBar.value, "additions", "#10b981", "+")}
      />
      <text
        x={bar.groupX + BAR_WIDTH + BAR_GAP / 2}
        y={MARGIN.top + innerHeight + 20}
        textAnchor="middle"
        className="fill-slate-700"
        style={{ fontSize: 12, fontWeight: 500 }}
        transform={`rotate(45, ${bar.groupX + BAR_WIDTH + BAR_GAP / 2}, ${MARGIN.top + innerHeight + 20})`}
      >
        {bar.contributorName}
      </text>
    </g>
  );
}
