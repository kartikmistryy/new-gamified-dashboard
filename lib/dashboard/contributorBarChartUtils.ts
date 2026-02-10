/** Contributor Bar Chart Calculation Utilities */

import type { ContributorCodeMetrics } from "@/components/dashboard/ContributorPerformanceBarChart";

const CHART_HEIGHT = 500;
const CHART_WIDTH = 900;
const MARGIN = { top: 40, right: 60, bottom: 120, left: 80 };
const BAR_WIDTH = 32;
const BAR_GAP = 12;

export type BarData = {
  contributorName: string;
  groupX: number;
  additionsBar: { x: number; y: number; height: number; value: number };
  deletionsBar: { x: number; y: number; height: number; value: number };
};

export type TickData = {
  y: number;
  value: number;
  isZero: boolean;
};

export type MedianLineData = {
  type: "team" | "org";
  additionsY: number;
  deletionsY: number;
  label: string;
  color: string;
};

export type ChartCalculationResult = {
  bars: BarData[];
  ticks: TickData[];
  centerY: number;
  medianLines: MedianLineData[];
  innerWidth: number;
  innerHeight: number;
} | null;

/** Calculate bar chart layout and positioning */
export function calculateBarChart(
  data: ContributorCodeMetrics[],
  teamMedian?: { additions: number; deletions: number },
  orgMedian?: { additions: number; deletions: number },
  height: number = CHART_HEIGHT
): ChartCalculationResult {
  if (data.length === 0) return null;

  const maxAdditions = Math.max(...data.map((d) => d.additions));
  const maxDeletions = Math.max(...data.map((d) => d.deletions));
  const maxValue = Math.max(maxAdditions, maxDeletions);

  const innerWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const centerY = MARGIN.top + innerHeight / 2;
  const scaleY = (value: number) => (value / maxValue) * (innerHeight / 2);

  const groupWidth = BAR_WIDTH * 2 + BAR_GAP;
  const totalWidth = data.length * groupWidth;
  const startX = MARGIN.left + (innerWidth - totalWidth) / 2;

  const bars = data.map((contributor, index) => {
    const groupX = startX + index * groupWidth;
    return {
      contributorName: contributor.contributorName,
      groupX,
      additionsBar: {
        x: groupX + BAR_WIDTH + BAR_GAP,
        y: centerY - scaleY(contributor.additions),
        height: scaleY(contributor.additions),
        value: contributor.additions,
      },
      deletionsBar: {
        x: groupX,
        y: centerY,
        height: scaleY(contributor.deletions),
        value: contributor.deletions,
      },
    };
  });

  const tickCount = 5;
  const ticks: TickData[] = [];
  for (let i = -tickCount; i <= tickCount; i++) {
    const value = (i / tickCount) * maxValue;
    const y = centerY - (i / tickCount) * (innerHeight / 2);
    ticks.push({ y, value: Math.round(Math.abs(value)), isZero: i === 0 });
  }

  const medianLines: MedianLineData[] = [];
  if (teamMedian) {
    medianLines.push({
      type: "team",
      additionsY: centerY - scaleY(teamMedian.additions),
      deletionsY: centerY + scaleY(teamMedian.deletions),
      label: "Team Median",
      color: "#3b82f6",
    });
  }
  if (orgMedian) {
    medianLines.push({
      type: "org",
      additionsY: centerY - scaleY(orgMedian.additions),
      deletionsY: centerY + scaleY(orgMedian.deletions),
      label: "Org Median",
      color: "#8b5cf6",
    });
  }

  return { bars, ticks, centerY, medianLines, innerWidth, innerHeight };
}

export const CHART_CONSTANTS = {
  CHART_HEIGHT,
  CHART_WIDTH,
  MARGIN,
  BAR_WIDTH,
  BAR_GAP,
};
