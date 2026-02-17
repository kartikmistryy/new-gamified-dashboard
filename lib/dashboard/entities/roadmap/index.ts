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
  // Role Roadmaps
  ROLE_ROADMAPS,
  AI_ENGINEER_ROLE,
  FULL_STACK_ROLE,
  MOBILE_DEV_ROLE,
  PLATFORM_ENGINEER_ROLE,
  QA_ENGINEER_ROLE,
  DATA_ENGINEER_ROLE,
  TECH_LEAD_ROLE,
  PRODUCT_DESIGNER_ROLE,
  // Skills Roadmaps
  SKILLS_ROADMAPS,
  AI_ML_ROADMAP,
  BACKEND_ROADMAP,
  DATA_ENGINEERING_ROADMAP,
  FRONTEND_ROADMAP,
  MOBILE_ROADMAP,
  DEVOPS_ROADMAP,
  CLOUD_ROADMAP,
  TESTING_ROADMAP,
  SECURITY_ROADMAP,
  LEADERSHIP_ROADMAP,
  PRODUCT_DESIGN_ROADMAP,
  // Developers
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
