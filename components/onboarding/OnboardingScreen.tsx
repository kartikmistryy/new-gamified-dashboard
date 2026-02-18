"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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

export function OnboardingScreen() {
  const router = useRouter()
  const [exiting, setExiting] = React.useState(false)

  function handleImportComplete(orgId: string) {
    setExiting(true)
    // Allow the exit animation to play before navigating
    setTimeout(() => {
      router.push(`/org/${orgId}`)
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
