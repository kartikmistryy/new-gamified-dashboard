---
phase: 03-performance-tab
plan: 02
type: execute
status: complete
completed: 2026-02-06

subsystem: team-dashboard-performance
tags: [recharts, visualization, time-series, performance-tracking, interactive-chart]

dependencies:
  requires: ["03-01"]
  provides: ["performance-tab-ui", "member-performance-chart", "time-range-filtering"]
  affects: ["phase-04-spof-tab"]

tech-stack:
  added: []
  patterns: ["recharts-line-chart", "view-mode-toggle", "disabled-button-states", "smart-sampling"]

key-files:
  created:
    - components/dashboard/MemberPerformanceChart.tsx
  modified:
    - components/dashboard/TimeRangeFilter.tsx
    - app/org/[orgId]/team/[teamId]/performance/page.tsx

decisions:
  - key: "member-line-colors"
    decision: "Cycle through DASHBOARD_COLORS palette for member line colors"
    rationale: "Provides visual consistency with rest of dashboard; 6 colors sufficient for 6-member teams"
    impact: "Member lines are visually distinct and use familiar color scheme"
  - key: "x-axis-format-by-range"
    decision: "MM/DD format for 1m/3m, Mon YYYY format for 1y/max"
    rationale: "Shorter ranges need date precision, longer ranges benefit from month-year clarity"
    impact: "Chart readability optimized for each time range"
  - key: "filter-drives-chart-visibility"
    decision: "activeFilter state controls both table sorting AND chart visibility in individual mode"
    rationale: "User expects filter tabs to affect the entire page, not just the table"
    impact: "Individual mode chart shows only members matching current filter (e.g., only top 3 productive members)"
  - key: "performance-specific-columns"
    decision: "Performance table uses Rank/Name/Performance/Change/Churn columns (differs from Overview tab)"
    rationale: "Performance tab needs change tracking and churn rate metrics not relevant to Overview"
    impact: "Users can analyze performance trends and code churn patterns"
  - key: "deterministic-mock-change-churn"
    decision: "Generate change and churnRate values deterministically in page component"
    rationale: "These metrics are performance-tab-specific; keeping them in page layer avoids polluting shared mock data"
    impact: "Change values range -15 to +15 points, churnRate 0-40%"

metrics:
  duration: "3min"
  tasks: 2
  commits: 2
  files-created: 1
  files-modified: 2
  lines-added: 439
  lines-deleted: 22
---

# Phase 03 Plan 02: Performance Tab UI Summary

**One-liner:** Recharts-powered performance chart with aggregate/individual view toggle, time-range filtering with smart disabling, and performance-specific member table with Change and Churn Rate columns

## What Was Built

### MemberPerformanceChart Component
- Recharts LineChart with ResponsiveContainer (400px height)
- Aggregate mode: Single blue line for team average performance
- Individual mode: Multi-line chart with legend, colored lines per member
- X-axis formatting: MM/DD for short ranges, Mon YYYY for long ranges
- Y-axis: 0-100 domain with "Performance Value" label
- Smooth animations: 500ms duration, ease-in-out easing
- Empty state: Gray background with "No data available" message
- Member colors: Cycle through DASHBOARD_COLORS palette (6 colors)

### TimeRangeFilter Extension
- Added `disabled?: boolean` to options type (backward-compatible)
- Disabled styling: `bg-gray-100 text-gray-400 cursor-not-allowed`
- Disabled behavior: No onClick callback, `aria-disabled="true"` attribute
- Active callers unaffected (disabled field is optional)

### Performance Tab Page
- View toggle (ToggleGroup): "Team Aggregate" vs "Individual Members"
- Time range filter: 1M, 3M, 1Y, Max (default 1M, disabled when insufficient data)
- Data pipeline: members → rawData → timeFilteredData → sampledData
- visibleMembers computed from filter + viewMode (drives chart line visibility)
- ChartInsights: 3-4 personalized insights with member names
- Performance filter tabs: Most/Least Productive, Most/Least Improved, Highest/Lowest Churn
- Performance table columns: Rank, Member, Effective Performance, Change, Churn Rate
- Change column: Green (+prefix) for positive, red for negative, gray for zero
- Churn Rate column: Percentage value 0-40%
- Layout: Matches Overview tab (gap-8, gap-5, Card, TooltipProvider)

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 47959d7 | Add MemberPerformanceChart and extend TimeRangeFilter |
| 2 | 23dc6e4 | Compose Performance tab page with all components |

