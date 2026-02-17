import type {
  ProficiencyLevel,
  RoadmapDeveloper,
  Checkpoint,
  SkillsRoadmap,
  RoleRoadmap,
  DeveloperProgress,
  CheckpointProgressData,
  SkillsRoadmapProgressData,
  RoleRoadmapProgressData,
} from "../types";
import {
  MOCK_DEVELOPERS,
  MOCK_DEVELOPER_PROGRESS,
  SKILLS_ROADMAPS,
} from "../mocks/roadmapMockData";

// =============================================================================
// Proficiency Level Calculation
// =============================================================================

/** Convert progress percentage to proficiency level */
export const getProficiencyLevel = (percent: number): ProficiencyLevel | null => {
  if (percent <= 0) return null;
  if (percent <= 33) return "basic";
  if (percent <= 66) return "intermediate";
  return "advanced";
};

/** Get color for proficiency level */
export const getProficiencyColor = (level: ProficiencyLevel | null): string => {
  switch (level) {
    case "basic":
      return "#F59E0B"; // amber
    case "intermediate":
      return "#3B82F6"; // blue
    case "advanced":
      return "#8B5CF6"; // purple
    default:
      return "#D1D5DB"; // gray
  }
};

// =============================================================================
// Developer Progress Helpers
// =============================================================================

/** Get a developer's unlock count for a specific checkpoint */
const getDevCheckpointUnlockCount = (
  devProgress: DeveloperProgress,
  checkpointId: string
): number => devProgress.checkpointProgress[checkpointId] ?? 0;

/** Calculate a developer's progress percent for a checkpoint */
const getDevCheckpointPercent = (
  devProgress: DeveloperProgress,
  checkpoint: Checkpoint
): number => {
  const unlocked = getDevCheckpointUnlockCount(devProgress, checkpoint.id);
  const total = checkpoint.subCheckpoints.length;
  return total > 0 ? (unlocked / total) * 100 : 0;
};

/** Calculate a developer's progress percent for a skills roadmap */
const getDevSkillsRoadmapPercent = (
  devProgress: DeveloperProgress,
  roadmap: SkillsRoadmap
): number => {
  if (roadmap.checkpoints.length === 0) return 0;
  const sum = roadmap.checkpoints.reduce(
    (acc, checkpoint) => acc + getDevCheckpointPercent(devProgress, checkpoint),
    0
  );
  return sum / roadmap.checkpoints.length;
};

/** Calculate a developer's progress percent for a role roadmap */
const getDevRoleRoadmapPercent = (
  devProgress: DeveloperProgress,
  roleRoadmap: RoleRoadmap
): number => {
  const skillsRoadmaps = roleRoadmap.skillsRoadmapIds
    .map((id) => SKILLS_ROADMAPS[id])
    .filter(Boolean);
  if (skillsRoadmaps.length === 0) return 0;
  const sum = skillsRoadmaps.reduce(
    (acc, roadmap) => acc + getDevSkillsRoadmapPercent(devProgress, roadmap),
    0
  );
  return sum / skillsRoadmaps.length;
};

// =============================================================================
// Grouping Developers by Proficiency
// =============================================================================

type DevelopersByLevel = {
  basic: RoadmapDeveloper[];
  intermediate: RoadmapDeveloper[];
  advanced: RoadmapDeveloper[];
};

const emptyDevelopersByLevel = (): DevelopersByLevel => ({
  basic: [],
  intermediate: [],
  advanced: [],
});

/** Group developers by their proficiency level for a given progress getter */
const groupDevelopersByLevel = (
  getPercent: (devProgress: DeveloperProgress) => number
): DevelopersByLevel => {
  const result = emptyDevelopersByLevel();

  MOCK_DEVELOPER_PROGRESS.forEach((devProgress) => {
    const percent = getPercent(devProgress);
    const level = getProficiencyLevel(percent);
    const developer = MOCK_DEVELOPERS.find((d) => d.id === devProgress.developerId);
    if (!developer || !level) return;

    result[level].push(developer);
  });

  return result;
};

// =============================================================================
// Checkpoint Progress Calculation
// =============================================================================

/** Calculate progress data for a single checkpoint */
export const calculateCheckpointProgress = (
  checkpoint: Checkpoint
): CheckpointProgressData => {
  const developersByLevel = groupDevelopersByLevel((devProgress) =>
    getDevCheckpointPercent(devProgress, checkpoint)
  );

  // Calculate average progress across all developers
  let totalPercent = 0;
  MOCK_DEVELOPER_PROGRESS.forEach((devProgress) => {
    totalPercent += getDevCheckpointPercent(devProgress, checkpoint);
  });
  const avgPercent =
    MOCK_DEVELOPER_PROGRESS.length > 0
      ? totalPercent / MOCK_DEVELOPER_PROGRESS.length
      : 0;

  return {
    checkpoint,
    progressPercent: Math.round(avgPercent),
    proficiencyLevel: getProficiencyLevel(avgPercent),
    developerCounts: {
      basic: developersByLevel.basic.length,
      intermediate: developersByLevel.intermediate.length,
      advanced: developersByLevel.advanced.length,
    },
    developersByLevel,
  };
};

