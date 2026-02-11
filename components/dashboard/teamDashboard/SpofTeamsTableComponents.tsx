/** SPOF Teams Table Sub-Components */

"use client";

import * as React from "react";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { getTrendIconForCount } from "@/lib/orgDashboard/spofTeamsTableUtils";
import { DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";

type JoinedDistributionBarProps = {
  segments: { label: string; value: number; color: string }[];
  valueLabel: string;
};

/** Joined Distribution Bar Component with trend indicators */
export function JoinedDistributionBar({ segments, valueLabel }: JoinedDistributionBarProps) {
  const counts = segments.map((segment) => segment.value);
  const total = counts.reduce((sum, value) => sum + value, 0);
  const tooltipId = React.useId().replace(/:/g, "");
  const tooltipRef = React.useRef<D3TooltipController | null>(null);

  React.useEffect(() => {
    tooltipRef.current = createChartTooltip(`joined-distribution-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  return (
    <div className="flex h-6 w-full overflow-hidden rounded-full bg-gray-100">
      {segments.map((segment, index) => {
        const TrendIcon = getTrendIconForCount(counts, index);
        return (
          <div
            key={segment.label}
            className="flex items-center justify-center gap-1 text-xs font-semibold"
            style={{
              flex: total > 0 ? `${segment.value} 1 0` : "1 1 0",
              minWidth: 40,
              backgroundColor: hexToRgba(segment.color, 0.25),
              color: segment.color,
            }}
            onMouseEnter={(event) => {
              const tooltip = tooltipRef.current;
              if (!tooltip) return;
              tooltip.show(
                `<div style="font-weight:600; color:${DASHBOARD_COLORS.gray950};">${segment.label}</div>` +
                  `<div style="color:${DASHBOARD_COLORS.gray500};">${valueLabel}: ${segment.value}</div>`,
                event.clientX + 12,
                event.clientY + 12
              );
            }}
            onMouseMove={(event) => {
              tooltipRef.current?.move(event.clientX + 12, event.clientY + 12);
            }}
            onMouseLeave={() => tooltipRef.current?.hide()}
          >
            <TrendIcon className="size-3.5 shrink-0 text-current" aria-hidden />
            {segment.value}
          </div>
        );
      })}
    </div>
  );
}