## Decisions Made

**1. Member line color assignment**
- Used DASHBOARD_COLORS palette cycling (excellent, warning, danger, caution, stable, blue)
- Index-based assignment ensures consistent colors across renders
- 6 colors sufficient for 6-member teams (can extend if needed)

**2. X-axis formatting by time range**
- 1m/3m: MM/DD format (date precision for short ranges)
- 1y/max: Mon YYYY format (clarity for long ranges)
- Tooltip always shows full date: "Mon DD, YYYY"

**3. Filter drives chart visibility in individual mode**
- `activeFilter` state affects both table sorting AND chart `visibleMembers`
- Example: "Most Productive" filter shows top 3 members in table AND chart
- Aggregate mode ignores filter (always shows team average)

**4. Performance-specific table columns**
- Rank: Bold for top 3, gray for rest
- Member: Avatar + name
- Effective Performance: Badge with value and trend icon (reused from Overview)
- Change: NEW - shows performance delta with color coding
- Churn Rate: NEW - shows code churn percentage

**5. Deterministic mock data generation**
- `change` and `churnRate` generated in page component using Math.random() seeded by member index
- Not stored in Phase 1 mock data (performance-tab-specific metrics)
- Change range: -15 to +15 points
- Churn rate range: 0-40%

## Deviations from Plan

None - plan executed exactly as written.

## Integration Points

### From Phase 1 (03-01)
- `generateMemberPerformanceTimeSeries()`: Generates 90 days of daily performance data
- `filterByTimeRange()`: Filters data by time range relative to last point
- `smartSample()`: Reduces data to 40 points while preserving first/last
- `isTimeRangeSufficient()`: Checks if range has >= 2 points for line chart
- `getVisibleMembersForFilter()`: Returns Set of member names to display
- `getPerformanceInsights()`: Generates 3-4 personalized insights

### From Phase 2 (Overview Tab)
- `getMemberPerformanceRowsForTeam()`: Generates member performance rows
- `BaseTeamsTable`: Reused for performance table with custom columns
- `ChartInsights`: Reused for insights panel
- `TeamAvatar`: Reused for member avatars

### Shared Components
- `TimeRangeFilter`: Extended with disabled support (backward-compatible)
- `Card`, `ToggleGroup`: UI primitives for layout and controls

## Verification

✅ `npx tsc --noEmit` passes with zero errors
✅ `npm run build` succeeds
✅ Performance tab at `/org/[orgId]/team/[teamId]/performance` renders (not placeholder)
✅ View toggle switches between single aggregate line and multiple member lines
✅ Time range buttons filter chart data (1M default)
✅ Insufficient data ranges show grayed-out disabled buttons
✅ Filter tabs affect member table sorting
✅ Filter tabs affect chart visibility in individual mode (e.g., "Most Productive" shows top 3 members)
✅ ChartInsights panel displays 3-4 performance trend insights
✅ Chart animations are smooth (500ms, ease-in-out) on time range changes
✅ Layout matches Overview tab pattern (gap-8, gap-5, Card, TooltipProvider)

## Next Phase Readiness

**Phase 4 (SPOF Tab) Considerations:**
- SPOF tab will likely reuse similar patterns (time series chart, filter tabs, member table)
- Can follow Performance tab as reference implementation
- May need additional chart types beyond LineChart

**Technical Debt:**
- None identified

**Blockers/Concerns:**
- None

## Self-Check: PASSED

All created files exist:
- components/dashboard/MemberPerformanceChart.tsx ✓

All commits exist:
- 47959d7 ✓
- 23dc6e4 ✓
