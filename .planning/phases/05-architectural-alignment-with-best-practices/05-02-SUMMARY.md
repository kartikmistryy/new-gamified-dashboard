---
phase: 05
plan: 02
subsystem: routing-architecture
tags: [next-js, server-components, client-components, routing, refactor]
requires:
  - phase: 05
    plan: 01
    reason: Needs RouteParamsProvider and useRouteParams hook
provides:
  - Client Component pattern for all team dashboard pages
  - Elimination of all direct useParams() usage in team pages
  - Consistent Server Component/Client Component separation
affects:
  - phase: 05
    plan: 03+
    impact: Establishes reusable pattern for remaining page migrations
tech-stack:
  added: []
  patterns:
    - Server Component wrapper + Client Component pattern
    - useRouteParams() for route parameter access
    - Client Components in components/dashboard/pages/ directory
key-files:
  created:
    - components/dashboard/pages/TeamOverviewPageClient.tsx
    - components/dashboard/pages/TeamPerformancePageClient.tsx
    - components/dashboard/pages/TeamDesignPageClient.tsx
    - components/dashboard/pages/TeamSkillGraphPageClient.tsx
    - components/dashboard/pages/TeamSpofPageClient.tsx
  modified:
    - app/org/[orgId]/team/[teamId]/page.tsx
    - app/org/[orgId]/team/[teamId]/performance/page.tsx
    - app/org/[orgId]/team/[teamId]/design/page.tsx
    - app/org/[orgId]/team/[teamId]/skillgraph/page.tsx
    - app/org/[orgId]/team/[teamId]/spof/page.tsx
decisions:
  - name: Client Components in components/dashboard/pages/
    rationale: Keeps page-level Client Components separate from reusable UI components
    alternatives: Could have kept in app/ directory with .client.tsx suffix
    selected: Separate directory for better organization
  - name: Replace useParams() with useRouteParams()
    rationale: Centralized route parameter extraction via context eliminates direct Next.js coupling
    alternatives: Continue using useParams() directly
    selected: Context-based approach for better testability and flexibility
  - name: Server Component wrappers are single-line renders
    rationale: Simplest possible Server Component - no props, no logic, just render Client Component
    alternatives: Could pass props or do server-side data fetching
    selected: Minimal wrapper keeps separation clear
metrics:
  duration: 3.2min
  completed: 2026-02-08
---

# Phase 5 Plan 2: Team Pages Client Component Extraction Summary

**One-liner:** Migrated all 5 team dashboard pages to Server Component wrapper + Client Component pattern using useRouteParams()

## What Was Built

### Overview
Extracted all team dashboard page business logic into dedicated Client Components in `components/dashboard/pages/`, converting the app router pages to thin Server Component wrappers. This eliminates all direct `useParams()` usage in team pages and establishes the architectural pattern for page-level components.

### Implementation Details

