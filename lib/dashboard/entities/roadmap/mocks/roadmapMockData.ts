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

export const FULL_STACK_ROLE: RoleRoadmap = {
  id: "full-stack",
  name: "Full Stack Developer",
  skillsRoadmapIds: ["frontend", "backend", "devops"],
};

export const MOBILE_DEV_ROLE: RoleRoadmap = {
  id: "mobile-dev",
  name: "Mobile Developer",
  skillsRoadmapIds: ["mobile", "frontend", "backend"],
};

export const PLATFORM_ENGINEER_ROLE: RoleRoadmap = {
  id: "platform-engineer",
  name: "Platform Engineer",
  skillsRoadmapIds: ["devops", "cloud", "security"],
};

export const QA_ENGINEER_ROLE: RoleRoadmap = {
  id: "qa-engineer",
  name: "QA Engineer",
  skillsRoadmapIds: ["testing", "security"],
};

export const DATA_ENGINEER_ROLE: RoleRoadmap = {
  id: "data-engineer",
  name: "Data Engineer",
  skillsRoadmapIds: ["data-engineering", "backend", "cloud"],
};

export const TECH_LEAD_ROLE: RoleRoadmap = {
  id: "tech-lead",
  name: "Tech Lead",
  skillsRoadmapIds: ["leadership", "backend", "testing"],
};

export const PRODUCT_DESIGNER_ROLE: RoleRoadmap = {
  id: "product-designer",
  name: "Product Designer",
  skillsRoadmapIds: ["product-design", "frontend"],
};

export const ROLE_ROADMAPS: RoleRoadmap[] = [
  AI_ENGINEER_ROLE,
  FULL_STACK_ROLE,
  MOBILE_DEV_ROLE,
  PLATFORM_ENGINEER_ROLE,
  QA_ENGINEER_ROLE,
  DATA_ENGINEER_ROLE,
  TECH_LEAD_ROLE,
  PRODUCT_DESIGNER_ROLE,
];

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

export const FRONTEND_ROADMAP: SkillsRoadmap = {
  id: "frontend",
  name: "Frontend",
  checkpoints: [
    // Basic phase
    createCheckpoint("react-basics", "React", "Basic", [
      "Components",
      "Hooks",
      "State Mgmt",
      "Routing",
      "Forms",
    ]),
    createCheckpoint("css-styling", "CSS & Styling", "Basic", [
      "Flexbox",
      "Grid",
      "Tailwind",
      "Animations",
      "Responsive",
    ]),
    // Intermediate phase
    createCheckpoint("nextjs", "Next.js", "Intermediate", [
      "App Router",
      "SSR/SSG",
      "API Routes",
      "Middleware",
      "Caching",
    ]),
    createCheckpoint("typescript-fe", "TypeScript", "Intermediate", [
      "Types",
      "Generics",
      "Utilities",
      "Strict Mode",
    ]),
    // Advanced phase
    createCheckpoint("performance-fe", "Performance", "Advanced", [
      "Code Splitting",
      "Bundle Analysis",
      "Lazy Loading",
      "Web Vitals",
    ]),
    createCheckpoint("testing-fe", "Testing", "Advanced", [
      "Unit Tests",
      "Integration",
      "E2E",
      "Visual Regression",
    ]),
  ],
};

export const MOBILE_ROADMAP: SkillsRoadmap = {
  id: "mobile",
  name: "Mobile",
  checkpoints: [
    // Basic phase
    createCheckpoint("react-native", "React Native", "Basic", [
      "Components",
      "Navigation",
      "Styling",
      "Native Modules",
      "Expo",
    ]),
    createCheckpoint("mobile-ui", "Mobile UI", "Basic", [
      "Gestures",
      "Animations",
      "Lists",
      "Forms",
    ]),
    // Intermediate phase
    createCheckpoint("swift", "Swift/iOS", "Intermediate", [
      "SwiftUI",
      "UIKit",
      "Core Data",
      "Networking",
      "App Store",
    ]),
    createCheckpoint("kotlin", "Kotlin/Android", "Intermediate", [
      "Compose",
      "Lifecycle",
      "Room DB",
      "Play Store",
    ]),
    // Advanced phase
    createCheckpoint("mobile-perf", "Mobile Performance", "Advanced", [
      "Profiling",
      "Memory Mgmt",
      "Battery",
      "Offline First",
    ]),
    createCheckpoint("flutter", "Flutter", "Advanced", [
      "Widgets",
      "State Mgmt",
      "Platform Channels",
      "Dart",
    ]),
  ],
};

