---
phase: 04-remaining-tabs
plan: 03
subsystem: team-dashboard-spof
tags: [spof, risk-analysis, repository-health, member-table, distribution-chart]
requires:
  - 01-02-foundation (MemberPerformanceRow base, member name generation)
  - 03-02-performance-tab (BaseTeamsTable pattern, filter tabs pattern)
provides:
  - member-spof-data-layer (getMemberSpofData, getMemberSpofDataPoints)
  - spof-filter-logic (6 filter tabs with sort functions)
  - team-spof-gauge (calculateTeamSpofGaugeValue)
  - spof-insights (getSpofInsights for member-level risk analysis)
  - spof-tab-ui (complete SPOF tab at /org/:orgId/team/:teamId/spof)
affects:
  - 04-04-skillgraph-tab (final remaining tab, follows same pattern)
tech-stack:
  added: []
  patterns:
    - deterministic-spof-generation (noise-based SPOF score calculation)
    - member-color-assignment (cycle through DASHBOARD_COLORS palette)
    - repo-health-distribution (3-segment health calculation)
    - spof-risk-insights (member-specific insight generation)
key-files:
  created:
    - lib/teamDashboard/spofMockData.ts
    - lib/teamDashboard/spofHelpers.ts
  modified:
    - app/org/[orgId]/team/[teamId]/spof/page.tsx
decisions:
  - id: member-spof-data-structure
    what: "MemberSpofRow includes avgSpofScore (0-6), repo counts, health metrics, and memberColor"
    why: "Matches org SPOF tab data structure for component reuse"
    when: "Task 1"
  - id: color-cycling-for-members
    what: "Cycle through 6 DASHBOARD_COLORS for member chart colors"
    why: "Ensures distinct colors for up to 6 members in distribution chart"
    when: "Task 1"
  - id: spof-to-gauge-inversion
    what: "Lower SPOF score = higher gauge value (100 - (avgSpof/6)*100)"
    why: "Gauge displays 'safety' rather than 'risk', so invert the metric"
    when: "Task 1"
  - id: repo-health-aggregation
    what: "RepoHealthBar shows sum of all members' healthy/attention/critical repos"
    why: "Provides team-level view of repository health distribution"
    when: "Task 2"
  - id: inline-mini-bars-in-table
    what: "Repo Health column renders 3-segment mini bar inline in table"
    why: "Provides quick visual scan of member repo health without clicking"
    when: "Task 2"
  - id: member-color-dot-indicator
    what: "Add colored dot to member avatar in table matching chart legend color"
    why: "Links table rows to distribution chart data points visually"
    when: "Task 2"
duration: 3.7min
completed: 2026-02-06
---

# Phase 04 Plan 03: SPOF Tab Summary

**One-liner:** Member-level SPOF risk analysis with distribution chart, repo health tracking, and 6-filter member table

## What Was Built

Implemented the SPOF (Single Point of Failure) tab for team dashboard showing member-level risk distribution and repository health:

**Data Layer (Task 1):**
- `MemberSpofRow` type with SPOF score, repo counts, health metrics, and chart colors
- `getMemberSpofData()`: Deterministic member SPOF data generator (0.3-4.5 score range)
- `getMemberSpofDataPoints()`: Distribution chart data points (8-20 per member, ~60-80 total)
- `calculateTeamSpofGaugeValue()`: Team safety gauge (inverted: lower SPOF = higher gauge)
- `SpofMemberFilter` type and `SPOF_MEMBER_FILTER_TABS`: 6 filter configurations
- `spofMemberSortFunction()`: Sort logic for Highest/Lowest Risk, Most/Least Repos, Most Critical/Healthy
- `getSpofInsights()`: Member-specific insights (3-4 insights with highest/lowest risk, repo health)

**UI Layer (Task 2):**
- D3Gauge showing team SPOF risk score (0-100 scale, inverted from SPOF score)
- SpofDistributionChart with member SPOF data points and visibility toggles
- RepoHealthBar with aggregated member repository health (healthy/attention/critical)
- ChartInsights panel with member-specific SPOF risk insights
- BaseTeamsTable with 6 columns: Rank, Member (with color dot), SPOF Score (color-coded), Repos, High Risk, Repo Health (inline mini bar)
- 6 filter tabs: Highest Risk, Lowest Risk, Most Repos, Least Repos, Most Critical, Most Healthy
- Layout mirrors org dashboard SPOF page exactly

## Component Reuse

**Reused from existing codebase:**
- D3Gauge (org dashboard)
- SpofDistributionChart (org dashboard, accepts member names in 'team' field)
- RepoHealthBar (org dashboard, accepts custom segments prop)
- BaseTeamsTable (Performance tab pattern)
- ChartInsights (org dashboard)
- TeamAvatar (Overview tab)
- DashboardSection (standard layout)

**Pattern following:**
- Deterministic data generation (Phase 1 pattern)
- Filter tabs with sort functions (Performance tab pattern)
- Color cycling for members (Performance tab pattern)
- Member table columns structure (Performance tab pattern)

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Create SPOF mock data generator and helpers | 7f339bb | lib/teamDashboard/spofMockData.ts, lib/teamDashboard/spofHelpers.ts |
| 2 | Compose SPOF tab page with all components | 78c178d | app/org/[orgId]/team/[teamId]/spof/page.tsx |

## Technical Implementation

