import type {
  ProfileTabKey,
  ProfileTab,
} from "@/components/dashboard/tabs/types"
import type { DashboardType } from "@/components/dashboard/tabs/constants"
import {
  detectDashboardType as detectDashboardTypeFromRoutes,
  extractRepoId as extractRepoIdFromRoutes,
  extractTeamId,
  extractUserId,
  extractOrgId,
  getOrgPath,
  getTeamPath,
  getUserPath,
  getRepoPath,
} from "@/lib/routes"

export type TabConfig = ProfileTab & {
  href: string
  isActive: boolean
}

export const extractRepoId = extractRepoIdFromRoutes

export const detectDashboardType = (
  pathname?: string | null,
): DashboardType => {
  return detectDashboardTypeFromRoutes(pathname ?? "")
}

const normalizeBasePath = (basePath: string) =>
  basePath === "/" ? "/" : basePath.replace(/\/$/, "")

/**
 * Resolve the active tab key from pathname.
 * For org-scoped routes, the tab is the segment after the context (team/user/repo/org).
 */
export const resolveActiveTab = (
  pathname: string | null,
  basePath: string,
  fallback: ProfileTabKey = "overview",
): ProfileTabKey => {
  if (!pathname) return fallback

  const teamMatch = pathname.match(/^\/org\/[^/]+\/team\/[^/]+(?:\/([^/]+))?/)
  if (teamMatch) return (teamMatch[1] as ProfileTabKey) || fallback

  const userMatch = pathname.match(/^\/org\/[^/]+\/user\/[^/]+(?:\/([^/]+))?/)
  if (userMatch) return (userMatch[1] as ProfileTabKey) || fallback

  const repoMatch = pathname.match(/^\/org\/[^/]+\/repo\/[^/]+(?:\/([^/]+))?/)
  if (repoMatch) return (repoMatch[1] as ProfileTabKey) || fallback

  const orgMatch = pathname.match(/^\/org\/[^/]+(?:\/([^/]+))?/)
  if (orgMatch) {
    const segment = orgMatch[1]
    if (segment && !["team", "user", "repo"].includes(segment)) {
      return (segment as ProfileTabKey) || fallback
    }
    return "overview"
  }

  const normalizedBasePath = normalizeBasePath(basePath)
  if (normalizedBasePath === "/") {
    if (pathname === "/") return fallback
    const segment = pathname.split("/").filter(Boolean)[0]
    return (segment as ProfileTabKey) ?? fallback
  }
  if (pathname === normalizedBasePath || pathname === `${normalizedBasePath}/`) {
    return fallback
  }
  if (pathname.startsWith(`${normalizedBasePath}/`)) {
    const segment = pathname
      .slice(normalizedBasePath.length + 1)
      .split("/")[0]
    return (segment as ProfileTabKey) || fallback
  }
  return fallback
}

/**
 * Build tab configs with href and isActive for each tab.
 */
export const buildTabConfigs = (
  tabs: Readonly<ProfileTab[]>,
  basePath: string,
  activeTab: ProfileTabKey,
  pathname: string | null,
): TabConfig[] => {
  const orgId = extractOrgId(pathname)
  const teamId = extractTeamId(pathname)
  const userId = extractUserId(pathname)
  const repoId = extractRepoIdFromRoutes(pathname)
  const dashboardType = detectDashboardType(pathname)

  return tabs.map((tab) => {
    let href: string

    if (orgId) {
      const tabKey = tab.key === "overview" ? undefined : tab.key
      if (dashboardType === "team" && teamId) {
        href = getTeamPath(orgId, teamId, tabKey)
      } else if (dashboardType === "user" && userId) {
        href = getUserPath(orgId, userId, tabKey)
      } else if (dashboardType === "repo" && repoId) {
        href = getRepoPath(orgId, repoId, tabKey)
      } else {
        href = getOrgPath(orgId, tabKey)
      }
    } else {
      const normalizedBasePath = normalizeBasePath(basePath)
      href =
        tab.key === "overview"
          ? normalizedBasePath
          : `${normalizedBasePath === "/" ? "" : normalizedBasePath}/${tab.key}`
    }

    return {
      ...tab,
      href,
      isActive: tab.key === activeTab,
    }
  })
}
