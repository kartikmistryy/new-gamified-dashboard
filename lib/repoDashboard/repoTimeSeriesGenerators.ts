/** Repo Time Series Data Generators */

import type { ContributorPerformanceRow } from "./types";
import type { ContributorCodeMetrics } from "@/components/dashboard/repoDashboard/ContributorPerformanceBarChart";
import {
  noise,
  hashString,
  getSprintMultiplier,
  getSeasonalMultiplier,
  isMilestoneWeek,
  isRefactoringWeek,
  generateWeekLabels,
} from "./repoDataGeneratorUtils";

/** Generates mock code metrics (additions and deletions) for contributors */
export function generateContributorCodeMetrics(
  contributors: ContributorPerformanceRow[]
): ContributorCodeMetrics[] {
  return contributors.map((contributor) => {
    const seed = hashString(contributor.contributorName + contributor.repoId);
    const performanceRatio = contributor.performanceValue / 100;

    const baseAdditions = 500 + performanceRatio * 4500;
    const additionsVariation = (noise(seed) - 0.5) * 1000;
    const additions = Math.round(Math.max(200, baseAdditions + additionsVariation));

    const baseDeletions = 200 + (1 - performanceRatio) * 1800;
    const deletionsVariation = (noise(seed + 1000) - 0.5) * 500;
    const deletions = Math.round(Math.max(100, baseDeletions + deletionsVariation));

    return {
      contributorName: contributor.contributorName,
      additions,
      deletions,
    };
  });
}

/** Calculates median code metrics for a team/org */
export function calculateMedianCodeMetrics(
  metrics: ContributorCodeMetrics[]
): { additions: number; deletions: number } {
  if (metrics.length === 0) {
    return { additions: 0, deletions: 0 };
  }

  const sortedAdditions = [...metrics].map((m) => m.additions).sort((a, b) => a - b);
  const sortedDeletions = [...metrics].map((m) => m.deletions).sort((a, b) => a - b);

  const medianIndex = Math.floor(metrics.length / 2);

  return {
    additions:
      metrics.length % 2 === 0
        ? Math.round((sortedAdditions[medianIndex - 1] + sortedAdditions[medianIndex]) / 2)
        : sortedAdditions[medianIndex],
    deletions:
      metrics.length % 2 === 0
        ? Math.round((sortedDeletions[medianIndex - 1] + sortedDeletions[medianIndex]) / 2)
        : sortedDeletions[medianIndex],
  };
}

export type ContributorTimeSeriesMetrics = {
  contributorName: string; contributorAvatar: string; rank: number;
  totalCommits: number; totalAdditions: number; totalDeletions: number;
  commitData: Array<{ week: string; value: number }>;
  additionsData: Array<{ week: string; value: number }>;
  deletionsData: Array<{ week: string; value: number }>;
};

/** Generates weekly time-series data for commits, additions, and deletions */
export function generateContributorTimeSeriesMetrics(
  contributors: ContributorPerformanceRow[],
  weekCount: number = 52
): ContributorTimeSeriesMetrics[] {
  const weeks = generateWeekLabels(weekCount);
  const today = new Date();

  return contributors.map((contributor, contributorIndex) => {
    const seed = hashString(contributor.contributorName + contributor.repoId);
    const performanceRatio = contributor.performanceValue / 100;
    const baseCommitsPerWeek = 5 + performanceRatio * 15;
    const baseLinesPerCommit = 100 + performanceRatio * 300;

    let totalCommits = 0, totalAdditions = 0, totalDeletions = 0;
    const commitData: Array<{ week: string; value: number }> = [];
    const additionsData: Array<{ week: string; value: number }> = [];
    const deletionsData: Array<{ week: string; value: number }> = [];

    for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - (weekCount - 1 - weekIndex) * 7);
      const month = weekDate.getMonth();
      const weekSeed = seed + weekIndex * 1000;

      const activityMultiplier =
        getSprintMultiplier(weekIndex) *
        getSeasonalMultiplier(month) *
        (isMilestoneWeek(weekIndex) ? 2.1 : 1.0) *
        (0.7 + noise(weekSeed) * 0.6) *
        (0.85 + noise(seed + contributorIndex * 500 + weekIndex) * 0.3);

      const commits = Math.round(Math.max(0, baseCommitsPerWeek * activityMultiplier));
      const additions = Math.round(commits * baseLinesPerCommit * (0.7 + noise(weekSeed + 100) * 0.6));

      let deletionRate = (0.3 + noise(weekSeed + 200) * 0.4) * (1 - performanceRatio * 0.3);
      if (isRefactoringWeek(weekIndex)) deletionRate *= 2.8;
      if (weekIndex % 4 === 3) deletionRate *= 0.4;
      if (isMilestoneWeek(weekIndex)) deletionRate *= 0.7;

      const deletions = Math.round(commits * baseLinesPerCommit * deletionRate);

      totalCommits += commits;
      totalAdditions += additions;
      totalDeletions += deletions;

      commitData.push({ week: weeks[weekIndex], value: commits });
      additionsData.push({ week: weeks[weekIndex], value: additions });
      deletionsData.push({ week: weeks[weekIndex], value: deletions });
    }

    return {
      contributorName: contributor.contributorName,
      contributorAvatar: contributor.contributorAvatar,
      rank: contributor.rank,
      totalCommits,
      totalAdditions,
      totalDeletions,
      commitData,
      additionsData,
      deletionsData,
    };
  });
}

/** Aggregates contributor time-series into repo-level aggregate */
export function aggregateContributorMetrics(contributors: ContributorTimeSeriesMetrics[]): {
  commitData: Array<{ week: string; value: number }>;
  additionsData: Array<{ week: string; value: number }>;
  deletionsData: Array<{ week: string; value: number }>;
} {
  if (contributors.length === 0) {
    return { commitData: [], additionsData: [], deletionsData: [] };
  }

  const weekCount = contributors[0].commitData.length;
  const commitData: Array<{ week: string; value: number }> = [];
  const additionsData: Array<{ week: string; value: number }> = [];
  const deletionsData: Array<{ week: string; value: number }> = [];

  for (let i = 0; i < weekCount; i++) {
    const week = contributors[0].commitData[i].week;
    let commits = 0, additions = 0, deletions = 0;

    contributors.forEach((contributor) => {
      commits += contributor.commitData[i].value;
      additions += contributor.additionsData[i].value;
      deletions += contributor.deletionsData[i].value;
    });

    commitData.push({ week, value: commits });
    additionsData.push({ week, value: additions });
    deletionsData.push({ week, value: deletions });
  }

  return { commitData, additionsData, deletionsData };
}

/** Converts time-series data to cumulative format for comparison charts */
export function generateCumulativeData(
  additionsData: Array<{ week: string; value: number }>,
  deletionsData: Array<{ week: string; value: number }>
): Array<{ week: string; cumulative: number; additions: number; deletions: number }> {
  const result: Array<{ week: string; cumulative: number; additions: number; deletions: number }> = [];
  let cumulative = 0;

  for (let i = 0; i < additionsData.length; i++) {
    const additions = additionsData[i]?.value ?? 0;
    const deletions = deletionsData[i]?.value ?? 0;
    cumulative += additions - deletions;

    result.push({
      week: additionsData[i]?.week ?? "",
      cumulative,
      additions,
      deletions,
    });
  }

  return result;
}
