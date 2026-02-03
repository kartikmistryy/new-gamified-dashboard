"use client";

import type { ComponentType, CSSProperties } from "react";
import { getSegmentRoundedClass } from "@/lib/orgDashboard/tableUtils";

export type SegmentBarSegment = {
  bg?: string;
  style?: CSSProperties;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  borderClass?: string;
};

type SegmentBarProps = {
  segments: SegmentBarSegment[];
  counts: number[];
  alignment?: "start" | "end";
};

export function SegmentBar({
  segments,
  counts,
  alignment = "end",
}: SegmentBarProps) {
  const total = segments.length;
  const justifyClass = alignment === "end" ? "justify-end" : "justify-start";

  return (
    <div className={`flex items-center ${justifyClass}`}>
      {segments.map((seg, segIndex) => {
        const count = counts[segIndex] ?? 0;
        const roundedClass = getSegmentRoundedClass(segIndex, total);
        const Icon = seg.icon;
        const borderClass = seg.borderClass ?? "";
        const bgClass = seg.bg ?? "";

        return (
          <span
            key={segIndex}
            className={`inline-flex w-full justify-center items-center gap-1.5 px-4 py-1 text-xs font-medium ${bgClass} ${roundedClass} ${borderClass}`}
            style={seg.style}
          >
            {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
            {count}
          </span>
        );
      })}
    </div>
  );
}
