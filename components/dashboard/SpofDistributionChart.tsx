"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { SPOF_TEAM_CONFIG } from "@/lib/orgDashboard/spofMockData";
import type { SpofDataPoint } from "@/lib/orgDashboard/spofMockData";
import { buildSpofPlotData, buildSpofPlotLayout, SPOF_PLOT_CONFIG } from "@/lib/orgDashboard/spofDistributionPlotly";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type SpofDistributionChartProps = {
  data: SpofDataPoint[];
  visibleTeams: Record<string, boolean>;
  showNormalFit?: boolean;
};

/** SPOF Distribution Chart - histogram with normal fit curve */
export function SpofDistributionChart({ data, visibleTeams, showNormalFit = true }: SpofDistributionChartProps) {
  const filteredData = useMemo(() => data.filter((d) => visibleTeams[d.team] !== false), [data, visibleTeams]);

  const visibleTeamNames = useMemo(
    () => SPOF_TEAM_CONFIG.filter((t) => visibleTeams[t.name] !== false).map((t) => t.name),
    [visibleTeams]
  );

  const visibleTeamConfigs = useMemo(
    () => SPOF_TEAM_CONFIG.filter((t) => visibleTeams[t.name] !== false),
    [visibleTeams]
  );

  const plotData = useMemo(
    () => buildSpofPlotData(filteredData, visibleTeamConfigs, visibleTeamNames, showNormalFit),
    [filteredData, visibleTeamConfigs, visibleTeamNames, showNormalFit]
  );

  const plotLayout = useMemo(() => buildSpofPlotLayout(filteredData, visibleTeamNames), [filteredData, visibleTeamNames]);

  return (
    <div className="w-full h-[500px]">
      <Plot data={plotData} layout={plotLayout} config={SPOF_PLOT_CONFIG} className="w-full h-full" />
    </div>
  );
}
