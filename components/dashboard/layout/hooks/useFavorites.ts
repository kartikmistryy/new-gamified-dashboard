import type { FavoriteItem, Organization } from "@/types/sidebar"
import { useMemo, useState, useCallback } from "react"

const createFavoriteKey = (type: string, id: string, orgId: string) =>
  `${type}:${id}:${orgId}`

export function useFavorites(selectedOrg: Organization) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const orgFavorites = useMemo(
    () => favorites.filter((fav) => fav.orgId === selectedOrg.id),
    [favorites, selectedOrg.id]
  )
  const isFavorited = useCallback(
    (type: "team" | "person" | "repo", id: string) =>
      favorites.some(
        (fav) =>
          fav.type === type && fav.id === id && fav.orgId === selectedOrg.id
      ),
    [favorites, selectedOrg.id]
  )
  const toggleFavorite = useCallback(
    (type: "team" | "person" | "repo", id: string) => {
      setFavorites((prev) => {
        const key = createFavoriteKey(type, id, selectedOrg.id)
        const set = new Set(prev.map((f) => createFavoriteKey(f.type, f.id, f.orgId)))
        if (set.has(key)) {
          return prev.filter((f) => createFavoriteKey(f.type, f.id, f.orgId) !== key)
        }
        return [...prev, { type, id, orgId: selectedOrg.id }]
      })
    },
    [selectedOrg.id]
  )
  return { favorites, orgFavorites, isFavorited, toggleFavorite }
}
