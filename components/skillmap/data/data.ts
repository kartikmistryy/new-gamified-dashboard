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
];