**SPOF Data Generation:**
```typescript
// Deterministic SPOF score generation
const spofNoise = noise(seed);
const avgSpofScore = Math.round((0.3 + spofNoise * 4.2) * 10) / 10; // 0.3-4.5

// Repo health derived from SPOF score
const healthyRatio = Math.max(0.2, 1 - avgSpofScore / 6.0);
const criticalRatio = Math.min(0.4, avgSpofScore / 6.0 * 0.6);
```

**Distribution Chart Data Points:**
```typescript
// 8-20 points per member clustered around their avgSpofScore
const pointCount = 8 + Math.floor(noise(seed) * 13);
const variation = (noise(pointSeed) - 0.5) * 2; // ±1 variation
const score = Math.max(0, Math.min(6, member.avgSpofScore + variation));
```

**Gauge Calculation (Inverted):**
```typescript
// Lower SPOF = higher safety gauge
const avgTeamSpof = members.reduce((sum, m) => sum + m.avgSpofScore, 0) / members.length;
return Math.round(100 - (avgTeamSpof / 6) * 100); // 0-100 scale
```

**Color Assignment:**
```typescript
const COLOR_PALETTE = [
  DASHBOARD_COLORS.blue,
  DASHBOARD_COLORS.excellent,
  DASHBOARD_COLORS.skillOrange,
  DASHBOARD_COLORS.skillLavender,
  DASHBOARD_COLORS.skillBlue,
  DASHBOARD_COLORS.skillGreen,
];
const memberColor = COLOR_PALETTE[index % COLOR_PALETTE.length];
```

## Decisions Made

**1. Member SPOF Data Structure**
- **Decision:** MemberSpofRow includes avgSpofScore (0-6), domainCount, skillCount, repoCount, highRiskCount, lowRiskCount, and 3 repo health metrics
- **Rationale:** Matches org SPOF tab structure for component reuse while adding member-specific metrics
- **Impact:** SpofDistributionChart and RepoHealthBar work without modifications

**2. SPOF Score to Gauge Inversion**
- **Decision:** Lower SPOF score = higher gauge value (formula: 100 - (avgSpof/6)*100)
- **Rationale:** Gauge displays "safety" rather than "risk" for positive UX framing
- **Impact:** Team with avgSpof 0 = gauge 100 (safest), avgSpof 6 = gauge 0 (riskiest)

**3. Member Color Assignment**
- **Decision:** Cycle through 6 DASHBOARD_COLORS palette colors
- **Rationale:** Ensures distinct colors for distribution chart legend and visual consistency
- **Impact:** Members get consistent colors across chart and table (color dot indicator)

**4. Repository Health Aggregation**
- **Decision:** RepoHealthBar shows sum of all members' healthy/attention/critical repo counts
- **Rationale:** Provides team-level view complementing individual member mini-bars in table
- **Impact:** Two levels of repo health visibility: team (top-level bar) and member (table column)

**5. Inline Mini Bars in Table**
- **Decision:** Repo Health column renders 3-segment horizontal bar inline
- **Rationale:** Quick visual scan of member repo health without opening details
- **Impact:** Better UX than showing just numeric counts

**6. Member Color Dot Indicator**
- **Decision:** Add colored dot overlay to TeamAvatar in table matching chart legend
- **Rationale:** Visual link between table rows and distribution chart data points
- **Impact:** Easier to correlate table members with chart clusters

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

✓ TypeScript compilation passes with no errors
✓ `npm run build` completes successfully
✓ SPOF tab page renders at `/org/:orgId/team/:teamId/spof`
✓ D3Gauge displays team SPOF risk score (0-100 scale, inverted)
✓ SpofDistributionChart receives member-level SpofDataPoint[] data
✓ RepoHealthBar renders with aggregated member repo health segments
✓ BaseTeamsTable renders all 6 SPOF-specific columns
✓ 6 filter tabs change table sort order correctly
✓ ChartInsights shows 3-4 member-specific SPOF risk insights

## Success Criteria Met

- [x] SPOF-01: SpofDistributionChart renders with member SPOF score distribution
- [x] SPOF-02: RepoHealthBar renders repository health distribution
- [x] SPOF-03: BaseTeamsTable shows members with SPOF score, repos, risk level, repo health columns
- [x] SPOF-04: 6 filter tabs (Highest/Lowest Risk, Most/Least Repos, Most Critical, Most Healthy) sort correctly
- [x] SPOF-05: ChartInsights panel shows 3-4 member-specific SPOF risk insights

## Metrics

- **Files created:** 2
- **Files modified:** 1
- **Lines added:** ~460
- **TypeScript errors:** 0
- **Build time:** ~2.7s (TypeScript compilation)
- **Execution time:** 3.7 minutes

## Next Phase Readiness

**Enables Phase 04 Plan 04 (Skillgraph Tab):**
- SPOF tab completes third of four remaining tabs
- Establishes member-level specialized metric pattern (SPOF risk)
- Validates distribution chart reuse with member data
- Confirms filter tab pattern scales to different metrics

**Readiness score: 100%** - All patterns established, final tab (Skillgraph) follows same structure.

**No blockers or concerns.**

## Self-Check: PASSED

All created files exist:
- lib/teamDashboard/spofMockData.ts
- lib/teamDashboard/spofHelpers.ts

All modified files exist:
- app/org/[orgId]/team/[teamId]/spof/page.tsx

All commits exist:
- 7f339bb (Task 1: SPOF mock data and helpers)
- 78c178d (Task 2: SPOF tab page composition)
