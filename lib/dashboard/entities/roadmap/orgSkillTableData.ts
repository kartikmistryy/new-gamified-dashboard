/** Org Skill Table data types, builders, and helpers */

import type {
  SkillsRoadmapProgressData,
  RoleRoadmapProgressData,
  CheckpointProgressData,
} from "./types";
import {
  calculateSkillsRoadmapProgress,
  calculateRoleRoadmapProgress,
} from "./utils/progressUtils";
import { SKILLS_ROADMAPS, ROLE_ROADMAPS } from "./mocks/roadmapMockData";

// =============================================================================
// Types
// =============================================================================

export type OrgSkillTableTab = "skill" | "role";
export type OrgSkillSortMode = "mostProficient" | "mostUnlocked";

// =============================================================================
// Sort & Filter Helpers
// =============================================================================

export function getTotalPeople(counts: { basic: number; proficient: number; advanced: number }) {
  return counts.basic + counts.proficient + counts.advanced;
}

function sortByMode<
  T extends {
    progressPercent: number;
    developerCounts: { basic: number; proficient: number; advanced: number };
  },
>(data: T[], sortMode: OrgSkillSortMode): T[] {
  return [...data].sort((a, b) => {
    if (sortMode === "mostProficient") return b.progressPercent - a.progressPercent;
    return getTotalPeople(b.developerCounts) - getTotalPeople(a.developerCounts);
  });
}

const PHASE_ORDER = { Basic: 0, Intermediate: 1, Advanced: 2 } as const;

export function sortCheckpointsByPhase(
  checkpoints: CheckpointProgressData[]
): CheckpointProgressData[] {
  return [...checkpoints].sort(
    (a, b) => PHASE_ORDER[a.checkpoint.phase] - PHASE_ORDER[b.checkpoint.phase]
  );
}

export function filterUnlockedCheckpoints(
  checkpoints: CheckpointProgressData[]
): CheckpointProgressData[] {
  return checkpoints.filter((cp) => getTotalPeople(cp.developerCounts) > 0);
}

// =============================================================================
// Data Builders
// =============================================================================

export function buildSkillBasedData(
  sortMode: OrgSkillSortMode
): SkillsRoadmapProgressData[] {
  const data = Object.values(SKILLS_ROADMAPS).map(calculateSkillsRoadmapProgress);
  return sortByMode(data, sortMode);
}

export function buildRoleBasedData(
  sortMode: OrgSkillSortMode
): RoleRoadmapProgressData[] {
  const data = ROLE_ROADMAPS.map(calculateRoleRoadmapProgress);
  return sortByMode(data, sortMode);
}
