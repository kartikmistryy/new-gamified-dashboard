"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import {
  detectDashboardType,
  extractOrgId,
  extractTeamId,
  extractUserId,
  extractRepoId,
  getOrgPath,
  getTeamPath,
  getUserPath,
  getRepoPath,
} from "@/lib/routes"

export type DashboardKey = "team" | "user" | "repo" | "organization"

export type BreadcrumbItem = { label: string; href: string }

const ROUTE_LABELS: Record<string, string> = {
  activity: "Activity",
  risks: "Risks",
  code: "Code",
  skills: "Skills",
  quality: "Quality",
  repositories: "Repositories",
  network: "Network",
  people: "People",
  teams: "Teams",
  logs: "Logs",
  overall: "Overall",
  benchmark: "Benchmark",
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function useDashboardMeta() {
  const pathname = usePathname()
  const dashboardKey = useMemo<DashboardKey>(
    () => detectDashboardType(pathname ?? ""),
    [pathname]
  )
  const routeParams = useMemo(
    () => ({
      orgId: extractOrgId(pathname),
      teamId: extractTeamId(pathname),
      userId: extractUserId(pathname),
      repoId: extractRepoId(pathname),
    }),
    [pathname]
  )

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const { orgId, teamId, userId, repoId } = routeParams
    const items: BreadcrumbItem[] = []
    if (!orgId) {
      items.push({ label: "Home", href: "/" })
      return items
    }
    items.push({ label: orgId, href: getOrgPath(orgId) })
    if (dashboardKey === "organization") {
      const match = pathname?.match(/^\/org\/[^/]+\/([^/]+)/)
      if (match) {
        const sub = match[1]
        if (!["team", "user", "repo"].includes(sub)) {
          items.push({
            label: ROUTE_LABELS[sub] ?? capitalize(sub),
            href: getOrgPath(orgId, sub),
          })
        }
      }
      return items
    }
    if (dashboardKey === "team" && teamId) {
      items.push({ label: "team", href: getOrgPath(orgId, "teams") })
      items.push({ label: teamId, href: getTeamPath(orgId, teamId) })
      const match = pathname?.match(/^\/org\/[^/]+\/team\/[^/]+\/([^/]+)/)
      if (match)
        items.push({
          label: ROUTE_LABELS[match[1]] ?? capitalize(match[1]),
          href: getTeamPath(orgId, teamId, match[1]),
        })
      return items
    }
    if (dashboardKey === "user" && userId) {
      items.push({ label: "user", href: getOrgPath(orgId, "people") })
      items.push({ label: userId, href: getUserPath(orgId, userId) })
      const match = pathname?.match(/^\/org\/[^/]+\/user\/[^/]+\/([^/]+)/)
      if (match)
        items.push({
          label: ROUTE_LABELS[match[1]] ?? capitalize(match[1]),
          href: getUserPath(orgId, userId, match[1]),
        })
      return items
    }
    if (dashboardKey === "repo" && repoId) {
      items.push({ label: "repo", href: getOrgPath(orgId, "repositories") })
      items.push({ label: repoId, href: getRepoPath(orgId, repoId) })
      const match = pathname?.match(/^\/org\/[^/]+\/repo\/[^/]+\/([^/]+)/)
      if (match)
        items.push({
          label: ROUTE_LABELS[match[1]] ?? capitalize(match[1]),
          href: getRepoPath(orgId, repoId, match[1]),
        })
      return items
    }
    return items
  }, [pathname, dashboardKey, routeParams])

  return { pathname, dashboardKey, breadcrumbItems, ...routeParams }
}
