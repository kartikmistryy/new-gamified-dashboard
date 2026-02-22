import type { Repository } from "@/types/sidebar"

export const repositoriesByOrg: Record<string, Repository[]> = {
  gitroll: [
    { id: "browser-sdk", name: "browser-sdk", orgId: "gitroll" },
    { id: "datadog-agent", name: "datadog-agent", orgId: "gitroll" },
    { id: "datadog-api-client-go", name: "datadog-api-client-go", orgId: "gitroll" },
    { id: "dd-sdk-android", name: "dd-sdk-android", orgId: "gitroll" },
    { id: "dd-trace-dotnet", name: "dd-trace-dotnet", orgId: "gitroll" },
    { id: "dd-trace-java", name: "dd-trace-java", orgId: "gitroll" },
    { id: "dd-trace-js", name: "dd-trace-js", orgId: "gitroll" },
    { id: "dd-trace-py", name: "dd-trace-py", orgId: "gitroll" },
    { id: "dd-trace-rb", name: "dd-trace-rb", orgId: "gitroll" },
    { id: "integrations-core", name: "integrations-core", orgId: "gitroll" },
    { id: "libdatadog", name: "libdatadog", orgId: "gitroll" },
    { id: "system-tests", name: "system-tests", orgId: "gitroll" },
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
