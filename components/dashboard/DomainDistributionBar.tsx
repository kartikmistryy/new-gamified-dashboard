"use client";

import { hexToRgba } from "@/lib/orgDashboard/tableUtils";

type DomainDistributionBarProps = {
  segments: { domain: string; value: number }[];
  getColor: (domain: string) => string;
};

export function DomainDistributionBar({
  segments,
  getColor,
}: DomainDistributionBarProps) {
  return (
    <div className="flex h-6 w-full overflow-hidden rounded-full bg-gray-100">
      {segments.map((segment) => {
        const color = getColor(segment.domain);
        return (
          <div
            key={segment.domain}
            className="flex items-center justify-center text-xs font-semibold"
            style={{
              flex: "1 1 0",
              minWidth: 0,
              backgroundColor: hexToRgba(color, 0.25),
              color,
            }}
          >
            {segment.value}
          </div>
        );
      })}
    </div>
  );
}
