"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GithubIcon, ArrowRight, CheckCircle2, Circle, Loader2, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImportPhase = "idle" | "loading" | "complete"
type StepStatus = "pending" | "active" | "done"

interface Stat {
  label: string
  value: string
}

interface PipelineStep {
  id: string
  headline: string
  tagline: string
  durationMs: number
  stats: Stat[]
}

// ---------------------------------------------------------------------------
// Log lines per step — detailed so stakeholders can follow along
// ---------------------------------------------------------------------------

const STEP_LOGS: Record<string, string[]> = {
  org: [
    "Authenticating GitHub App credentials...",
    "GET /orgs/gitroll → 200 OK",
    "org: gitroll  ·  type: Organization",
    "members: 42  ·  teams: 8  ·  plan: Enterprise",
    "Billing active  ·  founded: 2019  ✓",
  ],
  repos: [
    "Fetching repository manifest from GitHub...",
    "Found 127 repositories across 8 teams",
    "Resolving default branches (main / master / trunk)",
    "Detecting languages: TypeScript, Go, Python, Rust +4",
    "Scanning 1,402 branches for commit activity",
    "Language distribution mapped  ✓",
  ],
  contributors: [
    "Cross-referencing all repos for authorship data...",
    "Unique authors identified: 38",
    "Aggregating 14,902 commits (4.2 years of history)",
    "Pull request reviews ingested: 2,841",
    "Building co-authorship graph edges",
    "Contributor attribution matrix ready  ✓",
  ],
  skills: [
    "Initializing dependency graph (892 nodes)...",
    "Running language-feature extraction pass",
    "Computing per-author skill vectors across 127 repos",
    "Identified 14 distinct skill clusters",
    "Ranking expertise: intern → junior → mid → senior → staff",
    "Skill inference pipeline complete  ✓",
  ],
  finalize: [
    "Writing 24,891 index records to persistent store...",
    "Building full-text search indexes",
    "Warming edge cache layers",
    "Running dashboard preflight checks",
    "All systems nominal — dashboard ready  ✓",
  ],
}

// ---------------------------------------------------------------------------
// Pipeline definitions — paced to be readable during a live demo
// ---------------------------------------------------------------------------

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "org",
    headline: "Dialing into GitHub",
    tagline:
      "Authenticating with the GitHub API and resolving your organization's identity, membership structure, and access permissions.",
    durationMs: 3200,
    stats: [
      { label: "Members", value: "42" },
      { label: "Teams", value: "8" },
      { label: "Plan", value: "Enterprise" },
    ],
  },
  {
    id: "repos",
    headline: "Charting the Codebase",
    tagline:
      "Scanning every branch, commit history, and language signal across all active repositories in your organization.",
    durationMs: 4200,
    stats: [
      { label: "Repos", value: "127" },
      { label: "Branches", value: "1,402" },
      { label: "Languages", value: "8" },
    ],
  },
  {
    id: "contributors",
    headline: "Meeting the Team",
    tagline:
      "Aggregating author activity, pull request reviews, and commit attribution to build a complete picture of every contributor.",
    durationMs: 4600,
    stats: [
      { label: "Authors", value: "38" },
      { label: "Commits", value: "14,902" },
      { label: "PRs Merged", value: "1,247" },
    ],
  },
  {
    id: "skills",
    headline: "Wiring the Skill Map",
    tagline:
      "Inferring competency vectors and expertise levels from code ownership, review patterns, and contribution history.",
    durationMs: 5000,
    stats: [
      { label: "Graph Nodes", value: "892" },
      { label: "Skill Clusters", value: "14" },
      { label: "Vectors", value: "3,841" },
    ],
  },
  {
    id: "finalize",
    headline: "Polishing the Lens",
    tagline:
      "Indexing all records, warming caches, and tailoring the dashboard to your organization's unique structure.",
    durationMs: 3000,
    stats: [
      { label: "Records", value: "24,891" },
      { label: "Cache", value: "Warmed" },
      { label: "Status", value: "Ready" },
    ],
  },
]

const TOTAL_DURATION_MS = PIPELINE_STEPS.reduce((acc, s) => acc + s.durationMs, 0)

// ---------------------------------------------------------------------------
// LogTicker — typewriter terminal: chars appear one-by-one with blinking cursor
// ---------------------------------------------------------------------------

