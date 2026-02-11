import type { UserPerformanceData, UserMetricCardConfig } from "../types";

export function getUserMetricCards(data: UserPerformanceData): UserMetricCardConfig[] {
  const weeklyBadge = data.weeklyDiffDelta.value < 30 ? { text: "Low", color: "text-white bg-[#CA3A31]" }
    : data.weeklyDiffDelta.value < 60 ? { text: "Moderate", color: "text-white bg-[#E9A23B]" }
    : { text: "High", color: "text-white bg-[#6BC095]" };
  const weeklyBg = data.weeklyDiffDelta.value < 30 ? "#F9E3E2"
    : data.weeklyDiffDelta.value < 60 ? "#FCF3CC" : "#D9F9E6";
  const weeklyIconColor = data.weeklyDiffDelta.value < 30 ? "#CA3A31"
    : data.weeklyDiffDelta.value < 60 ? "#E9A23B" : "#55B685";

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
