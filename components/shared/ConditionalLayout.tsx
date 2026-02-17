"use client"

import { usePathname } from "next/navigation"
import DashboardSidebar from "@/components/dashboard/layout/DashboardSidebar"

/**
 * ConditionalLayout
 *
 * Wraps children in DashboardSidebar for all routes EXCEPT those listed in
 * BARE_ROUTES. Bare routes render their own layout (e.g. OnboardingScreen).
 *
 * This avoids restructuring the route tree into route groups while keeping
 * the root layout as a Server Component.
 */

const BARE_ROUTES = ["/onboarding"]

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isBare = BARE_ROUTES.some((route) => pathname?.startsWith(route))

  if (isBare) {
    return <>{children}</>
  }

  return <DashboardSidebar>{children}</DashboardSidebar>
}
