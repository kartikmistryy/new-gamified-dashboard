/**
 * User Performance Mock Data Generation
 *
 * Generates user performance metrics including performance score, weekly metrics,
 * developer classification, and chart insights.
 */

import type {
  UserPerformanceData,
  DeveloperType,
  EngineeringChaosStatus,
  SPOFRiskLevel,
  PerformanceLevel,
} from "./types";

/**
 * Creates a deterministic seeded random number generator.
 * Returns a function that generates numbers between 0 and 1.
 */
function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use a simple LCG (Linear Congruential Generator)
  let state = Math.abs(hash);
  return function() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Determines performance level based on Weekly DiffDelta value */
function getPerformanceLevel(value: number): PerformanceLevel {
  if (value < 20) return "Extreme Underperforming";
  if (value < 40) return "Underperforming";
  if (value < 60) return "Average";
  if (value < 80) return "Good";
  return "Excellent";
}

/** Determines churn rate comparison text */
function getChurnComparison(percentage: number): string {
  if (percentage >= 80) return "Extreme Higher Than The Medium";
  if (percentage >= 60) return "Higher Than The Medium";
  if (percentage >= 40) return "Around The Medium";
  if (percentage >= 20) return "Lower Than The Medium";
  return "Much Lower Than The Medium";
}

/**
 * Generates mock user performance data based on performance score.
 */
export function generateUserPerformanceData(
  userId: string,
  userName: string,
  performanceScore?: number
): UserPerformanceData {
  const random = createSeededRandom(userId);
  const score = performanceScore ?? Math.floor(random() * 101);

  // Generate correlated metrics based on performance score
  const weeklyDiffDelta = Math.floor(score * 0.8 + random() * 20);
  const churnRate = Math.floor(100 - score * 0.7 + random() * 30);
  const cumulativeDelta = Math.floor(score * 15 + random() * 500);
  const weekOverWeek = Math.floor((random() - 0.5) * 30);

  // Determine developer type based on score
  let developerType: DeveloperType;
  if (score >= 80) developerType = "Star";
  else if (score >= 60) developerType = "Key Player";
  else if (score >= 40) developerType = "Stable";
  else if (score >= 25) developerType = "Risky";
  else if (score >= 15) developerType = "Bottleneck";
  else developerType = "Time Bomb";

  // Engineering chaos status
  let chaosStatus: EngineeringChaosStatus;
  const isLowChurn = churnRate < 40;
  const isHighDiffDelta = weeklyDiffDelta > 60;

  if (isHighDiffDelta && isLowChurn) {
    chaosStatus = "Skilled AI Builder";
  } else if (!isHighDiffDelta && !isLowChurn) {
    chaosStatus = "Low-Skill Dev";
  } else if (!isHighDiffDelta && isLowChurn) {
    chaosStatus = "Legacy Dev";
  } else {
    chaosStatus = "Unskilled Vibe Coder";
  }

  // SPOF risk
  let spofLevel: SPOFRiskLevel;
  const ownershipScore = random() * 100;
  if (ownershipScore > 80) spofLevel = "High Risk";
  else if (ownershipScore > 60) spofLevel = "Need Attention";
  else if (ownershipScore > 40) spofLevel = "Low Risk";
  else spofLevel = "Optimal";

  return {
    userId,
    userName,
    userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    performanceScore: score,
    weeklyDiffDelta: {
      value: weeklyDiffDelta,
      level: getPerformanceLevel(weeklyDiffDelta),
    },
    churnRate: {
      percentage: churnRate,
      comparison: getChurnComparison(churnRate),
    },
    cumulativeDiffDelta: {
      value: cumulativeDelta,
      weekOverWeek,
      trend: weekOverWeek > 0 ? "up" : weekOverWeek < 0 ? "down" : "flat",
    },
    developerType: {
      type: developerType,
      spofLevel: score > 50 ? "Low" : "High",
      skillLevel: chaosStatus,
    },
    engineeringChaos: {
      status: chaosStatus,
      churnLevel: isLowChurn ? "Low" : "High",
      diffDeltaLevel: isHighDiffDelta ? "High" : "Low",
    },
    spofRisk: {
      level: spofLevel,
      ownership: ownershipScore > 60 ? "High" : "Low",
      percentile: Math.floor(ownershipScore),
    },
    insights: [
      `Performance ${score > 50 ? "above" : "below"} team average by ${Math.abs(score - 50)}%`,
      `Completed ${Math.floor(score / 10)} major features this quarter`,
      `Code review participation: ${score > 60 ? "Strong" : "Needs improvement"}`,
      `Collaboration score trending ${weekOverWeek > 0 ? "upward" : "downward"}`,
    ],
  };
}

/**
 * Mock chart insights for user dashboard.
 */
export function getUserChartInsights(score: number): Array<{ id: string; text: string }> {
  if (score >= 70) {
    return [
      { id: "insight-1", text: "Consistently high performer with strong collaboration metrics" },
      { id: "insight-2", text: "Code quality improvements show 15% reduction in bugs" },
      { id: "insight-3", text: "Leading contributor in AI-assisted development adoption" },
      { id: "insight-4", text: "Peer review velocity increased by 23% this quarter" },
    ];
  } else if (score >= 40) {
    return [
      { id: "insight-1", text: "Performance stable with room for optimization in code review speed" },
      { id: "insight-2", text: "Good progress on feature delivery, on track for quarterly goals" },
      { id: "insight-3", text: "Collaboration metrics trending positively" },
      { id: "insight-4", text: "Consider focusing on reducing code churn in next sprint" },
    ];
  } else {
    return [
      { id: "insight-1", text: "Performance below team average, coaching recommended" },
      { id: "insight-2", text: "High code churn indicates potential technical debt" },
      { id: "insight-3", text: "Limited participation in knowledge sharing activities" },
      { id: "insight-4", text: "Action needed: Focus on code quality and testing practices" },
    ];
  }
}
