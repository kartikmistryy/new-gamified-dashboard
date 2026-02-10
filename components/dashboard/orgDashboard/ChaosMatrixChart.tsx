"use client";

import { useMemo, useRef, useEffect, useId, useCallback } from "react";
import dynamic from "next/dynamic";
import type { PlotData, Layout, Config } from "plotly.js";
import {
  type ChaosPoint,
  type ChaosCategory,
  type ChaosTimeRangeKey,
  CATEGORY_COLORS,
  categorizeChaos,
  median,
  generateSyntheticChaosPoints,
} from "@/lib/orgDashboard/chaosMatrixData";
import { useChaosMatrixAvatars } from "./useChaosMatrixAvatars";
import {
  buildChaosMatrixLayout,
  CHAOS_MATRIX_CONFIG,
  type StackedPoint,
} from "@/lib/orgDashboard/chaosMatrixConfig";
import { processChaosMatrixData } from "@/lib/orgDashboard/chaosMatrixProcessing";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export type { ChaosTimeRangeKey };

type CategorizedPoint = ChaosPoint & { category: ChaosCategory };

type ChaosMatrixChartProps = {
  /** Data points to visualize. If not provided, synthetic data will be generated. */
  data?: ChaosPoint[];
  /** Time range key for generating synthetic data */
  range?: ChaosTimeRangeKey;
  /** Optional visibility map keyed by team/member name; hidden items are filtered out. */
  visibleTeams?: Record<string, boolean>;
  /** Optional team/member names for synthetic data generation */
  teamNames?: string[];
  /** Label for the secondary identifier in tooltips (e.g., "Team", "Person") */
  tooltipTeamLabel?: string;
  /** Render mode: "circles" for simple dots, "avatars" for profile images */
  renderMode?: "circles" | "avatars";
};

/** Unified Chaos Matrix component - visualizes KP vs Churn Rate with category quadrants */
export function ChaosMatrixChart({
  data,
  range = "max",
  visibleTeams,
  teamNames,
  tooltipTeamLabel = "Team",
  renderMode = "circles",
}: ChaosMatrixChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const svgOverlayRef = useRef<SVGSVGElement>(null);
  const clipId = useId().replace(/:/g, "");

  const { plotData, layout, stackedFiltered } = useMemo(() => {
    const { plotData, stackedFiltered, kpThresh, churnThresh } = processChaosMatrixData(
      data,
      range,
      visibleTeams,
      teamNames,
      tooltipTeamLabel,
      renderMode
    );
    const layout = buildChaosMatrixLayout(stackedFiltered, kpThresh, churnThresh);
    return { plotData, layout, stackedFiltered };
  }, [data, range, visibleTeams, teamNames, tooltipTeamLabel, renderMode]);

  useChaosMatrixAvatars(renderMode, stackedFiltered, clipId, plotRef, svgOverlayRef);

  return (
    <div className="w-full overflow-visible flex flex-col items-center">
      <div className="relative overflow-visible bg-white" style={{ width: 800, height: 480 }}>
        <div ref={plotRef}>
          <Plot data={plotData} layout={layout} config={CHAOS_MATRIX_CONFIG} />
        </div>
        {renderMode === "avatars" && (
          <svg
            ref={svgOverlayRef}
            className="absolute top-0 left-0 pointer-events-none"
            width={800}
            height={480}
            style={{ zIndex: 10 }}
          />
        )}
      </div>
    </div>
  );
}
