"use client"

import * as React from "react"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { organizations } from "@/__mocks__/sidebar/organizations"
import DashboardHeader from "./DashboardHeader"
import useDashboardMeta from "./hooks/useDashboardMeta"
import { useSidebarData, useVisibleItems, useSidebarVisibility } from "./hooks/useSidebarData"
import { useFavorites } from "./hooks/useFavorites"
import { OrganizationSwitcher } from "./OrganizationSwitcher"
import { MainNavigation } from "./MainNavigation"
import { SidebarContentSections } from "./SidebarContentSections"
import { UserFooter } from "./UserFooter"
import { SIDEBAR_DISPLAY_LIMITS } from "./constants"
import type { Organization } from "@/types/sidebar"

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const { breadcrumbItems, teamId, userId, repoId } = useDashboardMeta()
  const [selectedOrg, setSelectedOrg] = useState<Organization>(() => {
    if (organizations.length === 0) throw new Error("No organizations available.")
    return organizations[0]
  })

  const { allTeams, allRepositories, allPeople, repositories, people } =
    useSidebarData(selectedOrg)
  const {
    showAllTeams,
    setShowAllTeams,
    showAllRepos,
    setShowAllRepos,
    showAllPeople,
    setShowAllPeople,
    resetVisibility,
  } = useSidebarVisibility()

  React.useEffect(() => {
    resetVisibility()
  }, [selectedOrg.id, resetVisibility])

  const { orgFavorites, isFavorited, toggleFavorite } = useFavorites(selectedOrg)
  const visibleTeams = useVisibleItems(allTeams, showAllTeams, SIDEBAR_DISPLAY_LIMITS.TEAMS)
  const visibleRepos = useVisibleItems(
    repositories,
    showAllRepos,
    SIDEBAR_DISPLAY_LIMITS.REPOSITORIES
  )
  const visiblePeople = useVisibleItems(people, showAllPeople, SIDEBAR_DISPLAY_LIMITS.PEOPLE)

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="offcanvas" className="bg-white">
        <OrganizationSwitcher selectedOrg={selectedOrg} onSelectOrg={setSelectedOrg} />
        <SidebarContent className="flex flex-col gap-0 overflow-hidden py-0 bg-white">
          <div className="shrink-0">
            <MainNavigation />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pt-2">
            <SidebarContentSections
              orgId={selectedOrg.id}
              allTeams={allTeams}
              allPeople={allPeople}
              allRepositories={allRepositories}
              people={people}
              repositories={repositories}
              visibleTeams={visibleTeams}
              visiblePeople={visiblePeople}
              visibleRepos={visibleRepos}
              showAllTeams={showAllTeams}
              showAllRepos={showAllRepos}
              showAllPeople={showAllPeople}
              onToggleShowAllTeams={() => setShowAllTeams(!showAllTeams)}
              onToggleShowAllRepos={() => setShowAllRepos(!showAllRepos)}
              onToggleShowAllPeople={() => setShowAllPeople(!showAllPeople)}
              orgFavorites={orgFavorites}
              teamId={teamId}
              userId={userId}
              repoId={repoId}
              isFavorited={isFavorited}
              toggleFavorite={toggleFavorite}
            />
          </div>
        </SidebarContent>
        <UserFooter people={people} />
      </Sidebar>
      <SidebarInset className="p-0">
        <header className="flex h-14 items-center gap-4 px-6 border-b bg-white">
          <SidebarTrigger />
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
        </header>
        <main className="flex flex-1 flex-col bg-white">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
