import type { ChartInsight, OverviewSummaryCardConfig, TeamPerformanceRow } from "./types";
import { getPerformanceGaugeLabel } from "./utils";

const TEAM_NAMES = [
  "Frontend Development",
  "UI/UX Design",
  "AI / ML Development",
  "Mobile App Development",
  "Web Development",
] as const;

/** Spread around gauge so average equals gauge: -41, -13, 0, +13, +43. */
const TEAM_VALUE_OFFSETS = [-41, -13, 0, 13, 43] as const;

/** Reference type distributions (sum 30) for interpolation. Tuned so summed counts vary for trend arrows: some ≤4 (down), 5–7 (flat), ≥8 (up). */
const TYPE_DIST_REF: { value: number; dist: TeamPerformanceRow["typeDistribution"] }[] = [
  { value: 11, dist: { star: 10, timeBomb: 9, keyRole: 8, bottleneck: 2, risky: 0, legacy: 1 } },
  { value: 39, dist: { star: 10, timeBomb: 9, keyRole: 8, bottleneck: 2, risky: 0, legacy: 1 } },
  { value: 50, dist: { star: 9, timeBomb: 9, keyRole: 9, bottleneck: 1, risky: 1, legacy: 1 } },
  { value: 65, dist: { star: 9, timeBomb: 8, keyRole: 9, bottleneck: 1, risky: 1, legacy: 2 } },
  { value: 95, dist: { star: 10, timeBomb: 6, keyRole: 10, bottleneck: 0, risky: 2, legacy: 2 } },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getTypeDistributionForPerformance(value: number): TeamPerformanceRow["typeDistribution"] {
  const v = Math.max(0, Math.min(100, value));
  if (v <= TYPE_DIST_REF[0].value) return { ...TYPE_DIST_REF[0].dist };
  if (v >= TYPE_DIST_REF[TYPE_DIST_REF.length - 1].value) return { ...TYPE_DIST_REF[TYPE_DIST_REF.length - 1].dist };
  let i = 0;
  while (i < TYPE_DIST_REF.length - 1 && TYPE_DIST_REF[i + 1].value < v) i++;
  const lo = TYPE_DIST_REF[i];
  const hi = TYPE_DIST_REF[i + 1];
  const t = (v - lo.value) / (hi.value - lo.value);
  const keys = ["star", "timeBomb", "keyRole", "bottleneck", "risky", "legacy"] as const;
  const dist = keys.reduce((acc, key) => {
    acc[key] = Math.round(lerp(lo.dist[key], hi.dist[key], t));
    return acc;
  }, {} as TeamPerformanceRow["typeDistribution"]);
  const sum = keys.reduce((s, k) => s + dist[k], 0);
  if (sum !== 30) dist.star = dist.star + (30 - sum);
  return dist;
}

function getPerformanceBarColor(value: number): string {
  if (value <= 24) return "bg-[#CA3A31]";
  if (value <= 44) return "bg-[#E87B35]";
  if (value <= 55) return "bg-[#E2B53E]";
  if (value <= 75) return "bg-[#94CA42]";
  return "bg-[#55B685]";
}

/** Fixed colors for teams 1–5 (by name/order), not based on performance. */
const TEAM_COLORS_BY_RANK: string[] = [
  "bg-[#FF8080]",
  "bg-[#ACFF80]",
  "bg-[#80C8FF]",
  "bg-[#80C8FF]",
  "bg-[#80C8FF]",
];

/** Extreme Underperforming = down; Underperforming & Outperforming = up; Flat = right. */
function getTrend(value: number): "up" | "down" | "flat" {
  if (value <= 24) return "down";
  if (value >= 45 && value <= 55) return "flat";
  return "up";
}

/**
 * Generates 5 team rows whose average performance equals gaugeValue (0–100).
 * D3Gauge shows a random value; overview data is derived from it via this function.
 */
export function getTeamPerformanceRowsForGauge(gaugeValue: number): TeamPerformanceRow[] {
  const gauge = Math.max(0, Math.min(100, Math.round(gaugeValue)));
  const values = TEAM_VALUE_OFFSETS.map((off) => Math.max(0, Math.min(100, gauge + off))).sort((a, b) => a - b);
  return values.map((performanceValue, index) => {
    const performanceLabel = getPerformanceGaugeLabel(performanceValue);
    const performanceBarColor = getPerformanceBarColor(performanceValue);
    const teamColor = TEAM_COLORS_BY_RANK[index] ?? TEAM_COLORS_BY_RANK[0];
    const trend = getTrend(performanceValue);
    return {
      rank: index + 1,
      teamName: TEAM_NAMES[index],
      teamColor,
      performanceLabel,
      performanceValue,
      trend,
      performanceBarColor,
      typeDistribution: getTypeDistributionForPerformance(performanceValue),
    };
  });
}

const BASE_CARD_CONFIG: Omit<OverviewSummaryCardConfig, "count">[] = [
  { key: "star", title: "Star", priority: "Optimal", descriptionLine1: "Low SPOF", descriptionLine2: "Skilled AI Builder", bg: "#D9F9E6", iconColor: "#55B685", badgeColor: "text-white bg-[#6BC095]" },
  { key: "time-bomb", title: "Time Bomb", priority: "P0", descriptionLine1: "High SPOF", descriptionLine2: "Unskilled Vibe Coder", bg: "#F9E3E2", iconColor: "#CA3A31", badgeColor: "text-white bg-[#CA3A31]" },
  { key: "key-player", title: "Key Role", priority: "P1", descriptionLine1: "High SPOF", descriptionLine2: "Skilled AI Builder", bg: "#FCEED8", iconColor: "#E87B35", badgeColor: "text-white bg-[#E87B35]" },
  { key: "bottleneck", title: "Bottleneck", priority: "P1", descriptionLine1: "High SPOF", descriptionLine2: "Manual Coder", bg: "#FCEED8", iconColor: "#E87B35", badgeColor: "text-white bg-[#E9A23B]" },
  { key: "risky", title: "Risky", priority: "P2", descriptionLine1: "Low SPOF", descriptionLine2: "Unskilled Vibe Coder", bg: "#FCF3CC", iconColor: "#E9A23B", badgeColor: "text-white bg-[#E9A23B]" },
  { key: "stable", title: "Legacy", priority: "P3", descriptionLine1: "Low SPOF", descriptionLine2: "Manual Coder", bg: "#FDF9C9", iconColor: "#E2B53E", badgeColor: "text-white bg-[#E2B53E]" },
];

const CARD_KEY_TO_DIST_KEY: (keyof TeamPerformanceRow["typeDistribution"])[] = [
  "star", "timeBomb", "keyRole", "bottleneck", "risky", "legacy",
];

/**
 * Overview summary cards with counts derived from team type distributions for the given gauge value.
 */
export function getOverviewSummaryCardsForGauge(gaugeValue: number): OverviewSummaryCardConfig[] {
  const rows = getTeamPerformanceRowsForGauge(gaugeValue);
  const totals = { star: 0, timeBomb: 0, keyRole: 0, bottleneck: 0, risky: 0, legacy: 0 };
  for (const row of rows) {
    totals.star += row.typeDistribution.star;
    totals.timeBomb += row.typeDistribution.timeBomb;
    totals.keyRole += row.typeDistribution.keyRole;
    totals.bottleneck += row.typeDistribution.bottleneck;
    totals.risky += row.typeDistribution.risky;
    totals.legacy += row.typeDistribution.legacy;
  }
  return BASE_CARD_CONFIG.map((base, i) => ({
    ...base,
    count: totals[CARD_KEY_TO_DIST_KEY[i]],
  }));
}

/** Default gauge (52) for design/performance pages. Org overview uses random gauge. */
const DEFAULT_GAUGE = 52;

/** Team rows for default gauge; used by design and performance pages. */
export const TEAM_PERFORMANCE_ROWS: TeamPerformanceRow[] = getTeamPerformanceRowsForGauge(DEFAULT_GAUGE);

/** Overview cards for default gauge; used by design page. */
export const OVERVIEW_SUMMARY_CARDS: OverviewSummaryCardConfig[] = getOverviewSummaryCardsForGauge(DEFAULT_GAUGE);

const CHART_INSIGHTS_MOCK: ChartInsight[] = [
  { id: "baseline", text: "Performance stayed mostly above baseline, with the median clustering in the P40-P60 band throughout the year." },
  { id: "milestones", text: "Leadership and delivery milestones drive outsized gains, pushing results into the P70+ \"Excellent\" range." },
  { id: "disruption", text: "Team disruption has immediate impact, as seen in the sharp mid-year dip during the Architect's leave." },
  { id: "holiday", text: "Holiday effects are real but temporary, causing short dips without long-term degradation." },
  { id: "recovery", text: "Recovery speed is strong, with performance rebounding within weeks after each downturn." },
  { id: "volatility", text: "End-of-year volatility reflects seasonality, not a structural decline in performance." },
];

/** Mock chart insights for the overview dashboard. Replace with API/real data when available. */
export function getChartInsightsMock(): ChartInsight[] {
  return [...CHART_INSIGHTS_MOCK];
}
