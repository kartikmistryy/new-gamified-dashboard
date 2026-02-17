import type { Repository } from "@/types/sidebar"

export const repositoriesByOrg: Record<string, Repository[]> = {
  gitroll: [
    { id: "novu", name: "novu", orgId: "gitroll" },
    { id: "transformers", name: "transformers", orgId: "gitroll" },
    { id: "langchain", name: "langchain", orgId: "gitroll" },
    { id: "langfuse", name: "langfuse", orgId: "gitroll" },
    { id: "rustdesk", name: "rustdesk", orgId: "gitroll" },
    { id: "twenty", name: "twenty", orgId: "gitroll" },
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
