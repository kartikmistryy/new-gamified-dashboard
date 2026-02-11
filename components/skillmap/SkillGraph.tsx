"use client";

import { useEffect, useRef, useState, useCallback, useId, useMemo } from "react";
import type { SkillData, D3HierarchyNode, SkillTooltipController } from "./skillGraphTypes";
import { buildSkillData, loadD3Scripts, checkD3Libs } from "./skillGraphUtils";
import { renderWorldView, renderDrilldownView } from "./skillGraphRenderers";
import { createChartTooltip, type D3TooltipController } from "@/lib/dashboard/shared/charts/tooltip/chartTooltip";

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

const fullSkillData = buildSkillData();

const buildRootViewData = (data: SkillData): SkillData => ({
  name: data.name,
  value: data.value,
  frequency: data.frequency,
  children: data.children?.map((domain) => ({
    name: domain.name,
    value: domain.value,
    frequency: domain.frequency,
    children: domain.children?.map((skill) => ({
      name: skill.name,
      value: skill.value,
      frequency: skill.frequency,
    })),
  })),
});

type SkillGraphProps = {
  width?: number;
  height?: number;
  domainWeights?: Record<string, number>;
  skillVisibility?: Record<string, boolean>;
};

const sumLeafValues = (node: SkillData): number => {
  if (!node.children || node.children.length === 0) return node.value || 0;
  return node.children.reduce((sum, child) => sum + sumLeafValues(child), 0);
};

const scaleSkillData = (node: SkillData, multiplier: number): SkillData => {
  if (!node.children || node.children.length === 0) {
    return { ...node, value: (node.value || 0) * multiplier };
  }
  return {
    ...node,
    children: node.children.map((child) => scaleSkillData(child, multiplier)),
  };
};

const applyDomainWeights = (data: SkillData, domainWeights?: Record<string, number>): SkillData => {
  if (!domainWeights) return data;
  const domains = data.children ?? [];
  const filtered = domains
    .map((domain) => {
      const weight = domainWeights[domain.name];
      if (weight === 0) return null;
      if (weight == null) return domain;
      const base = sumLeafValues(domain);
      const multiplier = base > 0 ? weight / base : 0;
      return scaleSkillData(domain, multiplier);
    })
    .filter(Boolean) as SkillData[];

  const totalValue = filtered.reduce((sum, d) => sum + sumLeafValues(d), 0);
  return { ...data, children: filtered, value: totalValue };
};

const applySkillVisibility = (data: SkillData, skillVisibility?: Record<string, boolean>): SkillData => {
  if (!skillVisibility) return data;
  const domains = data.children ?? [];
  const filteredDomains = domains
    .map((domain) => {
      if (!domain.children || domain.children.length === 0) return domain;
      const filteredSkills = domain.children.filter((skill) => skillVisibility[skill.name] !== false);
      if (filteredSkills.length === 0) return null;
      const domainValue = filteredSkills.reduce((sum, skill) => sum + sumLeafValues(skill), 0);
      return { ...domain, children: filteredSkills, value: domainValue };
    })
    .filter(Boolean) as SkillData[];

  const totalValue = filteredDomains.reduce((sum, d) => sum + sumLeafValues(d), 0);
  return { ...data, children: filteredDomains, value: totalValue };
};

