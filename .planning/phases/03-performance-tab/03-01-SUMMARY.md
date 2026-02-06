---
phase: 03-performance-tab
plan: 01
title: "Performance Tab Data Layer"
subsystem: "team-dashboard"
tags: ["types", "mock-data", "helpers", "time-series", "data-layer"]

# Dependency tracking
requires:
  - 01-01-PLAN.md  # MemberPerformanceRow type definition
  - 01-02-PLAN.md  # Team structure for mock data
  - 02-01-PLAN.md  # Overview gauge calculation pattern
provides:
  - Performance types (ViewMode, PerformanceFilter, MemberPerformanceDataPoint)
  - Time-series mock data generator (90 days, deterministic)
  - Smart sampling (reduce to ~40 points)
  - Time range filtering (1m/3m/1y/max)
  - Member visibility calculation (6 filter types)
  - Performance insight generation (3-4 contextual insights)
affects:
  - 03-02-PLAN.md  # Performance page will consume these utilities

# Tech stack tracking
tech-stack:
  added: []
  patterns:
    - deterministic-noise  # Reused from overviewMockData.ts
    - smart-sampling  # Preserve first/last, evenly distribute middle points
    - average-aggregation  # Matches Overview gauge pattern (not median)

# File tracking
key-files:
  created:
    - lib/teamDashboard/performanceTypes.ts
    - lib/teamDashboard/performanceMockData.ts
    - lib/teamDashboard/performanceHelpers.ts
  modified:
    - lib/teamDashboard/types.ts

# Decisions made
decisions:
  - id: perf-01-aggregate-average
    title: "Use average (not median) for aggregate calculation"
    rationale: "Matches Phase 2 Overview gauge calculation: teamGaugeValue = Math.round(sum / members.length)"
    impact: "Consistent UX between Overview and Performance tabs"
  - id: perf-01-90-days
    title: "Generate 90 days of time-series data"
    rationale: "Enough for 3-month range, partial 1-year coverage"
    impact: "1-year range will show partial data (design decision)"
  - id: perf-01-smart-sampling
    title: "Smart sampling reduces to ~40 points"
    rationale: "Balance chart readability and performance"
    impact: "Charts render fast, trends remain visible"
  - id: perf-01-two-point-threshold
    title: "Time range enabled when >= 2 data points exist"
    rationale: "Minimum to draw a line chart"
    impact: "Range buttons disabled for insufficient data"

# Execution metrics
metrics:
  duration: "2min"
  completed: "2026-02-06"
  task-commits: 2
  files-created: 3
  files-modified: 1
---

# Phase 03 Plan 01: Performance Tab Data Layer Summary

**One-liner:** Created performance data layer with time-series mock generator (90 days), smart sampling (~40 points), time range filtering, and insight generation.

## What Was Built

### Types Layer
- **performanceTypes.ts**: ViewMode (aggregate/individual), PerformanceFilter (6 types), MemberPerformanceDataPoint
- **Extended MemberPerformanceRow**: Added optional `change` and `churnRate` fields (no breaking changes)

### Mock Data Generator
- **generateMemberPerformanceTimeSeries**: 90 daily data points
  - Deterministic noise based on member name + day index (stable across renders)
  - Each point includes team average + individual member values
  - All values clamped to 0-100
  - Team average calculated as simple average (matches Overview gauge)

### Helper Functions
1. **smartSample**: Reduce data to ~40 points preserving first/last
2. **filterByTimeRange**: Clip data to 1m/3m/1y/max
3. **isTimeRangeSufficient**: Check >= 2 points exist
4. **getVisibleMembersForFilter**: Calculate visible members for individual view mode (6 filter types)
5. **getPerformanceInsights**: Generate 3-4 contextual insights based on data and time range

## Deviations from Plan

None - plan executed exactly as written.

## Task Commits

