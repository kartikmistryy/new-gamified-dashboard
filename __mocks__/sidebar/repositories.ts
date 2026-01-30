import type { Repository } from "@/types/sidebar"

export const repositoriesByOrg: Record<string, Repository[]> = {
  gitroll: [
    { id: "web-app", name: "web-app", orgId: "gitroll", teamId: "frontend" },
    { id: "api", name: "api", orgId: "gitroll", teamId: "backend" },
    { id: "mobile-sdk", name: "mobile-sdk", orgId: "gitroll", teamId: "mobile" },
    { id: "design-system", name: "design-system", orgId: "gitroll", teamId: "design" },
    { id: "terraform-modules", name: "terraform-modules", orgId: "gitroll", teamId: "infra" },
    { id: "docs", name: "docs", orgId: "gitroll", teamId: "platform" },
  ],
  acme: [
    { id: "monorepo", name: "monorepo", orgId: "acme" },
    { id: "acme-api", name: "acme-api", orgId: "acme", teamId: "eng" },
    { id: "analytics-pipeline", name: "analytics-pipeline", orgId: "acme", teamId: "data" },
    { id: "acme-web", name: "acme-web", orgId: "acme", teamId: "eng" },
    { id: "vault-config", name: "vault-config", orgId: "acme", teamId: "security" },
  ],
  techcorp: [
    { id: "techcorp-core", name: "techcorp-core", orgId: "techcorp", teamId: "core" },
    { id: "landing", name: "landing", orgId: "techcorp", teamId: "growth" },
    { id: "experiments", name: "experiments", orgId: "techcorp", teamId: "growth" },
  ],
}