export function SkillGraph({ width = 800, height = 800, domainWeights, skillVisibility }: SkillGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const filteredSkillData = useMemo(
    () => applySkillVisibility(fullSkillData, skillVisibility),
    [skillVisibility]
  );
  const weightedFullData = useMemo(
    () => applyDomainWeights(filteredSkillData, domainWeights),
    [filteredSkillData, domainWeights]
  );
  const rootSkillData = useMemo(
    () => buildRootViewData(weightedFullData),
    [weightedFullData]
  );

  const [currentData, setCurrentData] = useState<SkillData>(rootSkillData);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ data: SkillData; activeDomain: string | null }>>([]);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [layoutAttempt, setLayoutAttempt] = useState(0);
  const instanceId = useId().replace(/:/g, "");
  const tooltipId = `skill-tooltip-${instanceId}`;
  const tooltipRef = useRef<D3TooltipController | null>(null);

  const radius = Math.min(width, height) / 2 - 100;
  const isRootView = currentData.name === rootSkillData.name;
  const clipId = `skill-clip-${instanceId}`;

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const last = next.pop();
      if (last) {
        setCurrentData(last.data);
        setActiveDomain(last.activeDomain);
      }
      return next;
    });
  }, []);

  const findDomain = useCallback((name: string) =>
    weightedFullData.children?.find((domain) => domain.name === name), [weightedFullData]);

  const handleNodeClick = useCallback((node: D3HierarchyNode) => {
    if (isRootView) {
      const domainName = node.parent?.data.name === rootSkillData.name
        ? node.data.name
        : node.parent?.data.name;
      if (!domainName) return;

      const domainNode = findDomain(domainName);
      if (!domainNode) return;

      const target = node.parent?.data.name === rootSkillData.name
        ? domainNode
        : domainNode.children?.find((skill) => skill.name === node.data.name);

      if (!target || !target.children || target.children.length === 0) return;

      setHistory((prev) => [...prev, { data: rootSkillData, activeDomain: null }]);
      setActiveDomain(domainNode.name);
      setCurrentData(target);
      return;
    }

    const domainNode = weightedFullData.children?.find((domain) => domain.name === currentData.name);
    if (domainNode) {
      const skillNode = domainNode.children?.find((skill) => skill.name === node.data.name);
      if (skillNode && skillNode.children && skillNode.children.length > 0) {
        setHistory((prev) => [...prev, { data: currentData, activeDomain }]);
        setCurrentData(skillNode);
      }
      return;
    }

    if (node.data.children && node.data.children.length > 0) {
      setHistory((prev) => [...prev, { data: currentData, activeDomain }]);
      setCurrentData(node.data);
      return;
    }

    goBack();
  }, [activeDomain, currentData, findDomain, goBack, isRootView, rootSkillData, weightedFullData]);

  useEffect(() => {
    setCurrentData(rootSkillData);
    setActiveDomain(null);
    setHistory([]);
  }, [rootSkillData]);

  useEffect(() => {
    tooltipRef.current = createChartTooltip(tooltipId);
    return () => tooltipRef.current?.destroy();
  }, [tooltipId]);

  useEffect(() => {
    if (!svgRef.current || typeof d3 === "undefined") return;
    const d3Lib = d3;
    d3Lib.select(svgRef.current).selectAll("*").remove();

    const svg = d3Lib.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height - 100}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const centerX = width / 2;
    const centerY = (height - 100) / 2;

    const isDomainView = weightedFullData.children?.some((domain) => domain.name === currentData.name) ?? false;
    const dataForHierarchy = isRootView
      ? rootSkillData
      : isDomainView
        ? buildRootViewData(currentData)
        : currentData;

    const root = d3Lib.hierarchy(dataForHierarchy)
      .sum((d) => (d.children && d.children.length > 0 ? 0 : d.value || 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0)) as unknown as D3HierarchyNode;

    const defs = svg.append("defs");
    defs.append("clipPath")
      .attr("id", clipId)
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius);


    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1);

    const g = svg.append("g")
      .attr("transform", `translate(${centerX},${centerY})`)
      .attr("clip-path", `url(#${clipId})`);

    const hasVoronoiTreemap = typeof d3Lib.voronoiTreemap !== "undefined";

    let needsRetry = false;
    if (libsLoaded && hasVoronoiTreemap && d3Lib.voronoiTreemap) {
      const tooltip: SkillTooltipController = tooltipRef.current
        ? {
          show: (html, x, y) => tooltipRef.current?.show(html, x, y),
          move: (x, y) => tooltipRef.current?.move(x, y),
          hide: () => tooltipRef.current?.hide(),
        }
        : {
          show: () => {},
          move: () => {},
          hide: () => {},
        };
      if (isRootView) {
        const ok = renderWorldView(
          d3Lib,
          g,
          svg,
          root,
          radius,
          centerX,
          centerY,
          tooltip,
          handleNodeClick,
          rootSkillData.name,
        );
        if (!ok) needsRetry = true;
      } else {
        renderDrilldownView(
          d3Lib,
          g,
          svg,
          root,
          radius,
          centerX,
          centerY,
          tooltip,
          handleNodeClick,
          currentData.name,
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
      if (!isRootView) {
        goBack();
      }
    });
    if (needsRetry) {
      const timer = window.setTimeout(() => {
        setLayoutAttempt((prev) => prev + 1);
      }, 60);
      return () => window.clearTimeout(timer);
    }
  }, [activeDomain, clipId, currentData, goBack, handleNodeClick, isRootView, layoutAttempt, libsLoaded, radius, width, height]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (checkD3Libs()) {
      setLibsLoaded(true);
      return;
    }

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

  return (
    <div className="w-full flex justify-center">
      <div className="relative w-full max-w-[900px]" style={{ height: 700 }}>
        <div className="relative w-full h-full flex justify-center items-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block">
          {!libsLoaded && isRootView && (
            <div className="absolute z-10 text-gray-500 text-sm text-center w-full pt-[200px]">
              Loading...
            </div>
          )}
          <svg ref={svgRef} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 flex-wrap" aria-hidden="true">
          <div className="flex items-center gap-3">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: "#8b93f5",
                  opacity: 0.85,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: "#8b93f5",
                  opacity: 0.85,
                  display: "inline-block",
                }}
              />
            </div>
            <div className="grid gap-0.5">
              <div className="text-[13px] font-semibold text-gray-900">Size</div>
              <div className="text-xs text-gray-500 leading-tight">How well I know this skill</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 110,
                height: 14,
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, rgba(139, 147, 245, 0.2), rgba(123, 133, 232, 0.95))",
              }}
            />
            <div className="grid gap-0.5">
              <div className="text-[13px] font-semibold text-gray-900">Color intensity</div>
              <div className="text-xs text-gray-500 leading-tight">
                How frequent (proficient) I use this skill
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
