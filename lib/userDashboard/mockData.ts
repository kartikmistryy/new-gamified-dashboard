/**
 * User Dashboard Mock Data
 * Generates realistic mock data for user performance metrics and overview cards.
 * This will be replaced with API calls in future implementation.
 */

/**
 * User Dashboard Mock Data
 *
 * Generates realistic mock data for user performance metrics, overview cards,
 * and SPOF analysis. This will be replaced with API calls in production.
 *
 * Key functions:
 * - generateUserPerformanceData: Creates user performance metrics
 * - getUserMetricCards: Generates 3x2 overview card grid
 * - getUserModuleSPOFData: Creates SPOF module data for treemap
 * - getUserChartInsights: Provides performance insights
 */

import type {
  UserPerformanceData,
  UserMetricCardConfig,
  DeveloperType,
  EngineeringChaosStatus,
  SPOFRiskLevel,
  PerformanceLevel,
  ModuleSPOFData,
  ModuleOwner,
} from "./types";
import { getScoreRange } from "./userSpofHelpers";

/**
 * Determines performance level based on Weekly DiffDelta value.
 */
function getPerformanceLevel(value: number): PerformanceLevel {
  if (value < 20) return "Extreme Underperforming";
  if (value < 40) return "Underperforming";
  if (value < 60) return "Average";
  if (value < 80) return "Good";
  return "Excellent";
}

/**
 * Determines churn rate comparison text.
 */
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
  // Use provided score or generate random value
  const score = performanceScore ?? Math.floor(Math.random() * 101);

  // Generate correlated metrics based on performance score
  const weeklyDiffDelta = Math.floor(score * 0.8 + Math.random() * 20);
  const churnRate = Math.floor(100 - score * 0.7 + Math.random() * 30);
  const cumulativeDelta = Math.floor(score * 15 + Math.random() * 500);
  const weekOverWeek = Math.floor((Math.random() - 0.5) * 30);

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
  const ownershipScore = Math.random() * 100;
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
 * Generates metric cards for the user dashboard using OverviewSummaryCard format.
 * Returns 6 cards compatible with the OverviewSummaryCard component.
 */
