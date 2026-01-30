"use client"

import * as React from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { SidebarHighlight, SidebarHighlightItem } from "./SidebarHighlight"
import { SidebarListItem } from "./SidebarListItem"
import { getTeamPath, getUserPath, getRepoPath, getOrgPath } from "@/lib/routes"
import type { FavoriteItem, Team, Person, Repository } from "@/types/sidebar"

interface FavoritesListProps {
  favorites: FavoriteItem[]
  allTeams: Team[]
  allPeople: Person[]
  allRepositories: Repository[]
  orgId: string
  activeIds: { teamId?: string; userId?: string; repoId?: string }
  onToggleFavorite: (type: "team" | "person" | "repo", id: string) => void
  onBack: (path: string) => void
  isFavorited: (type: "team" | "person" | "repo", id: string) => boolean
}

export function FavoritesList({
  favorites,
  allTeams,
  allPeople,
  allRepositories,
  orgId,
  activeIds,
  onToggleFavorite,
  onBack,
  isFavorited,
}: FavoritesListProps) {
  const handleBack = React.useCallback(() => onBack(getOrgPath(orgId)), [onBack, orgId])

  return (
    <SidebarGroup className="bg-white">
      <SidebarGroupLabel className="px-2 text-sm font-semibold text-gray-700 h-10">
        Favorites
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarHighlight className="relative">
          <SidebarMenu className="gap-0">
            {favorites.map((fav) => {
              if (fav.type === "team") {
                const team = allTeams.find((t) => t.id === fav.id)
                if (!team) return null
                return (
                  <SidebarHighlightItem
                    key={`team-${fav.id}`}
                    as="li"
                    className="group/menu-item relative"
                  >
                    <SidebarListItem
                      type="team"
                      id={team.id}
                      name={team.name}
                      avatar={team.avatar}
                      href={getTeamPath(orgId, team.id)}
                      isActive={activeIds.teamId === team.id}
                      isFavorited={isFavorited("team", team.id)}
                      onToggleFavorite={() => onToggleFavorite("team", team.id)}
                      showBackButton={activeIds.teamId === team.id}
                      onBack={handleBack}
                      contentOnly
                    />
                  </SidebarHighlightItem>
                )
              }
              if (fav.type === "person") {
                const person = allPeople.find((p) => p.id === fav.id)
                if (!person) return null
                return (
                  <SidebarHighlightItem
                    key={`person-${fav.id}`}
                    as="li"
                    className="group/menu-item relative"
                  >
                    <SidebarListItem
                      type="person"
                      id={person.id}
                      name={person.name}
                      avatar={person.avatar}
                      href={getUserPath(orgId, person.id)}
                      isActive={activeIds.userId === person.id}
                      isFavorited={isFavorited("person", person.id)}
                      onToggleFavorite={() => onToggleFavorite("person", person.id)}
                      showBackButton={activeIds.userId === person.id}
                      onBack={handleBack}
                      contentOnly
                    />
                  </SidebarHighlightItem>
                )
              }
              if (fav.type === "repo") {
                const repo = allRepositories.find((r) => r.id === fav.id)
                if (!repo) return null
                return (
                  <SidebarHighlightItem
                    key={`repo-${fav.id}`}
                    as="li"
                    className="group/menu-item relative"
                  >
                    <SidebarListItem
                      type="repo"
                      id={repo.id}
                      name={repo.name}
                      href={getRepoPath(orgId, repo.id)}
                      isActive={activeIds.repoId === repo.id}
                      isFavorited={isFavorited("repo", repo.id)}
                      onToggleFavorite={() => onToggleFavorite("repo", repo.id)}
                      showBackButton={activeIds.repoId === repo.id}
                      onBack={handleBack}
                      contentOnly
                    />
                  </SidebarHighlightItem>
                )
              }
              return null
            })}
          </SidebarMenu>
        </SidebarHighlight>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
