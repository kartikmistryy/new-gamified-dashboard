"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type Bounds = { left: number; top: number; width: number; height: number }

const HighlightContext = React.createContext<{
  onItemHover: (el: HTMLElement | null) => void
} | null>(null)

function useHighlight() {
  const ctx = React.useContext(HighlightContext)
  if (!ctx) throw new Error("SidebarHighlightItem must be used within SidebarHighlight")
  return ctx
}

interface SidebarHighlightProps {
  children: React.ReactNode
  className?: string
}

export function SidebarHighlight({ children, className }: SidebarHighlightProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = React.useState<Bounds | null>(null)
  const [hoveredEl, setHoveredEl] = React.useState<HTMLElement | null>(null)

  const updateBounds = React.useCallback(() => {
    if (!containerRef.current || !hoveredEl) {
      setBounds(null)
      return
    }
    const containerRect = containerRef.current.getBoundingClientRect()
    const elRect = hoveredEl.getBoundingClientRect()
    setBounds({
      left: elRect.left - containerRect.left,
      top: elRect.top - containerRect.top,
      width: elRect.width,
      height: elRect.height,
    })
  }, [hoveredEl])

  React.useLayoutEffect(() => {
    updateBounds()
  }, [updateBounds])

  React.useEffect(() => {
    if (!hoveredEl || !containerRef.current) return
    const container = containerRef.current
    const onScroll = () => updateBounds()
    container.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", updateBounds)
    return () => {
      container.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", updateBounds)
    }
  }, [hoveredEl, updateBounds])

  const clearTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const onItemHover = React.useCallback((el: HTMLElement | null) => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current)
      clearTimeoutRef.current = null
    }
    if (el) {
      setHoveredEl(el)
    } else {
      clearTimeoutRef.current = setTimeout(() => setHoveredEl(null), 50)
    }
  }, [])

  return (
    <HighlightContext.Provider value={{ onItemHover }}>
      <div ref={containerRef} className={className ?? "relative"}>
        {bounds && (
          <motion.div
            className="absolute rounded-md bg-gray-100 z-0 pointer-events-none"
            initial={false}
            animate={{
              left: bounds.left,
              top: bounds.top,
              width: bounds.width,
              height: bounds.height,
            }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 35,
            }}
          />
        )}
        {children}
      </div>
    </HighlightContext.Provider>
  )
}

interface SidebarHighlightItemProps {
  children: React.ReactNode
  className?: string
  /** Use "li" when direct child of SidebarMenu (ul) for valid markup */
  as?: "li" | "div"
}

export function SidebarHighlightItem({
  children,
  className,
  as: Component = "div",
}: SidebarHighlightItemProps) {
  const ref = React.useRef<HTMLDivElement | HTMLLIElement>(null)
  const { onItemHover } = useHighlight()

  return (
    <Component
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      className={cn("relative z-10", className)}
      onMouseEnter={() => onItemHover(ref.current)}
      onMouseLeave={() => onItemHover(null)}
      {...(Component === "li"
        ? { "data-slot": "sidebar-menu-item", "data-sidebar": "menu-item" }
        : {})}
    >
      {children}
    </Component>
  )
}
