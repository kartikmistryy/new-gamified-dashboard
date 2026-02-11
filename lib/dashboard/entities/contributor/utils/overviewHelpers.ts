import type { ContributorPerformanceRow } from "../types";
import type { OverviewSummaryCardConfig, ChartInsight } from "@/lib/dashboard/entities/team/types";
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";

/** Base card config (same as team dashboard, but for contributors instead of members) */
const BASE_CARD_CONFIG: Omit<OverviewSummaryCardConfig, "count">[] = [
  {
    key: "star",
    title: "Star",
    priority: "Optimal",
    descriptionLine1: "Low SPOF",
    descriptionLine2: "Skilled AI Builder",
    bg: DASHBOARD_COLORS.bgGreenLight,
    iconColor: DASHBOARD_COLORS.excellent,
    badgeColor: "text-white bg-[#6BC095]"
  },
  {
    key: "time-bomb",
    title: "Time Bomb",
    priority: "P0",
    descriptionLine1: "High SPOF",
    descriptionLine2: "Unskilled Vibe Coder",
    bg: DASHBOARD_COLORS.bgRedLight,
    iconColor: DASHBOARD_COLORS.danger,
    badgeColor: "text-white bg-[#CA3A31]"
  },
  {
    key: "key-player",
    title: "Key Role",
    priority: "P1",
    descriptionLine1: "High SPOF",
    descriptionLine2: "Skilled AI Builder",
    bg: DASHBOARD_COLORS.bgOrangeLight,
    iconColor: DASHBOARD_COLORS.warning,
    badgeColor: "text-white bg-[#E87B35]"
  },
  {
    key: "bottleneck",
    title: "Bottleneck",
    priority: "P1",
    descriptionLine1: "High SPOF",
    descriptionLine2: "Manual Coder",
    bg: DASHBOARD_COLORS.bgOrangeLight,
    iconColor: DASHBOARD_COLORS.warning,
    badgeColor: "text-white bg-[#E9A23B]"
  },
  {
    key: "risky",
    title: "Risky",
    priority: "P2",
    descriptionLine1: "Low SPOF",
    descriptionLine2: "Unskilled Vibe Coder",
    bg: DASHBOARD_COLORS.bgYellowLight,
    iconColor: DASHBOARD_COLORS.caution,
    badgeColor: "text-white bg-[#E9A23B]"
  },
  {
    key: "stable",
    title: "Legacy",
    priority: "P3",
    descriptionLine1: "Low SPOF",
    descriptionLine2: "Manual Coder",
    bg: DASHBOARD_COLORS.bgBlueLight,
    iconColor: DASHBOARD_COLORS.blueAccent,
    badgeColor: "text-white bg-[#7BA8E6]"
  },
];

const CARD_KEY_TO_DIST_KEY: (keyof ContributorPerformanceRow["typeDistribution"])[] = [
  "star", "timeBomb", "keyRole", "bottleneck", "risky", "legacy",
];

/**
 * Calculate repository gauge value as average of contributor performance values.
 * Validates that contributor mocks aggregate correctly to repository level.
 */
export function calculateRepoGaugeValue(contributors: ContributorPerformanceRow[]): number {
  if (contributors.length === 0) return 0;
  const sum = contributors.reduce((acc, c) => acc + c.performanceValue, 0);
  return Math.round(sum / contributors.length);
}

/**
 * Generate metric cards by summing typeDistribution fields across all contributors.
 * Matches team dashboard pattern: getMemberMetricCards().
 */
export function getContributorMetricCards(contributors: ContributorPerformanceRow[]): OverviewSummaryCardConfig[] {
  const totals = { star: 0, timeBomb: 0, keyRole: 0, bottleneck: 0, risky: 0, legacy: 0 };

  for (const contributor of contributors) {
    totals.star += contributor.typeDistribution.star;
    totals.timeBomb += contributor.typeDistribution.timeBomb;
    totals.keyRole += contributor.typeDistribution.keyRole;
    totals.bottleneck += contributor.typeDistribution.bottleneck;
    totals.risky += contributor.typeDistribution.risky;
    totals.legacy += contributor.typeDistribution.legacy;
  }

  return BASE_CARD_CONFIG.map((base, i) => ({
    ...base,
    count: totals[CARD_KEY_TO_DIST_KEY[i]],
  }));
}

/**
 * Generate repository composition insights mentioning specific contributor names.
 * Adapted from team dashboard getMemberInsights().
 */
export function getContributorInsights(contributors: ContributorPerformanceRow[]): ChartInsight[] {
  if (contributors.length === 0) return [];

  const insights: ChartInsight[] = [];

  // Find primary category for each contributor (highest typeDistribution value)
  const categoryCounts = { star: 0, timeBomb: 0, risky: 0, bottleneck: 0, keyRole: 0, legacy: 0 };
  const categoryContributors: Record<string, string[]> = {
    star: [], timeBomb: [], risky: [], bottleneck: [], keyRole: [], legacy: []
  };

  for (const contributor of contributors) {
    const dist = contributor.typeDistribution;
    const entries = Object.entries(dist) as [keyof typeof dist, number][];
    const maxEntry = entries.reduce((max, entry) => entry[1] > max[1] ? entry : max, entries[0]);
    const maxKey = maxEntry[0];
    categoryCounts[maxKey]++;
    categoryContributors[maxKey].push(contributor.contributorName);
  }

  // Star performers insight (personalized with names)
  if (categoryCounts.star > 0) {
    const names = categoryContributors.star.slice(0, 2).join(" and ");
    insights.push({
      id: "stars",
      text: `${categoryCounts.star} star performer${categoryCounts.star > 1 ? 's' : ''} (${names}) are driving high performance with low SPOF risk.`
    });
  }

  // Time bomb warning (personalized with names)
  if (categoryCounts.timeBomb > 0) {
    const names = categoryContributors.timeBomb.slice(0, 1).join(", ");
    insights.push({
      id: "timebombs",
      text: `${categoryCounts.timeBomb} time bomb${categoryCounts.timeBomb > 1 ? 's' : ''} detected${names ? ` including ${names}` : ''} — high SPOF risk with low skill level.`
    });
  }

  // Risky contributors insight
  if (categoryCounts.risky > 0) {
    insights.push({
      id: "risky",
      text: `${categoryCounts.risky} risky contributor${categoryCounts.risky > 1 ? 's' : ''} require upskilling to reduce vibe coding patterns.`
    });
  }

  // Top performers summary
  const topPerformers = contributors.filter(c => c.performanceValue >= 75);
  if (topPerformers.length > 0) {
    insights.push({
      id: "topperformers",
      text: `${topPerformers.length} contributor${topPerformers.length > 1 ? 's' : ''} achieving "Extreme Outperforming" status (75+) this period.`
    });
  }

  return insights.slice(0, 4); // Display 3-4 items
}
