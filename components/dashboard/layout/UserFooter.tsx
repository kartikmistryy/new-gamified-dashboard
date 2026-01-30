"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronRight, Settings, LogOut, UserCircle, HelpCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarFooter, SidebarMenuButton } from "@/components/ui/sidebar"
import { SIDEBAR_DEFAULTS } from "./constants"
import type { Person } from "@/types/sidebar"

interface UserFooterProps {
  people: Person[]
}

export function UserFooter({ people }: UserFooterProps) {
  const userAvatar = React.useMemo(
    () => (people.length > 0 ? people[0]!.avatar : "https://github.com/shadcn.png"),
    [people]
  )

  return (
    <SidebarFooter className="p-2 bg-white">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="h-auto w-full py-2">
            <Image
              src={userAvatar}
              alt="User"
              width={32}
              height={32}
              className="rounded-full object-cover"
              unoptimized
            />
            <div className="flex flex-1 flex-col items-start text-left">
              <span className="text-sm font-medium text-gray-900">{SIDEBAR_DEFAULTS.USER_NAME}</span>
              <span className="text-xs text-gray-600">{SIDEBAR_DEFAULTS.USER_ROLE}</span>
            </div>
            <ChevronRight className="size-4 text-gray-600" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          <DropdownMenuLabel className="cursor-pointer">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <UserCircle className="size-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="size-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <HelpCircle className="size-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
            <LogOut className="size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  )
}
