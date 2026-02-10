/** Chaos Matrix Data Processing Utilities */

import type { PlotData } from "plotly.js";
import type { ChaosPoint, ChaosCategory, ChaosTimeRangeKey } from "./chaosMatrixData";
import { CATEGORY_COLORS, categorizeChaos, median, generateSyntheticChaosPoints } from "./chaosMatrixData";
import type { StackedPoint } from "./chaosMatrixConfig";

type CategorizedPoint = ChaosPoint & { category: ChaosCategory };

export type ProcessedChaosData = {
  plotData: Partial<PlotData>[];
  stackedFiltered: StackedPoint[];
  kpThresh: number;
  churnThresh: number;
};

/** Process chaos matrix data - categorize, filter, stack, and generate Plotly traces */
export function processChaosMatrixData(
  data: ChaosPoint[] | undefined,
  range: ChaosTimeRangeKey,
  visibleTeams: Record<string, boolean> | undefined,
  teamNames: string[] | undefined,
  tooltipTeamLabel: string,
  renderMode: "circles" | "avatars"
): ProcessedChaosData {
  const base = data && data.length > 0 ? data : generateSyntheticChaosPoints(range, teamNames);
  const kpThresh = base.length > 0 ? median(base.map((p) => p.medianWeeklyKp)) : 1000;
  const churnThresh = base.length > 0 ? median(base.map((p) => p.churnRatePct)) : 2;

  const categorized: CategorizedPoint[] = base.map((p) => ({
    ...p,
    category: categorizeChaos(p.medianWeeklyKp, p.churnRatePct, kpThresh, churnThresh),
  }));

  const filtered = visibleTeams
    ? categorized.filter((p) => visibleTeams[p.team] !== false)
    : categorized;

  const buckets = new Map<string, CategorizedPoint[]>();
  filtered.forEach((p) => {
    const key = `${Math.round(p.medianWeeklyKp / 50)}:${Math.round(p.churnRatePct * 10)}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(p);
    } else {
      buckets.set(key, [p]);
    }
  });

  const stackedFiltered: StackedPoint[] = filtered.map((p) => {
    const key = `${Math.round(p.medianWeeklyKp / 50)}:${Math.round(p.churnRatePct * 10)}`;
    const bucket = buckets.get(key) || [];
    const stackIndex = bucket.findIndex((bp) => bp.name === p.name);
    const stackCount = bucket.length;
    const originalKp = p.medianWeeklyKp;
    const originalChurn = p.churnRatePct;

    if (stackCount > 1) {
      const angle = (stackIndex / stackCount) * Math.PI * 2;
      const radius = 50;
      const radiusChurn = 0.15;
      return {
        ...p,
        medianWeeklyKp: p.medianWeeklyKp + Math.cos(angle) * radius,
        churnRatePct: p.churnRatePct + Math.sin(angle) * radiusChurn,
        originalKp,
        originalChurn,
      };
    }
    return { ...p, originalKp, originalChurn };
  });

  const categories: ChaosCategory[] = [
    "Skilled AI User",
    "Unskilled AI User",
    "Traditional Developer",
    "Low-Skill Developer",
  ];

  const plotData: Partial<PlotData>[] = categories.map((category) => {
    const categoryPoints = stackedFiltered.filter((p) => p.category === category);
    return {
      type: "scatter",
      mode: "markers",
      name: category,
      x: categoryPoints.map((p) => p.medianWeeklyKp),
      y: categoryPoints.map((p) => p.churnRatePct),
      text: categoryPoints.map(
        (p) =>
          `<b>${p.name}</b><br>KP: ${Math.round(p.originalKp)} · Churn: ${Math.round(p.originalChurn)}%`
      ),
      hovertemplate: "%{text}<extra></extra>",
      marker:
        renderMode === "avatars"
          ? { size: 22, color: "rgba(0,0,0,0)", opacity: 0, line: { color: "rgba(0,0,0,0)", width: 0 } }
          : { size: 8, color: CATEGORY_COLORS[category] },
      showlegend: true,
      legendgroup: category,
    } as Partial<PlotData>;
  });

  return { plotData, stackedFiltered, kpThresh, churnThresh };
}
