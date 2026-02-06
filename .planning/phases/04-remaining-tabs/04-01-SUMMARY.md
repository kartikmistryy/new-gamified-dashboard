---
phase: 04-remaining-tabs
plan: 01
subsystem: ui
tags: [react, nextjs, charts, ownership-scatter, chaos-matrix, design-metrics]

# Dependency graph
requires:
  - phase: 01-foundation-type-system
    provides: Base member types and mock data generation patterns
  - phase: 03-performance-tab
    provides: BaseTeamsTable component and table filter patterns
provides:
  - Design tab with ownership scatter plot and chaos matrix for members
  - MemberDesignRow type with ownership and chaos metrics
  - Design mock data generators with deterministic generation
  - 6 filter tabs for design analysis (ownership, AI usage, chaos)
affects: [05-skillgraph-tab, 06-spof-tab, design-analysis, member-metrics]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Member design metrics generation using deterministic seeds
    - Transform functions for chart data compatibility
    - Stacked segment bars for ownership and chaos visualization

key-files:
  created:
    - lib/teamDashboard/designMockData.ts
    - lib/teamDashboard/designHelpers.ts
  modified:
    - app/org/[orgId]/team/[teamId]/design/page.tsx

key-decisions:
  - "Use member name charCode + index as seed for deterministic design metrics"
  - "Calculate outlier detection via standard deviation (>1 stddev = outlier)"
  - "Use member name as ChaosMatrix 'team' field so each member is distinct group"
  - "Reuse OWNERSHIP_SEGMENTS and CHAOS_SEGMENTS from org dashboard pattern"
  - "Filter badges rendered outside BaseTeamsTable (matches org design pattern)"

patterns-established:
  - "Design metrics: ownership allocation (3 segments), engineering chaos (4 segments)"
  - "Score-based filtering: derive scores from metrics for deterministic sorting"
  - "Transform functions bridge mock data format to chart component interfaces"

# Metrics
duration: 3.4min
completed: 2026-02-06
---

# Phase 04 Plan 01: Design Tab Implementation Summary

**Member-level design tab with ownership scatter plot, chaos matrix, and 6-filter design analysis table**

## Performance

- **Duration:** 3.4 min
- **Started:** 2026-02-06T15:40:48Z
- **Completed:** 2026-02-06T15:44:09Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Member design mock data generator with ownership and chaos metrics
- OwnershipScatter integration showing member data points with outlier detection
- ChaosMatrix integration showing member chaos positions (KP vs churn rate)
- Design filter tabs: Highest/Lowest Ownership, Skilled AI, Traditional Dev, Highest/Lowest Chaos
- Stacked segment bars for ownership allocation and engineering chaos index

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Design mock data generator and helpers** - `45a1658` (feat)
2. **Task 2: Compose Design tab page with all components** - `96b60bb` (feat)

## Files Created/Modified
- `lib/teamDashboard/designMockData.ts` - MemberDesignRow type, getMemberDesignData(), transform functions for scatter/chaos data
- `lib/teamDashboard/designHelpers.ts` - DesignMemberFilter type, filter tabs, sort function, getDesignInsights()
- `app/org/[orgId]/team/[teamId]/design/page.tsx` - Full Design tab with OwnershipScatter, ChaosMatrix, BaseTeamsTable, filter badges

## Decisions Made

**1. Use member name charCode + index as seed for deterministic design metrics**
- Rationale: Ensures consistent data generation across renders while providing member-specific variation
- Pattern matches Performance tab deterministic generation approach

**2. Calculate outlier detection via standard deviation (>1 stddev = outlier)**
- Rationale: Statistical approach provides consistent outlier classification within member cohort
- Enables automatic "high" vs "low" outlier type determination

**3. Use member name as ChaosMatrix 'team' field so each member is distinct group**
- Rationale: ChaosMatrix component groups by 'team' field; using member name makes each point independently visible/toggleable
- Maintains component reuse without requiring member-specific logic

**4. Reuse OWNERSHIP_SEGMENTS and CHAOS_SEGMENTS from org dashboard pattern**
- Rationale: Maintains visual consistency with org dashboard design tab
- 3-segment ownership (high/balanced/low) and 4-segment chaos (skilled AI/traditional/unskilled AI/low-skill)

**5. Filter badges rendered outside BaseTeamsTable (matches org design pattern)**
- Rationale: Consistent with org Design page lines 83-96, provides flexible layout control
- BaseTeamsTable receives `showFilters={false}` and filters rendered in DashboardSection action slot

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All components integrated smoothly using established patterns.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Design tab complete with full member-level analysis
- Ready for Skills Graph tab (04-02) implementation
- Established design metrics pattern reusable for other tabs
- All chart components proven compatible with member-level data

---

## Self-Check: PASSED

All created files exist:
- lib/teamDashboard/designMockData.ts ✓
- lib/teamDashboard/designHelpers.ts ✓

All commits exist:
- 45a1658 ✓
- 96b60bb ✓

---
*Phase: 04-remaining-tabs*
*Completed: 2026-02-06*
