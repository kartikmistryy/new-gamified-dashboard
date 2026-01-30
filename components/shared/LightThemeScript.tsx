"use client"

import { useEffect } from "react"

/**
 * Ensures light theme by setting CSS variables to light values.
 * Runs once on mount to override any dark mode media query preferences.
 * This ensures the app stays light even if user's system prefers dark mode.
 */
export function LightThemeScript() {
  useEffect(() => {
    const html = document.documentElement
    
    // Override any dark mode CSS variables with light values
    html.style.setProperty("--background", "#ffffff")
    html.style.setProperty("--foreground", "#171717")
    
    // Sidebar light theme variables (needed for shadcn sidebar utilities)
    html.style.setProperty("--sidebar", "#ffffff")
    html.style.setProperty("--sidebar-foreground", "#0a0a0a")
    html.style.setProperty("--sidebar-accent", "#f1f5f9") // light gray for hover
    html.style.setProperty("--sidebar-accent-foreground", "#18181b")
    html.style.setProperty("--sidebar-border", "#e2e8f0")
    html.style.setProperty("--sidebar-ring", "#94a3b8")
    html.style.setProperty("--sidebar-primary", "#18181b")
    html.style.setProperty("--sidebar-primary-foreground", "#ffffff")
    
    // Ensure light color-scheme (prevents dark mode media query from overriding)
    html.style.setProperty("color-scheme", "light")
    html.classList.remove("dark")
  }, [])

  return null
}