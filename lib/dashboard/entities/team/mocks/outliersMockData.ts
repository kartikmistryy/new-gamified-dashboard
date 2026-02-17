/**
 * Mock data for the Org Design Outliers Table
 * Combines Ownership Misallocation + Chaos Matrix + SPOF Assessment
 */

import type {
  OutlierDeveloper,
  OwnershipCategory,
  ChaosCategory,
  SpofAssessment,
  OutlierPriority,
  ChartMotivation,
} from "../types";

// =============================================================================
// Ranking & Priority Utilities
// =============================================================================

/** Chaos category rank (1 = worst, 4 = best within same ownership category) */
const CHAOS_RANK: Record<ChaosCategory, number> = {
  "Low-Skill Developer": 1,
  "Traditional Developer": 2,
  "Unskilled AI User": 3,
  "Skilled AI User": 4,
};

/** Calculate combined rank (1-12, lower is worse) */
export function calculateCombinedRank(
  ownership: OwnershipCategory,
  chaos: ChaosCategory
): number {
  const chaosRank = CHAOS_RANK[chaos];
  if (ownership === "lower") return chaosRank; // 1-4 (Critical)
  if (ownership === "higher") return chaosRank + 4; // 5-8 (Needs Attention)
  return chaosRank + 8; // 9-12 (Others/Normal)
}

/** Get priority from ownership category */
export function getPriorityFromOwnership(
  ownership: OwnershipCategory
): OutlierPriority {
  if (ownership === "lower") return "critical";
  if (ownership === "higher") return "attention";
  return "normal";
}

/** Create an outlier developer with calculated rank and priority */
function createOutlier(
  id: string,
  name: string,
  team: string,
  ownershipCategory: OwnershipCategory,
  chaosCategory: ChaosCategory,
  spofAssessment: SpofAssessment
): OutlierDeveloper {
  return {
    id,
    name,
    team,
    ownershipCategory,
    chaosCategory,
    spofAssessment,
    combinedRank: calculateCombinedRank(ownershipCategory, chaosCategory),
    priority: getPriorityFromOwnership(ownershipCategory),
  };
}

// =============================================================================
// Mock Outlier Developers
// =============================================================================

/**
 * Mock data representing developers with their combined classifications.
 * Distribution: ~20% outliers (lower/higher), ~80% expected
 * Outliers are sorted by combinedRank (ascending = worst first)
 */
export const MOCK_OUTLIER_DEVELOPERS: OutlierDeveloper[] = [
  // Critical (Lower than expected ownership) - Rank 1-4
  createOutlier("dev-1", "Jordan Patel", "DevOps", "lower", "Low-Skill Developer", "high"),
  createOutlier("dev-2", "Avery Thomas", "DevOps", "lower", "Traditional Developer", "high"),
  createOutlier("dev-3", "Casey Ford", "Frontend", "lower", "Unskilled AI User", "medium"),
  createOutlier("dev-4", "Reese Blake", "DevOps", "lower", "Skilled AI User", "medium"),

  // Needs Attention (Higher than expected ownership) - Rank 5-8
  createOutlier("dev-5", "Sky Wilson", "Backend", "higher", "Low-Skill Developer", "high"),
  createOutlier("dev-6", "Alex Davis", "Backend", "higher", "Traditional Developer", "medium"),
  createOutlier("dev-7", "Riley Taylor", "Backend", "higher", "Unskilled AI User", "medium"),
  createOutlier("dev-8", "Avery Patel", "Backend", "higher", "Skilled AI User", "low"),

  // Normal (As expected) - Rank 9-12 - showing some examples
  createOutlier("dev-9", "Morgan Kim", "Frontend", "expected", "Low-Skill Developer", "medium"),
  createOutlier("dev-10", "Quinn Hayes", "Backend", "expected", "Traditional Developer", "low"),
  createOutlier("dev-11", "Drew Walsh", "Platform", "expected", "Unskilled AI User", "low"),
  createOutlier("dev-12", "Sam Chen", "Platform", "expected", "Skilled AI User", "low"),
].sort((a, b) => a.combinedRank - b.combinedRank);

/** Get only the outliers (non-expected developers) */
export function getOutliersOnly(): OutlierDeveloper[] {
  return MOCK_OUTLIER_DEVELOPERS.filter((d) => d.ownershipCategory !== "expected");
}

/** Get developers by ownership category */
export function getDevelopersByOwnership(
  category: OwnershipCategory
): OutlierDeveloper[] {
  return MOCK_OUTLIER_DEVELOPERS.filter((d) => d.ownershipCategory === category);
}

