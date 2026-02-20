
"use client"

import * as React from "react"
import { MoreHorizontal, ChevronRight, ChevronDown, type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SidebarHighlight, SidebarHighlightItem } from "./SidebarHighlight"
import { cn } from "@/lib/utils"

export type SidebarSectionRenderOptions = { contentOnly?: boolean }

interface SidebarSectionProps<T> {
  title: string
  icon?: LucideIcon
  items: T[]
  visibleItems: T[]
  showAll: boolean
  onToggleShowAll: () => void
  renderItem: (item: T, options?: SidebarSectionRenderOptions) => React.ReactNode
  getKey?: (item: T) => string
  emptyMessage?: string
  showMoreThreshold: number
  isExpanded?: boolean
  onToggleExpand?: () => void
  headingHref?: string
  isHighlighted?: boolean
}

export function SidebarSection<T>({
  title,
  icon: Icon,
  items,
  visibleItems,
  showAll,
  onToggleShowAll,
  renderItem,
  getKey,
  emptyMessage,
  showMoreThreshold,
  isExpanded = true,
  onToggleExpand,
  headingHref,
  isHighlighted = false,
}: SidebarSectionProps<T>) {
  if (items.length === 0) return null
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleExpand?.()
  }

  return (
    <SidebarGroup className="flex flex-col gap-0 bg-white px-2">
      <SidebarHighlight className="relative flex flex-col gap-0">
        <SidebarHighlightItem
          as="div"
          className={cn(
            "flex items-center gap-2 rounded-md transition-colors text-gray-900",
            "px-1.5 text-sm font-semibold h-10 min-h-10 group/label",
            "hover:bg-transparent!",
            isHighlighted && "bg-gray-100 text-gray-900"
          )}
        >
          <SidebarGroupLabel
            className={cn(
              "flex-1 px-1 h-full flex items-center gap-2 rounded-md transition-colors hover:bg-transparent! text-gray-900 w-full",
              isHighlighted && "bg-gray-100 text-gray-900"
            )}
          >
            {Icon && (
              <div
                className="relative size-4 flex items-center justify-center cursor-pointer shrink-0"
                onClick={handleIconClick}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-opacity duration-150 ease-in-out text-gray-700",
                    onToggleExpand && "group-hover/label:opacity-0",
                    isHighlighted && "text-gray-900"
                  )}
                />
                {onToggleExpand && (
                  <ChevronIcon className="absolute inset-0 size-4 shrink-0 rounded-sm bg-gray-100 text-gray-900 opacity-0 group-hover/label:opacity-100 transition-opacity duration-150 ease-in-out" />
                )}
              </div>
            )}
            {headingHref ? (
              <span
                className={cn(
                  "flex-1 text-sm font-medium tracking-wide cursor-default transition-colors duration-150 ease-in-out text-gray-900",
                  isHighlighted && "text-gray-900"
                )}
              >
                {title}
              </span>
            ) : (
              <span className={cn("flex-1 text-gray-900", isHighlighted && "text-gray-900")}>{title}</span>
            )}
          </SidebarGroupLabel>
        </SidebarHighlightItem>
        {isExpanded && (
          <SidebarGroupContent className="pl-3 pt-0">
            <SidebarMenu className="gap-0">
              {visibleItems.length === 0 ? (
                <SidebarMenuItem>
                  <div className="px-2 py-4 text-center text-sm text-gray-500">
                    {emptyMessage ?? `No ${title.toLowerCase()} available`}
                  </div>
                </SidebarMenuItem>
              ) : (
                <>
                  {visibleItems.map((item, index) => (
                    <SidebarHighlightItem
                      as="li"
                      key={getKey ? getKey(item) : String(index)}
                      className="group/menu-item relative"
                    >
                      {renderItem(item, { contentOnly: true })}
                    </SidebarHighlightItem>
                  ))}
                {items.length > showMoreThreshold && (
                  <SidebarHighlightItem
                    as="li"
                    className="group/menu-item relative"
                  >
                    <button
                      onClick={onToggleShowAll}
                      className="flex w-full items-center h-8 gap-2 px-2 py-1.5 text-sm text-gray-700 cursor-pointer hover:bg-transparent! rounded-md"
                    >
                      <MoreHorizontal className="size-4 shrink-0 text-gray-700" />
                      <span className="font-semibold text-xs text-gray-700">
                        {showAll ? "Show less" : "View all"}
                      </span>
                    </button>
                  </SidebarHighlightItem>
                )}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarHighlight>
    </SidebarGroup>
  )
}
