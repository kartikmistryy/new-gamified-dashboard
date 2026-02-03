"use client";

import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { SPOF_TEAM_CONFIG, calculateSpofStats } from "@/lib/orgDashboard/spofMockData";
import type { SpofDataPoint } from "@/lib/orgDashboard/spofMockData";
import {
  getChartDimensions,
  createStackedHistogramData,
  generateNormalCurveData,
  drawShadedRegions,
  drawStackedBars,
  drawNormalCurve,
  drawSigmaLines,
  drawAxes,
  drawTitle,
  drawLegend,
} from "@/lib/orgDashboard/spofChartUtils";

type SpofDistributionChartProps = {
  data: SpofDataPoint[];
  visibleTeams: Record<string, boolean>;
  showNormalFit?: boolean;
};

export function SpofDistributionChart({
  data,
  visibleTeams,
  showNormalFit = true,
}: SpofDistributionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(
    () => data.filter((d) => visibleTeams[d.team] !== false),
    [data, visibleTeams]
  );

  const visibleTeamNames = useMemo(
    () => SPOF_TEAM_CONFIG.filter((t) => visibleTeams[t.name] !== false).map((t) => t.name),
    [visibleTeams]
  );

  const visibleTeamConfigs = useMemo(
    () => SPOF_TEAM_CONFIG.filter((t) => visibleTeams[t.name] !== false),
    [visibleTeams]
  );

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const dims = getChartDimensions(containerRef.current.clientWidth);
    const { width, height, margin, innerWidth, innerHeight } = dims;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    const stats = calculateSpofStats(filteredData);
    const { mean, std, skewType } = stats;

    const xScale = d3.scaleLinear().domain([0, 6]).range([0, innerWidth]);
    const { stackedData, maxCount, binWidth } = createStackedHistogramData(
      filteredData,
      visibleTeamConfigs,
      xScale
    );
    const yScale = d3.scaleLinear()
      .domain([0, Math.ceil(maxCount / 10) * 10])
      .range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const muMinus1Sigma = Math.max(0, mean - std);
    const muPlus1Sigma = Math.min(6, mean + std);

    drawShadedRegions(g, xScale, innerHeight, innerWidth, muMinus1Sigma, muPlus1Sigma);

    const teamColors = new Map(SPOF_TEAM_CONFIG.map((t) => [t.name, t.color]));
    drawStackedBars(g, stackedData, xScale, yScale, binWidth, teamColors);

    if (showNormalFit && filteredData.length > 0) {
      const normalData = generateNormalCurveData(mean, std, filteredData.length);
      drawNormalCurve(g, normalData, xScale, yScale);
    }

    drawSigmaLines(g, xScale, innerHeight, muMinus1Sigma, muPlus1Sigma);
    drawAxes(g, xScale, yScale, innerHeight, innerWidth);

    const teamsText = visibleTeamNames.length > 0 ? visibleTeamNames.join(", ") : "No teams selected";
    drawTitle(svg, width, skewType, mean, std, teamsText);
    drawLegend(svg, visibleTeamConfigs, width, margin, showNormalFit, mean, std);
  }, [filteredData, visibleTeamConfigs, visibleTeamNames, showNormalFit]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
