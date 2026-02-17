import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Import Organization | GitRoll",
  description: "Connect your GitHub organization to build your team's skill graph.",
}

/**
 * Onboarding layout.
 *
 * This route is intentionally excluded from the root DashboardSidebar
 * wrapper. The sidebar variant rendered here is a static-only shell
 * (no repos, no people, no org switcher) appropriate for the pre-data
 * import state.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
