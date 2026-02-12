"use client";

import { useEffect, useRef, useState, useCallback, useId, useMemo } from "react";
import type { SkillData, D3HierarchyNode, SkillTooltipController } from "./skillGraphTypes";
import { loadD3Scripts, checkD3Libs } from "./skillGraphUtils";
import { renderWorldView, renderDrilldownView } from "./skillGraphRenderers";
import { createChartTooltip, type D3TooltipController } from "@/lib/dashboard/shared/charts/tooltip/chartTooltip";
import { loadAllSkillGraphData, type SkillGraphBundle } from "./skillGraphDataLoader";

declare const d3: typeof import("d3") & {
  voronoiTreemap?: () => {
    clip: (p: [number, number][]) => {
      convergenceRatio: (r: number) => {
        maxIterationCount: (c: number) => {
          minWeightRatio: (r: number) => (root: unknown) => void;
        };
      };
    };
  };
} | undefined;

type ViewMode = "role" | "skill";

type SkillGraphProps = {
  width?: number;
  height?: number;
};

/** Flatten group→children for the root "world" view */
const buildRootViewData = (data: SkillData): SkillData => ({
  name: data.name,
  value: data.value,
  frequency: data.frequency,
  children: data.children?.map((group) => ({
    name: group.name,
    value: group.value,
    frequency: group.frequency,
    children: group.children?.map((item) => ({
      name: item.name,
      value: item.value,
      frequency: item.frequency,
    })),
  })),
});