export const DEVOPS_ROADMAP: SkillsRoadmap = {
  id: "devops",
  name: "DevOps",
  checkpoints: [
    // Basic phase
    createCheckpoint("docker", "Docker", "Basic", [
      "Containers",
      "Images",
      "Compose",
      "Networking",
      "Volumes",
    ]),
    createCheckpoint("cicd", "CI/CD", "Basic", [
      "GitHub Actions",
      "Pipelines",
      "Artifacts",
      "Deployments",
    ]),
    // Intermediate phase
    createCheckpoint("kubernetes", "Kubernetes", "Intermediate", [
      "Pods",
      "Services",
      "Deployments",
      "ConfigMaps",
      "Helm",
    ]),
    createCheckpoint("iac", "Infrastructure as Code", "Intermediate", [
      "Terraform",
      "State Mgmt",
      "Modules",
      "Drift Detection",
    ]),
    // Advanced phase
    createCheckpoint("platform-eng", "Platform Engineering", "Advanced", [
      "Internal Dev Portal",
      "Golden Paths",
      "Self-Service",
      "Cost Optimization",
    ]),
    createCheckpoint("observability", "Observability", "Advanced", [
      "Metrics",
      "Tracing",
      "Logging",
      "Alerting",
    ]),
  ],
};

export const CLOUD_ROADMAP: SkillsRoadmap = {
  id: "cloud",
  name: "Cloud",
  checkpoints: [
    // Basic phase
    createCheckpoint("aws-basics", "AWS Basics", "Basic", [
      "EC2",
      "S3",
      "IAM",
      "VPC",
      "Lambda",
    ]),
    createCheckpoint("cloud-networking", "Cloud Networking", "Basic", [
      "Load Balancers",
      "DNS",
      "CDN",
      "Firewalls",
    ]),
    // Intermediate phase
    createCheckpoint("gcp", "Google Cloud", "Intermediate", [
      "Compute Engine",
      "Cloud Run",
      "BigQuery",
      "Cloud Functions",
    ]),
    createCheckpoint("serverless", "Serverless", "Intermediate", [
      "Functions",
      "Event Triggers",
      "Cold Starts",
      "Cost Mgmt",
    ]),
    // Advanced phase
    createCheckpoint("multi-cloud", "Multi-Cloud", "Advanced", [
      "Architecture",
      "Portability",
      "Vendor Lock-in",
      "Governance",
    ]),
    createCheckpoint("finops", "FinOps", "Advanced", [
      "Cost Allocation",
      "Reserved Instances",
      "Spot Instances",
      "Budgeting",
    ]),
  ],
};

export const TESTING_ROADMAP: SkillsRoadmap = {
  id: "testing",
  name: "Testing",
  checkpoints: [
    // Basic phase
    createCheckpoint("unit-testing", "Unit Testing", "Basic", [
      "Jest",
      "Mocking",
      "Coverage",
      "TDD",
      "Assertions",
    ]),
    createCheckpoint("integration-testing", "Integration Testing", "Basic", [
      "API Testing",
      "DB Testing",
      "Test Fixtures",
      "Cleanup",
    ]),
    // Intermediate phase
    createCheckpoint("e2e-testing", "E2E Testing", "Intermediate", [
      "Playwright",
      "Cypress",
      "Page Objects",
      "Visual Testing",
    ]),
    createCheckpoint("perf-testing", "Performance Testing", "Intermediate", [
      "Load Testing",
      "Stress Testing",
      "Benchmarks",
      "Profiling",
    ]),
    // Advanced phase
    createCheckpoint("test-architecture", "Test Architecture", "Advanced", [
      "Test Pyramid",
      "Test Strategy",
      "Flaky Tests",
      "Test Infra",
    ]),
    createCheckpoint("chaos-eng", "Chaos Engineering", "Advanced", [
      "Fault Injection",
      "Game Days",
      "Resilience",
      "Recovery",
    ]),
  ],
};

export const SECURITY_ROADMAP: SkillsRoadmap = {
  id: "security",
  name: "Security",
  checkpoints: [
    // Basic phase
    createCheckpoint("app-security", "App Security", "Basic", [
      "OWASP Top 10",
      "Input Validation",
      "XSS Prevention",
      "CSRF Protection",
    ]),
    createCheckpoint("auth-security", "Auth & Identity", "Basic", [
      "OAuth/OIDC",
      "JWT",
      "MFA",
      "Sessions",
      "RBAC",
    ]),
    // Intermediate phase
    createCheckpoint("infra-security", "Infra Security", "Intermediate", [
      "Secrets Mgmt",
      "Network Security",
      "Encryption",
      "Compliance",
    ]),
    createCheckpoint("security-testing", "Security Testing", "Intermediate", [
      "SAST",
      "DAST",
      "Pen Testing",
      "Bug Bounty",
    ]),
    // Advanced phase
    createCheckpoint("devsecops", "DevSecOps", "Advanced", [
      "Shift Left",
      "Security Gates",
      "SBOM",
      "Supply Chain",
    ]),
    createCheckpoint("incident-response", "Incident Response", "Advanced", [
      "Detection",
      "Containment",
      "Forensics",
      "Postmortem",
    ]),
  ],
};

