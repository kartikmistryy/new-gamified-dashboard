/**
 * Transform SkillGraph JSON data into table-compatible types.
 *
 * Bridges the gap between graph JSON (roadmaps/index.json + engineers/*.json)
 * and the existing table types (SkillsRoadmapProgressData / RoleRoadmapProgressData).
 */

import type {
  SkillGraphRawData,
  RoadmapIndexEntry,
  RoadmapLevelEntry,
  EngineerData,
  EngineerIndexEntry,
} from "./skillGraphDataLoader";
import type {
  CheckpointPhase,
  RoadmapDeveloper,
  Checkpoint,
  CheckpointProgressData,
  SkillsRoadmapProgressData,
  RoleRoadmapProgressData,
  RoleRoadmap,
} from "@/lib/dashboard/entities/roadmap/types";
import { getProficiencyLevel } from "@/lib/dashboard/entities/roadmap/utils/progressUtils";

// =============================================================================
// Engineer helpers
// =============================================================================

/** Build a RoadmapDeveloper from the engineer index */
function toRoadmapDeveloper(eng: EngineerIndexEntry): RoadmapDeveloper {
  return { id: eng.userId, name: eng.name };
}

/** Get the completion count for a roadmap key from an engineer's data */
function getEngineerCompletions(eng: EngineerData, key: string): number {
  const record = eng.roadmaps[key];
  if (!record) return 0;
  return Object.keys(record.completions).length;
}

// =============================================================================
// Developer grouping by proficiency
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

function groupEngineers(
  engineerIndex: EngineerIndexEntry[],
  engineers: EngineerData[],
  getPercent: (eng: EngineerData) => number,
): DevelopersByLevel {
  const result = emptyDevelopersByLevel();

  engineers.forEach((eng, i) => {
    const pct = getPercent(eng);
    const level = getProficiencyLevel(pct);
    if (!level) return;
    const dev = toRoadmapDeveloper(engineerIndex[i]);
    result[level].push(dev);
  });

  return result;
}

// =============================================================================
// Level → Checkpoint conversion
// =============================================================================

const LEVEL_TO_PHASE: Record<string, CheckpointPhase> = {
  basic: "Basic",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Create synthetic checkpoints from roadmap levels (no sub-checkpoints) */
function levelsToCheckpoints(
  roadmapKey: string,
  levels: RoadmapLevelEntry[],
): Checkpoint[] {
  return levels.map((lvl) => ({
    id: `${roadmapKey}::${lvl.level}`,
    name: lvl.label,
    phase: LEVEL_TO_PHASE[lvl.level] ?? "Basic",
    subCheckpoints: [],
  }));
}

/**
 * Approximate completions per level.
 * Assumes completions fill basic→intermediate→advanced sequentially.
 */
function splitCompletionsByLevel(
  totalCompletions: number,
  levels: RoadmapLevelEntry[],
): number[] {
  let remaining = totalCompletions;
  return levels.map((lvl) => {
    const assigned = Math.min(remaining, lvl.subCheckpointCount);
    remaining = Math.max(0, remaining - lvl.subCheckpointCount);
    return assigned;
  });
}

// =============================================================================
// Checkpoint progress (per-level)
// =============================================================================

function buildCheckpointProgressForLevel(
  roadmap: RoadmapIndexEntry,
  levelIndex: number,
  checkpoint: Checkpoint,
  engineerIndex: EngineerIndexEntry[],
  engineers: EngineerData[],
): CheckpointProgressData {
  const level = roadmap.levels[levelIndex];
  const subCount = level.subCheckpointCount;
  if (subCount === 0) {
    return {
      checkpoint,
      progressPercent: 0,
      proficiencyLevel: null,
      developerCounts: { basic: 0, intermediate: 0, advanced: 0 },
      developersByLevel: emptyDevelopersByLevel(),
    };
  }

  const getLevelPercent = (eng: EngineerData): number => {
    const total = getEngineerCompletions(eng, roadmap.key);
    const perLevel = splitCompletionsByLevel(total, roadmap.levels);
    return (perLevel[levelIndex] / subCount) * 100;
  };

  const developersByLevel = groupEngineers(engineerIndex, engineers, getLevelPercent);

  let sum = 0;
  let count = 0;
  engineers.forEach((eng) => {
    if (!eng.roadmaps[roadmap.key]) return;
    sum += getLevelPercent(eng);
    count++;
  });
  const avgPercent = count > 0 ? sum / count : 0;

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
}

// =============================================================================
// SkillsRoadmapProgressData builder
// =============================================================================

function buildOneSkillRoadmapProgress(
  roadmap: RoadmapIndexEntry,
  engineerIndex: EngineerIndexEntry[],
  engineers: EngineerData[],
): SkillsRoadmapProgressData {
  const totalSub = roadmap.totalSubCheckpoints;
  const checkpoints = levelsToCheckpoints(roadmap.key, roadmap.levels);

  // Overall roadmap percent per engineer
  const getRoadmapPercent = (eng: EngineerData): number => {
    if (totalSub === 0) return 0;
    return (getEngineerCompletions(eng, roadmap.key) / totalSub) * 100;
  };

  const developersByLevel = groupEngineers(engineerIndex, engineers, getRoadmapPercent);

  let sum = 0;
  let count = 0;
  engineers.forEach((eng) => {
    if (!eng.roadmaps[roadmap.key]) return;
    sum += getRoadmapPercent(eng);
    count++;
  });
  const avgPercent = count > 0 ? sum / count : 0;

  const checkpointProgress = checkpoints.map((cp, i) =>
    buildCheckpointProgressForLevel(roadmap, i, cp, engineerIndex, engineers),
  );

  return {
    roadmap: {
      id: roadmap.key,
      name: roadmap.name,
      checkpoints,
    },
    progressPercent: Math.round(avgPercent),
    proficiencyLevel: getProficiencyLevel(avgPercent),
    developerCounts: {
      basic: developersByLevel.basic.length,
      intermediate: developersByLevel.intermediate.length,
      advanced: developersByLevel.advanced.length,
    },
    developersByLevel,
    checkpoints: checkpointProgress,
  };
}

// =============================================================================
// Public API
// =============================================================================

export interface SkillGraphTableData {
  skillBased: SkillsRoadmapProgressData[];
  roleBased: RoleRoadmapProgressData[];
}

/** Transform raw graph JSON into table-compatible data */
export function transformToTableData(raw: SkillGraphRawData): SkillGraphTableData {
  const { roadmaps, engineerIndex, engineers } = raw;

  // Skill-based: all roadmaps with type "skill"
  const skillRoadmaps = roadmaps.filter((r) => r.type === "skill");
  const skillBased = skillRoadmaps.map((r) =>
    buildOneSkillRoadmapProgress(r, engineerIndex, engineers),
  );

  // Role-based: all roadmaps with type "role", wrapped in RoleRoadmapProgressData
  const roleRoadmaps = roadmaps.filter((r) => r.type === "role");
  const roleBased = roleRoadmaps.map((r) => {
    const inner = buildOneSkillRoadmapProgress(r, engineerIndex, engineers);

    const roleRoadmap: RoleRoadmap = {
      id: r.key,
      name: r.name,
      skillsRoadmapIds: [r.key],
    };

    const result: RoleRoadmapProgressData = {
      roleRoadmap,
      progressPercent: inner.progressPercent,
      proficiencyLevel: inner.proficiencyLevel,
      developerCounts: inner.developerCounts,
      developersByLevel: inner.developersByLevel,
      skillsRoadmaps: [inner],
    };
    return result;
  });

  return { skillBased, roleBased };
}
