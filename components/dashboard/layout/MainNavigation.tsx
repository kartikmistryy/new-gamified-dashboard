"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { SidebarHighlight, SidebarHighlightItem } from "./SidebarHighlight"
import { mainNavItems } from "@/__mocks__/sidebar/navigation"
import { cn } from "@/lib/utils"

export function MainNavigation() {
  return (
    <SidebarGroup className="py-0 bg-white">
      <SidebarGroupContent>
        <SidebarHighlight className="relative">
          <SidebarMenu className="gap-0">
            {mainNavItems.map((item) => (
              <SidebarHighlightItem
                as="li"
                key={item.title}
                className={cn("group/menu-item relative h-10 font-medium")}
              >
                <SidebarMenuButton asChild>
                  <a
                    className="h-10 text-sm font-medium flex items-center gap-2 rounded-md px-2 relative z-10 hover:!bg-transparent text-gray-900"
                    href={item.url}
                  >
                    <item.icon className="size-4 shrink-0 text-gray-700" />
                    <span className="text-gray-900 text-sm font-medium">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarHighlightItem>
            ))}
          </SidebarMenu>
        </SidebarHighlight>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