// =============================================================================
// Skills Roadmap Progress Calculation
// =============================================================================

/** Calculate progress data for a skills roadmap */
export const calculateSkillsRoadmapProgress = (
  roadmap: SkillsRoadmap
): SkillsRoadmapProgressData => {
  const checkpoints = roadmap.checkpoints.map(calculateCheckpointProgress);

  const developersByLevel = groupDevelopersByLevel((devProgress) =>
    getDevSkillsRoadmapPercent(devProgress, roadmap)
  );

  // Calculate average progress across all developers
  let totalPercent = 0;
  MOCK_DEVELOPER_PROGRESS.forEach((devProgress) => {
    totalPercent += getDevSkillsRoadmapPercent(devProgress, roadmap);
  });
  const avgPercent =
    MOCK_DEVELOPER_PROGRESS.length > 0
      ? totalPercent / MOCK_DEVELOPER_PROGRESS.length
      : 0;

  return {
    roadmap,
    progressPercent: Math.round(avgPercent),
    proficiencyLevel: getProficiencyLevel(avgPercent),
    developerCounts: {
      basic: developersByLevel.basic.length,
      intermediate: developersByLevel.intermediate.length,
      advanced: developersByLevel.advanced.length,
    },
    developersByLevel,
    checkpoints,
  };
};

// =============================================================================
// Role Roadmap Progress Calculation
// =============================================================================

/** Calculate progress data for a role roadmap */
export const calculateRoleRoadmapProgress = (
  roleRoadmap: RoleRoadmap
): RoleRoadmapProgressData => {
  const skillsRoadmaps = roleRoadmap.skillsRoadmapIds
    .map((id) => SKILLS_ROADMAPS[id])
    .filter(Boolean)
    .map(calculateSkillsRoadmapProgress);

  const developersByLevel = groupDevelopersByLevel((devProgress) =>
    getDevRoleRoadmapPercent(devProgress, roleRoadmap)
  );

  // Calculate average progress across all developers
  let totalPercent = 0;
  MOCK_DEVELOPER_PROGRESS.forEach((devProgress) => {
    totalPercent += getDevRoleRoadmapPercent(devProgress, roleRoadmap);
  });
  const avgPercent =
    MOCK_DEVELOPER_PROGRESS.length > 0
      ? totalPercent / MOCK_DEVELOPER_PROGRESS.length
      : 0;

  return {
    roleRoadmap,
    progressPercent: Math.round(avgPercent),
    proficiencyLevel: getProficiencyLevel(avgPercent),
    developerCounts: {
      basic: developersByLevel.basic.length,
      intermediate: developersByLevel.intermediate.length,
      advanced: developersByLevel.advanced.length,
    },
    developersByLevel,
    checkpoints: skillsRoadmaps.flatMap((sr) => sr.checkpoints),
    skillsRoadmaps,
  };
};

// =============================================================================
// Sub-checkpoint Unlock Status (for individual developer view)
// =============================================================================

/** Check if a specific sub-checkpoint is unlocked for a developer */
export const isSubCheckpointUnlocked = (
  developerId: string,
  checkpointId: string,
  subCheckpointIndex: number
): boolean => {
  const devProgress = MOCK_DEVELOPER_PROGRESS.find(
    (p) => p.developerId === developerId
  );
  if (!devProgress) return false;
  const unlockedCount = devProgress.checkpointProgress[checkpointId] ?? 0;
  return subCheckpointIndex < unlockedCount;
};

/** Get unlock status for all sub-checkpoints in a checkpoint (org-wide aggregation) */
export const getSubCheckpointUnlockCounts = (
  checkpoint: Checkpoint
): { subCheckpoint: typeof checkpoint.subCheckpoints[0]; unlockedByCount: number }[] => {
  return checkpoint.subCheckpoints.map((sub) => {
    let count = 0;
    MOCK_DEVELOPER_PROGRESS.forEach((devProgress) => {
      const unlockedCount = devProgress.checkpointProgress[checkpoint.id] ?? 0;
      if (sub.index < unlockedCount) count++;
    });
    return { subCheckpoint: sub, unlockedByCount: count };
  });
};
