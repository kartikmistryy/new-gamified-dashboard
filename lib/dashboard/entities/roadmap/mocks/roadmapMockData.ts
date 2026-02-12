import type {
  RoadmapDeveloper,
  SubCheckpoint,
  Checkpoint,
  CheckpointPhase,
  SkillsRoadmap,
  RoleRoadmap,
  DeveloperProgress,
} from "../types";

// =============================================================================
// Role-based Roadmap Definition
// =============================================================================

export const AI_ENGINEER_ROLE: RoleRoadmap = {
  id: "ai-engineer",
  name: "AI Engineer",
  skillsRoadmapIds: ["ai-ml", "backend", "data-engineering"],
};

// =============================================================================
// Skills Roadmaps (derived from existing data.ts structure)
// =============================================================================

const createSubCheckpoints = (names: string[], checkpointId: string): SubCheckpoint[] =>
  names.map((name, index) => ({
    id: `${checkpointId}-${index}`,
    name,
    index,
  }));

const createCheckpoint = (
  id: string,
  name: string,
  phase: CheckpointPhase,
  subNames: string[]
): Checkpoint => ({
  id,
  name,
  phase,
  subCheckpoints: createSubCheckpoints(subNames, id),
});

export const AI_ML_ROADMAP: SkillsRoadmap = {
  id: "ai-ml",
  name: "AI & ML",
  checkpoints: [
    // Basic phase
    createCheckpoint("python-ml", "Python ML", "Basic", [
      "Pandas",
      "Scikit-Learn",
      "Feature Eng",
      "Model Eval",
      "Pipelines",
    ]),
    // Intermediate phase
    createCheckpoint("tensorflow", "TensorFlow", "Intermediate", [
      "Keras",
      "Training",
      "Tuning",
      "Deployment",
      "TF Data",
    ]),
    createCheckpoint("pytorch", "PyTorch", "Intermediate", [
      "Tensors",
      "Training",
      "Lightning",
      "Deployment",
      "Optimization",
    ]),
    createCheckpoint("llms-nlp", "LLMs & NLP", "Intermediate", [
      "Prompting",
      "Fine-tuning",
      "RAG",
      "Evaluation",
    ]),
    // Advanced phase - not yet unlocked by anyone
    createCheckpoint("mlops", "MLOps", "Advanced", [
      "Model Registry",
      "CI/CD Pipelines",
      "Monitoring",
      "A/B Testing",
      "Feature Stores",
    ]),
    createCheckpoint("computer-vision", "Computer Vision", "Advanced", [
      "CNNs",
      "Object Detection",
      "Segmentation",
      "GANs",
    ]),
  ],
};

export const BACKEND_ROADMAP: SkillsRoadmap = {
  id: "backend",
  name: "Backend",
  checkpoints: [
    // Basic phase
    createCheckpoint("nodejs", "Node.js", "Basic", [
      "Express",
      "Authentication",
      "Performance",
      "REST API",
      "Databases",
      "Testing",
    ]),
    createCheckpoint("python-backend", "Python", "Basic", [
      "FastAPI",
      "Data Modeling",
      "Async IO",
      "ETL",
      "Testing",
      "Packaging",
    ]),
    // Intermediate phase
    createCheckpoint("graphql", "GraphQL", "Intermediate", [
      "Schema Design",
      "Resolvers",
      "Auth",
      "Caching",
      "Federation",
    ]),
    createCheckpoint("postgresql", "PostgreSQL", "Intermediate", [
      "Schema Design",
      "Indexing",
      "Query Tuning",
      "Migrations",
      "Transactions",
    ]),
    // Advanced phase - not yet unlocked by anyone
    createCheckpoint("rust-backend", "Rust", "Advanced", [
      "Ownership",
      "Async Runtime",
      "Actix/Axum",
      "FFI",
    ]),
    createCheckpoint("grpc", "gRPC", "Advanced", [
      "Protocol Buffers",
      "Streaming",
      "Load Balancing",
      "Service Mesh",
    ]),
  ],
};

export const DATA_ENGINEERING_ROADMAP: SkillsRoadmap = {
  id: "data-engineering",
  name: "Data Engineering",
  checkpoints: [
    // Basic phase
    createCheckpoint("pipelines", "Pipelines", "Basic", [
      "Batch ETL",
      "Streaming",
      "Orchestration",
      "Data Quality",
      "Lineage",
    ]),
    // Intermediate phase
    createCheckpoint("warehousing", "Warehousing", "Intermediate", [
      "Modeling",
      "Partitioning",
      "Cost Control",
      "Query Tuning",
      "Governance",
    ]),
    createCheckpoint("streaming", "Streaming", "Intermediate", [
      "Kafka",
      "Flink",
      "Event Design",
      "Backfills",
    ]),
    createCheckpoint("analytics", "Analytics", "Intermediate", [
      "Dashboards",
      "Metric Design",
      "Self-Serve",
      "Documentation",
    ]),
    // Advanced phase - not yet unlocked by anyone
    createCheckpoint("data-mesh", "Data Mesh", "Advanced", [
      "Domain Ownership",
      "Data Products",
      "Federated Governance",
      "Self-Serve Platform",
    ]),
    createCheckpoint("realtime-ml", "Real-time ML", "Advanced", [
      "Feature Serving",
      "Online Inference",
      "Model Monitoring",
      "Drift Detection",
    ]),
  ],
};

