---
phase: 05-architectural-alignment
plan: 01
subsystem: infra
tags: [react, context, routing, typescript, nextjs]

# Dependency graph
requires:
  - phase: 04-remaining-tabs
    provides: Completed dashboard pages using mixed routing patterns
provides:
  - Type-safe context factory (getStrictContext)
  - RouteParamsProvider for extracting orgId/teamId/userId/repoId from pathname
  - Org-level layout wrapping all /org/[orgId]/ routes with RouteParamsProvider
  - Centralized URL building in dashboardTabHelpers using route utilities
affects: [05-02, 05-03, 05-04, future-route-dependent-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "getStrictContext factory for type-safe contexts without null checks"
    - "RouteParamsProvider pattern for extracting route params via context"
    - "Layout-based provider wrapping for automatic context availability"
    - "Centralized route utilities replace manual URL string concatenation"

key-files:
  created:
    - lib/get-strict-context.tsx
    - lib/RouteParamsProvider.tsx
    - app/org/[orgId]/layout.tsx
  modified:
    - components/dashboard/layout/helpers/dashboardTabHelpers.ts

key-decisions:
  - "getStrictContext throws runtime error if hook used outside provider (eliminates null checks)"
  - "RouteParamsProvider pre-binds URL builders with orgId for convenience"
  - "Org layout is Server Component wrapping client-side RouteParamsProvider"
  - "dashboardTabHelpers refactored to use getTeamPath/getUserPath/getRepoPath/getOrgPath"
  - "RouteParamsProvider marked 'use client' for usePathname hook compatibility"

patterns-established:
  - "Strict context pattern: context factory returns [Context, useHook] tuple with null safety"
  - "Route params context pattern: extract params from pathname once, provide everywhere via context"
  - "Layout-based provider: wrap route segments at appropriate level for automatic availability"
  - "Centralized route utilities: all URL building uses lib/routes.ts functions"

# Metrics
duration: 2min
completed: 2026-02-08
---

# Phase 05 Plan 01: Architectural Foundation Summary

**Type-safe context factory, RouteParamsProvider with route params extraction, org layout wrapper, and centralized URL building in dashboardTabHelpers**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-08T09:46:28Z
- **Completed:** 2026-02-08T09:48:22Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created getStrictContext factory for type-safe contexts that throw on null access
- Implemented RouteParamsProvider extracting orgId/teamId/userId/repoId from pathname
- Added org-level layout wrapping all /org/[orgId]/ routes with RouteParamsProvider
- Refactored dashboardTabHelpers to use centralized route utilities instead of manual URL strings

## Task Commits

Each task was committed atomically:

1. **Task 1: Create strict context utility and RouteParamsProvider** - `955eda4` (feat)
2. **Task 2: Create org layout wrapper and refactor URL building** - `355c805` (feat)

## Files Created/Modified
- `lib/get-strict-context.tsx` - Type-safe context factory that throws if hook used outside provider
- `lib/RouteParamsProvider.tsx` - Route params context provider extracting route params from pathname
- `app/org/[orgId]/layout.tsx` - Org-level layout wrapping children with RouteParamsProvider
- `components/dashboard/layout/helpers/dashboardTabHelpers.ts` - Refactored to use centralized route utilities

## Decisions Made
- **getStrictContext pattern:** Returns `[Context, useHook]` tuple where hook throws descriptive error if used outside provider, eliminating null checks at call sites
- **RouteParamsProvider pre-binding:** URL builder functions are pre-bound with orgId for convenience (e.g., `getTeamUrl(teamId, tab)` instead of requiring orgId each time)
- **Server/Client composition:** Org layout is Server Component that renders client-side RouteParamsProvider (marked 'use client' for usePathname hook)
- **Centralized URL building:** Replaced all manual template literals like `` `/org/${orgId}/team/${teamId}` `` with `getTeamPath(orgId, teamId)` calls in dashboardTabHelpers
- **Tab key normalization:** Convert 'overview' to undefined before passing to route builders (they handle default behavior)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Infrastructure foundation is complete and ready for page migrations:
- All pages under /org/[orgId]/ now have access to useRouteParams() hook
- URL building centralized in lib/routes.ts
- Type-safe context pattern established for future providers
- App builds successfully with no TypeScript errors

**Ready for:** Plan 05-02 (page migrations to use new infrastructure)

## Self-Check: PASSED

All files created:
- FOUND: lib/get-strict-context.tsx
- FOUND: lib/RouteParamsProvider.tsx
- FOUND: app/org/[orgId]/layout.tsx
- FOUND: components/dashboard/layout/helpers/dashboardTabHelpers.ts (modified)

All commits exist:
- FOUND: 955eda4 (Task 1)
- FOUND: 355c805 (Task 2)

---
*Phase: 05-architectural-alignment*
*Completed: 2026-02-08*
