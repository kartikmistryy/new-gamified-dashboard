import type { FavoriteItem, Organization } from "@/types/sidebar"
import { useMemo, useState, useCallback, useEffect } from "react"

const createFavoriteKey = (type: string, id: string, orgId: string) =>
  `${type}:${id}:${orgId}`

export function useFavorites(selectedOrg: Organization) {
  // const [favorites, setFavorites] = useState<FavoriteItem[]>(JSON.parse(localStorage.getItem("favorites") ?? "[]") as FavoriteItem[])
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    if(typeof window === "undefined") return []
    return (JSON.parse(localStorage.getItem("favorites") ?? "[]") as FavoriteItem[])
  })
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
        const newFavorites = [...prev]
        const key = createFavoriteKey(type, id, selectedOrg.id)
        const set = new Set(newFavorites.map((f) => createFavoriteKey(f.type, f.id, f.orgId)))
        const filteredFavorites = newFavorites.filter((f) => createFavoriteKey(f.type, f.id, f.orgId) !== key)
        if (set.has(key)) {
          return filteredFavorites
        }
        const newFavorite = [...newFavorites, { type, id, orgId: selectedOrg.id }]
        return newFavorite
      })
    },
    [selectedOrg.id]
  )

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  return { favorites, orgFavorites, isFavorited, toggleFavorite }
}
