"use client";

import { useMemo, useRef, useEffect, useId } from "react";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import { calculateBarChart, CHART_CONSTANTS } from "@/lib/dashboard/repoDashboard/contributorBarChartUtils";
import { BarGroup, MedianLines, YAxisTicks } from "./ContributorBarChartComponents";

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

const { CHART_HEIGHT, CHART_WIDTH, MARGIN } = CHART_CONSTANTS;

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

  const chart = useMemo(
    () => calculateBarChart(data, teamMedian, orgMedian, height),
    [data, teamMedian, orgMedian, height]
  );

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

          <MedianLines medianLines={chart.medianLines} innerWidth={chart.innerWidth} />

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
          {chart.bars.map((bar) => (
            <BarGroup
              key={bar.contributorName}
              bar={bar}
              tooltipRef={tooltipRef}
              innerHeight={chart.innerHeight}
            />
          ))}

          <YAxisTicks ticks={chart.ticks} innerHeight={chart.innerHeight} />
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
