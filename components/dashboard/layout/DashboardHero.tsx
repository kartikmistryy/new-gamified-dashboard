"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import type { DashboardKey } from "./hooks/useDashboardMeta"

const DEFAULT_AVATAR_SRC = "https://github.com/shadcn.png"
const DEFAULT_AVATAR_FALLBACK = "CN"

export type DashboardHeroProps = {
  dashboard: DashboardKey
  /** Display title for org/team/repo; fallback label used when omitted */
  name?: string
  /** User display name when dashboard === "user"; defaults to "John Doe" */
  userName?: string
  /** Avatar image URL; defaults to shadcn.png */
  avatarSrc?: string
}

function getFallbackDisplayName(dashboard: DashboardKey): string {
  if (dashboard === "repo") return "Repository Name"
  if (dashboard === "team") return "Team Name"
  if (dashboard === "user") return "John Doe"
  return "Organization Name"
}

export default function DashboardHero({
  dashboard,
  name,
  userName,
  avatarSrc = DEFAULT_AVATAR_SRC,
}: DashboardHeroProps) {
  const displayName =
    dashboard === "user"
      ? userName ?? getFallbackDisplayName("user")
      : name ?? getFallbackDisplayName(dashboard)

  return (
    <div className="w-full h-fit flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div className="w-full h-fit flex flex-row lg:items-center items-start gap-3">
        <Avatar className="lg:size-12 size-8 rounded-xl">
          <AvatarImage src={avatarSrc} alt={`${displayName} avatar`} />
          <AvatarFallback>{DEFAULT_AVATAR_FALLBACK}</AvatarFallback>
        </Avatar>
        <span className="w-full h-full flex flex-col gap-2">
          <h1 className="lg:text-4xl text-xl font-bold">{displayName}</h1>
        </span>
      </div>
    </div>
  )
}
