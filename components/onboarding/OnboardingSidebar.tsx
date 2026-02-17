"use client"

import * as React from "react"
import { Home as HomeIcon, MapPin, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Static sidebar shown during onboarding import.
// Renders only the main nav links — no repos, people, or org switcher.
// Mirrors the visual language of DashboardSidebar without dynamic data.
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { title: "Home", icon: HomeIcon, href: "/" },
  { title: "Skill Maps", icon: MapPin, href: "/skillmaps" },
  { title: "Ask AI", icon: Sparkles, href: "#" },
] as const

interface OnboardingSidebarProps {
  /** Width class; defaults to w-[--sidebar-width] matching shadcn sidebar */
  className?: string
}

export function OnboardingSidebar({ className }: OnboardingSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen w-[240px] flex-shrink-0",
        "border-r border-gray-100 bg-white",
        className
      )}
      aria-label="Main navigation"
    >
      {/* Org header — static placeholder matching OrganizationSwitcher shape */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-100">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-white text-xs font-bold select-none">
          G
        </div>
        <span className="font-semibold text-sm text-gray-900 truncate">GitRoll</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0 py-2 px-2" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className={cn(
              "flex items-center gap-2 h-10 px-2 rounded-md",
              "text-sm font-medium text-gray-900",
              "transition-colors duration-100",
              "hover:bg-gray-50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            )}
            aria-label={item.title}
          >
            <item.icon className="size-4 shrink-0 text-gray-700" strokeWidth={1.8} />
            <span>{item.title}</span>
          </a>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User footer — static placeholder matching UserFooter shape */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100">
        {/* Avatar placeholder */}
        <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" aria-hidden="true" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">John Doe</span>
          <span className="text-xs text-gray-500 truncate">Admin</span>
        </div>
      </div>
    </aside>
  )
}