export const LEADERSHIP_ROADMAP: SkillsRoadmap = {
  id: "leadership",
  name: "Leadership",
  checkpoints: [
    // Basic phase
    createCheckpoint("mentoring", "Mentoring", "Basic", [
      "1:1s",
      "Feedback",
      "Growth Plans",
      "Coaching",
    ]),
    createCheckpoint("communication", "Communication", "Basic", [
      "Tech Writing",
      "Presentations",
      "Stakeholders",
      "Documentation",
    ]),
    // Intermediate phase
    createCheckpoint("team-lead", "Team Leadership", "Intermediate", [
      "Sprint Planning",
      "Estimation",
      "Delegation",
      "Conflict Resolution",
    ]),
    createCheckpoint("technical-strategy", "Technical Strategy", "Intermediate", [
      "Roadmapping",
      "Tech Debt",
      "Architecture Reviews",
      "RFCs",
    ]),
    // Advanced phase
    createCheckpoint("org-design", "Org Design", "Advanced", [
      "Team Topologies",
      "Hiring",
      "Culture",
      "Scaling",
    ]),
    createCheckpoint("exec-presence", "Executive Presence", "Advanced", [
      "Board Presentations",
      "Budget Planning",
      "Vendor Mgmt",
      "Strategy",
    ]),
  ],
};

export const PRODUCT_DESIGN_ROADMAP: SkillsRoadmap = {
  id: "product-design",
  name: "Product & Design",
  checkpoints: [
    // Basic phase
    createCheckpoint("ui-design", "UI Design", "Basic", [
      "Figma",
      "Design Systems",
      "Typography",
      "Color Theory",
    ]),
    createCheckpoint("ux-basics", "UX Basics", "Basic", [
      "User Research",
      "Wireframes",
      "Prototypes",
      "Usability Testing",
    ]),
    // Intermediate phase
    createCheckpoint("product-thinking", "Product Thinking", "Intermediate", [
      "User Stories",
      "Metrics",
      "Prioritization",
      "MVPs",
    ]),
    createCheckpoint("accessibility", "Accessibility", "Intermediate", [
      "WCAG",
      "Screen Readers",
      "Keyboard Nav",
      "Color Contrast",
    ]),
    // Advanced phase
    createCheckpoint("design-ops", "Design Ops", "Advanced", [
      "Design Tokens",
      "Component Libraries",
      "Design QA",
      "Handoff",
    ]),
    createCheckpoint("product-strategy", "Product Strategy", "Advanced", [
      "Market Research",
      "Competitive Analysis",
      "Roadmapping",
      "OKRs",
    ]),
  ],
};

export const SKILLS_ROADMAPS: Record<string, SkillsRoadmap> = {
  "ai-ml": AI_ML_ROADMAP,
  backend: BACKEND_ROADMAP,
  "data-engineering": DATA_ENGINEERING_ROADMAP,
  frontend: FRONTEND_ROADMAP,
  mobile: MOBILE_ROADMAP,
  devops: DEVOPS_ROADMAP,
  cloud: CLOUD_ROADMAP,
  testing: TESTING_ROADMAP,
  security: SECURITY_ROADMAP,
  leadership: LEADERSHIP_ROADMAP,
  "product-design": PRODUCT_DESIGN_ROADMAP,
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
  // AI & ML
  "mlops",
  "computer-vision",
  // Backend
  "rust-backend",
  "grpc",
  // Data Engineering
  "data-mesh",
  "realtime-ml",
  // Frontend
  "performance-fe",
  "testing-fe",
  // Mobile
  "mobile-perf",
  "flutter",
  // DevOps
  "platform-eng",
  "observability",
  // Cloud
  "multi-cloud",
  "finops",
  // Testing
  "test-architecture",
  "chaos-eng",
  // Security
  "devsecops",
  "incident-response",
  // Leadership
  "org-design",
  "exec-presence",
  // Product & Design
  "design-ops",
  "product-strategy",
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
