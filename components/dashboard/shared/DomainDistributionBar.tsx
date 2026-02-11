"use client";

import { useEffect, useId, useRef } from "react";
import { hexToRgba } from "@/lib/orgDashboard/tableUtils";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import { DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";

type DomainDistributionBarProps = {
  segments: { domain: string; value: number }[];
  getColor: (domain: string) => string;
};

export function DomainDistributionBar({
  segments,
  getColor,
}: DomainDistributionBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const tooltipId = useId().replace(/:/g, "");
  const tooltipRef = useRef<D3TooltipController | null>(null);

  useEffect(() => {
    tooltipRef.current = createChartTooltip(`domain-distribution-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  return (
    <div className="flex h-6 w-full overflow-hidden rounded-full bg-gray-100">
      {segments.map((segment) => {
        const color = getColor(segment.domain);
        return (
          <div
            key={segment.domain}
            className="flex items-center justify-center text-xs font-semibold"
            style={{
              flex: total > 0 ? `${segment.value} 1 0` : "1 1 0",
              minWidth: 40,
              backgroundColor: hexToRgba(color, 0.25),
              color,
            }}
            onMouseEnter={(event) => {
              const tooltip = tooltipRef.current;
              if (!tooltip) return;
              tooltip.show(
                `<div style="font-weight:600; color:${DASHBOARD_COLORS.gray950};">${segment.domain}</div>` +
                  `<div style="color:${DASHBOARD_COLORS.gray500};">Count: ${segment.value}</div>`,
                event.clientX + 12,
                event.clientY + 12
              );
            }}
            onMouseMove={(event) => {
              tooltipRef.current?.move(event.clientX + 12, event.clientY + 12);
            }}
            onMouseLeave={() => tooltipRef.current?.hide()}
          >
            {segment.value}
          </div>
        );
      })}
    </div>
  );
}