const CHAR_DELAY_MS = 18   // ms per character while typing
const LINE_PAUSE_MS = 200  // ms pause before the next line begins

function LogTicker({ stepId }: { stepId: string }) {
  const logs = React.useMemo(() => STEP_LOGS[stepId] ?? [], [stepId])

  const [completedLines, setCompletedLines] = React.useState<string[]>([])
  const [typingText, setTypingText] = React.useState("")
  const [cursorOn, setCursorOn] = React.useState(true)

  React.useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 530)
    return () => clearInterval(id)
  }, [])

  React.useEffect(() => {
    setCompletedLines([])
    setTypingText("")
    if (logs.length === 0) return

    let lineIdx = 0
    let charIdx = 0
    let tid: ReturnType<typeof setTimeout>

    function advance() {
      if (lineIdx >= logs.length) return
      const line = logs[lineIdx]!

      if (charIdx <= line.length) {
        setTypingText(line.slice(0, charIdx))
        charIdx++
        tid = setTimeout(advance, CHAR_DELAY_MS)
      } else {
        const finished = line
        setCompletedLines((prev) => [...prev, finished])
        setTypingText("")
        lineIdx++
        charIdx = 0
        tid = setTimeout(advance, LINE_PAUSE_MS)
      }
    }

    tid = setTimeout(advance, 140)
    return () => clearTimeout(tid)
  }, [stepId, logs])

  const showCursorRow = completedLines.length < logs.length

  return (
    <div
      className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 font-mono text-[11px] min-h-[72px] overflow-hidden"
      aria-live="polite"
      aria-label="Import log output"
    >
      <div className="flex items-center gap-1.5 mb-2 -mx-3 -mt-2.5 px-3 py-1.5 border-b border-gray-100 bg-gray-50/80">
        <Terminal className="size-[9px] text-gray-300" strokeWidth={2} />
        <span className="text-[9px] font-medium text-gray-300 tracking-wide uppercase select-none">
          stdout
        </span>
      </div>

      {completedLines.map((line, i) => (
        <div key={`${stepId}-c-${i}`} className="leading-[1.7] text-gray-500">
          <span className="text-gray-300 select-none mr-1.5">$</span>
          {line}
        </div>
      ))}

      {showCursorRow && (
        <div className="leading-[1.7] text-gray-500 flex items-center">
          <span className="text-gray-300 select-none mr-1.5">$</span>
          <span>{typingText}</span>
          <span
            className={cn(
              "inline-block w-px h-[10px] bg-gray-500 ml-px align-middle transition-opacity duration-75",
              cursorOn ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// StepCard — collapses to a single row; expands to full detail when active
// ---------------------------------------------------------------------------

interface StepCardProps {
  step: PipelineStep
  status: StepStatus
  stepNumber: number
}

function StepCard({ step, status, stepNumber }: StepCardProps) {
  const isActive = status === "active"
  const isDone = status === "done"
  const isPending = status === "pending"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
        opacity: { duration: 0.3, delay: stepNumber * 0.04 },
        y: { duration: 0.3, delay: stepNumber * 0.04 },
      }}
      className={cn(
        "rounded-md border overflow-hidden transition-colors duration-300",
        isActive && "border-gray-300 bg-white",
        isDone && "border-emerald-100 bg-emerald-50/50",
        isPending && "border-gray-100 bg-white",
      )}
    >
      {/* ── Header row — always visible ── */}
      <div
        className={cn(
          "flex items-center gap-3 px-3",
          isActive ? "pt-4 pb-0" : "py-3",
        )}
      >
        <span
          className={cn(
            "shrink-0 text-[11px] font-bold tabular-nums w-4 text-right leading-none",
            isActive && "text-gray-400",
            isDone && "text-emerald-400",
            isPending && "text-gray-200",
          )}
        >
          {stepNumber}
        </span>

        <div className="shrink-0">
          {isDone && (
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "backOut" }}
            >
              <CheckCircle2 className="size-4 text-emerald-500" strokeWidth={2.5} />
            </motion.div>
          )}
          {isActive && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="size-4 text-gray-900" strokeWidth={2} />
            </motion.div>
          )}
          {isPending && <Circle className="size-4 text-gray-200" strokeWidth={1.5} />}
        </div>

        <span
          className={cn(
            "text-sm font-semibold leading-none",
            isActive && "text-gray-900",
            isDone && "text-gray-700",
            isPending && "text-gray-300",
          )}
        >
          {step.headline}
          {isActive && (
            <span className="ml-2 inline-flex items-center gap-[3px]">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="inline-block w-[3px] h-[3px] rounded-full bg-gray-500"
                  animate={{ opacity: [0.15, 1, 0.15] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.22,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </span>
          )}
        </span>

        {isDone && (
          <span className="ml-auto text-xs font-bold text-emerald-600 tabular-nums">
            Done
          </span>
        )}
      </div>

      {/* ── Expanded panel — only when active ── */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-3 pb-4 flex flex-col gap-4">
              <div className="h-px bg-gray-100" />

              {/* Tagline */}
              <p className="text-[13px] text-gray-500 leading-relaxed">{step.tagline}</p>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                {step.stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                    className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
                  >
                    <div className="text-[15px] font-bold text-gray-900 tabular-nums leading-none">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Log ticker */}
              <LogTicker stepId={step.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// ProgressTrack — header progress bar with countdown
// ---------------------------------------------------------------------------

interface ProgressTrackProps {
  activeIndex: number
  totalSteps: number
  elapsed: number
  totalDuration: number
}

function ProgressTrack({ activeIndex, totalSteps, elapsed, totalDuration }: ProgressTrackProps) {
  const progressPct = Math.min((elapsed / totalDuration) * 100, 100)
  const remainingSec = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-500">
          Step{" "}
          <span className="font-bold text-gray-900 tabular-nums">
            {Math.min(activeIndex + 1, totalSteps)}
          </span>{" "}
          of {totalSteps}
        </span>
        <span className="text-xs text-gray-400 tabular-nums">~{remainingSec}s remaining</span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gray-900"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-y-0 w-16 bg-linear-to-r from-transparent via-white/60 to-transparent"
          animate={{ x: ["-64px", "100%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ left: 0 }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ImportButton — arrow micro-interaction on click
// ---------------------------------------------------------------------------

function ImportButton({ onClick }: { onClick: () => void }) {
  const [pressed, setPressed] = React.useState(false)

  return (
    <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }}>
      <Button
        onClick={() => {
          setPressed(true)
          setTimeout(() => setPressed(false), 200)
          onClick()
        }}
        size="default"
        className={cn(
          "h-10 px-5 gap-2 text-sm font-semibold",
          "bg-gray-900 text-white hover:bg-gray-800",
          "transition-all duration-150",
          "focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
        )}
        aria-label="Import GitHub organization"
      >
        Import
        <motion.span
          animate={{ x: pressed ? 3 : 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <ArrowRight className="size-4" strokeWidth={2} />
        </motion.span>
      </Button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Confetti — particle burst for the completion screen
// ---------------------------------------------------------------------------

const CONFETTI_PALETTE = [
  "#10b981", // emerald-500
  "#34d399", // emerald-400
  "#6ee7b7", // emerald-300
  "#059669", // emerald-600
  "#111827", // gray-900
  "#6b7280", // gray-500
  "#d1d5db", // gray-200
]

interface ParticleConfig {
  id: number
  color: string
  width: number
  height: number
  borderRadius: string
  dx: number
  dy: number
  rotation: number
  delay: number
  duration: number
}

function ConfettiParticle({ color, dx, dy, width, height, borderRadius, rotation, delay, duration }: Omit<ParticleConfig, "id">) {
  return (
    <motion.span
      aria-hidden
      style={{
        position: "absolute",
        width,
        height,
        borderRadius,
        backgroundColor: color,
        top: 0,
        left: 0,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        transformOrigin: "center center",
        willChange: "transform, opacity",
      }}
      initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 1 }}
      animate={{
        x: dx,
        y: dy,
        opacity: [0, 1, 1, 0],
        rotate: rotation,
        scale: [1, 1, 0.65],
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
        opacity: { duration, delay, times: [0, 0.06, 0.62, 1], ease: "linear" },
        scale: { duration, delay, times: [0, 0.5, 1] },
      }}
    />
  )
}

function generateParticles(count: number): ParticleConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const baseAngle = (i / count) * Math.PI * 2
    const jitter = (Math.random() - 0.5) * ((Math.PI * 2) / count) * 1.8
    const angle = baseAngle + jitter
    const speed = 130 + Math.random() * 210
    const isCircle = Math.random() > 0.42
    const size = 4 + Math.random() * 7

    return {
      id: i,
      color: CONFETTI_PALETTE[Math.floor(Math.random() * CONFETTI_PALETTE.length)]!,
      width: size,
      height: isCircle ? size : size * 0.52,
      borderRadius: isCircle ? "50%" : "2px",
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed - 55, // upward bias
      rotation: Math.random() * 720 - 360,
      delay: Math.random() * 0.38,
      duration: 1.4 + Math.random() * 0.9,
    }
  })
}

function ConfettiBurst({ originTop }: { originTop: number }) {
  // useState lazy initializer runs exactly once — safe for impure Math.random() calls
  const [particles] = React.useState<ParticleConfig[]>(() => generateParticles(52))

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2"
      style={{ top: originTop, width: 0, height: 0, overflow: "visible" }}
    >
      {particles.map((p) => (
        <ConfettiParticle key={p.id} {...p} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CompletionScreen — celebration after all pipeline steps finish
// ---------------------------------------------------------------------------

const COMPLETION_STATS = [
  { label: "Repos", value: "127" },
  { label: "Contributors", value: "38" },
  { label: "Commits", value: "14,902" },
  { label: "Skills Mapped", value: "3,841" },
]

const COMPLETION_HIGHLIGHTS = [
  "Contributor profiles and commit histories fully imported",
  "Skill graph built across 14 distinct competency clusters",
  "Dashboard tailored to your organization's structure",
]

interface CompletionScreenProps {
  orgUrl: string
  onOpenDashboard: () => void
}

function CompletionScreen({ orgUrl, onOpenDashboard }: CompletionScreenProps) {
  const displayOrg = orgUrl.replace(/^https?:\/\//, "") || "github.com/your-org"

  return (
    <div className="relative flex flex-col items-center gap-7 text-center">
      {/* Confetti burst — originates from the checkmark position */}
      <ConfettiBurst originTop={52} />

      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.65, delay: 0.05, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="relative z-10 flex size-[104px] items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/30"
      >
        {/* Outer ring pulse */}
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-400"
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 1.45, opacity: 0 }}
          transition={{ duration: 1.1, delay: 0.55, ease: "easeOut" }}
        />
        <CheckCircle2 className="size-12 text-white" strokeWidth={2} />
      </motion.div>

      {/* Headline + org */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.3 }}
        className="relative z-10 flex flex-col gap-1.5"
      >
        <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-[1.1]">
          Your organization<br />is ready
        </h2>
        <p className="font-mono text-sm text-gray-400 truncate max-w-[380px] mx-auto">
          {displayOrg}
        </p>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.48 }}
        className="relative z-10 grid grid-cols-4 gap-2 w-full"
      >
        {COMPLETION_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.52 + i * 0.07 }}
            className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-3"
          >
            <div className="text-[17px] font-bold text-gray-900 tabular-nums leading-none">
              {stat.value}
            </div>
            <div className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-400 leading-tight">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* What was built */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.7 }}
        className="relative z-10 w-full rounded-xl border border-emerald-100 bg-emerald-50/80 px-5 py-4 text-left"
      >
        <div className="flex flex-col gap-2.5">
          {COMPLETION_HIGHLIGHTS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.32, delay: 0.76 + i * 0.08 }}
              className="flex items-start gap-2.5"
            >
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" strokeWidth={2.5} />
              <span className="text-sm text-emerald-800 leading-snug">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.92 }}
        className="relative z-10 flex w-full flex-col items-center gap-3"
      >
        <motion.div className="w-full" whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }}>
          <Button
            onClick={onOpenDashboard}
            className="w-full h-11 gap-2 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
          >
            Open Dashboard
            <ArrowRight className="size-4" strokeWidth={2} />
          </Button>
        </motion.div>
        <p className="text-xs text-gray-400">
          You can always connect more organizations from dashboard settings.
        </p>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ImportPanel — main export
// ---------------------------------------------------------------------------

interface ImportPanelProps {
  onImportComplete: () => void
}

export function ImportPanel({ onImportComplete }: ImportPanelProps) {
  const [orgUrl, setOrgUrl] = React.useState("")
  const [phase, setPhase] = React.useState<ImportPhase>("idle")
  const [activeStepIndex, setActiveStepIndex] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())
  const [elapsed, setElapsed] = React.useState(0)
  const [urlError, setUrlError] = React.useState("")

  // Elapsed ticker — drives the smooth progress bar fill
  React.useEffect(() => {
    if (phase !== "loading") return
    const start = Date.now()
    const id = setInterval(() => setElapsed(Date.now() - start), 80)
    return () => clearInterval(id)
  }, [phase])

  // Pipeline step sequencer
  React.useEffect(() => {
    if (phase !== "loading") return

    const completed = new Set<number>()
    const timers: ReturnType<typeof setTimeout>[] = []

    function scheduleStep(idx: number, delayFromNow: number) {
      if (idx >= PIPELINE_STEPS.length) return
      timers.push(
        setTimeout(() => {
          setActiveStepIndex(idx)
          timers.push(
            setTimeout(() => {
              completed.add(idx)
              setCompletedSteps(new Set(completed))
              if (idx + 1 < PIPELINE_STEPS.length) {
                scheduleStep(idx + 1, 0)
              } else {
                // All steps done — transition to celebration screen
                timers.push(
                  setTimeout(() => {
                    setPhase("complete")
                  }, 700),
                )
              }
            }, PIPELINE_STEPS[idx]!.durationMs),
          )
        }, delayFromNow),
      )
    }

    scheduleStep(0, 0)
    return () => timers.forEach(clearTimeout)
  }, [phase])

  function handleImport() {
    const trimmed = orgUrl.trim()
    if (!trimmed) {
      setUrlError("Please enter a GitHub organization URL.")
      return
    }
    setUrlError("")
    setPhase("loading")
    setActiveStepIndex(0)
    setCompletedSteps(new Set())
    setElapsed(0)
  }

  function getStepStatus(index: number): StepStatus {
    if (completedSteps.has(index)) return "done"
    if (index === activeStepIndex && phase === "loading") return "active"
    return "pending"
  }

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <AnimatePresence mode="wait">
        {/* ── IDLE state: URL input ── */}
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-[1.08]">
                Connect your
                <br />
                GitHub organization
              </h1>
              <p className="max-w-md text-sm text-gray-500 leading-relaxed">
                Paste your GitHub org URL and we&apos;ll import repositories, contributors, and
                code activity to build your team&apos;s skill graph.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="github-org-url" className="text-sm font-medium text-gray-700">
                GitHub organization URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <GithubIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"
                    strokeWidth={1.8}
                  />
                  <Input
                    id="github-org-url"
                    type="url"
                    placeholder="https://github.com/your-org"
                    value={orgUrl}
                    onChange={(e) => {
                      setOrgUrl(e.target.value)
                      if (urlError) setUrlError("")
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleImport()}
                    className={cn(
                      "pl-9 h-10 text-sm border-gray-200 bg-white focus-visible:ring-gray-300 placeholder:text-gray-300",
                      urlError && "border-red-400 focus-visible:ring-red-200",
                    )}
                    aria-describedby={urlError ? "url-error" : undefined}
                    aria-invalid={!!urlError}
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <ImportButton onClick={handleImport} />
              </div>
              {urlError && (
                <motion.p
                  id="url-error"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500"
                >
                  {urlError}
                </motion.p>
              )}
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Example organizations">
              {["vercel", "facebook", "microsoft", "stripe"].map((org) => (
                <Badge
                  key={org}
                  onClick={() => setOrgUrl(`https://github.com/${org}`)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white h-fit px-3 py-1.5 text-xs font-medium text-gray-600 cursor-pointer transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                >
                  <GithubIcon className="size-5 h-6 text-gray-400" strokeWidth={1.8} />
                  {org}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── LOADING state: pipeline step cards ── */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-black tracking-tight text-gray-900">
                Importing data
              </h2>
              <p className="max-w-full truncate font-mono text-sm text-gray-400">
                {orgUrl || "your-org"}
              </p>
            </div>

            <ProgressTrack
              activeIndex={activeStepIndex}
              totalSteps={PIPELINE_STEPS.length}
              elapsed={elapsed}
              totalDuration={TOTAL_DURATION_MS}
            />

            <div className="flex flex-col gap-2">
              {PIPELINE_STEPS.map((step, i) => (
                <StepCard
                  key={step.id}
                  step={step}
                  status={getStepStatus(i)}
                  stepNumber={i + 1}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── COMPLETE state: celebration screen ── */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <CompletionScreen
              orgUrl={orgUrl}
              onOpenDashboard={onImportComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
