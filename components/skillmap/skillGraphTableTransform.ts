/**
 * Transform SkillGraph JSON data into table-compatible types.
 *
 * Uses detail roadmap files for real checkpoint/sub-checkpoint names,
 * and engineer completions for precise per-checkpoint people stats.
 */

import type {
  SkillGraphRawData,
  RoadmapIndexEntry,
  DetailRoadmapEntry,
  DetailCheckpoint,
  EngineerData,
  EngineerIndexEntry,
  RoadmapDetailMap,
} from "./skillGraphDataLoader";
import type {
  CheckpointPhase,
  RoadmapDeveloper,
  Checkpoint,
  SubCheckpoint,
  SubCheckpointUnlockCount,
  CheckpointProgressData,
  SkillsRoadmapProgressData,
  RoleRoadmapProgressData,
  RoleRoadmap,
} from "@/lib/dashboard/entities/roadmap/types";
import { getProficiencyLevel } from "@/lib/dashboard/entities/roadmap/utils/progressUtils";

// =============================================================================
// Engineer helpers
// =============================================================================

function toRoadmapDeveloper(eng: EngineerIndexEntry): RoadmapDeveloper {
  return { id: eng.userId, name: eng.name };
}

/** Get the set of completed sub-checkpoint IDs for a roadmap key */
function getCompletionSet(eng: EngineerData, key: string): Set<string> {
  const record = eng.roadmaps[key];
  if (!record) return new Set();
  return new Set(Object.keys(record.completions));
}

// =============================================================================
// Developer grouping
// =============================================================================

type DevelopersByLevel = {
  basic: RoadmapDeveloper[];
  intermediate: RoadmapDeveloper[];
  advanced: RoadmapDeveloper[];
};

const emptyByLevel = (): DevelopersByLevel => ({
  basic: [],
  intermediate: [],
  advanced: [],
});

function groupEngineers(
  engineerIndex: EngineerIndexEntry[],
  engineers: EngineerData[],
  getPercent: (eng: EngineerData) => number,
): DevelopersByLevel {
  const result = emptyByLevel();
  engineers.forEach((eng, i) => {
    const pct = getPercent(eng);
    const level = getProficiencyLevel(pct);
    if (!level) return;
    result[level].push(toRoadmapDeveloper(engineerIndex[i]));
  });
  return result;
}

// =============================================================================
// Detail → Checkpoint conversion (real names + sub-checkpoints)
// =============================================================================

const LEVEL_TO_PHASE: Record<string, CheckpointPhase> = {
  basic: "Basic",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Convert a detail checkpoint to the table Checkpoint type */
function toCheckpoint(dc: DetailCheckpoint, phase: CheckpointPhase): Checkpoint {
  const subCheckpoints: SubCheckpoint[] = dc.subCheckpoints.map((sc, i) => ({
    id: sc.id,
    name: sc.title,
    index: i,
  }));
  return { id: dc.id, name: dc.title, phase, subCheckpoints };
}

/** Build all Checkpoint[] from a detail roadmap entry */
function detailToCheckpoints(detail: DetailRoadmapEntry): Checkpoint[] {
  const checkpoints: Checkpoint[] = [];
  for (const level of detail.levels) {
    const phase = LEVEL_TO_PHASE[level.level] ?? "Basic";
    for (const dc of level.checkpoints) {
      checkpoints.push(toCheckpoint(dc, phase));
    }
  }
  return checkpoints;
}

/** Collect all sub-checkpoint IDs from a Checkpoint */
function subCheckpointIds(cp: Checkpoint): string[] {
  return cp.subCheckpoints.map((sc) => sc.id);
}

// =============================================================================
// Per-checkpoint progress
// =============================================================================

function buildCheckpointProgress(
  cp: Checkpoint,
  roadmapKey: string,
  engineerIndex: EngineerIndexEntry[],
  engineers: EngineerData[],
): CheckpointProgressData {
  const scIds = subCheckpointIds(cp);
  const total = scIds.length;
  if (total === 0) {
    return {
      checkpoint: cp,
      progressPercent: 0,
      proficiencyLevel: null,
      developerCounts: { basic: 0, intermediate: 0, advanced: 0 },
      developersByLevel: emptyByLevel(),
    };
  }

  const getCpPercent = (eng: EngineerData): number => {
    const completions = getCompletionSet(eng, roadmapKey);
    const done = scIds.filter((id) => completions.has(id)).length;
    return (done / total) * 100;
  };

  const developersByLevel = groupEngineers(engineerIndex, engineers, getCpPercent);

  let sum = 0;
  let count = 0;
  for (const eng of engineers) {
    if (!eng.roadmaps[roadmapKey]) continue;
    sum += getCpPercent(eng);
    count++;
  }
  const avgPercent = count > 0 ? sum / count : 0;

  // Per-sub-checkpoint unlock counts
  const subCheckpointUnlockCounts: SubCheckpointUnlockCount[] = cp.subCheckpoints.map((sub) => {
    let unlocked = 0;
    for (const eng of engineers) {
      const completions = getCompletionSet(eng, roadmapKey);
      if (completions.has(sub.id)) unlocked++;
    }
    return { subCheckpoint: sub, unlockedByCount: unlocked };
  });

  return {
    checkpoint: cp,
    progressPercent: Math.round(avgPercent),
    proficiencyLevel: getProficiencyLevel(avgPercent),
    developerCounts: {
      basic: developersByLevel.basic.length,
      intermediate: developersByLevel.intermediate.length,
      advanced: developersByLevel.advanced.length,
    },
    developersByLevel,
    subCheckpointUnlockCounts,
  };
}

// =============================================================================
// Per-roadmap progress
// =============================================================================

function buildOneRoadmapProgress(
  roadmap: RoadmapIndexEntry,
  detailMap: RoadmapDetailMap,
  engineerIndex: EngineerIndexEntry[],
  engineers: EngineerData[],
): SkillsRoadmapProgressData {
  const detail = detailMap.get(roadmap.name);
  const checkpoints = detail ? detailToCheckpoints(detail) : [];
  const totalSub = roadmap.totalSubCheckpoints;

  // Overall roadmap percent
  const getRoadmapPercent = (eng: EngineerData): number => {
    if (totalSub === 0) return 0;
    const completions = getCompletionSet(eng, roadmap.key);
    return (completions.size / totalSub) * 100;
  };

  const developersByLevel = groupEngineers(engineerIndex, engineers, getRoadmapPercent);

  let sum = 0;
  let count = 0;
  for (const eng of engineers) {
    if (!eng.roadmaps[roadmap.key]) continue;
    sum += getRoadmapPercent(eng);
    count++;
  }
  const avgPercent = count > 0 ? sum / count : 0;

  const checkpointProgress = checkpoints.map((cp) =>
    buildCheckpointProgress(cp, roadmap.key, engineerIndex, engineers),
  );

  return {
    roadmap: { id: roadmap.key, name: roadmap.name, checkpoints },
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
  const { roadmaps, engineerIndex, engineers, detailMap } = raw;

  // Skill-based
  const skillRoadmaps = roadmaps.filter((r) => r.type === "skill");
  const skillBased = skillRoadmaps.map((r) =>
    buildOneRoadmapProgress(r, detailMap, engineerIndex, engineers),
  );

  // Role-based
  const roleRoadmaps = roadmaps.filter((r) => r.type === "role");
  const roleBased = roleRoadmaps.map((r) => {
    const inner = buildOneRoadmapProgress(r, detailMap, engineerIndex, engineers);

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
