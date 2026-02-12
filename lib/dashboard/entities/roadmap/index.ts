// Types
export type {
  ProficiencyLevel,
  CheckpointPhase,
  RoadmapDeveloper,
  SubCheckpoint,
  Checkpoint,
  SkillsRoadmap,
  RoleRoadmap,
  DeveloperCheckpointProgress,
  DeveloperProgress,
  CheckpointProgressData,
  SkillsRoadmapProgressData,
  RoleRoadmapProgressData,
  RoadmapViewMode,
  RoadmapFilterMode,
  SidePanelContext,
} from "./types";

// Mock Data
export {
  AI_ENGINEER_ROLE,
  AI_ML_ROADMAP,
  BACKEND_ROADMAP,
  DATA_ENGINEERING_ROADMAP,
  SKILLS_ROADMAPS,
  MOCK_DEVELOPERS,
  MOCK_DEVELOPER_PROGRESS,
  getDeveloperProgress,
  getDeveloperById,
} from "./mocks/roadmapMockData";

// Utilities
export {
  getProficiencyLevel,
  getProficiencyColor,
  calculateCheckpointProgress,
  calculateSkillsRoadmapProgress,
  calculateRoleRoadmapProgress,
  isSubCheckpointUnlocked,
  getSubCheckpointUnlockCounts,
} from "./utils/progressUtils";