export function SkillGraph({ width = 800, height = 800 }: SkillGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  /* ── Data loading ────────────────────────────────────── */
  const [bundle, setBundle] = useState<SkillGraphBundle | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("role");

  useEffect(() => {
    loadAllSkillGraphData()
      .then(setBundle)
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, []);

  const fullData = bundle?.[viewMode] ?? null;
  const rootSkillData = useMemo(
    () => (fullData ? buildRootViewData(fullData) : null),
    [fullData],
  );

  /* ── Navigation state (2 levels only) ───────────────── */
  const [currentData, setCurrentData] = useState<SkillData | null>(null);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  useEffect(() => {
    if (rootSkillData) {
      setCurrentData(rootSkillData);
      setActiveDomain(null);
    }
  }, [rootSkillData]);

  /* ── D3 + rendering state ────────────────────────────── */
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [layoutAttempt, setLayoutAttempt] = useState(0);
  const instanceId = useId().replace(/:/g, "");
  const tooltipId = `skill-tooltip-${instanceId}`;
  const tooltipRef = useRef<D3TooltipController | null>(null);

  const radius = Math.min(width, height) / 2 - 100;
  const isRootView = currentData?.name === rootSkillData?.name;
  const clipId = `skill-clip-${instanceId}`;

  const goBack = useCallback(() => {
    if (rootSkillData) {
      setCurrentData(rootSkillData);
      setActiveDomain(null);
    }
  }, [rootSkillData]);

  const handleNodeClick = useCallback(
    (node: D3HierarchyNode) => {
      if (!isRootView || !fullData || !rootSkillData) return;

      /* Identify which group the clicked node belongs to */
      const groupName =
        node.parent?.data.name === rootSkillData.name
          ? node.data.name
          : node.parent?.data.name;
      if (!groupName) return;

      const groupNode = fullData.children?.find((g) => g.name === groupName);
      if (!groupNode?.children?.length) return;

      setActiveDomain(groupName);
      setCurrentData(groupNode);
    },
    [isRootView, fullData, rootSkillData],
  );

  /* ── Tooltip lifecycle ───────────────────────────────── */
  useEffect(() => {
    tooltipRef.current = createChartTooltip(tooltipId);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  /* ── Main SVG render ─────────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current || typeof d3 === "undefined" || !currentData || !rootSkillData) return;

    const d3Lib = d3;
    d3Lib.select(svgRef.current).selectAll("*").remove();

    const svg = d3Lib
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height - 100}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const centerX = width / 2;
    const centerY = (height - 100) / 2;

    const dataForHierarchy = isRootView ? rootSkillData : buildRootViewData(currentData);
    const root = d3Lib
      .hierarchy(dataForHierarchy)
      .sum((d) => (d.children?.length ? 0 : d.value || 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0)) as unknown as D3HierarchyNode;

    const defs = svg.append("defs");
    defs
      .append("clipPath")
      .attr("id", clipId)
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius);

    svg
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1);

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX},${centerY})`)
      .attr("clip-path", `url(#${clipId})`);

    const hasVoronoi = typeof d3Lib.voronoiTreemap !== "undefined";

    let needsRetry = false;
    if (libsLoaded && hasVoronoi && d3Lib.voronoiTreemap) {
      const tooltip: SkillTooltipController = tooltipRef.current
        ? {
            show: (html, x, y) => tooltipRef.current?.show(html, x, y),
            move: (x, y) => tooltipRef.current?.move(x, y),
            hide: () => tooltipRef.current?.hide(),
          }
        : { show: () => {}, move: () => {}, hide: () => {} };

      if (isRootView) {
        const ok = renderWorldView(
          d3Lib, g, svg, root, radius, centerX, centerY,
          tooltip, handleNodeClick, rootSkillData.name,
        );
        if (!ok) needsRetry = true;
      } else {
        renderDrilldownView(
          d3Lib, g, svg, root, radius, centerX, centerY,
          tooltip, handleNodeClick, currentData.name,
          activeDomain ?? currentData.name,
        );
      }
    } else {
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "#666")
        .attr("font-size", "14px")
        .text("Loading visualization...");
    }

    svg.on("click", () => {
      if (!isRootView) goBack();
    });

    if (needsRetry) {
      const timer = window.setTimeout(() => setLayoutAttempt((p) => p + 1), 60);
      return () => window.clearTimeout(timer);
    }
  }, [activeDomain, clipId, currentData, goBack, handleNodeClick, isRootView, layoutAttempt, libsLoaded, radius, rootSkillData, width, height]);

  /* ── Load D3 libs once ───────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (checkD3Libs()) { setLibsLoaded(true); return; }

    loadD3Scripts().then(() => {
      let attempts = 0;
      const interval = setInterval(() => {
        if (checkD3Libs() || ++attempts >= 50) {
          clearInterval(interval);
          setLibsLoaded(true);
        }
      }, 100);
    });
  }, []);

  /* ── Render ──────────────────────────────────────────── */
  const loading = dataLoading || (!libsLoaded && isRootView);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* View mode tabs */}
      <div className="inline-flex rounded-full bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setViewMode("role")}
          className={`px-5 py-2 text-xs font-semibold rounded-full transition ${
            viewMode === "role" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Role-Based
        </button>
        <button
          type="button"
          onClick={() => setViewMode("skill")}
          className={`px-5 py-2 text-xs font-semibold rounded-full transition ${
            viewMode === "skill" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Skill-Based
        </button>
      </div>

      {/* Chart area */}
      <div className="relative w-full max-w-[900px]" style={{ height: 700 }}>
        <div className="relative w-full h-full flex justify-center items-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block">
          {loading && (
            <div className="absolute z-10 text-gray-500 text-sm text-center w-full pt-[200px]">
              Loading...
            </div>
          )}
          <svg ref={svgRef} />
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 flex-wrap" aria-hidden="true">
          <div className="flex items-center gap-3">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: "#8b93f5", opacity: 0.85 }} />
              <span className="inline-block rounded-full" style={{ width: 18, height: 18, background: "#8b93f5", opacity: 0.85 }} />
            </div>
            <div className="grid gap-0.5">
              <div className="text-[13px] font-semibold text-gray-900">Size</div>
              <div className="text-xs text-gray-500 leading-tight">Number of people with this skill</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full" style={{ width: 110, height: 14, background: "linear-gradient(90deg, rgba(139,147,245,0.2), rgba(123,133,232,0.95))" }} />
            <div className="grid gap-0.5">
              <div className="text-[13px] font-semibold text-gray-900">Color intensity</div>
              <div className="text-xs text-gray-500 leading-tight">Average completion rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
