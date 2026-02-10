/** Team Performance Additional Utilities */

import type { MemberPerformanceWithDelta } from "./performanceTableConfig";

export interface EnrichedMember {
  memberName: string;
  performanceValue: number;
  change?: number;
  churnRate?: number;
}

export interface AggregateTeamDataPoint {
  week: string;
  cumulative: number;
  additions: number;
  deletions: number;
}

/** Calculate cumulative diff delta by member */
export function calculateCumulativeDiffDeltaByMember(
  timeFilteredData: any[],
  members: EnrichedMember[]
): Map<string, number> {
  const totals = new Map<string, number>();
  if (timeFilteredData.length < 2) return totals;

  for (let i = 1; i < timeFilteredData.length; i++) {
    const prev = timeFilteredData[i - 1];
    const curr = timeFilteredData[i];
    for (const member of members) {
      const prevValue = prev.memberValues[member.memberName] ?? 0;
      const currValue = curr.memberValues[member.memberName] ?? 0;
      const delta = currValue - prevValue;
      totals.set(member.memberName, (totals.get(member.memberName) ?? 0) + delta);
    }
  }

  return totals;
}

/** Build table rows with scaled cumulative diff delta */
export function buildTableRowsWithScaling(
  members: EnrichedMember[],
  cumulativeDiffDeltaByMember: Map<string, number>
): MemberPerformanceWithDelta[] {
  const rawValues = members.map((member) => Math.abs(cumulativeDiffDeltaByMember.get(member.memberName) ?? 0));
  const min = Math.min(...rawValues, 0);
  const max = Math.max(...rawValues, 0);
  const minOutput = 20;
  const maxOutput = 50;
  const scaleValue = (value: number) => {
    if (max === min) return Math.round((minOutput + maxOutput) / 2);
    const ratio = (value - min) / (max - min);
    return Math.round(minOutput + ratio * (maxOutput - minOutput));
  };

  return members.map((member) => ({
    ...member,
    cumulativeDiffDelta: scaleValue(Math.abs(cumulativeDiffDeltaByMember.get(member.memberName) ?? 0)),
  }));
}

/** Calculate team average performance value */
export function calculateTeamPerformanceValue(members: EnrichedMember[]): number {
  if (members.length === 0) return 0;
  const total = members.reduce((sum, member) => sum + member.performanceValue, 0);
  return Math.round(total / members.length);
}

/** Generate aggregate team cumulative data with realistic variations */
export function generateAggregateTeamData(
  timeFilteredData: any[],
  members: EnrichedMember[],
  teamId: string
): AggregateTeamDataPoint[] {
  if (timeFilteredData.length === 0) return [];

  const aggregated = timeFilteredData.map((point, weekIndex) => {
    const memberNames = Object.keys(point.memberValues);
    const date = new Date(point.date);
    const month = date.getMonth();

    const sprintPhase = weekIndex % 4;
    const sprintMultiplier =
      sprintPhase === 0 ? 1.4 : sprintPhase === 1 ? 1.8 : sprintPhase === 2 ? 1.1 : 0.7;

    const isHolidaySeason = month === 11 || month === 0;
    const isSummerSlump = month === 6 || month === 7;
    const seasonalMultiplier = isHolidaySeason ? 0.5 : isSummerSlump ? 0.7 : 1.0;

    const isMilestoneWeek = weekIndex % 7 === 3 || weekIndex % 11 === 5;
    const milestoneMultiplier = isMilestoneWeek ? 2.2 : 1.0;

    const isRefactoringWeek = weekIndex % 8 === 6;
    const refactoringMultiplier = isRefactoringWeek ? 1.5 : 1.0;

    const weekSeed = weekIndex * 0.7 + (teamId ? teamId.charCodeAt(0) : 42);
    const randomVariation = 0.75 + Math.sin(weekSeed) * 0.25;

    let totalAdd = 0;
    let totalDelete = 0;

    memberNames.forEach((memberName, memberIndex) => {
      const performanceValue = point.memberValues[memberName] ?? 50;
      const baseContribution = performanceValue * 2 + 50;

      const memberSeed = memberName.charCodeAt(0) + weekIndex * 0.3;
      const memberVariation = 0.8 + Math.cos(memberSeed) * 0.4;

      const weeklyAdd =
        baseContribution *
        sprintMultiplier *
        seasonalMultiplier *
        milestoneMultiplier *
        randomVariation *
        memberVariation;

      totalAdd += weeklyAdd;

      let deleteRate = (1 - performanceValue / 100) * 0.3;
      if (isRefactoringWeek) deleteRate *= 2.5;
      if (sprintPhase === 3) deleteRate *= 0.5;

      const deleteVariation = 0.7 + Math.sin(memberSeed + weekIndex) * 0.6;
      const weeklyDelete = baseContribution * deleteRate * deleteVariation * refactoringMultiplier;

      totalDelete += weeklyDelete;
    });

    return {
      date: point.date,
      add: Math.max(50, Math.round(totalAdd)),
      delete: Math.max(10, Math.round(totalDelete)),
    };
  });

  let cumulative = 0;
  return aggregated.map((point) => {
    cumulative += point.add - point.delete;
    return {
      week: point.date,
      cumulative: Math.round(cumulative),
      additions: point.add,
      deletions: point.delete,
    };
  });
}

/** Calculate team benchmarks for comparison */
export function calculateTeamBenchmarks(
  members: EnrichedMember[],
  aggregateTeamData: AggregateTeamDataPoint[]
): { orgBenchmark: number | undefined; industryBenchmark: number | undefined } {
  if (members.length === 0 || aggregateTeamData.length === 0) {
    return { orgBenchmark: undefined, industryBenchmark: undefined };
  }

  const teamFinalValue = aggregateTeamData[aggregateTeamData.length - 1]?.cumulative ?? 0;
  const orgBenchmark = Math.round(teamFinalValue * 0.65);
  const industryBenchmark = Math.round(teamFinalValue * 1.3);

  return { orgBenchmark, industryBenchmark };
}
