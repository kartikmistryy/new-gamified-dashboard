"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Config } from "plotly.js";
import { buildSankeyPlotly } from "@/lib/dashboard/repoDashboard/sankeyContributionPlotly";
import { DASHBOARD_BG_CLASSES } from "@/lib/orgDashboard/colors";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type ContributionNode = {
  id: string;
  label: string;
  side: string;
  value: number;
  health?: "healthy" | "needsAttention" | "critical";
};

type ContributionLink = {
  source: string;
  target: string;
  value: number;
  percentage: number;
};

type ContributionFlow = {
  nodes: ContributionNode[];
  links: ContributionLink[];
};

type SankeyContributionChartProps = {
  flow: ContributionFlow;
  colorMap: Map<string, string>;
  sourceLabel?: string;
  targetLabel?: string;
  height?: number;
};

/** Sankey Contribution Chart - visualizes contribution flows with Plotly.js */
export function SankeyContributionChart({
  flow,
  colorMap,
  sourceLabel = "Source",
  targetLabel = "Target",
  height = 500,
}: SankeyContributionChartProps) {
  const { plotlyData, plotlyLayout } = useMemo(
    () => buildSankeyPlotly(flow, colorMap, height),
    [flow, colorMap, height]
  );

  const config: Partial<Config> = {
    displayModeBar: false,
    responsive: true,
  };

  if (flow.nodes.length === 0 || flow.links.length === 0) {
    return (
      <div className={`w-full rounded-xl ${DASHBOARD_BG_CLASSES.bgLight} p-6`}>
        <p className="text-sm text-slate-600">Not enough data to render contribution flow.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-visible bg-white rounded-lg">
      <Plot
        data={plotlyData}
        layout={plotlyLayout}
        config={config}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler={true}
      />
    </div>
  );
}
