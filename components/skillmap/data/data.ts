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
    value: 350,
    technologies: [
      {
        name: "React",
        value: 120,
        children: [
          { name: "Components", value: 22 },
          { name: "Hooks", value: 18 },
          { name: "State & Props", value: 16 },
          { name: "Routing", value: 12 },
          { name: "Context API", value: 10 },
          { name: "Performance", value: 12 },
          { name: "Testing", value: 10 },
        ],
      },
      {
        name: "TypeScript",
        value: 90,
        children: [
          { name: "Types & Interfaces", value: 20 },
          { name: "Generics", value: 15 },
          { name: "Narrowing", value: 12 },
          { name: "Utility Types", value: 12 },
          { name: "TSConfig", value: 10 },
          { name: "Tooling", value: 9 },
        ],
      },
      {
        name: "Next.js",
        value: 80,
        children: [
          { name: "App Router", value: 18 },
          { name: "Data Fetching", value: 16 },
          { name: "Server Actions", value: 12 },
          { name: "API Routes", value: 12 },
          { name: "SEO & Metadata", value: 10 },
          { name: "Deployment", value: 12 },
        ],
      },
      {
        name: "CSS",
        value: 60,
        children: [
          { name: "Layout", value: 18 },
          { name: "Flex & Grid", value: 16 },
          { name: "Animations", value: 10 },
          { name: "Responsive", value: 8 },
          { name: "Sass", value: 8 },
        ],
      },
    ],
  },
  {
    name: "Backend",
    value: 320,
    technologies: [
      {
        name: "Node.js",
        value: 100,
        children: [
          { name: "Express", value: 20 },
          { name: "Authentication", value: 15 },
          { name: "Performance", value: 15 },
          { name: "REST API", value: 18 },
          { name: "Databases", value: 16 },
          { name: "Testing", value: 16 },
        ],
      },
      {
        name: "Python",
        value: 85,
        children: [
          { name: "FastAPI", value: 20 },
          { name: "Data Modeling", value: 15 },
          { name: "Async IO", value: 12 },
          { name: "ETL", value: 14 },
          { name: "Testing", value: 12 },
          { name: "Packaging", value: 12 },
        ],
      },
      {
        name: "GraphQL",
        value: 70,
        children: [
          { name: "Schema Design", value: 20 },
          { name: "Resolvers", value: 15 },
          { name: "Auth", value: 12 },
          { name: "Caching", value: 10 },
          { name: "Federation", value: 13 },
        ],
      },
      {
        name: "PostgreSQL",
        value: 65,
        children: [
          { name: "Schema Design", value: 18 },
          { name: "Indexing", value: 15 },
          { name: "Query Tuning", value: 12 },
          { name: "Migrations", value: 10 },
          { name: "Transactions", value: 10 },
        ],
      },
    ],
  },
  {
    name: "DevOps",
    value: 280,
    technologies: [
      {
        name: "Docker",
        value: 90,
        children: [
          { name: "Images", value: 18 },
          { name: "Compose", value: 14 },
          { name: "Optimization", value: 12 },
          { name: "Security", value: 10 },
          { name: "Registry", value: 12 },
        ],
      },
      {
        name: "Kubernetes",
        value: 75,
        children: [
          { name: "Deployments", value: 20 },
          { name: "Services", value: 15 },
          { name: "Ingress", value: 12 },
          { name: "Helm", value: 12 },
          { name: "Observability", value: 16 },
        ],
      },
      {
        name: "Terraform",
        value: 60,
        children: [
          { name: "Modules", value: 15 },
          { name: "State", value: 12 },
          { name: "Providers", value: 10 },
          { name: "IaC Patterns", value: 12 },
          { name: "CI Integration", value: 11 },
        ],
      },
      {
        name: "CI/CD",
        value: 55,
        children: [
          { name: "Pipelines", value: 16 },
          { name: "Testing", value: 12 },
          { name: "Releases", value: 10 },
          { name: "Secrets", value: 8 },
          { name: "Monitoring", value: 9 },
        ],
      },
    ],
  },
  {
    name: "AI & ML",
    value: 250,
    technologies: [
      {
        name: "Python ML",
        value: 85,
        children: [
          { name: "Pandas", value: 18 },
          { name: "Scikit-Learn", value: 16 },
          { name: "Feature Eng", value: 14 },
          { name: "Model Eval", value: 12 },
          { name: "Pipelines", value: 10 },
        ],
      },
      {
        name: "TensorFlow",
        value: 60,
        children: [
          { name: "Keras", value: 18 },
          { name: "Training", value: 14 },
          { name: "Tuning", value: 12 },
          { name: "Deployment", value: 8 },
          { name: "TF Data", value: 8 },
        ],
      },
      {
        name: "PyTorch",
        value: 55,
        children: [
          { name: "Tensors", value: 16 },
          { name: "Training", value: 14 },
          { name: "Lightning", value: 10 },
          { name: "Deployment", value: 8 },
          { name: "Optimization", value: 7 },
        ],
      },
      {
        name: "LLMs & NLP",
        value: 50,
        children: [
          { name: "Prompting", value: 16 },
          { name: "Fine-tuning", value: 12 },
          { name: "RAG", value: 12 },
          { name: "Evaluation", value: 10 },
        ],
      },
    ],
  },
  {
    name: "Mobile",
    value: 220,
    technologies: [
      {
        name: "React Native",
        value: 80,
        children: [
          { name: "Navigation", value: 18 },
          { name: "State Mgmt", value: 14 },
          { name: "Native Modules", value: 12 },
          { name: "Performance", value: 10 },
          { name: "Testing", value: 8 },
          { name: "UI Components", value: 10 },
        ],
      },
      {
        name: "Flutter",
        value: 60,
        children: [
          { name: "Widgets", value: 18 },
          { name: "State Mgmt", value: 14 },
          { name: "Animations", value: 10 },
          { name: "Platform Channels", value: 10 },
          { name: "Testing", value: 8 },
        ],
      },
      {
        name: "Swift",
        value: 45,
        children: [
          { name: "SwiftUI", value: 14 },
          { name: "Networking", value: 12 },
          { name: "Concurrency", value: 10 },
          { name: "Persistence", value: 9 },
        ],
      },
      {
        name: "Kotlin",
        value: 35,
        children: [
          { name: "Coroutines", value: 10 },
          { name: "Android UI", value: 12 },
          { name: "DI", value: 8 },
          { name: "Testing", value: 5 },
        ],
      },
    ],
  },
  {
    name: "Cloud",
    value: 200,
    technologies: [
      {
        name: "Google Cloud",
        value: 70,
        children: [
          { name: "Compute", value: 18 },
          { name: "Storage", value: 14 },
          { name: "Networking", value: 12 },
          { name: "IAM", value: 10 },
          { name: "Monitoring", value: 10 },
        ],
      },
      {
        name: "Cloudflare",
        value: 55,
        children: [
          { name: "DNS", value: 12 },
          { name: "Workers", value: 12 },
          { name: "CDN", value: 10 },
          { name: "Security", value: 8 },
          { name: "Analytics", value: 6 },
        ],
      },
      {
        name: "Vercel",
        value: 45,
        children: [
          { name: "Deployments", value: 14 },
          { name: "Edge Functions", value: 10 },
          { name: "Analytics", value: 8 },
          { name: "Env & Secrets", value: 6 },
          { name: "Previews", value: 7 },
        ],
      },
      {
        name: "Redis",
        value: 30,
        children: [
          { name: "Caching", value: 10 },
          { name: "Pub/Sub", value: 8 },
          { name: "Streams", value: 6 },
          { name: "Persistence", value: 6 },
        ],
      },
    ],
  },
  {
    name: "Testing",
    value: 150,
    technologies: [
      {
        name: "Unit Testing",
        value: 55,
        children: [
          { name: "Jest", value: 18 },
          { name: "Mocks", value: 12 },
          { name: "Coverage", value: 10 },
          { name: "TDD", value: 8 },
          { name: "Assertions", value: 7 },
        ],
      },
      {
        name: "E2E Testing",
        value: 50,
        children: [
          { name: "Playwright", value: 16 },
          { name: "Cypress", value: 12 },
          { name: "Flows", value: 12 },
          { name: "CI", value: 10 },
        ],
      },
      {
        name: "Performance Testing",
        value: 45,
        children: [
          { name: "Lighthouse", value: 18 },
          { name: "Profiling", value: 12 },
          { name: "Load", value: 10 },
          { name: "Optimization", value: 5 },
        ],
      },
    ],
  },
  {
    name: "Product & Design",
    value: 180,
    technologies: [
      {
        name: "Product Strategy",
        value: 60,
        children: [
          { name: "Vision & Goals", value: 16 },
          { name: "Roadmapping", value: 14 },
          { name: "Prioritization", value: 12 },
          { name: "Metrics", value: 10 },
          { name: "Stakeholders", value: 8 },
        ],
      },
      {
        name: "UX Design",
        value: 55,
        children: [
          { name: "User Research", value: 14 },
          { name: "Information Arch", value: 12 },
          { name: "Wireframing", value: 10 },
          { name: "Usability", value: 10 },
          { name: "Accessibility", value: 9 },
        ],
      },
      {
        name: "UI Design",
        value: 40,
        children: [
          { name: "Design Systems", value: 12 },
          { name: "Typography", value: 8 },
          { name: "Color & Theme", value: 8 },
          { name: "Components", value: 7 },
          { name: "Prototyping", value: 5 },
        ],
      },
      {
        name: "Growth",
        value: 25,
        children: [
          { name: "Onboarding", value: 8 },
          { name: "Activation", value: 7 },
          { name: "Retention", value: 6 },
          { name: "Experimentation", value: 4 },
        ],
      },
    ],
  },
  {
    name: "Data Engineering",
    value: 190,
    technologies: [
      {
        name: "Pipelines",
        value: 70,
        children: [
          { name: "Batch ETL", value: 18 },
          { name: "Streaming", value: 16 },
          { name: "Orchestration", value: 14 },
          { name: "Data Quality", value: 12 },
          { name: "Lineage", value: 10 },
        ],
      },
      {
        name: "Warehousing",
        value: 55,
        children: [
          { name: "Modeling", value: 14 },
          { name: "Partitioning", value: 12 },
          { name: "Cost Control", value: 10 },
          { name: "Query Tuning", value: 9 },
          { name: "Governance", value: 10 },
        ],
      },
      {
        name: "Streaming",
        value: 40,
        children: [
          { name: "Kafka", value: 12 },
          { name: "Flink", value: 10 },
          { name: "Event Design", value: 9 },
          { name: "Backfills", value: 9 },
        ],
      },
      {
        name: "Analytics",
        value: 25,
        children: [
          { name: "Dashboards", value: 8 },
          { name: "Metric Design", value: 7 },
          { name: "Self-Serve", value: 6 },
          { name: "Documentation", value: 4 },
        ],
      },
    ],
  },
  {
    name: "Security",
    value: 170,
    technologies: [
      {
        name: "App Security",
        value: 60,
        children: [
          { name: "AuthN/AuthZ", value: 16 },
          { name: "Secure APIs", value: 14 },
          { name: "Input Validation", value: 12 },
          { name: "Secrets Mgmt", value: 10 },
          { name: "Dependency Risk", value: 8 },
        ],
      },
      {
        name: "Infrastructure",
        value: 45,
        children: [
          { name: "Network Segments", value: 12 },
          { name: "IAM", value: 10 },
          { name: "Vuln Scans", value: 9 },
          { name: "Backups", value: 8 },
          { name: "Incident Prep", value: 6 },
        ],
      },
      {
        name: "Compliance",
        value: 35,
        children: [
          { name: "SOC 2", value: 10 },
          { name: "GDPR", value: 9 },
          { name: "Risk Reviews", value: 8 },
          { name: "Policies", value: 8 },
        ],
      },
      {
        name: "Threat Modeling",
        value: 30,
        children: [
          { name: "Attack Surface", value: 8 },
          { name: "Abuse Cases", value: 8 },
          { name: "Mitigations", value: 7 },
          { name: "Tabletop", value: 7 },
        ],
      },
    ],
  },
  {
    name: "Leadership",
    value: 160,
    technologies: [
      {
        name: "Team Health",
        value: 55,
        children: [
          { name: "1:1s", value: 14 },
          { name: "Hiring", value: 12 },
          { name: "Feedback", value: 10 },
          { name: "Growth Plans", value: 9 },
          { name: "Recognition", value: 10 },
        ],
      },
      {
        name: "Execution",
        value: 50,
        children: [
          { name: "Scoping", value: 14 },
          { name: "Estimation", value: 12 },
          { name: "Delivery", value: 10 },
          { name: "Risk Mgmt", value: 8 },
          { name: "Postmortems", value: 6 },
        ],
      },
      {
        name: "Communication",
        value: 35,
        children: [
          { name: "Docs", value: 10 },
          { name: "Stakeholder Updates", value: 10 },
          { name: "Decision Logs", value: 8 },
          { name: "Alignment", value: 7 },
        ],
      },
      {
        name: "Mentorship",
        value: 20,
        children: [
          { name: "Pairing", value: 6 },
          { name: "Coaching", value: 6 },
          { name: "Onboarding", value: 5 },
          { name: "Community", value: 3 },
        ],
      },
    ],
  },
];