export const SKILLS_ROADMAPS: Record<string, SkillsRoadmap> = {
  "ai-ml": AI_ML_ROADMAP,
  backend: BACKEND_ROADMAP,
  "data-engineering": DATA_ENGINEERING_ROADMAP,
};

// =============================================================================
// Mock Developers (30 developers)
// =============================================================================

const FIRST_NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry",
  "Ivy", "Jack", "Kate", "Liam", "Mia", "Noah", "Olivia", "Peter",
  "Quinn", "Ruby", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xander",
  "Yuki", "Zoe", "Aaron", "Beth", "Carlos", "Dana",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas",
  "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris",
  "Clark", "Lewis", "Walker", "Hall", "Young", "King", "Wright", "Lopez",
  "Hill", "Scott",
];

export const MOCK_DEVELOPERS: RoadmapDeveloper[] = FIRST_NAMES.map((firstName, i) => ({
  id: `dev-${i + 1}`,
  name: `${firstName} ${LAST_NAMES[i]}`,
  avatarUrl: undefined, // Could add placeholder URLs if needed
}));

// =============================================================================
// Mock Developer Progress (Sequential Unlocks)
// =============================================================================

/** Get all checkpoint IDs across all skills roadmaps */
const getAllCheckpointIds = (): string[] => {
  const ids: string[] = [];
  Object.values(SKILLS_ROADMAPS).forEach((roadmap) => {
    roadmap.checkpoints.forEach((checkpoint) => {
      ids.push(checkpoint.id);
    });
  });
  return ids;
};

/** Get the total sub-checkpoints for a checkpoint */
const getCheckpointSize = (checkpointId: string): number => {
  for (const roadmap of Object.values(SKILLS_ROADMAPS)) {
    const checkpoint = roadmap.checkpoints.find((c) => c.id === checkpointId);
    if (checkpoint) return checkpoint.subCheckpoints.length;
  }
  return 0;
};

/** Seeded random for reproducible mock data */
const seededRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
};

/** Checkpoints that are "advanced" and no one has unlocked yet */
const ADVANCED_CHECKPOINT_IDS = new Set([
  "mlops",
  "computer-vision",
  "rust-backend",
  "grpc",
  "data-mesh",
  "realtime-ml",
]);

/** Generate mock progress for all developers */
const generateMockProgress = (): DeveloperProgress[] => {
  const checkpointIds = getAllCheckpointIds();
  const random = seededRandom(42); // Fixed seed for reproducibility

  return MOCK_DEVELOPERS.map((dev, devIndex) => {
    // Each developer has a "skill level" that affects their overall progress
    // Distribute developers across skill levels for variety
    const skillLevel = random() * 0.6 + (devIndex % 5) * 0.1; // 0.0 to 1.0

    const checkpointProgress: Record<string, number> = {};

    checkpointIds.forEach((checkpointId) => {
      // Advanced checkpoints have 0 progress for everyone
      if (ADVANCED_CHECKPOINT_IDS.has(checkpointId)) {
        checkpointProgress[checkpointId] = 0;
        return;
      }

      const totalSubs = getCheckpointSize(checkpointId);
      // Higher skill level = more likely to have more unlocked
      // Add some randomness for variety
      const progressFactor = skillLevel * (0.7 + random() * 0.6);
      const unlockedCount = Math.min(
        totalSubs,
        Math.floor(totalSubs * progressFactor)
      );
      checkpointProgress[checkpointId] = unlockedCount;
    });

    return {
      developerId: dev.id,
      checkpointProgress,
    };
  });
};

export const MOCK_DEVELOPER_PROGRESS: DeveloperProgress[] = generateMockProgress();

// =============================================================================
// Helper to get developer progress by ID
// =============================================================================

export const getDeveloperProgress = (developerId: string): DeveloperProgress | undefined =>
  MOCK_DEVELOPER_PROGRESS.find((p) => p.developerId === developerId);

export const getDeveloperById = (developerId: string): RoadmapDeveloper | undefined =>
  MOCK_DEVELOPERS.find((d) => d.id === developerId);
