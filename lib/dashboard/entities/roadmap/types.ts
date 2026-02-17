/** Proficiency level based on progress percentage */
export type ProficiencyLevel = "basic" | "intermediate" | "advanced";

/** Checkpoint difficulty phase */
export type CheckpointPhase = "Basic" | "Intermediate" | "Advanced";

/** Developer info for display */
export type RoadmapDeveloper = {
  id: string;
  name: string;
  avatarUrl?: string;
};

/** Sub-checkpoint (leaf node) - binary unlock status per developer */
export type SubCheckpoint = {
  id: string;
  name: string;
  index: number; // Position in sequence (0 = easiest)
};

/** Checkpoint containing ordered sub-checkpoints */
export type Checkpoint = {
  id: string;
  name: string;
  phase: CheckpointPhase;
  subCheckpoints: SubCheckpoint[];
};

/** Skills-based roadmap containing checkpoints */
export type SkillsRoadmap = {
  id: string;
  name: string;
  checkpoints: Checkpoint[];
};

/** Role-based roadmap containing multiple skills roadmaps */
export type RoleRoadmap = {
  id: string;
  name: string;
  skillsRoadmapIds: string[];
};

/** Developer's progress on a specific checkpoint (count of unlocked sub-checkpoints) */
export type DeveloperCheckpointProgress = {
  checkpointId: string;
  unlockedCount: number; // Sequential: indices 0 to (unlockedCount-1) are unlocked
};

/** Developer's overall progress across all checkpoints */
export type DeveloperProgress = {
  developerId: string;
  checkpointProgress: Record<string, number>; // checkpointId -> unlockedCount
};

/** Pre-computed sub-checkpoint unlock count (for graph-sourced data) */
export type SubCheckpointUnlockCount = {
  subCheckpoint: SubCheckpoint;
  unlockedByCount: number;
};

/** Computed progress for a checkpoint (for display) */
export type CheckpointProgressData = {
  checkpoint: Checkpoint;
  progressPercent: number; // 0-100
  proficiencyLevel: ProficiencyLevel | null; // null if 0%
  developerCounts: {
    basic: number;
    intermediate: number;
    advanced: number;
  };
  developersByLevel: {
    basic: RoadmapDeveloper[];
    intermediate: RoadmapDeveloper[];
    advanced: RoadmapDeveloper[];
  };
  /** Pre-computed sub-checkpoint unlock counts (graph-sourced data). */
  subCheckpointUnlockCounts?: SubCheckpointUnlockCount[];
};

/** Computed progress for a skills roadmap (for display) */
export type SkillsRoadmapProgressData = {
  roadmap: SkillsRoadmap;
  progressPercent: number; // 0-100 (avg of checkpoints)
  proficiencyLevel: ProficiencyLevel | null;
  developerCounts: {
    basic: number;
    intermediate: number;
    advanced: number;
  };
  developersByLevel: {
    basic: RoadmapDeveloper[];
    intermediate: RoadmapDeveloper[];
    advanced: RoadmapDeveloper[];
  };
  checkpoints: CheckpointProgressData[];
};

/** Computed progress for a role roadmap (for display) */
export type RoleRoadmapProgressData = {
  roleRoadmap: RoleRoadmap;
  progressPercent: number; // 0-100 (weighted avg of skills roadmaps)
  proficiencyLevel: ProficiencyLevel | null;
  developerCounts: {
    basic: number;
    intermediate: number;
    advanced: number;
  };
  developersByLevel: {
    basic: RoadmapDeveloper[];
    intermediate: RoadmapDeveloper[];
    advanced: RoadmapDeveloper[];
  };
  /** Role's own checkpoints (from role roadmap detail) */
  checkpoints: CheckpointProgressData[];
  /** Mapped skill-based roadmaps (from skill-role-mapping) */
  skillsRoadmaps: SkillsRoadmapProgressData[];
};

/** View mode for the roadmap table */
export type RoadmapViewMode = "role" | "skills";

/** Filter mode for showing roadmap items */
export type RoadmapFilterMode = "all" | "unlocked";

/** Side panel context - what was clicked to open it */
export type SidePanelContext = {
  type: "roadmap" | "checkpoint" | "subcheckpoint";
  id: string;
  name: string;
  developersByLevel: {
    basic: RoadmapDeveloper[];
    intermediate: RoadmapDeveloper[];
    advanced: RoadmapDeveloper[];
  };
} | null;
