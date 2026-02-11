import type { MemberDesignRow } from "../mocks/designMockData";
import type { ChartInsight } from "@/lib/dashboard/entities/team/types";

/** Design member filter types. */
export type DesignMemberFilter =
  | "mostImportant"
  | "skilledAI"
  | "traditionalDev"
  | "unskilledAI"
  | "lowSkillDev";

/** Design filter tab configuration. */
export const DESIGN_MEMBER_FILTER_TABS: { key: DesignMemberFilter; label: string }[] = [
  { key: "mostImportant", label: "Most Important" },
  { key: "skilledAI", label: "Most Skilled AI Builders" },
  { key: "traditionalDev", label: "Most Legacy Devs" },
  { key: "unskilledAI", label: "Most Unskilled Vibe Coders" },
  { key: "lowSkillDev", label: "Most Low-Skill Devs" },
];

/** Sort function for design member table based on active filter. */
export function designMemberSortFunction(
  rows: MemberDesignRow[],
  currentFilter: DesignMemberFilter
): MemberDesignRow[] {
  const copy = [...rows];

  switch (currentFilter) {
    case "mostImportant":
      return copy.sort((a, b) => b.ownershipPct - a.ownershipPct);
    case "skilledAI":
      return copy.sort((a, b) => b.skilledAIScore - a.skilledAIScore);
    case "traditionalDev":
      return copy.sort((a, b) => b.legacyScore - a.legacyScore);
    case "unskilledAI":
      return copy.sort((a, b) => b.unskilledScore - a.unskilledScore);
    case "lowSkillDev":
      // Low-skill devs: low KP + high churn
      return copy.sort((a, b) => {
        const aScore = a.churnRatePct / (a.medianWeeklyKp + 1);
        const bScore = b.churnRatePct / (b.medianWeeklyKp + 1);
        return bScore - aScore;
      });
    default:
      return copy;
  }
}

/** Generate design-specific insights about member ownership and chaos patterns. */
export function getDesignInsights(members: MemberDesignRow[]): ChartInsight[] {
  const insights: ChartInsight[] = [];

  // Sort by ownership to find extremes
  const byOwnership = [...members].sort((a, b) => b.ownershipPct - a.ownershipPct);
  const highestOwnership = byOwnership[0];
  const lowestOwnership = byOwnership[byOwnership.length - 1];

  // Sort by chaos to find extremes
  const byChaos = [...members].sort((a, b) => b.churnRatePct - a.churnRatePct);
  const highestChaos = byChaos[0];
  const lowestChaos = byChaos[byChaos.length - 1];

  // Insight 1: Highest ownership member
  insights.push({
    id: "highest-ownership",
    text: `${highestOwnership.memberName} has the highest ownership concentration at ${highestOwnership.ownershipPct.toFixed(1)}%, indicating strong code ownership patterns.`,
  });

  // Insight 2: Ownership spread
  const ownershipSpread = highestOwnership.ownershipPct - lowestOwnership.ownershipPct;
  if (ownershipSpread > 15) {
    insights.push({
      id: "ownership-spread",
      text: `Team shows ${ownershipSpread.toFixed(1)}% ownership spread, suggesting diverse responsibility distribution across members.`,
    });
  } else {
    insights.push({
      id: "ownership-spread",
      text: `Team has balanced ownership distribution with only ${ownershipSpread.toFixed(1)}% spread between highest and lowest members.`,
    });
  }

  // Insight 3: Chaos extremes
  if (highestChaos.churnRatePct > 40) {
    insights.push({
      id: "chaos-high",
      text: `${highestChaos.memberName} shows elevated churn rate at ${highestChaos.churnRatePct.toFixed(1)}%, potentially indicating rapid iteration or refactoring work.`,
    });
  } else if (lowestChaos.churnRatePct < 15) {
    insights.push({
      id: "chaos-low",
      text: `${lowestChaos.memberName} maintains low churn rate at ${lowestChaos.churnRatePct.toFixed(1)}%, suggesting stable, focused development approach.`,
    });
  }

  // Insight 4: AI usage patterns (skilled AI users)
  const bySkilledAI = [...members].sort((a, b) => b.skilledAIScore - a.skilledAIScore);
  const topSkilledAI = bySkilledAI[0];
  if (topSkilledAI.skilledAIScore > 12) {
    insights.push({
      id: "skilled-ai",
      text: `${topSkilledAI.memberName} demonstrates high-productivity, low-churn pattern consistent with effective AI tool usage.`,
    });
  }

  return insights;
}