| Task | Name                                                          | Commit  | Files                                                                         |
| ---- | ------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| 1    | Create performance types and extend MemberPerformanceRow      | d25d857 | lib/teamDashboard/performanceTypes.ts, lib/teamDashboard/types.ts            |
| 2    | Create mock data generator and performance helper functions  | f36590f | lib/teamDashboard/performanceMockData.ts, lib/teamDashboard/performanceHelpers.ts |

## Technical Decisions

### Data Generation Strategy
- **90 days of data**: Sufficient for 3-month range, partial 1-year
- **Deterministic noise**: Reused `noise()` pattern from overviewMockData.ts
- **Member value calculation**: `member.performanceValue + random_walk_variation`
- **Team average**: Simple average of all member values (matches Phase 2 pattern)

### Smart Sampling Algorithm
- If data.length <= targetPoints, return unchanged
- Always include first and last point
- Evenly distribute remaining points: `step = (data.length - 1) / (targetPoints - 1)`

### Time Range Filtering
- Filter first, sample second (correct order)
- "max" returns all data
- 1m/3m/1y: calculate startDate from last data point, filter where date >= startDate

### Member Visibility Logic
- mostProductive/leastProductive: sort, take top 3
- mostImproved/mostRegressed: filter where change > 0 or < 0 (all that match)
- highestChurn/lowestChurn: sort by churnRate, take top 3
- Always spread-copy arrays before sorting (no mutation)

### Insight Generation
- Trend insight: change > 5 (positive), < -5 (concern), else stable
- Top performers: performanceValue >= 75
- Improved members: change > 10
- Low performers: performanceValue < 40
- Return up to 4 insights, personalized with member names

## Patterns Established

1. **Deterministic mock data**: Stable across renders using hash-based seeds
2. **Average aggregation**: Consistent with Overview gauge calculation
3. **Smart sampling**: Preserve endpoints, evenly distribute middle
4. **Filter-then-sample**: Correct data transformation order
5. **Type-safe helpers**: Generic constraints ensure correct date field access

## Next Phase Readiness

**Ready for Plan 02 (Performance Page UI):**
- ✅ All types exported and available
- ✅ Mock data generator ready to use
- ✅ All 5 helper functions exported
- ✅ Zero TypeScript errors
- ✅ No breaking changes to existing code

**Integration points for Plan 02:**
- Import `generateMemberPerformanceTimeSeries` to create chart data
- Import `smartSample` and `filterByTimeRange` for chart rendering
- Import `isTimeRangeSufficient` to enable/disable time range buttons
- Import `getVisibleMembersForFilter` for individual view mode
- Import `getPerformanceInsights` for insights section

## Performance Characteristics

- **Mock data generation**: O(days × members) = O(90 × 6) = 540 data points
- **Smart sampling**: O(n) single pass
- **Time range filtering**: O(n) single pass
- **Member visibility**: O(n log n) for sorting filters
- **Insight generation**: O(n) multiple passes (separate concerns)

All operations execute in milliseconds for typical team sizes (6-8 members).

## Verification Results

- ✅ `npx tsc --noEmit` passes with zero errors
- ✅ performanceTypes.ts exports ViewMode, PerformanceFilter, MemberPerformanceDataPoint
- ✅ performanceMockData.ts exports generateMemberPerformanceTimeSeries
- ✅ performanceHelpers.ts exports all 5 helper functions
- ✅ types.ts has change and churnRate optional fields
- ✅ Existing MemberTable and overview page still work (no breaking changes)

## Duration

**Total execution time:** 2 minutes
- Task 1: Types and type extensions
- Task 2: Mock data and helpers
- Verification: TypeScript compilation

---

*Plan 03-01 completed 2026-02-06 by Claude Sonnet 4.5*

## Self-Check: PASSED

All created files verified:
- ✅ lib/teamDashboard/performanceTypes.ts
- ✅ lib/teamDashboard/performanceMockData.ts
- ✅ lib/teamDashboard/performanceHelpers.ts
- ✅ lib/teamDashboard/types.ts (modified)

All commits verified:
- ✅ d25d857 (Task 1)
- ✅ f36590f (Task 2)
