"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import { usePathname } from "next/navigation"

import useTabIndicator from "@/lib/hooks/useTabIndicator"
import { DASHBOARD_TABS, DASHBOARD_BASE_PATHS } from "@/components/dashboard/tabs/constants"
import DashboardTabItem from "@/components/dashboard/layout/DashboardTabItem"
import {
  detectDashboardType,
  resolveActiveTab,
  buildTabConfigs,
} from "@/components/dashboard/layout/helpers/dashboardTabHelpers"

export default function DashboardTabs() {
  const pathname = usePathname()

  const dashboardType = useMemo(
    () => detectDashboardType(pathname),
    [pathname],
  )
  const tabs = DASHBOARD_TABS[dashboardType]
  const basePath = DASHBOARD_BASE_PATHS[dashboardType]

  const activeFromPath = useMemo(
    () => resolveActiveTab(pathname ?? null, basePath),
    [pathname, basePath],
  )

  const tabConfigs = useMemo(
    () => buildTabConfigs(tabs, basePath, activeFromPath, pathname),
    [tabs, basePath, activeFromPath, pathname],
  )

  const { containerRef, registerTabRef, indicatorStyle } = useTabIndicator({
    activeTab: activeFromPath,
    dependencies: [pathname],
  })

  return (
    <div className="w-full h-fit flex overflow-x-auto">
      <div
        ref={containerRef}
        className="relative flex flex-row items-center justify-between w-auto min-w-max max-w-full sm:min-w-fit sm:max-w-80 md:max-w-fit lg:h-fit h-12 py-1 px-1.5 rounded-full bg-muted shrink-0"
      >
        <motion.span
          aria-hidden
          className="pointer-events-none h-9 absolute top-1/2 -translate-y-1/2 bg-card rounded-full transition-all duration-300 ease-out z-0"
          style={{ width: indicatorStyle.width, left: indicatorStyle.left }}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <ul
          className="relative flex flex-row w-auto px-0 py-0.5 gap-0.5 sm:gap-0"
          role="tablist"
        >
          {tabConfigs.map((tab) => (
            <DashboardTabItem
              key={tab.key}
              tab={tab}
              registerTabRef={registerTabRef}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
