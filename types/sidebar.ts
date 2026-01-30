import type { LucideIcon } from "lucide-react"

export type Organization = {
  id: string
  name: string
}

export type Team = {
  id: string
  name: string
  avatar: string
  orgId: string
}

export type Repository = {
  id: string
  name: string
  orgId: string
  teamId?: string
}

export type Person = {
  id: string
  name: string
  avatar: string
  orgId: string
  teamId?: string
}

export type FavoriteItem = {
  type: "team" | "person" | "repo"
  id: string
  orgId: string
}

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}
