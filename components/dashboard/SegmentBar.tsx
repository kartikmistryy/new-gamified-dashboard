"use client";

import { useEffect, useId, useRef } from "react";
import type { ComponentType, CSSProperties } from "react";
import { getSegmentRoundedClass } from "@/lib/orgDashboard/tableUtils";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";

export type SegmentBarSegment = {
  bg?: string;
  style?: CSSProperties;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  borderClass?: string;
  label?: string;
};

type SegmentBarProps = {
  segments: SegmentBarSegment[];
  counts: number[];
  alignment?: "start" | "end";
  showCounts?: boolean;
  minSegmentWidth?: number;
};

export function SegmentBar({
  segments,
  counts,
  alignment = "end",
  showCounts = false,
  minSegmentWidth = 40,
}: SegmentBarProps) {
  const total = segments.length;
  const totalCount = counts.reduce((sum, value) => sum + value, 0);
  const justifyClass = alignment === "end" ? "justify-end" : "justify-start";
  const tooltipId = useId().replace(/:/g, "");
  const tooltipRef = useRef<D3TooltipController | null>(null);

  useEffect(() => {
    tooltipRef.current = createChartTooltip(`segment-bar-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  return (
    <div className={`flex items-center ${justifyClass}`}>
      {segments.map((seg, segIndex) => {
        const count = counts[segIndex] ?? 0;
        const roundedClass = getSegmentRoundedClass(segIndex, total);
        const Icon = seg.icon;
        const borderClass = seg.borderClass ?? "";
        const bgClass = seg.bg ?? "";
        const label = seg.label ?? `Segment ${segIndex + 1}`;

        return (
          <span
            key={segIndex}
            className={`inline-flex w-full justify-center items-center gap-1.5 px-4 py-1 text-xs font-medium ${bgClass} ${roundedClass} ${borderClass}`}
            style={{
              ...seg.style,
              flex: totalCount > 0 ? `${count} 1 0` : "1 1 0",
              minWidth: minSegmentWidth,
            }}
            onMouseEnter={(event) => {
              const tooltip = tooltipRef.current;
              if (!tooltip) return;
              tooltip.show(
                `<div style="font-weight:600; color:#0f172a;">${label}</div>` +
                  `<div style="color:#6b7280;">Count: ${count}</div>`,
                event.clientX + 12,
                event.clientY + 12
              );
            }}
            onMouseMove={(event) => {
              tooltipRef.current?.move(event.clientX + 12, event.clientY + 12);
            }}
            onMouseLeave={() => tooltipRef.current?.hide()}
          >
            {Icon && <Icon className="size-3.5 shrink-0 text-current" aria-hidden />}
            {showCounts ? <span className="text-current">{count}</span> : null}
          </span>
        );
      })}
    </div>
  );
}