/** Get developers by chaos category */
export function getDevelopersByChaos(
  category: ChaosCategory
): OutlierDeveloper[] {
  return MOCK_OUTLIER_DEVELOPERS.filter((d) => d.chaosCategory === category);
}

/** Get developers by priority */
export function getDevelopersByPriority(
  priority: OutlierPriority
): OutlierDeveloper[] {
  return MOCK_OUTLIER_DEVELOPERS.filter((d) => d.priority === priority);
}

// =============================================================================
// Outlier Trend (weekly time series for mini area chart)
// =============================================================================

/** Deterministic PRNG so trend data is stable across renders */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export type OutlierTrendData = {
  critical: number[];
  needsAttention: number[];
  total: number[];
  criticalChangePct: number;
  needsAttentionChangePct: number;
};

/**
 * Generate `weeks` of mock outlier counts.
 * Last entry = current real count; prior weeks are a seeded random walk.
 * Critical trends UP (worsening), NeedsAttention trends DOWN (improving).
 */
export function generateOutlierTrend(
  currentCritical: number,
  currentNeedsAttention: number,
  weeks = 12,
): OutlierTrendData {
  const rand = seededRandom(42);
  const critical = new Array<number>(weeks);
  const needsAttention = new Array<number>(weeks);

  critical[weeks - 1] = currentCritical;
  needsAttention[weeks - 1] = currentNeedsAttention;

  for (let i = weeks - 2; i >= 0; i--) {
    // bias negative → past lower → trend rises toward current
    critical[i] = Math.max(1, critical[i + 1] + Math.round(rand() * 3) - 2);
    // bias positive → past higher → trend falls toward current
    needsAttention[i] = Math.max(1, needsAttention[i + 1] + Math.round(rand() * 3) - 1);
  }

  const total = critical.map((c, i) => c + needsAttention[i]);

  const cmpIdx = Math.max(0, weeks - 5); // ~4 weeks back
  const criticalChangePct = critical[cmpIdx] === 0
    ? 0
    : Math.round(((currentCritical - critical[cmpIdx]) / critical[cmpIdx]) * 100);
  const needsAttentionChangePct = needsAttention[cmpIdx] === 0
    ? 0
    : Math.round(((currentNeedsAttention - needsAttention[cmpIdx]) / needsAttention[cmpIdx]) * 100);

  return { critical, needsAttention, total, criticalChangePct, needsAttentionChangePct };
}

// =============================================================================
// Chart Motivation Content
// =============================================================================

export const OWNERSHIP_MOTIVATION: ChartMotivation = {
  why: "Spots misalignment between effort and impact. High KP + low ownership = work getting overwritten. Low KP + high ownership = potential bottleneck.",
  how: "Plots KarmaPoints vs ownership %. Regression line shows expected ratio. Outliers fall outside ±1.5σ band.",
};

export const CHAOS_MATRIX_MOTIVATION: ChartMotivation = {
  why: "Shows if developers balance speed with quality. High churn = code that doesn't stick. Combined with KP, reveals effective vs wasteful AI usage.",
  how: "Uses median weekly KP (productivity) and churn rate (% deleted in 30 days). Four quadrants: Skilled AI, Unskilled AI, Traditional, Low-Skill.",
};

// =============================================================================
// Priority Badge Styles
// =============================================================================

export const PRIORITY_STYLES: Record<OutlierPriority, { label: string; bgColor: string; textColor: string }> = {
  critical: {
    label: "Critical",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  attention: {
    label: "Needs Attention",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  normal: {
    label: "Normal",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
};

// =============================================================================
// Ownership Category Styles
// =============================================================================

export const OWNERSHIP_STYLES: Record<OwnershipCategory, { label: string; bgColor: string; textColor: string }> = {
  lower: {
    label: "Lower than expected",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  higher: {
    label: "Higher than expected",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  expected: {
    label: "As expected",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
};

// =============================================================================
// Chaos Category Styles
// =============================================================================

export const CHAOS_STYLES: Record<ChaosCategory, { bgColor: string; textColor: string }> = {
  "Skilled AI User": {
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
  "Unskilled AI User": {
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  "Traditional Developer": {
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  "Low-Skill Developer": {
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
};

// =============================================================================
// SPOF Assessment Styles
// =============================================================================

export const SPOF_STYLES: Record<SpofAssessment, { label: string; bgColor: string; textColor: string }> = {
  high: {
    label: "High Risk",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  medium: {
    label: "Medium Risk",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  low: {
    label: "Low Risk",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
};
