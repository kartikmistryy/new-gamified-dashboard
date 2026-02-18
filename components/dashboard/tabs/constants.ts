import type { ProfileTab } from "./types"

export const REPO_DASHBOARD_TABS: Readonly<ProfileTab[]> = [
  { key: "overview", label: "Overview" },
  { key: "performance", label: "Performance" },
  { key: "spof", label: "SPOF" },
  { key: "outliers", label: "Outliers" },
  { key: "skillgraph", label: "SkillsGraph" },
] as const

export const USER_DASHBOARD_TABS: Readonly<ProfileTab[]> = [
  { key: "performance", label: "Performance" },
  { key: "skillgraph", label: "SkillsGraph" },
  { key: "spof", label: "SPOF" },
] as const

export const TEAM_DASHBOARD_TABS: Readonly<ProfileTab[]> = [
  { key: "overview", label: "Overview" },
  { key: "performance", label: "Performance" },
  { key: "spof", label: "SPOF" },
  { key: "outliers", label: "Outliers" },
  { key: "skillgraph", label: "SkillsGraph" },
] as const

export const ORGANIZATION_DASHBOARD_TABS: Readonly<ProfileTab[]> = [
  { key: "overview", label: "Overview" },
  { key: "performance", label: "Performance" },
  { key: "spof", label: "SPOF" },
  { key: "outliers", label: "Outliers" },
  { key: "skillgraph", label: "SkillsGraph" },
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
  repo: "/repository",
  user: "/user",
  organization: "/",
} as const
