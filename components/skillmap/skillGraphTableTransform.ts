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
  CategoryProgressData,
  SkillCategoryName,
  ProficiencyLevel,
} from "@/lib/dashboard/entities/roadmap/types";
import { getProficiencyLevel } from "@/lib/dashboard/entities/roadmap/utils/progressUtils";

// =============================================================================
// Category ordering (R3)
// =============================================================================

const CATEGORY_ORDER: SkillCategoryName[] = [
  "Programming Languages",
  "Frontend Technologies",
  "Backend Frameworks & Platforms",
  "Mobile & Cross-Platform",
  "Databases & Data Storage",
  "DevOps & Cloud Infrastructure",
  "CS Fundamentals & System Design",
  "Emerging Technology",
  "Others",
];

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

/**
 * R19: Aggregate developers by their HIGHEST level across multiple sources.
 * Each developer appears exactly once, at their max proficiency level.
 * Example: Alice is Basic in React, Advanced in Vue → counted as Advanced only.
 */
function aggregateDevelopersByMaxLevel(sources: DevelopersByLevel[]): DevelopersByLevel {
  const levelPriority: Record<ProficiencyLevel, number> = { basic: 1, intermediate: 2, advanced: 3 };

  // Track each developer's highest level
  const devMaxLevel = new Map<string, { dev: RoadmapDeveloper; level: ProficiencyLevel }>();

  for (const source of sources) {
    for (const level of ["basic", "intermediate", "advanced"] as const) {
      for (const dev of source[level]) {
        const existing = devMaxLevel.get(dev.id);
        if (!existing || levelPriority[level] > levelPriority[existing.level]) {
          devMaxLevel.set(dev.id, { dev, level });
        }
      }
    }
  }

  // Build result grouped by level
  const result = emptyByLevel();
  for (const { dev, level } of devMaxLevel.values()) {
    result[level].push(dev);
  }
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
// Category grouping (R3)
// =============================================================================

/** Build category progress from skills and checkpoints (R3, R5) */
function buildCategoryProgress(
  roleName: string,
  mappedSkills: SkillsRoadmapProgressData[],
  checkpoints: CheckpointProgressData[],
  roleCategorizedSkills: Map<string, Map<string, string[]>>,
): CategoryProgressData[] {
  const categoryMap = new Map<SkillCategoryName, { skills: SkillsRoadmapProgressData[]; checkpoints: CheckpointProgressData[] }>();

  // Initialize with empty arrays
  for (const cat of CATEGORY_ORDER) {
    categoryMap.set(cat, { skills: [], checkpoints: [] });
  }

  // Get categorized skills for this role
  const roleCategories = roleCategorizedSkills.get(roleName);

  if (roleCategories) {
    // Group skills by category according to role mapping
    for (const [categoryName, skillNames] of roleCategories.entries()) {
      const catName = categoryName as SkillCategoryName;
      const catData = categoryMap.get(catName) ?? { skills: [], checkpoints: [] };

      for (const skillName of skillNames) {
        const skill = mappedSkills.find((s) => s.roadmap.name === skillName);
        if (skill) {
          catData.skills.push(skill);
        }
      }

      categoryMap.set(catName, catData);
    }
  }

  // Put checkpoints in "Others" category
  const othersData = categoryMap.get("Others")!;
  othersData.checkpoints = checkpoints;

  // Build CategoryProgressData for each category
  const result: CategoryProgressData[] = [];

  for (const category of CATEGORY_ORDER) {
    const data = categoryMap.get(category)!;

    // Skip categories with no skills and no checkpoints
    if (data.skills.length === 0 && (data.checkpoints?.length ?? 0) === 0) {
      continue;
    }

    // R5: Max progress from skills
    const maxProgress = data.skills.length > 0
      ? Math.max(...data.skills.map((s) => s.progressPercent))
      : (data.checkpoints?.length ?? 0) > 0
        ? Math.max(...(data.checkpoints?.map((c) => c.progressPercent) ?? [0]))
        : 0;

    // R19: Aggregate developers by max level (each dev counted at their highest level)
    const sources: DevelopersByLevel[] = data.skills.map((s) => s.developersByLevel);

    // Also include checkpoint developers for Others category
    if (category === "Others" && data.checkpoints) {
      sources.push(...data.checkpoints.map((cp) => cp.developersByLevel));
    }

    const developersByLevel = aggregateDevelopersByMaxLevel(sources);

    result.push({
      category,
      progressPercent: Math.round(maxProgress),
      proficiencyLevel: getProficiencyLevel(maxProgress),
      developerCounts: {
        basic: developersByLevel.basic.length,
        intermediate: developersByLevel.intermediate.length,
        advanced: developersByLevel.advanced.length,
      },
      developersByLevel,
      skills: data.skills,
      checkpoints: category === "Others" ? data.checkpoints : undefined,
    });
  }

  return result;
}

// =============================================================================
// Skill-based category grouping (R9)
// =============================================================================

/** Category grouping for skill-based tab (without checkpoints) */
export type SkillCategoryData = {
  category: SkillCategoryName;
  progressPercent: number;
  proficiencyLevel: ProficiencyLevel | null;
  developerCounts: { basic: number; intermediate: number; advanced: number };
  developersByLevel: DevelopersByLevel;
  skills: SkillsRoadmapProgressData[];
};

/** Build category groupings for skill-based view (R9) */
function buildSkillBasedCategories(
  skills: SkillsRoadmapProgressData[],
  skillCategoryMapping: Map<string, string>,
): SkillCategoryData[] {
  const categoryMap = new Map<SkillCategoryName, SkillsRoadmapProgressData[]>();

  // Initialize categories
  for (const cat of CATEGORY_ORDER) {
    categoryMap.set(cat, []);
  }

  // Group skills by category
  for (const skill of skills) {
    const categoryName = skillCategoryMapping.get(skill.roadmap.name) as SkillCategoryName | undefined;
    const cat = categoryName ?? "Others";
    const list = categoryMap.get(cat) ?? [];
    list.push(skill);
    categoryMap.set(cat, list);
  }

  // Build category data
  const result: SkillCategoryData[] = [];

  for (const category of CATEGORY_ORDER) {
    const catSkills = categoryMap.get(category) ?? [];
    if (catSkills.length === 0) continue;

    // Max progress from skills
    const maxProgress = Math.max(...catSkills.map((s) => s.progressPercent));

    // R19: Aggregate developers by max level (each dev counted at their highest level)
    const developersByLevel = aggregateDevelopersByMaxLevel(
      catSkills.map((s) => s.developersByLevel)
    );

    result.push({
      category,
      progressPercent: Math.round(maxProgress),
      proficiencyLevel: getProficiencyLevel(maxProgress),
      developerCounts: {
        basic: developersByLevel.basic.length,
        intermediate: developersByLevel.intermediate.length,
        advanced: developersByLevel.advanced.length,
      },
      developersByLevel,
      skills: catSkills,
    });
  }

  return result;
}

// =============================================================================
// Public API
// =============================================================================

export interface SkillGraphTableData {
  skillBased: SkillsRoadmapProgressData[];
  /** Skill-based data grouped by category (R9) */
  skillBasedCategories: SkillCategoryData[];
  roleBased: RoleRoadmapProgressData[];
}

/** Transform raw graph JSON into table-compatible data */
export function transformToTableData(raw: SkillGraphRawData): SkillGraphTableData {
  const { roadmaps, engineerIndex, engineers, detailMap, roleSkillMapping, skillCategoryMapping, roleCategorizedSkills } = raw;

  // Skill-based
  const skillRoadmaps = roadmaps.filter((r) => r.type === "skill");
  const skillBased = skillRoadmaps.map((r) =>
    buildOneRoadmapProgress(r, detailMap, engineerIndex, engineers),
  );

  // Build name → SkillsRoadmapProgressData lookup for role mapping
  const skillByName = new Map<string, SkillsRoadmapProgressData>();
  for (const sp of skillBased) {
    skillByName.set(sp.roadmap.name, sp);
  }

  // Role-based
  const roleRoadmaps = roadmaps.filter((r) => r.type === "role");
  const roleBased = roleRoadmaps.map((r) => {
    const inner = buildOneRoadmapProgress(r, detailMap, engineerIndex, engineers);

    // Find mapped skill-based roadmaps from the mapping JSON
    const mappedSkillNames = roleSkillMapping.get(r.name) ?? [];
    const mappedSkills = mappedSkillNames
      .map((name) => skillByName.get(name))
      .filter((s): s is SkillsRoadmapProgressData => s != null);

    // Build category groupings (R3)
    const categories = buildCategoryProgress(
      r.name,
      mappedSkills,
      inner.checkpoints,
      roleCategorizedSkills,
    );

    // R19: Role developers = union of all categories (max level per developer)
    const roleDevelopersByLevel = aggregateDevelopersByMaxLevel(
      categories.map((cat) => cat.developersByLevel)
    );

    // R19: Role progress = max of all category progress (consistent with people aggregation)
    const roleProgressPercent = categories.length > 0
      ? Math.max(...categories.map((cat) => cat.progressPercent))
      : inner.progressPercent;

    const roleRoadmap: RoleRoadmap = {
      id: r.key,
      name: r.name,
      skillsRoadmapIds: mappedSkills.map((s) => s.roadmap.id),
    };

    const result: RoleRoadmapProgressData = {
      roleRoadmap,
      progressPercent: roleProgressPercent,
      proficiencyLevel: getProficiencyLevel(roleProgressPercent),
      developerCounts: {
        basic: roleDevelopersByLevel.basic.length,
        intermediate: roleDevelopersByLevel.intermediate.length,
        advanced: roleDevelopersByLevel.advanced.length,
      },
      developersByLevel: roleDevelopersByLevel,
      checkpoints: inner.checkpoints,
      skillsRoadmaps: mappedSkills,
      categories,
    };
    return result;
  });

  // Build skill-based category groupings (R9)
  const skillBasedCategories = buildSkillBasedCategories(skillBased, skillCategoryMapping);

  return { skillBased, skillBasedCategories, roleBased };
}
