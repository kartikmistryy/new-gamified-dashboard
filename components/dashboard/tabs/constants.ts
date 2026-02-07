import type { ProfileTab } from "./types"

export const REPO_DASHBOARD_TABS: Readonly<ProfileTab[]> = [
  { key: "overview", label: "Overview" },
  { key: "performance", label: "Performance" },
  { key: "skillgraph", label: "Skills Graph" },
  { key: "design", label: "Design" },
  { key: "spof", label: "SPOF" },
] as const

export const USER_DASHBOARD_TABS: Readonly<ProfileTab[]> = [
  { key: "overview", label: "Overview" },
  { key: "skillgraph", label: "Skills Graph" },
  { key: "design", label: "Design" },
  { key: "spof", label: "SPOF" },
] as const

export const TEAM_DASHBOARD_TABS: Readonly<ProfileTab[]> = [
  { key: "overview", label: "Overview" },
  { key: "performance", label: "Performance" },
  { key: "design", label: "Design" },
  { key: "skillgraph", label: "Skills Graph" },
  { key: "spof", label: "SPOF" },
] as const

export const ORGANIZATION_DASHBOARD_TABS: Readonly<ProfileTab[]> = [
  { key: "overview", label: "Overview" },
  { key: "performance", label: "Performance" },
  { key: "design", label: "Design" },
  { key: "skillgraph", label: "Skills Graph" },
  { key: "spof", label: "SPOF" },
] as const

export type DashboardType = "team" | "repo" | "user" | "organization"

export const DASHBOARD_TABS: Record<DashboardType, Readonly<ProfileTab[]>> = {
  team: TEAM_DASHBOARD_TABS,
  repo: REPO_DASHBOARD_TABS,
  user: USER_DASHBOARD_TABS,
  organization: ORGANIZATION_DASHBOARD_TABS,
} as const

export const DASHBOARD_BASE_PATHS: Record<DashboardType, string> = {
  team: "/team",
  repo: "/team/repositories",
  user: "/user",
  organization: "/",
} as const
