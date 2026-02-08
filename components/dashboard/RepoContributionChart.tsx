"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ContributorSpofRow } from "@/lib/repoDashboard/spofMockData";
import { buildRepoContributionFlow } from "@/lib/repoDashboard/spofContributionData";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import { calculateFlowLayout } from "@/lib/repoDashboard/contributionFlowLayout";
import { CONTRIBUTOR_FALLBACK_COLORS } from "@/lib/repoDashboard/contributionFlowHelpers";
import { ContributionFlowSVG } from "./ContributionFlowSVG";

type RepoContributionChartProps = {
  contributors: ContributorSpofRow[];
  minPercentage?: number;
  height?: number;
};

const DEFAULT_HEIGHT = 500;
const MIN_WIDTH = 920;

export function RepoContributionChart({
  contributors,
  minPercentage = 5,
  height = DEFAULT_HEIGHT,
}: RepoContributionChartProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<D3TooltipController | null>(null);
  const [width, setWidth] = useState(MIN_WIDTH);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setWidth(Math.max(MIN_WIDTH, Math.floor(entry.contentRect.width)));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    tooltipRef.current = createChartTooltip("repo-contribution-tooltip");
    return () => tooltipRef.current?.destroy();
  }, []);

  const flow = useMemo(
    () => buildRepoContributionFlow(contributors, minPercentage),
    [contributors, minPercentage]
  );

  const contributorColorMap = useMemo(() => {
    return new Map(
      contributors.map((contributor, index) => [
        contributor.contributorName,
        contributor.contributorColor ?? CONTRIBUTOR_FALLBACK_COLORS[index % CONTRIBUTOR_FALLBACK_COLORS.length],
      ])
    );
  }, [contributors]);

  const layout = useMemo(
    () => calculateFlowLayout(flow, width, height),
    [flow, width, height]
  );

  if (!layout) {
    return (
      <div ref={wrapperRef} className="w-full rounded-xl border border-gray-100 bg-[#e8edf5] p-6">
        <p className="text-sm text-slate-600">Not enough data to render contribution flow.</p>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full rounded-xl border border-gray-100 bg-[#e8edf5] p-4">
      <ContributionFlowSVG
        layout={layout}
        width={width}
        height={height}
        memberColorMap={contributorColorMap}
        tooltipRef={tooltipRef}
      />
    </div>
  );
}
