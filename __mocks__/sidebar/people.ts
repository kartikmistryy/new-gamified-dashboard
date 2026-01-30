import type { Person } from "@/types/sidebar"

export const peopleByOrg: Record<string, Person[]> = {
  gitroll: [
    { id: "alice", name: "Alice", avatar: "https://github.com/shadcn.png", orgId: "gitroll", teamId: "frontend" },
    { id: "bob", name: "Bob", avatar: "https://github.com/shadcn.png", orgId: "gitroll", teamId: "backend" },
    { id: "charlie", name: "Charlie", avatar: "https://github.com/shadcn.png", orgId: "gitroll", teamId: "platform" },
    { id: "diana", name: "Diana", avatar: "https://github.com/shadcn.png", orgId: "gitroll", teamId: "mobile" },
    { id: "eve", name: "Eve", avatar: "https://github.com/shadcn.png", orgId: "gitroll", teamId: "design" },
    { id: "frank", name: "Frank", avatar: "https://github.com/shadcn.png", orgId: "gitroll", teamId: "infra" },
    { id: "grace", name: "Grace", avatar: "https://github.com/shadcn.png", orgId: "gitroll", teamId: "frontend" },
  ],
  acme: [
    { id: "carol", name: "Carol", avatar: "https://github.com/shadcn.png", orgId: "acme", teamId: "eng" },
    { id: "henry", name: "Henry", avatar: "https://github.com/shadcn.png", orgId: "acme", teamId: "product" },
    { id: "iris", name: "Iris", avatar: "https://github.com/shadcn.png", orgId: "acme", teamId: "data" },
    { id: "james", name: "James", avatar: "https://github.com/shadcn.png", orgId: "acme", teamId: "security" },
    { id: "kate", name: "Kate", avatar: "https://github.com/shadcn.png", orgId: "acme", teamId: "eng" },
  ],
  techcorp: [
    { id: "leo", name: "Leo", avatar: "https://github.com/shadcn.png", orgId: "techcorp", teamId: "core" },
    { id: "maya", name: "Maya", avatar: "https://github.com/shadcn.png", orgId: "techcorp", teamId: "growth" },
    { id: "nathan", name: "Nathan", avatar: "https://github.com/shadcn.png", orgId: "techcorp", teamId: "core" },
  ],
}