export function getUserMetricCards(data: UserPerformanceData): UserMetricCardConfig[] {
  // Card 1: Weekly DiffDelta
  const weeklyBadge =
    data.weeklyDiffDelta.value < 30
      ? { text: "Low", color: "text-white bg-[#CA3A31]" }
      : data.weeklyDiffDelta.value < 60
        ? { text: "Moderate", color: "text-white bg-[#E9A23B]" }
        : { text: "High", color: "text-white bg-[#6BC095]" };

  const weeklyBg =
    data.weeklyDiffDelta.value < 30
      ? "#F9E3E2"
      : data.weeklyDiffDelta.value < 60
        ? "#FCF3CC"
        : "#D9F9E6";

  const weeklyIconColor =
    data.weeklyDiffDelta.value < 30
      ? "#CA3A31"
      : data.weeklyDiffDelta.value < 60
        ? "#E9A23B"
        : "#55B685";

  // Card 2: Churn Rate
  const churnBadge =
    data.churnRate.percentage >= 70
      ? { text: "High", color: "text-white bg-[#CA3A31]" }
      : data.churnRate.percentage >= 40
        ? { text: "Moderate", color: "text-white bg-[#E9A23B]" }
        : { text: "Low", color: "text-white bg-[#6BC095]" };

  const churnBg =
    data.churnRate.percentage >= 70
      ? "#F9E3E2"
      : data.churnRate.percentage >= 40
        ? "#FCF3CC"
        : "#D9F9E6";

  const churnIconColor =
    data.churnRate.percentage >= 70 ? "#CA3A31" : data.churnRate.percentage >= 40 ? "#E9A23B" : "#55B685";

  // Card 3: Cumulative DiffDelta
  const cumulativeBadge =
    data.cumulativeDiffDelta.value >= 1000
      ? { text: "Excellent", color: "text-white bg-[#6BC095]" }
      : data.cumulativeDiffDelta.value >= 500
        ? { text: "Good", color: "text-white bg-[#E9A23B]" }
        : { text: "Low", color: "text-white bg-[#CA3A31]" };

  const cumulativeBg =
    data.cumulativeDiffDelta.value >= 1000
      ? "#D9F9E6"
      : data.cumulativeDiffDelta.value >= 500
        ? "#FCF3CC"
        : "#F9E3E2";

  const cumulativeIconColor =
    data.cumulativeDiffDelta.value >= 1000 ? "#55B685" : data.cumulativeDiffDelta.value >= 500 ? "#E9A23B" : "#CA3A31";

  // Card 4: Developer Type
  const devTypeBadge =
    data.developerType.type === "Star"
      ? { text: "Optimal", color: "text-white bg-[#6BC095]" }
      : data.developerType.type === "Key Player"
        ? { text: "P1", color: "text-white bg-[#E87B35]" }
        : data.developerType.type === "Stable"
          ? { text: "P3", color: "text-white bg-[#7BA8E6]" }
          : { text: "P0", color: "text-white bg-[#CA3A31]" };

  const devTypeBg =
    data.developerType.type === "Star"
      ? "#D9F9E6"
      : data.developerType.type === "Key Player"
        ? "#FCEED8"
        : data.developerType.type === "Stable"
          ? "#E5ECF6"
          : "#F9E3E2";

  const devTypeIconColor =
    data.developerType.type === "Star"
      ? "#55B685"
      : data.developerType.type === "Key Player"
        ? "#E87B35"
        : data.developerType.type === "Stable"
          ? "#7BA8E6"
          : "#CA3A31";

  // Card 5: Engineering Chaos
  const chaosBadge =
    data.engineeringChaos.status === "Skilled AI Builder"
      ? { text: "Optimal", color: "text-white bg-[#6BC095]" }
      : data.engineeringChaos.status === "Legacy Dev"
        ? { text: "P3", color: "text-white bg-[#7BA8E6]" }
        : { text: "P0", color: "text-white bg-[#CA3A31]" };

  const chaosBg =
    data.engineeringChaos.status === "Skilled AI Builder"
      ? "#D9F9E6"
      : data.engineeringChaos.status === "Legacy Dev"
        ? "#E5ECF6"
        : data.engineeringChaos.status === "Unskilled Vibe Coder"
          ? "#FCEED8"
          : "#F9E3E2";

  const chaosIconColor =
    data.engineeringChaos.status === "Skilled AI Builder"
      ? "#55B685"
      : data.engineeringChaos.status === "Legacy Dev"
        ? "#7BA8E6"
        : data.engineeringChaos.status === "Unskilled Vibe Coder"
          ? "#E87B35"
          : "#CA3A31";

  // Card 6: SPOF Risk
  const spofBadge =
    data.spofRisk.level === "Optimal" || data.spofRisk.level === "Low Risk"
      ? { text: "Optimal", color: "text-white bg-[#6BC095]" }
      : data.spofRisk.level === "Need Attention"
        ? { text: "P2", color: "text-white bg-[#E9A23B]" }
        : { text: "P0", color: "text-white bg-[#CA3A31]" };

  const spofBg =
    data.spofRisk.level === "Optimal" || data.spofRisk.level === "Low Risk"
      ? "#D9F9E6"
      : data.spofRisk.level === "Need Attention"
        ? "#FCF3CC"
        : "#F9E3E2";

  const spofIconColor =
    data.spofRisk.level === "Optimal" || data.spofRisk.level === "Low Risk"
      ? "#55B685"
      : data.spofRisk.level === "Need Attention"
        ? "#E9A23B"
        : "#CA3A31";

  return [
    {
      key: "star",
      title: "Weekly DiffDelta",
      count: data.weeklyDiffDelta.value,
      priority: weeklyBadge.text,
      badgeColor: weeklyBadge.color,
      descriptionLine1: data.weeklyDiffDelta.level,
      descriptionLine2: "Based on weekly performance",
      bg: weeklyBg,
      iconColor: weeklyIconColor,
    },
    {
      key: "risky",
      title: "Churn Rate",
      count: `${data.churnRate.percentage}%`,
      priority: churnBadge.text,
      badgeColor: churnBadge.color,
      descriptionLine1: data.churnRate.comparison,
      descriptionLine2: "Code stability metric",
      bg: churnBg,
      iconColor: churnIconColor,
    },
    {
      key: "key-player",
      title: "Cumulative DiffDelta",
      count: data.cumulativeDiffDelta.value,
      priority: cumulativeBadge.text,
      badgeColor: cumulativeBadge.color,
      descriptionLine1: `WoW ${data.cumulativeDiffDelta.weekOverWeek > 0 ? "+" : ""}${data.cumulativeDiffDelta.weekOverWeek}`,
      descriptionLine2: "Week over week change",
      bg: cumulativeBg,
      iconColor: cumulativeIconColor,
    },
    {
      key: "stable",
      title: "Developer Type",
      count: data.developerType.type,
      priority: devTypeBadge.text,
      badgeColor: devTypeBadge.color,
      descriptionLine1: `${data.developerType.spofLevel} SPOF • ${data.developerType.skillLevel}`,
      descriptionLine2: "Performance classification",
      bg: devTypeBg,
      iconColor: devTypeIconColor,
    },
    {
      key: "bottleneck",
      title: "Engineering Chaos",
      count: data.engineeringChaos.status,
      priority: chaosBadge.text,
      badgeColor: chaosBadge.color,
      descriptionLine1: `${data.engineeringChaos.churnLevel} Churn • ${data.engineeringChaos.diffDeltaLevel} DiffDelta`,
      descriptionLine2: "Based on metrics combination",
      bg: chaosBg,
      iconColor: chaosIconColor,
    },
    {
      key: "time-bomb",
      title: "SPOF Risk",
      count: data.spofRisk.level,
      priority: spofBadge.text,
      badgeColor: spofBadge.color,
      descriptionLine1: `${data.spofRisk.ownership} Ownership`,
      descriptionLine2: `Above ${data.spofRisk.percentile}% of people`,
      bg: spofBg,
      iconColor: spofIconColor,
    },
  ];
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

/**
 * Mock user names for module owners.
 * Used to generate diverse ownership data.
 */
const MOCK_USERS = [
  "Alice Johnson",
  "Bob Smith",
  "Charlie Brown",
  "Diana Prince",
  "Eve Adams",
  "Frank Castle",
  "Grace Hopper",
  "Henry Ford",
  "Iris West",
  "Jack Ryan",
];

/**
 * Generates mock module owner data.
 *
 * Creates a consistent owner object with ID, name, and ownership percentage.
 *
 * @param index - Index for selecting user name from MOCK_USERS
 * @param ownershipPercent - Ownership percentage (0-100)
 * @returns ModuleOwner object
 */
function generateMockOwner(index: number, ownershipPercent: number): ModuleOwner {
  const userName = MOCK_USERS[index % MOCK_USERS.length];
  return {
    id: `user-${index}`,
    name: userName,
    ownershipPercent,
  };
}

/**
 * Generates mock module SPOF data for treemap visualization and modules table.
 *
 * Creates realistic module data where the current user is always a contributor
 * (either primary or backup owner). Higher SPOF scores indicate higher risk
 * and more concentrated ownership.
 *
 * Features:
 * - 25 modules across 5 repositories
 * - Risk levels distributed across high/medium/low
 * - Current user assigned as primary owner (~50% of modules)
 * - Ownership percentages correlated with SPOF scores
 *
 * @param userId - Current user's ID
 * @param userName - Current user's name (default: "Alice")
 * @returns Array of 25 modules with SPOF data
 */
export function getUserModuleSPOFData(userId: string, userName: string = "Alice"): ModuleSPOFData[] {
  // Mock repositories
  const repos = ["web-app", "api", "mobile-app", "platform", "services"];

  // Mock data matching the screenshot
  const modules: Array<Omit<ModuleSPOFData, "id" | "scoreRange" | "primaryOwner" | "backupOwner" | "repoName">> = [
    // High risk modules (red) - SPOF score 71-100
    { name: "Deployment Module", spofScore: 85, size: 220 },
    { name: "Payment Module", spofScore: 88, size: 220 },
    { name: "Cache Module", spofScore: 82, size: 150 },
    { name: "Database Module", spofScore: 79, size: 150 },
    { name: "Logging Module", spofScore: 77, size: 150 },
    { name: "Reporting Module", spofScore: 81, size: 150 },
    { name: "Storage Module", spofScore: 86, size: 200 },
    { name: "Auth Module", spofScore: 84, size: 200 },
    { name: "Search Module", spofScore: 78, size: 180 },
    { name: "Frontend Module", spofScore: 80, size: 180 },
    { name: "User Module", spofScore: 83, size: 180 },
    { name: "Security Module", spofScore: 87, size: 180 },

    // Medium risk modules (yellow/orange) - SPOF score 31-70
    { name: "Migration Module", spofScore: 65, size: 180 },
    { name: "Documentation Module", spofScore: 58, size: 120 },
    { name: "Testing Module", spofScore: 62, size: 120 },
    { name: "Email Module", spofScore: 68, size: 120 },
    { name: "Monitoring Module", spofScore: 64, size: 160 },
    { name: "Dashboard Module", spofScore: 61, size: 160 },
    { name: "Backend Module", spofScore: 67, size: 160 },
    { name: "Notification Module", spofScore: 59, size: 140 },
    { name: "Analytics Module", spofScore: 63, size: 140 },

    // Low risk modules (green) - SPOF score 0-30
    { name: "Backup Module", spofScore: 28, size: 140 },
    { name: "API Module", spofScore: 25, size: 140 },
    { name: "Configuration Module", spofScore: 22, size: 140 },
  ];

  return modules.map((module, index) => {
    // Generate ownership percentages based on SPOF score
    // Higher SPOF = more concentrated ownership
    const primaryOwnership = Math.floor(50 + (module.spofScore / 100) * 40); // 50-90%
    const backupOwnership = Math.floor(20 + Math.random() * 20); // 20-40%

    // Determine if current user is primary or backup owner
    // For high SPOF scores, user is more likely to be primary owner
    const isUserPrimaryOwner = module.spofScore > 60 ? index % 2 === 0 : index % 3 === 0;

    // Create current user owner object
    const currentUserOwner: ModuleOwner = {
      id: userId,
      name: userName,
      ownershipPercent: isUserPrimaryOwner ? primaryOwnership : backupOwnership,
    };

    // Create other owner object
    const otherOwner: ModuleOwner = generateMockOwner(
      index,
      isUserPrimaryOwner ? backupOwnership : primaryOwnership
    );

    return {
      id: `module-${userId}-${index}`,
      repoName: repos[index % repos.length],
      ...module,
      scoreRange: getScoreRange(module.spofScore),
      primaryOwner: isUserPrimaryOwner ? currentUserOwner : otherOwner,
      backupOwner: isUserPrimaryOwner ? otherOwner : currentUserOwner,
    };
  });
}