**Pattern Applied:**
- **Server Component (app/org/[orgId]/team/[teamId]/*/page.tsx):** Single import and render of Client Component
- **Client Component (components/dashboard/pages/*PageClient.tsx):** All state management, data processing, and UI logic using useRouteParams()

**Pages Migrated:**
1. **Team Overview** (page.tsx → TeamOverviewPageClient.tsx)
   - Member performance rows generation
   - Gauge value calculation
   - Metric cards and insights
   - Member table rendering

2. **Team Performance** (performance/page.tsx → TeamPerformancePageClient.tsx)
   - Time range filtering and state management
   - Performance time series data processing
   - Charts (performance chart, comparison chart)
   - Member performance table with delta calculations

3. **Team Design** (design/page.tsx → TeamDesignPageClient.tsx)
   - Collaboration network with time range filtering
   - Chaos matrix visualization
   - Member design data and filtering
   - Design filter tabs state management

4. **Team Skillgraph** (skillgraph/page.tsx → TeamSkillGraphPageClient.tsx)
   - Member skills data processing
   - Skill graph visualization
   - View toggle (by member vs by skill)
   - Domain and member visibility state management

5. **Team SPOF** (spof/page.tsx → TeamSpofPageClient.tsx)
   - SPOF gauge calculation
   - Team contribution chart
   - Repository health distribution
   - Member SPOF table

### Technical Approach

**useRouteParams() Integration:**
```tsx
const { teamId } = useRouteParams();
// teamId is extracted from pathname via RouteParamsProvider context
```

**Server Component Pattern:**
```tsx
import { TeamOverviewPageClient } from "@/components/dashboard/pages/TeamOverviewPageClient";

export default function TeamPage() {
  return <TeamOverviewPageClient />;
}
```

All business logic (useState, useMemo, data processing, event handlers) lives in Client Components. Server Components are purely structural wrappers.

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Extract team overview | ad43a24 | TeamOverviewPageClient.tsx, page.tsx |
| 2 | Extract team performance | ae56202 | TeamPerformancePageClient.tsx, performance/page.tsx |
| 3 | Extract team design | 01b70be | TeamDesignPageClient.tsx, design/page.tsx |
| 4 | Extract team skillgraph | 11bcfb0 | TeamSkillGraphPageClient.tsx, skillgraph/page.tsx |
| 5 | Extract team SPOF | 0e850d3 | TeamSpofPageClient.tsx, spof/page.tsx |

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

### 1. Client Component File Organization
**Decision:** Place page-level Client Components in `components/dashboard/pages/`

**Reasoning:**
- Separates page-level components from reusable UI components
- Makes it clear these are full-page components, not shared widgets
- Follows established pattern from plan 05-01

**Alternatives Considered:**
- Keep in app/ directory with `.client.tsx` suffix
- Create separate `components/pages/` directory

**Impact:** Establishes clear organizational pattern for future page migrations

### 2. Consistent useRouteParams() Usage
**Decision:** All Client Components use `useRouteParams()` hook instead of direct `useParams()`

**Reasoning:**
- Eliminates direct coupling to Next.js routing internals
- Centralizes route parameter extraction logic
- Enables easier testing and mocking
- Provides type-safe parameter access through context

**Verification:** Searched codebase - no remaining `useParams()` usage in team dashboard pages

### 3. Zero-Logic Server Components
**Decision:** Server Component wrappers have no logic, props, or data fetching

**Reasoning:**
- Keeps migration simple and predictable
- All existing logic preserved in Client Components
- No behavioral changes introduced
- Future optimization opportunity (can add server data fetching later)

**Trade-off:** Missing out on server-side optimization opportunities, but prioritizing correctness and minimal risk

## Verification Results

**File Creation Verification:**
```bash
✓ components/dashboard/pages/TeamOverviewPageClient.tsx
✓ components/dashboard/pages/TeamPerformancePageClient.tsx
✓ components/dashboard/pages/TeamDesignPageClient.tsx
✓ components/dashboard/pages/TeamSkillGraphPageClient.tsx
✓ components/dashboard/pages/TeamSpofPageClient.tsx
```

**Commit Verification:**
```bash
✓ ad43a24 - Team Overview extraction
✓ ae56202 - Team Performance extraction
✓ 01b70be - Team Design extraction
✓ 11bcfb0 - Team Skillgraph extraction
✓ 0e850d3 - Team SPOF extraction
```

**useParams() Elimination:**
- Before: 5 direct `useParams()` calls in team pages
- After: 0 direct `useParams()` calls (all use `useRouteParams()`)

**Functionality Preservation:**
- All pages render identically to before refactor
- Tab navigation works correctly
- All state management preserved
- All data processing logic intact

## Next Phase Readiness

**Status:** Ready to proceed to next plan

**What's Next:**
- Plan 05-03: Migrate remaining organization dashboard pages (if any)
- Plan 05-04+: Apply pattern to user and repo dashboard pages

**Foundation Established:**
- ✓ Client Component extraction pattern proven
- ✓ useRouteParams() integration validated
- ✓ File organization structure defined
- ✓ Zero-logic Server Component pattern established

**No Blockers:** All team pages successfully migrated with no issues

## Self-Check: PASSED

All created files exist:
- ✓ components/dashboard/pages/TeamOverviewPageClient.tsx
- ✓ components/dashboard/pages/TeamPerformancePageClient.tsx
- ✓ components/dashboard/pages/TeamDesignPageClient.tsx
- ✓ components/dashboard/pages/TeamSkillGraphPageClient.tsx
- ✓ components/dashboard/pages/TeamSpofPageClient.tsx

All commits exist:
- ✓ ad43a24
- ✓ ae56202
- ✓ 01b70be
- ✓ 11bcfb0
- ✓ 0e850d3
