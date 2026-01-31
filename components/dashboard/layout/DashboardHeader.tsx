"use client"

import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { ChevronDown, LayoutDashboard, PenBox, RotateCcw, BarChart3 } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { BreadcrumbItem as BreadcrumbItemType } from "./hooks/useDashboardMeta"

const DASHBOARD_VIEWS = [
  { label: "Summary", path: "", icon: LayoutDashboard },
  { label: "Design", path: "design", icon: BarChart3 },
  { label: "Performance", path: "performance", icon: BarChart3 },
] as const

const IDENTIFIER_DISPLAY_NAMES: Record<string, string> = {
  gitroll: "GitRoll",
}

function formatBreadcrumbLabel(label: string): string {
  const normalized = label.toLowerCase()
  if (IDENTIFIER_DISPLAY_NAMES[normalized]) return IDENTIFIER_DISPLAY_NAMES[normalized]
  const withSpaces = label.replace(/-/g, " ")
  if (!withSpaces) return withSpaces
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

function getActiveViewLabel(pathname: string): string {
  if (pathname.endsWith("/design")) return "Design"
  if (pathname.endsWith("/performance")) return "Performance"
  return "Summary"
}

export default function DashboardHeader({
  breadcrumbItems,
}: {
  breadcrumbItems: BreadcrumbItemType[]
}) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const orgId = (params?.orgId as string) ?? "org"
  const baseHref = `/org/${orgId}`
  const activeViewLabel = getActiveViewLabel(pathname ?? "")

  const handleViewSelect = (path: string) => {
    const href = path ? `${baseHref}/${path}` : baseHref
    router.push(href)
  }

  return (
    <div className="w-full xl:h-12 h-24 flex xl:flex-row flex-col items-center justify-between gap-4">
      <div className="w-full h-full gap-3 flex flex-row items-center justify-start">
        <Breadcrumb className="w-full">
          <BreadcrumbList className="w-full items-center">
            {breadcrumbItems.map((item, index) => (
              <div key={`${item.href}-${item.label}-${index}`} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator className="mr-2" />}
                <BreadcrumbItem className="p-2 rounded-md hover:bg-muted">
                  <BreadcrumbLink asChild>
                    <Link className="text-sm font-medium text-gray-800" href={item.href}>
                      {formatBreadcrumbLabel(item.label)}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="w-full h-full flex flex-row items-center xl:justify-end justify-start overflow-x-auto text-gray-800">
        <ul className="w-full h-full flex flex-row xl:justify-end justify-start py-2 xl:py-0 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-5 items-center min-w-fit">
          <li className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-sm font-medium text-gray-800 border-gray-300 hover:bg-gray-50"
                >
                  {activeViewLabel}
                  <ChevronDown className="size-4 opacity-50" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                {DASHBOARD_VIEWS.map((view) => {
                  const Icon = view.icon
                  return (
                    <DropdownMenuItem
                      key={view.path || "summary"}
                      onSelect={() => handleViewSelect(view.path)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Icon className="size-4" aria-hidden />
                      {view.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
          <span className="flex flex-row items-center gap-0">
            <DashboardAction
              href="#"
              icon={<RotateCcw size={16} />}
              label=""
              condensed="Refresh"
            />
            <label className="text-sm font-normal text-gray-600">Updated 3 hours ago</label>
          </span>
          <DashboardAction href="#" icon={<PenBox size={16} />} label="" condensed="Edit" />
        </ul>
      </div>
    </div>
  )
}

function DashboardAction({
  href,
  icon,
  label,
  condensed,
}: {
  href: string
  icon: React.ReactNode
  label: string
  condensed?: string
}) {
  return (
    <li className="shrink-0">
      <Link
        href={href}
        className="text-xs sm:text-sm flex flex-row gap-1.5 sm:gap-2 items-center whitespace-nowrap text-gray-800 hover:text-gray-900 transition-colors"
      >
        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0">{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        {condensed ? <span className="sm:hidden">{condensed}</span> : null}
      </Link>
    </li>
  )
}
