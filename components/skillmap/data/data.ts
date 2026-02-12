export interface Technology {
  name: string;
  value: number;
  frequency?: number;
  children?: Technology[];
}

export interface Roadmap {
  name: string;
  value: number;
  frequency?: number;
  technologies: Technology[];
}

export const roadmapData: Roadmap[] = [
  {
    name: "Frontend",
    value: 35,
    frequency: 65,
    technologies: [
      {
        name: "React",
        value: 30,
        frequency: 68,
        children: [
          { name: "Components", value: 30, frequency: 85 },
          { name: "Hooks", value: 28, frequency: 78 },
          { name: "State & Props", value: 27, frequency: 82 },
          { name: "Routing", value: 22, frequency: 70 },
          { name: "Context API", value: 18, frequency: 55 },
          { name: "Performance", value: 15, frequency: 48 },
          { name: "Testing", value: 12, frequency: 42 },
        ],
      },
      {
        name: "TypeScript",
        value: 32,
        frequency: 58,
        children: [
          { name: "Types & Interfaces", value: 32, frequency: 80 },
          { name: "Generics", value: 20, frequency: 55 },
          { name: "Narrowing", value: 16, frequency: 45 },
          { name: "Utility Types", value: 14, frequency: 40 },
          { name: "TSConfig", value: 25, frequency: 65 },
          { name: "Tooling", value: 18, frequency: 50 },
        ],
      },
      {
        name: "Next.js",
        value: 22,
        frequency: 56,
        children: [
          { name: "App Router", value: 22, frequency: 72 },
          { name: "Data Fetching", value: 20, frequency: 68 },
          { name: "Server Actions", value: 14, frequency: 45 },
          { name: "API Routes", value: 18, frequency: 60 },
          { name: "SEO & Metadata", value: 10, frequency: 38 },
          { name: "Deployment", value: 16, frequency: 55 },
        ],
      },
      {
        name: "CSS",
        value: 28,
        frequency: 60,
        children: [
          { name: "Layout", value: 28, frequency: 75 },
          { name: "Flex & Grid", value: 26, frequency: 72 },
          { name: "Animations", value: 12, frequency: 40 },
          { name: "Responsive", value: 24, frequency: 68 },
          { name: "Sass", value: 10, frequency: 35 },
        ],
      },
    ],
  },
  {
    name: "Backend",
    value: 30,
    frequency: 58,
    technologies: [
      {
        name: "Node.js",
        value: 25,
        frequency: 64,
        children: [
          { name: "Express", value: 25, frequency: 78 },
          { name: "Authentication", value: 18, frequency: 60 },
          { name: "Performance", value: 12, frequency: 45 },
          { name: "REST API", value: 24, frequency: 82 },
          { name: "Databases", value: 20, frequency: 65 },
          { name: "Testing", value: 16, frequency: 52 },
        ],
      },
      {
        name: "Python",
        value: 18,
        frequency: 47,
        children: [
          { name: "FastAPI", value: 14, frequency: 58 },
          { name: "Data Modeling", value: 16, frequency: 62 },
          { name: "Async IO", value: 10, frequency: 42 },
          { name: "ETL", value: 8, frequency: 38 },
          { name: "Testing", value: 12, frequency: 50 },
          { name: "Packaging", value: 6, frequency: 30 },
        ],
      },
      {
        name: "GraphQL",
        value: 12,
        frequency: 46,
        children: [
          { name: "Schema Design", value: 12, frequency: 65 },
          { name: "Resolvers", value: 10, frequency: 55 },
          { name: "Auth", value: 8, frequency: 48 },
          { name: "Caching", value: 6, frequency: 35 },
          { name: "Federation", value: 4, frequency: 25 },
        ],
      },
      {
        name: "PostgreSQL",
        value: 20,
        frequency: 55,
        children: [
          { name: "Schema Design", value: 18, frequency: 70 },
          { name: "Indexing", value: 14, frequency: 55 },
          { name: "Query Tuning", value: 10, frequency: 45 },
          { name: "Migrations", value: 16, frequency: 62 },
          { name: "Transactions", value: 8, frequency: 40 },
        ],
      },
    ],
  },
  {
    name: "DevOps",
    value: 12,
    frequency: 48,
    technologies: [
      {
        name: "Docker",
        value: 18,
        frequency: 52,
        children: [
          { name: "Images", value: 18, frequency: 72 },
          { name: "Compose", value: 16, frequency: 65 },
          { name: "Optimization", value: 8, frequency: 40 },
          { name: "Security", value: 6, frequency: 32 },
          { name: "Registry", value: 10, frequency: 45 },
        ],
      },
      {
        name: "Kubernetes",
        value: 10,
        frequency: 45,
        children: [
          { name: "Deployments", value: 10, frequency: 60 },
          { name: "Services", value: 8, frequency: 52 },
          { name: "Ingress", value: 6, frequency: 38 },
          { name: "Helm", value: 7, frequency: 42 },
          { name: "Observability", value: 5, frequency: 35 },
        ],
      },
      {
        name: "Terraform",
        value: 8,
        frequency: 43,
        children: [
          { name: "Modules", value: 8, frequency: 55 },
          { name: "State", value: 7, frequency: 48 },
          { name: "Providers", value: 6, frequency: 42 },
          { name: "IaC Patterns", value: 5, frequency: 38 },
          { name: "CI Integration", value: 4, frequency: 30 },
        ],
      },
      {
        name: "CI/CD",
        value: 15,
        frequency: 49,
        children: [
          { name: "Pipelines", value: 15, frequency: 68 },
          { name: "Testing", value: 12, frequency: 55 },
          { name: "Releases", value: 10, frequency: 48 },
          { name: "Secrets", value: 8, frequency: 40 },
          { name: "Monitoring", value: 6, frequency: 32 },
        ],
      },
    ],
  },
  {
    name: "AI & ML",
    value: 10,
    frequency: 42,
    technologies: [
      {
        name: "Python ML",
        value: 10,
        frequency: 52,
        children: [
          { name: "Pandas", value: 10, frequency: 72 },
          { name: "Scikit-Learn", value: 8, frequency: 58 },
          { name: "Feature Eng", value: 6, frequency: 45 },
          { name: "Model Eval", value: 7, frequency: 50 },
          { name: "Pipelines", value: 5, frequency: 35 },
        ],
      },
      {
        name: "TensorFlow",
        value: 6,
        frequency: 39,
        children: [
          { name: "Keras", value: 6, frequency: 55 },
          { name: "Training", value: 5, frequency: 48 },
          { name: "Tuning", value: 4, frequency: 38 },
          { name: "Deployment", value: 3, frequency: 28 },
          { name: "TF Data", value: 3, frequency: 25 },
        ],
      },
      {
        name: "PyTorch",
        value: 5,
        frequency: 34,
        children: [
          { name: "Tensors", value: 5, frequency: 52 },
          { name: "Training", value: 4, frequency: 45 },
          { name: "Lightning", value: 3, frequency: 32 },
          { name: "Deployment", value: 2, frequency: 22 },
          { name: "Optimization", value: 2, frequency: 20 },
        ],
      },
      {
        name: "LLMs & NLP",
        value: 8,
        frequency: 42,
        children: [
          { name: "Prompting", value: 8, frequency: 65 },
          { name: "Fine-tuning", value: 4, frequency: 35 },
          { name: "RAG", value: 5, frequency: 42 },
          { name: "Evaluation", value: 3, frequency: 28 },
        ],
      },
    ],
  },
  {
    name: "Mobile",
    value: 12,
    frequency: 42,
    technologies: [
      {
        name: "React Native",
        value: 10,
        frequency: 48,
        children: [
          { name: "Navigation", value: 10, frequency: 70 },
          { name: "State Mgmt", value: 8, frequency: 60 },
          { name: "Native Modules", value: 5, frequency: 38 },
          { name: "Performance", value: 4, frequency: 32 },
          { name: "Testing", value: 3, frequency: 25 },
          { name: "UI Components", value: 8, frequency: 62 },
        ],
      },
      {
        name: "Flutter",
        value: 5,
        frequency: 34,
        children: [
          { name: "Widgets", value: 5, frequency: 55 },
          { name: "State Mgmt", value: 4, frequency: 45 },
          { name: "Animations", value: 3, frequency: 30 },
          { name: "Platform Channels", value: 2, frequency: 22 },
          { name: "Testing", value: 2, frequency: 20 },
        ],
      },
      {
        name: "Swift",
        value: 4,
        frequency: 35,
        children: [
          { name: "SwiftUI", value: 4, frequency: 48 },
          { name: "Networking", value: 3, frequency: 38 },
          { name: "Concurrency", value: 2, frequency: 28 },
          { name: "Persistence", value: 2, frequency: 25 },
        ],
      },
      {
        name: "Kotlin",
        value: 3,
        frequency: 34,
        children: [
          { name: "Coroutines", value: 3, frequency: 42 },
          { name: "Android UI", value: 3, frequency: 45 },
          { name: "DI", value: 2, frequency: 30 },
          { name: "Testing", value: 1, frequency: 18 },
        ],
      },
    ],
  },
  {
    name: "Cloud",
    value: 15,
    frequency: 48,
    technologies: [
      {
        name: "Google Cloud",
        value: 10,
        frequency: 46,
        children: [
          { name: "Compute", value: 10, frequency: 65 },
          { name: "Storage", value: 8, frequency: 55 },
          { name: "Networking", value: 6, frequency: 42 },
          { name: "IAM", value: 5, frequency: 38 },
          { name: "Monitoring", value: 4, frequency: 30 },
        ],
      },
      {
        name: "Cloudflare",
        value: 8,
        frequency: 44,
        children: [
          { name: "DNS", value: 8, frequency: 62 },
          { name: "Workers", value: 5, frequency: 45 },
          { name: "CDN", value: 7, frequency: 55 },
          { name: "Security", value: 4, frequency: 35 },
          { name: "Analytics", value: 3, frequency: 25 },
        ],
      },
      {
        name: "Vercel",
        value: 12,
        frequency: 53,
        children: [
          { name: "Deployments", value: 12, frequency: 75 },
          { name: "Edge Functions", value: 6, frequency: 42 },
          { name: "Analytics", value: 4, frequency: 30 },
          { name: "Env & Secrets", value: 8, frequency: 55 },
          { name: "Previews", value: 10, frequency: 65 },
        ],
      },
      {
        name: "Redis",
        value: 8,
        frequency: 37,
        children: [
          { name: "Caching", value: 8, frequency: 62 },
          { name: "Pub/Sub", value: 4, frequency: 35 },
          { name: "Streams", value: 2, frequency: 22 },
          { name: "Persistence", value: 3, frequency: 28 },
        ],
      },
    ],
  },
  {
    name: "Testing",
    value: 25,
    frequency: 52,
    technologies: [
      {
        name: "Unit Testing",
        value: 22,
        frequency: 58,
        children: [
          { name: "Jest", value: 20, frequency: 75 },
          { name: "Mocks", value: 16, frequency: 58 },
          { name: "Coverage", value: 14, frequency: 52 },
          { name: "TDD", value: 8, frequency: 38 },
          { name: "Assertions", value: 18, frequency: 65 },
        ],
      },
      {
        name: "E2E Testing",
        value: 12,
        frequency: 50,
        children: [
          { name: "Playwright", value: 10, frequency: 62 },
          { name: "Cypress", value: 6, frequency: 42 },
          { name: "Flows", value: 8, frequency: 50 },
          { name: "CI", value: 7, frequency: 45 },
        ],
      },
      {
        name: "Performance Testing",
        value: 8,
        frequency: 37,
        children: [
          { name: "Lighthouse", value: 8, frequency: 55 },
          { name: "Profiling", value: 5, frequency: 38 },
          { name: "Load", value: 4, frequency: 30 },
          { name: "Optimization", value: 3, frequency: 25 },
        ],
      },
    ],
  },
  {
    name: "Product & Design",
    value: 10,
    frequency: 48,
    technologies: [
      {
        name: "Product Strategy",
        value: 6,
        frequency: 56,
        children: [
          { name: "Vision & Goals", value: 6, frequency: 72 },
          { name: "Roadmapping", value: 5, frequency: 62 },
          { name: "Prioritization", value: 5, frequency: 58 },
          { name: "Metrics", value: 4, frequency: 45 },
          { name: "Stakeholders", value: 4, frequency: 42 },
        ],
      },
      {
        name: "UX Design",
        value: 5,
        frequency: 51,
        children: [
          { name: "User Research", value: 5, frequency: 65 },
          { name: "Information Arch", value: 4, frequency: 50 },
          { name: "Wireframing", value: 5, frequency: 62 },
          { name: "Usability", value: 3, frequency: 42 },
          { name: "Accessibility", value: 3, frequency: 38 },
        ],
      },
      {
        name: "UI Design",
        value: 4,
        frequency: 46,
        children: [
          { name: "Design Systems", value: 4, frequency: 58 },
          { name: "Typography", value: 3, frequency: 42 },
          { name: "Color & Theme", value: 3, frequency: 45 },
          { name: "Components", value: 4, frequency: 55 },
          { name: "Prototyping", value: 2, frequency: 28 },
        ],
      },
      {
        name: "Growth",
        value: 3,
        frequency: 34,
        children: [
          { name: "Onboarding", value: 3, frequency: 48 },
          { name: "Activation", value: 2, frequency: 35 },
          { name: "Retention", value: 2, frequency: 32 },
          { name: "Experimentation", value: 1, frequency: 20 },
        ],
      },
    ],
  },
  {
    name: "Data Engineering",
    value: 8,
    frequency: 42,
    technologies: [
      {
        name: "Pipelines",
        value: 7,
        frequency: 48,
        children: [
          { name: "Batch ETL", value: 7, frequency: 68 },
          { name: "Streaming", value: 5, frequency: 48 },
          { name: "Orchestration", value: 6, frequency: 55 },
          { name: "Data Quality", value: 4, frequency: 40 },
          { name: "Lineage", value: 3, frequency: 28 },
        ],
      },
      {
        name: "Warehousing",
        value: 6,
        frequency: 43,
        children: [
          { name: "Modeling", value: 6, frequency: 62 },
          { name: "Partitioning", value: 4, frequency: 42 },
          { name: "Cost Control", value: 3, frequency: 35 },
          { name: "Query Tuning", value: 5, frequency: 50 },
          { name: "Governance", value: 2, frequency: 25 },
        ],
      },
      {
        name: "Streaming",
        value: 4,
        frequency: 35,
        children: [
          { name: "Kafka", value: 4, frequency: 52 },
          { name: "Flink", value: 2, frequency: 28 },
          { name: "Event Design", value: 3, frequency: 38 },
          { name: "Backfills", value: 2, frequency: 22 },
        ],
      },
      {
        name: "Analytics",
        value: 5,
        frequency: 38,
        children: [
          { name: "Dashboards", value: 5, frequency: 58 },
          { name: "Metric Design", value: 3, frequency: 42 },
          { name: "Self-Serve", value: 2, frequency: 28 },
          { name: "Documentation", value: 2, frequency: 22 },
        ],
      },
    ],
  },
  {
    name: "Security",
    value: 8,
    frequency: 42,
    technologies: [
      {
        name: "App Security",
        value: 8,
        frequency: 55,
        children: [
          { name: "AuthN/AuthZ", value: 8, frequency: 72 },
          { name: "Secure APIs", value: 6, frequency: 58 },
          { name: "Input Validation", value: 7, frequency: 65 },
          { name: "Secrets Mgmt", value: 5, frequency: 45 },
          { name: "Dependency Risk", value: 4, frequency: 35 },
        ],
      },
      {
        name: "Infrastructure",
        value: 5,
        frequency: 42,
        children: [
          { name: "Network Segments", value: 4, frequency: 48 },
          { name: "IAM", value: 5, frequency: 55 },
          { name: "Vuln Scans", value: 3, frequency: 38 },
          { name: "Backups", value: 4, frequency: 45 },
          { name: "Incident Prep", value: 2, frequency: 25 },
        ],
      },
      {
        name: "Compliance",
        value: 4,
        frequency: 35,
        children: [
          { name: "SOC 2", value: 3, frequency: 42 },
          { name: "GDPR", value: 3, frequency: 40 },
          { name: "Risk Reviews", value: 2, frequency: 30 },
          { name: "Policies", value: 2, frequency: 28 },
        ],
      },
      {
        name: "Threat Modeling",
        value: 3,
        frequency: 31,
        children: [
          { name: "Attack Surface", value: 3, frequency: 45 },
          { name: "Abuse Cases", value: 2, frequency: 32 },
          { name: "Mitigations", value: 2, frequency: 28 },
          { name: "Tabletop", value: 1, frequency: 18 },
        ],
      },
    ],
  },
  {
    name: "Leadership",
    value: 6,
    frequency: 52,
    technologies: [
      {
        name: "Team Health",
        value: 6,
        frequency: 63,
        children: [
          { name: "1:1s", value: 6, frequency: 82 },
          { name: "Hiring", value: 4, frequency: 55 },
          { name: "Feedback", value: 5, frequency: 68 },
          { name: "Growth Plans", value: 4, frequency: 50 },
          { name: "Recognition", value: 5, frequency: 62 },
        ],
      },
      {
        name: "Execution",
        value: 5,
        frequency: 55,
        children: [
          { name: "Scoping", value: 5, frequency: 70 },
          { name: "Estimation", value: 4, frequency: 55 },
          { name: "Delivery", value: 5, frequency: 68 },
          { name: "Risk Mgmt", value: 3, frequency: 42 },
          { name: "Postmortems", value: 3, frequency: 38 },
        ],
      },
      {
        name: "Communication",
        value: 5,
        frequency: 54,
        children: [
          { name: "Docs", value: 5, frequency: 65 },
          { name: "Stakeholder Updates", value: 4, frequency: 58 },
          { name: "Decision Logs", value: 3, frequency: 42 },
          { name: "Alignment", value: 4, frequency: 52 },
        ],
      },
      {
        name: "Mentorship",
        value: 4,
        frequency: 45,
        children: [
          { name: "Pairing", value: 4, frequency: 60 },
          { name: "Coaching", value: 3, frequency: 48 },
          { name: "Onboarding", value: 3, frequency: 45 },
          { name: "Community", value: 2, frequency: 28 },
        ],
      },
    ],
  },
];
