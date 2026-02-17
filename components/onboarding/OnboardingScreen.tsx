"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { OnboardingSidebar } from "./OnboardingSidebar"
import { ImportPanel } from "./ImportPanel"

// ---------------------------------------------------------------------------
// OnboardingScreen
//
// Full-screen layout shell for the import flow. Renders the static sidebar
// alongside the centered ImportPanel. When the import completes, triggers a
// smooth full-page fade-out before redirecting to the dashboard.
//
// Route: /onboarding
// ---------------------------------------------------------------------------

const DEFAULT_REDIRECT = "/org/gitroll"

export function OnboardingScreen() {
  const router = useRouter()
  const [exiting, setExiting] = React.useState(false)

  function handleImportComplete() {
    setExiting(true)
    // Allow the exit animation to play before navigating
    setTimeout(() => {
      router.push(DEFAULT_REDIRECT)
    }, 500)
  }

  return (
    <AnimatePresence mode="wait">
      {!exiting && (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="flex h-screen w-screen overflow-hidden bg-white"
        >
          {/* Static sidebar — no dynamic data loaded */}
          <OnboardingSidebar />

          {/* Main content area */}
          <main
            className="flex flex-1 flex-col overflow-hidden"
            role="main"
            aria-label="Import organization"
          >
            {/* Centered import panel */}
            <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-6 py-12">
              <div className="relative z-10 w-full">
                <ImportPanel onImportComplete={handleImportComplete} />
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Subtle background texture — a 3x3 grid of faint dots that adds depth
// without competing with the import panel. Pure CSS, no images required.
// ---------------------------------------------------------------------------

function CanvasDecoration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle, #d4d4d4 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
        opacity: 0.35,
      }}
    />
  )
}
