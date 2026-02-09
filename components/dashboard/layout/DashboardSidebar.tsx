"use client"

import * as React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { organizations } from "@/__mocks__/sidebar/organizations"
import DashboardHeader from "./DashboardHeader"
import DashboardHero from "./DashboardHero"
import DashboardTabs from "./DashboardTabs"
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
  const pathname = usePathname()
  const { breadcrumbItems, dashboardKey, teamId, userId, repoId } = useDashboardMeta()
  const showDashboardTabs = pathname?.startsWith("/org/") ?? false
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

  const heroDisplayName = React.useMemo(() => {
    if (dashboardKey === "organization") return selectedOrg.name
    if (dashboardKey === "team" && teamId)
      return allTeams.find((t) => t.id === teamId)?.name
    if (dashboardKey === "user" && userId)
      return people.find((p) => p.id === userId)?.name
    if (dashboardKey === "repo" && repoId)
      return repositories.find((r) => r.id === repoId)?.name
    return undefined
  }, [dashboardKey, selectedOrg.name, teamId, userId, repoId, allTeams, people, repositories])
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
      <SidebarInset className="min-w-0 overflow-x-hidden p-0">
        <header className="flex h-14 min-w-0 items-center gap-4 border-b bg-white px-4">
          <SidebarTrigger />
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
        </header>
        <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden bg-white">
          <div className="px-4 pt-4">
            <DashboardHero
              dashboard={dashboardKey}
              name={heroDisplayName}
              userName={dashboardKey === "user" ? heroDisplayName : undefined}
              avatarSrc={
                dashboardKey === "user"
                  ? people.find((p) => p.id === userId)?.avatar
                  : dashboardKey === "team"
                    ? allTeams.find((t) => t.id === teamId)?.avatar
                    : undefined
              }
            />
          </div>
          {showDashboardTabs && (
            <div className="px-4 pb-2">
              <DashboardTabs />
            </div>
          )}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
