"use client"

import { motion } from "framer-motion"
import Link from "next/link"

import { Badge } from "@/components/shared/Badge"
import { cn } from "@/lib/utils"
import type { ProfileTabKey } from "@/components/dashboard/tabs/types"
import type { TabConfig } from "./helpers/dashboardTabHelpers"

const basePill =
  "relative h-10 cursor-pointer select-none font-medium flex items-center gap-2 rounded-full transition-colors lg:text-base text-xs duration-150 whitespace-nowrap px-2 sm:px-3"

type TabItemProps = {
  tab: TabConfig
  registerTabRef: (key: ProfileTabKey, el: HTMLElement | null) => void
}

export default function DashboardTabItem({
  tab,
  registerTabRef,
}: TabItemProps) {
  return (
    <li
      role="tab"
      aria-selected={tab.isActive}
      aria-controls={`panel-${tab.key}`}
      tabIndex={tab.isActive ? 0 : -1}
      className="flex-1 sm:flex-1 min-w-fit h-9 cursor-pointer shrink-0"
    >
      <Link
        href={tab.href}
        ref={(el) => registerTabRef(tab.key, el)}
        className={cn(
          basePill,
          "w-full z-10 h-9 flex flex-row items-center gap-1",
          tab.isActive ? "text-foreground" : "text-foreground/60",
        )}
      >
        <span className="z-10 text-sm">{tab.label}</span>
        {typeof tab.count === "number" && tab.isActive && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Badge
              variant="default"
              className={cn(
                "lg:text-sm text-xs rounded-xl lg:min-w-6 min-w-5 h-6 w-6 flex items-center justify-center",
                tab.isActive ? "opacity-100" : "opacity-50",
              )}
            >
              {tab.count}
            </Badge>
          </motion.span>
        )}
      </Link>
    </li>
  )
}
