import type { Team } from "@/types/sidebar"

export const teamsByOrg: Record<string, Team[]> = {
  gitroll: [
    { id: "frontend", name: "Frontend", avatar: "https://github.com/shadcn.png", orgId: "gitroll" },
    { id: "backend", name: "Backend", avatar: "https://github.com/shadcn.png", orgId: "gitroll" },
    { id: "platform", name: "Platform", avatar: "https://github.com/shadcn.png", orgId: "gitroll" },
    { id: "mobile", name: "Mobile", avatar: "https://github.com/shadcn.png", orgId: "gitroll" },
    { id: "infra", name: "Infrastructure", avatar: "https://github.com/shadcn.png", orgId: "gitroll" },
    { id: "design", name: "Design", avatar: "https://github.com/shadcn.png", orgId: "gitroll" },
  ],
  acme: [
    { id: "eng", name: "Engineering", avatar: "https://github.com/shadcn.png", orgId: "acme" },
    { id: "product", name: "Product", avatar: "https://github.com/shadcn.png", orgId: "acme" },
    { id: "data", name: "Data Science", avatar: "https://github.com/shadcn.png", orgId: "acme" },
    { id: "security", name: "Security", avatar: "https://github.com/shadcn.png", orgId: "acme" },
  ],
  techcorp: [
    { id: "core", name: "Core", avatar: "https://github.com/shadcn.png", orgId: "techcorp" },
    { id: "growth", name: "Growth", avatar: "https://github.com/shadcn.png", orgId: "techcorp" },
  ],
}
