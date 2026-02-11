import type { MemberPerformanceRow } from "../types";
import type { OverviewSummaryCardConfig, ChartInsight } from "@/lib/dashboard/entities/team/types";

/** Base card config (same as org dashboard, but for members instead of teams) */
const BASE_CARD_CONFIG: Omit<OverviewSummaryCardConfig, "count">[] = [
  {
    key: "star",
    title: "Star",
    priority: "Optimal",
    descriptionLine1: "Low SPOF",
    descriptionLine2: "Skilled AI Builder",
    bg: "#D9F9E6",
    iconColor: "#55B685",
    badgeColor: "text-white bg-[#6BC095]"
  },
  {
    key: "time-bomb",
    title: "Time Bomb",
    priority: "P0",
    descriptionLine1: "High SPOF",
    descriptionLine2: "Unskilled Vibe Coder",
    bg: "#F9E3E2",
    iconColor: "#CA3A31",
    badgeColor: "text-white bg-[#CA3A31]"
  },
  {
    key: "key-player",
    title: "Key Role",
    priority: "P1",
    descriptionLine1: "High SPOF",
    descriptionLine2: "Skilled AI Builder",
    bg: "#FCEED8",
    iconColor: "#E87B35",
    badgeColor: "text-white bg-[#E87B35]"
  },
  {
    key: "bottleneck",
    title: "Bottleneck",
    priority: "P1",
    descriptionLine1: "High SPOF",
    descriptionLine2: "Manual Coder",
    bg: "#FCEED8",
    iconColor: "#E87B35",
    badgeColor: "text-white bg-[#E9A23B]"
  },
  {
    key: "risky",
    title: "Risky",
    priority: "P2",
    descriptionLine1: "Low SPOF",
    descriptionLine2: "Unskilled Vibe Coder",
    bg: "#FCF3CC",
    iconColor: "#E9A23B",
    badgeColor: "text-white bg-[#E9A23B]"
  },
  {
    key: "stable",
    title: "Legacy",
    priority: "P3",
    descriptionLine1: "Low SPOF",
    descriptionLine2: "Manual Coder",
    bg: "#E5ECF6",
    iconColor: "#7BA8E6",
    badgeColor: "text-white bg-[#7BA8E6]"
  },
];

const CARD_KEY_TO_DIST_KEY: (keyof MemberPerformanceRow["typeDistribution"])[] = [
  "star", "timeBomb", "keyRole", "bottleneck", "risky", "legacy",
];

/**
 * Calculate team gauge value as average of member performance values.
 * Validates that member mocks aggregate correctly to team level.
 */
export function calculateTeamGaugeValue(members: MemberPerformanceRow[]): number {
  if (members.length === 0) return 0;
  const sum = members.reduce((acc, m) => acc + m.performanceValue, 0);
  return Math.round(sum / members.length);
}

/**
 * Generate metric cards by summing typeDistribution fields across all members.
 * Matches org dashboard pattern: getOverviewSummaryCardsForGauge().
 */
export function getMemberMetricCards(members: MemberPerformanceRow[]): OverviewSummaryCardConfig[] {
  const totals = { star: 0, timeBomb: 0, keyRole: 0, bottleneck: 0, risky: 0, legacy: 0 };

  for (const member of members) {
    totals.star += member.typeDistribution.star;
    totals.timeBomb += member.typeDistribution.timeBomb;
    totals.keyRole += member.typeDistribution.keyRole;
    totals.bottleneck += member.typeDistribution.bottleneck;
    totals.risky += member.typeDistribution.risky;
    totals.legacy += member.typeDistribution.legacy;
  }

  return BASE_CARD_CONFIG.map((base, i) => ({
    ...base,
    count: totals[CARD_KEY_TO_DIST_KEY[i]],
  }));
}

/**
 * Generate team composition insights mentioning specific member names.
 * Static for Phase 2 (validates UI, faster implementation).
 */
export function getMemberInsights(members: MemberPerformanceRow[]): ChartInsight[] {
  if (members.length === 0) return [];

  const insights: ChartInsight[] = [];

  // Find primary category for each member (highest typeDistribution value)
  const categoryCounts = { star: 0, timeBomb: 0, risky: 0, bottleneck: 0, keyRole: 0, legacy: 0 };
  const categoryMembers: Record<string, string[]> = {
    star: [], timeBomb: [], risky: [], bottleneck: [], keyRole: [], legacy: []
  };

  for (const member of members) {
    const dist = member.typeDistribution;
    const entries = Object.entries(dist) as [keyof typeof dist, number][];
    const maxEntry = entries.reduce((max, entry) => entry[1] > max[1] ? entry : max, entries[0]);
    const maxKey = maxEntry[0];
    categoryCounts[maxKey]++;
    categoryMembers[maxKey].push(member.memberName);
  }

  // Star performers insight (personalized with names)
  if (categoryCounts.star > 0) {
    const names = categoryMembers.star.slice(0, 2).join(" and ");
    insights.push({
      id: "stars",
      text: `${categoryCounts.star} star performer${categoryCounts.star > 1 ? 's' : ''} (${names}) are driving high performance with low SPOF risk.`
    });
  }

  // Time bomb warning (personalized with names)
  if (categoryCounts.timeBomb > 0) {
    const names = categoryMembers.timeBomb.slice(0, 1).join(", ");
    insights.push({
      id: "timebombs",
      text: `${categoryCounts.timeBomb} time bomb${categoryCounts.timeBomb > 1 ? 's' : ''} detected${names ? ` including ${names}` : ''} — high SPOF risk with low skill level.`
    });
  }

  // Risky members insight
  if (categoryCounts.risky > 0) {
    insights.push({
      id: "risky",
      text: `${categoryCounts.risky} risky member${categoryCounts.risky > 1 ? 's' : ''} require upskilling to reduce vibe coding patterns.`
    });
  }

  // Top performers summary
  const topPerformers = members.filter(m => m.performanceValue >= 75);
  if (topPerformers.length > 0) {
    insights.push({
      id: "topperformers",
      text: `${topPerformers.length} member${topPerformers.length > 1 ? 's' : ''} achieving "Extreme Outperforming" status (75+) this period.`
    });
  }

  return insights.slice(0, 4); // Display 3-4 items (matches org dashboard pattern)
}
