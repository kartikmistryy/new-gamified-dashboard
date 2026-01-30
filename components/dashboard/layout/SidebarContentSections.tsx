"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Users, User, FolderOpen } from "lucide-react"
import { SidebarSection } from "./SidebarSection"
import { SidebarListItem } from "./SidebarListItem"
import { FavoritesList } from "@/components/dashboard/layout/FavoritesList"
import { SIDEBAR_DISPLAY_LIMITS } from "./constants"
import { getTeamPath, getUserPath, getRepoPath, getOrgPath } from "@/lib/routes"
import type { Team, Person, Repository, FavoriteItem } from "@/types/sidebar"

interface SidebarContentSectionsProps {
  orgId: string
  allTeams: Team[]
  allPeople: Person[]
  allRepositories: Repository[]
  people: Person[]
  repositories: Repository[]
  visibleTeams: Team[]
  visiblePeople: Person[]
  visibleRepos: Repository[]
  showAllTeams: boolean
  showAllRepos: boolean
  showAllPeople: boolean
  onToggleShowAllTeams: () => void
  onToggleShowAllRepos: () => void
  onToggleShowAllPeople: () => void
  orgFavorites: FavoriteItem[]
  teamId?: string | null
  userId?: string | null
  repoId?: string | null
  isFavorited: (type: "team" | "person" | "repo", id: string) => boolean
  toggleFavorite: (type: "team" | "person" | "repo", id: string) => void
}

export function SidebarContentSections({
  orgId,
  allTeams,
  allPeople,
  allRepositories,
  people,
  repositories,
  visibleTeams,
  visiblePeople,
  visibleRepos,
  showAllTeams,
  showAllRepos,
  showAllPeople,
  onToggleShowAllTeams,
  onToggleShowAllRepos,
  onToggleShowAllPeople,
  orgFavorites,
  teamId,
  userId,
  repoId,
  isFavorited,
  toggleFavorite,
}: SidebarContentSectionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isTeamsExpanded, setIsTeamsExpanded] = React.useState(true)
  const [isPeopleExpanded, setIsPeopleExpanded] = React.useState(true)
  const [isReposExpanded, setIsReposExpanded] = React.useState(true)

  const handleBack = () => router.push(getOrgPath(orgId))

  const highlightedSection = React.useMemo(() => {
    if (!pathname) return null
    const match = pathname.match(/^\/org\/[^/]+\/(teams|people|repositories)(?:\/|$)/)
    return match ? match[1] : null
  }, [pathname])

  return (
    <div className="flex flex-col gap-0">
      {orgFavorites.length > 0 && (
        <FavoritesList
          favorites={orgFavorites}
          allTeams={allTeams}
          allPeople={allPeople}
          allRepositories={allRepositories}
          orgId={orgId}
          activeIds={{
            teamId: teamId ?? undefined,
            userId: userId ?? undefined,
            repoId: repoId ?? undefined,
          }}
          onToggleFavorite={toggleFavorite}
          onBack={(path: string) => router.push(path)}
          isFavorited={isFavorited}
        />
      )}
      <SidebarSection
        title="Teams"
        icon={Users}
        items={allTeams}
        visibleItems={visibleTeams}
        showAll={showAllTeams}
        onToggleShowAll={onToggleShowAllTeams}
        showMoreThreshold={SIDEBAR_DISPLAY_LIMITS.TEAMS}
        isExpanded={isTeamsExpanded}
        onToggleExpand={() => setIsTeamsExpanded((prev) => !prev)}
        headingHref={getOrgPath(orgId, "teams")}
        isHighlighted={highlightedSection === "teams"}
        getKey={(team) => team.id}
        renderItem={(team, opts) => (
          <SidebarListItem
            type="team"
            id={team.id}
            name={team.name}
            avatar={team.avatar}
            href={getTeamPath(orgId, team.id)}
            isActive={teamId === team.id}
            isFavorited={isFavorited("team", team.id)}
            onToggleFavorite={() => toggleFavorite("team", team.id)}
            showBackButton={teamId === team.id}
            onBack={handleBack}
            contentOnly={opts?.contentOnly}
          />
        )}
      />
      <SidebarSection
        title="People"
        icon={User}
        items={people}
        visibleItems={visiblePeople}
        showAll={showAllPeople}
        onToggleShowAll={onToggleShowAllPeople}
        showMoreThreshold={SIDEBAR_DISPLAY_LIMITS.PEOPLE}
        emptyMessage="No people available"
        isExpanded={isPeopleExpanded}
        onToggleExpand={() => setIsPeopleExpanded((prev) => !prev)}
        headingHref={getOrgPath(orgId, "people")}
        isHighlighted={highlightedSection === "people"}
        getKey={(person) => person.id}
        renderItem={(person, opts) => (
          <SidebarListItem
            type="person"
            id={person.id}
            name={person.name}
            avatar={person.avatar}
            href={getUserPath(orgId, person.id)}
            isActive={userId === person.id}
            isFavorited={isFavorited("person", person.id)}
            onToggleFavorite={() => toggleFavorite("person", person.id)}
            showBackButton={userId === person.id}
            onBack={handleBack}
            contentOnly={opts?.contentOnly}
          />
        )}
      />
      <SidebarSection
        title="Repositories"
        icon={FolderOpen}
        items={repositories}
        visibleItems={visibleRepos}
        showAll={showAllRepos}
        onToggleShowAll={onToggleShowAllRepos}
        showMoreThreshold={SIDEBAR_DISPLAY_LIMITS.REPOSITORIES}
        emptyMessage="No repositories available"
        isExpanded={isReposExpanded}
        onToggleExpand={() => setIsReposExpanded((prev) => !prev)}
        headingHref={getOrgPath(orgId, "repositories")}
        isHighlighted={highlightedSection === "repositories"}
        getKey={(repo) => repo.id}
        renderItem={(repo, opts) => (
          <SidebarListItem
            type="repo"
            id={repo.id}
            name={repo.name}
            href={getRepoPath(orgId, repo.id)}
            isActive={repoId === repo.id}
            isFavorited={isFavorited("repo", repo.id)}
            onToggleFavorite={() => toggleFavorite("repo", repo.id)}
            showBackButton={repoId === repo.id}
            onBack={handleBack}
            contentOnly={opts?.contentOnly}
          />
        )}
      />
    </div>
  )
}
