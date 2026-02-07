"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MemberSpofRow } from "@/lib/teamDashboard/spofMockData";
import { buildTeamContributionFlow } from "@/lib/teamDashboard/spofContributionData";
import { createChartTooltip, type D3TooltipController } from "@/lib/chartTooltip";
import { calculateFlowLayout } from "@/lib/teamDashboard/contributionFlowLayout";
import { MEMBER_FALLBACK_COLORS } from "@/lib/teamDashboard/contributionFlowHelpers";
import { ContributionFlowSVG } from "./ContributionFlowSVG";

type TeamContributionChartProps = {
  members: MemberSpofRow[];
  minPercentage?: number;
  height?: number;
};

const DEFAULT_HEIGHT = 500;
const MIN_WIDTH = 920;

export function TeamContributionChart({
  members,
  minPercentage = 5,
  height = DEFAULT_HEIGHT,
}: TeamContributionChartProps) {
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
    tooltipRef.current = createChartTooltip("team-contribution-tooltip");
    return () => tooltipRef.current?.destroy();
  }, []);

  const flow = useMemo(
    () => buildTeamContributionFlow(members, minPercentage),
    [members, minPercentage]
  );

  const memberColorMap = useMemo(() => {
    return new Map(
      members.map((member, index) => [
        member.memberName,
        member.memberColor ?? MEMBER_FALLBACK_COLORS[index % MEMBER_FALLBACK_COLORS.length],
      ])
    );
  }, [members]);

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
        memberColorMap={memberColorMap}
        tooltipRef={tooltipRef}
      />
    </div>
  );
}
