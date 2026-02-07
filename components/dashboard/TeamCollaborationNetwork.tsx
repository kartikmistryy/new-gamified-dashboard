"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { interpolateViridis, scaleLinear, scaleSequential } from "d3";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import type { ChartInsight } from "@/lib/orgDashboard/types";
import {
  buildCollaborationGraph,
  getCollaborationInsights,
  type CollaborationModule,
} from "@/lib/teamDashboard/collaborationNetworkData";
import { layoutGraph, type LayoutType } from "@/lib/teamDashboard/collaborationNetworkLayout";
import { CollaborationNetworkSVG } from "./CollaborationNetworkSVG";
import { CollaborationNetworkLegend } from "./CollaborationNetworkLegend";

const CHART_HEIGHT = 540;
const DEFAULT_THRESHOLD = 0.7;
const DEFAULT_LAYOUT: LayoutType = "shell";

type TeamCollaborationNetworkProps = {
  data: CollaborationModule | undefined;
  onInsightsChange?: (insights: ChartInsight[]) => void;
};

export function TeamCollaborationNetwork({ data, onInsightsChange }: TeamCollaborationNetworkProps) {
  const [width, setWidth] = useState(820);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<D3TooltipController | null>(null);
  const tooltipId = useId().replace(/:/g, "");

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setWidth(Math.max(460, Math.floor(entry.contentRect.width)));
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    tooltipRef.current = createChartTooltip(`collab-tooltip-${tooltipId}`);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  const graph = useMemo(
    () => buildCollaborationGraph(data, DEFAULT_THRESHOLD, true),
    [data]
  );

  const insights = useMemo(
    () => getCollaborationInsights(data, graph, DEFAULT_THRESHOLD),
    [data, graph]
  );

  useEffect(() => {
    if (!onInsightsChange) return;
    onInsightsChange(insights);
  }, [insights, onInsightsChange]);

  const laidOutGraph = useMemo(
    () => layoutGraph(graph, width - 72, CHART_HEIGHT - 64, DEFAULT_LAYOUT),
    [graph, width]
  );

  const colorScale = useMemo(
    () => scaleSequential(interpolateViridis).domain([0.05, 1]),
    []
  );

  const edgeWidthScale = useMemo(
    () => scaleLinear().domain([0.35, 1]).range([1.4, 5.6]).clamp(true),
    []
  );

  return (
    <div className="w-full min-w-0" ref={wrapperRef}>
      <div className="rounded-xl border border-gray-100 bg-[#e8edf5] p-4">
        <div className="flex min-w-0 items-stretch gap-4">
          <CollaborationNetworkSVG
            graph={laidOutGraph}
            width={width - 72}
            height={CHART_HEIGHT}
            colorScale={colorScale}
            edgeWidthScale={edgeWidthScale}
            tooltipRef={tooltipRef}
          />
          <CollaborationNetworkLegend />
        </div>
      </div>
    </div>
  );
}
