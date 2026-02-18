import { useMemo, useState, useCallback } from "react"
import type { Organization } from "@/types/sidebar"
import { teamsByOrg } from "@/__mocks__/sidebar/teams"
import { repositoriesByOrg } from "@/__mocks__/sidebar/repositories"
import { peopleByOrg } from "@/__mocks__/sidebar/people"

export function useSidebarData(_selectedOrg: Organization) {
  const allTeams = useMemo(() => teamsByOrg["gitroll"] ?? [], [])
  const allRepositories = useMemo(() => repositoriesByOrg["gitroll"] ?? [], [])
  const allPeople = useMemo(() => peopleByOrg["gitroll"] ?? [], [])
  return {
    allTeams,
    allRepositories,
    allPeople,
    repositories: allRepositories,
    people: allPeople,
  }
}

export function useVisibleItems<T>(items: T[], showAll: boolean, limit: number) {
  return useMemo(() => (showAll ? items : items.slice(0, limit)), [items, showAll, limit])
}

export function useSidebarVisibility() {
  const [showAllTeams, setShowAllTeams] = useState(false)
  const [showAllRepos, setShowAllRepos] = useState(false)
  const [showAllPeople, setShowAllPeople] = useState(false)
  const resetVisibility = useCallback(() => {
    setShowAllTeams(false)
    setShowAllRepos(false)
    setShowAllPeople(false)
  }, [])
  return {
    showAllTeams,
    setShowAllTeams,
    showAllRepos,
    setShowAllRepos,
    showAllPeople,
    setShowAllPeople,
    resetVisibility,
  }
}
