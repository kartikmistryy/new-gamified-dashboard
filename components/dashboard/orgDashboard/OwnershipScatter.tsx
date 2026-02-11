"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";
import type { OwnershipTimeRangeKey, DeveloperPoint } from "@/lib/dashboard/entities/team/types";
import { buildOwnershipChartData, WIDTH, HEIGHT } from "@/lib/dashboard/entities/team/charts/ownershipScatter/ownershipScatterUtils";
import {
  buildOwnershipTraces,
  buildOwnershipLayout,
  OWNERSHIP_SCATTER_CONFIG,
} from "@/lib/dashboard/entities/team/charts/ownershipScatter/ownershipScatterPlotly";
import { DASHBOARD_COLORS, DASHBOARD_BG_CLASSES } from "@/lib/dashboard/shared/utils/colors";

// Dynamically import Plotly to avoid SSR issues
// Note: react-plotly.js only exports a default export (external library)
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export type { OwnershipTimeRangeKey } from "@/lib/dashboard/entities/team/types";

type OwnershipScatterProps = {
  data?: DeveloperPoint[];
  range?: OwnershipTimeRangeKey;
};

/** Ownership Scatter Plot - KarmaPoints vs Ownership with outlier detection and trend line */
export function OwnershipScatter({ data, range = "max" }: OwnershipScatterProps) {
  const { points, bandPath, xTicks, yTicks, trendLine } = useMemo(
    () => buildOwnershipChartData(data, range),
    [data, range]
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: WIDTH, height: HEIGHT });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? {};
      if (typeof width === "number" && width > 0) {
        setChartSize({ width, height: HEIGHT });
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const plotlyData = useMemo(() => buildOwnershipTraces(points), [points]);
  const plotlyLayout = useMemo(() => buildOwnershipLayout(trendLine, chartSize.width), [trendLine, chartSize.width]);

  return (
    <div ref={containerRef} className="w-full overflow-visible">
      <div className="relative overflow-visible bg-white">
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          config={OWNERSHIP_SCATTER_CONFIG}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler={true}
        />
      </div>

      {/* Legend */}
      <div
        className="mt-5 pt-6 flex flex-wrap items-center justify-center gap-6 text-slate-700"
        role="list"
        aria-label="Chart legend"
      >
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: DASHBOARD_COLORS.greenLight }}
          />
          <span className="text-xs font-medium">Outlier (High Ownership)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${DASHBOARD_BG_CLASSES.red}`} />
          <span className="text-xs font-medium">Outlier (Low Ownership)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" preserveAspectRatio="none" aria-hidden>
            <line x1={0} y1={6} x2={12} y2={6} stroke={DASHBOARD_COLORS.gray500} strokeWidth={1.5} strokeDasharray="4 4" />
          </svg>
          <span className="text-xs font-medium">Trend</span>
        </div>
      </div>
    </div>
  );
}
