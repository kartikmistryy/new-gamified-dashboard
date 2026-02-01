export function getOrgPath(orgId: string, tab?: string): string {
  const base = `/org/${orgId}`
  return tab ? `${base}/${tab}` : base
}

export function getTeamPath(orgId: string, teamId: string, tab?: string): string {
  const base = `/org/${orgId}/team/${teamId}`
  return tab ? `${base}/${tab}` : base
}

export function getUserPath(orgId: string, userId: string, tab?: string): string {
  const base = `/org/${orgId}/user/${userId}`
  return tab ? `${base}/${tab}` : base
}

export function getRepoPath(orgId: string, repoId: string, tab?: string): string {
  const base = `/org/${orgId}/repo/${repoId}`
  return tab ? `${base}/${tab}` : base
}

export function extractOrgId(pathname: string | null | undefined): string | null {
  if (!pathname) return null
  const match = pathname.match(/^\/org\/([^/]+)/)
  return match ? match[1] : null
}

export function extractTeamId(pathname: string | null | undefined): string | null {
  if (!pathname) return null
  const match = pathname.match(/^\/org\/[^/]+\/team\/([^/]+)/)
  return match ? match[1] : null
}

export function extractUserId(pathname: string | null | undefined): string | null {
  if (!pathname) return null
  const match = pathname.match(/^\/org\/[^/]+\/user\/([^/]+)/)
  return match ? match[1] : null
}

export function extractRepoId(pathname: string | null | undefined): string | null {
  if (!pathname) return null
  const match = pathname.match(/^\/org\/[^/]+\/repo\/([^/]+)/)
  return match ? match[1] : null
}

export type DashboardType = "organization" | "team" | "user" | "repo"

export function detectDashboardType(pathname: string): DashboardType {
  if (/^\/org\/[^/]+\/user\/[^/]+/.test(pathname)) return "user"
  if (/^\/org\/[^/]+\/repo\/[^/]+/.test(pathname)) return "repo"
  if (/^\/org\/[^/]+\/team\/[^/]+/.test(pathname)) return "team"
  if (/^\/org\/[^/]+/.test(pathname)) return "organization"
  return "organization"
}

export function isRepoDetailPage(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return /^\/org\/[^/]+\/repo\/[^/]+/.test(pathname)
}
