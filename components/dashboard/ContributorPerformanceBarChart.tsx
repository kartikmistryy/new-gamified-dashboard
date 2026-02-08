"use client";

import { useMemo, useRef, useEffect, useId, type MouseEvent } from "react";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";

export type ContributorCodeMetrics = {
  contributorName: string;
  additions: number;
  deletions: number;
};

type ContributorPerformanceBarChartProps = {
  data: ContributorCodeMetrics[];
  teamMedian?: { additions: number; deletions: number };
  orgMedian?: { additions: number; deletions: number };
  height?: number;
};

const CHART_HEIGHT = 500;
const CHART_WIDTH = 900;
const MARGIN = { top: 40, right: 60, bottom: 120, left: 80 };
const BAR_WIDTH = 32;
const BAR_GAP = 12;

export function ContributorPerformanceBarChart({
  data,
  teamMedian,
  orgMedian,
  height = CHART_HEIGHT,
}: ContributorPerformanceBarChartProps) {
  const tooltipId = useId().replace(/:/g, "");
  const tooltipRef = useRef<D3TooltipController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tooltipRef.current = createChartTooltip(`contributor-performance-bar-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  const chart = useMemo(() => {
    if (data.length === 0) {
      return null;
    }

    // Calculate the maximum value for scaling
    const maxAdditions = Math.max(...data.map((d) => d.additions));
    const maxDeletions = Math.max(...data.map((d) => d.deletions));
    const maxValue = Math.max(maxAdditions, maxDeletions);

    const innerWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    // Center Y position (zero line)
    const centerY = MARGIN.top + innerHeight / 2;

    // Scale function: maps data value to pixel distance from center
    const scaleY = (value: number) => (value / maxValue) * (innerHeight / 2);

    // Calculate X position for each bar group
    const groupWidth = BAR_WIDTH * 2 + BAR_GAP;
    const totalWidth = data.length * groupWidth;
    const startX = MARGIN.left + (innerWidth - totalWidth) / 2;

    // Create bars for each contributor
    const bars = data.map((contributor, index) => {
      const groupX = startX + index * groupWidth;
      const deletionsX = groupX;
      const additionsX = groupX + BAR_WIDTH + BAR_GAP;

      return {
        contributorName: contributor.contributorName,
        groupX,
        additionsBar: {
          x: additionsX,
          y: centerY - scaleY(contributor.additions),
          height: scaleY(contributor.additions),
          value: contributor.additions,
        },
        deletionsBar: {
          x: deletionsX,
          y: centerY,
          height: scaleY(contributor.deletions),
          value: contributor.deletions,
        },
      };
    });

    // Generate Y-axis ticks
    const tickCount = 5;
    const ticks = [];
    for (let i = -tickCount; i <= tickCount; i++) {
      const value = (i / tickCount) * maxValue;
      const y = centerY - (i / tickCount) * (innerHeight / 2);
      ticks.push({
        y,
        value: Math.round(Math.abs(value)),
        isZero: i === 0,
      });
    }

    // Calculate median line positions if provided
    const medianLines = [];
    if (teamMedian) {
      medianLines.push({
        type: "team" as const,
        additionsY: centerY - scaleY(teamMedian.additions),
        deletionsY: centerY + scaleY(teamMedian.deletions),
        label: "Team Median",
        color: "#3b82f6",
      });
    }
    if (orgMedian) {
      medianLines.push({
        type: "org" as const,
        additionsY: centerY - scaleY(orgMedian.additions),
        deletionsY: centerY + scaleY(orgMedian.deletions),
        label: "Org Median",
        color: "#8b5cf6",
      });
    }

    return {
      bars,
      ticks,
      centerY,
      medianLines,
      innerWidth,
      innerHeight,
    };
  }, [data, teamMedian, orgMedian, height]);

  if (!chart) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-12">
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <div className="min-w-[900px]">
        <svg
          width={CHART_WIDTH}
          height={height}
          className="block w-full"
          role="img"
          aria-label="Contributor code additions and deletions comparison"
        >
          {/* Background */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={chart.innerWidth}
            height={chart.innerHeight}
            fill="#f9fafb"
          />

          {/* Median lines (drawn first, in background) */}
          {chart.medianLines.map((median, index) => (
            <g key={`${median.type}-${index}`}>
              {/* Additions median line (above center) */}
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + chart.innerWidth}
                y1={median.additionsY}
                y2={median.additionsY}
                stroke={median.color}
                strokeWidth={2}
                strokeDasharray="8 4"
                opacity={0.7}
              />
              {/* Deletions median line (below center) */}
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + chart.innerWidth}
                y1={median.deletionsY}
                y2={median.deletionsY}
                stroke={median.color}
                strokeWidth={2}
                strokeDasharray="8 4"
                opacity={0.7}
              />
              {/* Label for additions */}
              <text
                x={MARGIN.left + chart.innerWidth + 8}
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

          {/* Center line (zero line) */}
          <line
            x1={MARGIN.left}
            x2={MARGIN.left + chart.innerWidth}
            y1={chart.centerY}
            y2={chart.centerY}
            stroke="#1f2937"
            strokeWidth={2}
          />

          {/* Bars */}
          {chart.bars.map((bar) => {
            const additionsHandlers = {
              onMouseEnter: (e: MouseEvent<SVGElement>) => {
                tooltipRef.current?.show(
                  `<div style="font-weight:600; color:#10b981;">+${bar.additionsBar.value.toLocaleString()} additions</div>` +
                    `<div style="color:#6b7280; margin-top:4px;">${bar.contributorName}</div>`,
                  e.clientX + 12,
                  e.clientY + 12
                );
              },
              onMouseMove: (e: MouseEvent<SVGElement>) => {
                tooltipRef.current?.move(e.clientX + 12, e.clientY + 12);
              },
              onMouseLeave: () => tooltipRef.current?.hide(),
            };

            const deletionsHandlers = {
              onMouseEnter: (e: MouseEvent<SVGElement>) => {
                tooltipRef.current?.show(
                  `<div style="font-weight:600; color:#ef4444;">-${bar.deletionsBar.value.toLocaleString()} deletions</div>` +
                    `<div style="color:#6b7280; margin-top:4px;">${bar.contributorName}</div>`,
                  e.clientX + 12,
                  e.clientY + 12
                );
              },
              onMouseMove: (e: MouseEvent<SVGElement>) => {
                tooltipRef.current?.move(e.clientX + 12, e.clientY + 12);
              },
              onMouseLeave: () => tooltipRef.current?.hide(),
            };

            return (
              <g key={bar.contributorName}>
                {/* Deletions bar (below center, red) */}
                <rect
                  x={bar.deletionsBar.x}
                  y={bar.deletionsBar.y}
                  width={BAR_WIDTH}
                  height={bar.deletionsBar.height}
                  fill="#ef4444"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  {...deletionsHandlers}
                />

                {/* Additions bar (above center, green) */}
                <rect
                  x={bar.additionsBar.x}
                  y={bar.additionsBar.y}
                  width={BAR_WIDTH}
                  height={bar.additionsBar.height}
                  fill="#10b981"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  {...additionsHandlers}
                />

                {/* Contributor name label (below X-axis) */}
                <text
                  x={bar.groupX + BAR_WIDTH + BAR_GAP / 2}
                  y={MARGIN.top + chart.innerHeight + 20}
                  textAnchor="middle"
                  className="fill-slate-700"
                  style={{ fontSize: 12, fontWeight: 500 }}
                  transform={`rotate(45, ${bar.groupX + BAR_WIDTH + BAR_GAP / 2}, ${MARGIN.top + chart.innerHeight + 20})`}
                >
                  {bar.contributorName}
                </text>
              </g>
            );
          })}

          {/* Y-axis */}
          <line
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={MARGIN.top + chart.innerHeight}
            stroke="#d1d5db"
            strokeWidth={1}
          />

          {/* Y-axis ticks and labels */}
          {chart.ticks.map((tick, i) => (
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

          {/* Y-axis label */}
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
            y={MARGIN.top + chart.innerHeight + 15}
            textAnchor="start"
            className="fill-red-600"
            style={{ fontSize: 12, fontWeight: 600 }}
          >
            Deletions
          </text>
        </svg>

        {/* Legend */}
        {chart.medianLines.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            {chart.medianLines.map((median) => (
              <div key={median.type} className="flex items-center gap-2">
                <svg width="24" height="2">
                  <line
                    x1="0"
                    x2="24"
                    y1="1"
                    y2="1"
                    stroke={median.color}
                    strokeWidth="2"
                    strokeDasharray="8 4"
                  />
                </svg>
                <span className="text-slate-600 font-medium">{median.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
