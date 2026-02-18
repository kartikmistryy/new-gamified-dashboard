"use client"

import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarHeader } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { getOrganizations } from "@/__mocks__/sidebar/organizations"
import type { Organization } from "@/types/sidebar"

interface OrganizationSwitcherProps {
  selectedOrg: Organization
  onSelectOrg: (org: Organization) => void
}

export function OrganizationSwitcher({ selectedOrg, onSelectOrg }: OrganizationSwitcherProps) {
  return (
    <SidebarHeader className="bg-white">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex w-full items-center justify-between rounded-lg cursor-pointer p-2 hover:bg-gray-100 text-gray-900"
            aria-label={`Current organization: ${selectedOrg.name}. Click to switch organizations`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-white text-xs font-bold">
                {selectedOrg.name.charAt(0)}
              </div>
              <span className="font-semibold text-sm text-gray-900">{selectedOrg.name}</span>
            </div>
            <ChevronDown className="size-4 text-gray-700" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] bg-white">
          <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {getOrganizations().map((org: Organization) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => onSelectOrg(org)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                selectedOrg.id === org.id && "bg-accent"
              )}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
                {org.name.charAt(0)}
              </div>
              <span>{org.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarHeader>
  )
}
