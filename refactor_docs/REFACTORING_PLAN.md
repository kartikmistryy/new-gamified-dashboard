# Comprehensive Codebase Refactoring Plan

**Generated**: 2026-02-10
**Updated**: 2026-02-10 (Added anti-pattern analysis findings)
**Status**: Pending Approval
**Estimated Total Effort**: 85-115 hours (73-97 hours required, +12-18 hours optional)

---

## Executive Summary

The codebase has **strong architectural foundations** (proper Server/Client Component split, centralized routing, type-safe route params) but suffers from:

1. **🔴 CRITICAL: Duplicate route structure** (`/repo/` AND `/repository/` - 8 duplicate pages causing navigation confusion)
2. **🔴 CRITICAL: Barrel export violations** (2 index.ts files violating explicit project rule)
3. **🔴 CRITICAL: Massive code duplication** (21 files duplicated between team/repo dashboards + 200+ lines of identical helpers)
4. **🔴 CRITICAL: Triple TimeRange implementation** (3 separate implementations causing type incompatibility)
5. **🟠 HIGH: File size violations** (30+ files exceed 200-line limit, some by 300+ lines)
6. **🟠 HIGH: Inconsistent patterns** (dual controlled/uncontrolled components, 59 unused imports, magic numbers)
7. **🟡 MEDIUM: Poor file organization** (53 files in `/components/dashboard` + 12 in `/lib/dashboard` without entity-based subfolders)
8. **🟡 MEDIUM: Hardcoded values** (32 files with hardcoded colors, 100+ magic numbers)

This plan addresses all violations through 5 phased refactorings with approval gates between each phase.

---

## Table of Contents

1. [Critical Violations](#critical-violations)
2. [Major Violations](#major-violations)
3. [Minor Violations](#minor-violations)
4. [Refactoring Opportunities](#refactoring-opportunities)
5. [Phased Execution Plan](#phased-execution-plan)
6. [Architecture Compliance Status](#architecture-compliance-status)
7. [Effort Estimates](#effort-estimates)

---

## Critical Violations

### CV-1: Barrel Export Violations ⚠️
**Rule**: "Never use barrel exports (index.ts/index.tsx files that re-export from multiple files)"

**Violations**:
- `/lib/shared/types/index.ts` (117 lines) - Re-exports from 5 type files
- `/lib/dashboard/performanceChart/index.ts` (62 lines) - Re-exports from 3 files

**Current State**: Central index files re-exporting types, transformers, generators
```typescript
// lib/shared/types/index.ts
export * from "./entityTypes";
export * from "./chartTypes";
export * from "./timeRangeTypes";
// ... etc
```

**Expected State**: Direct imports from source files
```typescript
// BEFORE
import { TeamId, ChartDataPoint } from "@/lib/shared/types";

// AFTER
import { TeamId } from "@/lib/shared/types/entityTypes";
import { ChartDataPoint } from "@/lib/shared/types/chartTypes";
```

**Impact**:
- Violates explicit project rule
- Increases bundle size
- Makes tree-shaking harder
- Affects ~50+ import statements across codebase

**Effort**: Medium (3-4 hours)
**Priority**: CRITICAL

---

### CV-2: Massive Code Duplication - Performance Helpers 🔁
**Rule**: "If a utility, component, hook, or block of code is repeated in the app, extract it into a reusable piece"

**Violations**:
- `/lib/repoDashboard/performanceHelpers.ts` (501 lines)
- `/lib/teamDashboard/performanceHelpers.ts` (209 lines)

**Duplicate Functions** (100% identical implementation):
1. `smartSample<T>()` - Reduces data to target points
2. `filterByTimeRange<T>()` - Filters by time range
3. `isTimeRangeSufficient<T>()` - Checks data sufficiency
4. `getPerformanceInsights()` - Generates chart insights
5. `aggregateMetrics()` - Aggregates performance metrics

**Current State**: Same functions duplicated in 2 files with only type name differences (Contributor vs Member)

**Expected State**: Extract to `/lib/shared/performanceUtils.ts` with generic types
```typescript
// lib/shared/performanceUtils.ts
export function smartSample<T extends { timestamp: number }>(
  data: T[],
  targetPoints: number
): T[] {
  // ... implementation
}

export function filterByTimeRange<T extends { timestamp: number }>(
  data: T[],
  timeRange: TimeRangeKey
): T[] {
  // ... implementation
}
```

**Impact**:
- CRITICAL: 200+ lines of duplicate code
- Maintenance nightmare (bug fixes need 2x updates)
- Inconsistent behavior risk between dashboards

**Effort**: Medium (2-3 hours)
**Priority**: CRITICAL

---

### CV-3: Duplicate Data Generation Logic 🔁
**Rule**: "If a utility, component, hook, or block of code is repeated in the app, extract it into a reusable piece"

**Duplicate Files**:
1. `/lib/repoDashboard/collaborationNetworkData.ts` vs `/lib/teamDashboard/collaborationNetworkData.ts`
2. `/lib/repoDashboard/skillsMockDataGenerator.ts` vs `/lib/teamDashboard/skillsMockDataGenerator.ts`
3. `/lib/repoDashboard/spofMockData.ts` vs `/lib/teamDashboard/spofMockData.ts`

**Impact**: CRITICAL - Duplicate business logic, inconsistent behavior between dashboards
**Effort**: Large (6-8 hours - requires careful abstraction)
**Priority**: HIGH

---

### CV-4: Poor File Organization (Components, Hooks, Helpers, Utils) 📁
**Rule**: "Root `/components` must use **intent-based folders**" + "Organize files into subfolders when there are 10+ files to avoid confusion"

**Violations**:
1. **53 files** in `/components/dashboard` root without entity-based organization
2. **12 files** in `/lib/dashboard` root - mix of shared and entity-specific files
3. **21 files each** in `/lib/orgDashboard`, `/lib/teamDashboard`, `/lib/repoDashboard` (borderline - could benefit from feature-based subfolders)

**Current State - Components**: 53 files in `/components/dashboard` root without entity-based organization
```
components/dashboard/
├── ChaosMatrixChart.tsx           (org-specific)
├── MemberPerformanceChart.tsx     (team-specific)
├── ContributorTable.tsx           (repo-specific)
├── SkillgraphBySkillTable.tsx     (user-specific)
├── PerformanceChart.tsx           (shared)
├── ... 48 more files
```

**Expected State**: Organize into entity-based subfolders
```
components/dashboard/
├── shared/                        (used across multiple dashboards)
│   ├── BaseTeamsTable.tsx
│   ├── DashboardSection.tsx
│   ├── SegmentBar.tsx
│   ├── TimeRangeFilter.tsx
│   ├── FilterBadges.tsx
│   ├── GaugeSection.tsx
│   ├── GaugeWithInsights.tsx
│   ├── PerformanceChart.tsx
│   ├── PerformanceChartSVG.tsx
│   ├── PerformanceChartLegend.tsx
│   └── ... (15 total shared components)
├── orgDashboard/                  (org-specific components)
│   ├── ChaosMatrixChart.tsx
│   ├── OwnershipScatter.tsx
│   ├── DesignTeamsTable.tsx
│   ├── PerformanceTeamsTable.tsx
│   └── TeamTable.tsx
├── teamDashboard/                 (team-specific components)
│   ├── MemberTable.tsx
│   ├── MemberPerformanceChart.tsx
│   ├── CollaborationNetworkGraph.tsx
│   ├── SpofTeamsTable.tsx
│   └── SpofDistributionChart.tsx
├── repoDashboard/                 (repo-specific components)
│   ├── ContributorPerformanceCarousel.tsx
│   ├── ContributorCarouselHeader.tsx
│   ├── ContributorCarouselNavigation.tsx
│   ├── ContributorCarouselSlide.tsx
│   ├── ContributorPerformanceBarChart.tsx
│   ├── ContributorMetricsChart.tsx
│   ├── ContributorTable.tsx
│   ├── ModulesTable.tsx
│   ├── ModuleDetailSheet.tsx
│   └── ContributionFlowSVG.tsx
├── userDashboard/                 (user-specific components)
│   ├── SkillgraphBySkillTable.tsx
│   ├── SkillgraphByTeamTable.tsx
│   ├── SkillgraphDetailTable.tsx
│   ├── SkillgraphProgressBar.tsx
│   ├── SkillgraphTeamDetailTable.tsx
│   └── SkillgraphTeamsTable.tsx
├── pages/                         (page client components - already organized)
│   ├── OrgPerformancePageClient.tsx
│   ├── TeamPerformancePageClient.tsx
│   └── ...
├── layout/                        (existing - layout components)
└── tabs/                          (existing - tab components)
```

**Component Categorization**:

**Shared (15 files)**:
- BaseTeamsTable, DashboardSection, SegmentBar, TimeRangeFilter
- FilterBadges, GaugeSection, GaugeWithInsights, ChartInsights
- PerformanceChart, PerformanceChartSVG, PerformanceChartLegend
- ComparativePerformanceChart, ComparativePerformanceChartSVG, ComparativePerformanceChartLegend
- OverviewSummaryCard, SortableTableHeader, VisibilityToggleButton
- TimeRangeDropdown, GlobalTimeRangeFilter, D3Gauge
- SPOFTreemap, SankeyContributionChart, RepoHealthBar, DomainDistributionBar

**Org Dashboard (5 files)**:
- ChaosMatrixChart, OwnershipScatter, DesignTeamsTable
- PerformanceTeamsTable, TeamTable

**Team Dashboard (5 files)**:
- MemberTable, MemberPerformanceChart, CollaborationNetworkGraph
- SpofTeamsTable, SpofDistributionChart

**Repo Dashboard (10 files)**:
- ContributorPerformanceCarousel, ContributorCarouselHeader
- ContributorCarouselNavigation, ContributorCarouselSlide
- ContributorPerformanceBarChart, ContributorMetricsChart
- ContributorTable, ModulesTable, ModuleDetailSheet
- ContributionFlowSVG, ContributorMetricsCard, ContributorPerformanceChartAdapter

**User Dashboard (6 files)**:
- SkillgraphBySkillTable, SkillgraphByTeamTable
- SkillgraphDetailTable, SkillgraphProgressBar
- SkillgraphTeamDetailTable, SkillgraphTeamsTable

---

**Current State - lib/dashboard**: 12 files in root mixing shared and entity-specific utilities
```
lib/dashboard/
├── MultiTimeRangeContext.tsx         (shared)
├── TimeRangeContext.tsx              (shared)
├── TimeRangeFilter.tsx               (shared)
├── timeRangeTypes.ts                 (shared)
├── chartConstants.ts                 (shared)
├── trendHelpers.ts                   (shared)
├── skillgraphColumns.tsx             (user-specific)
├── skillgraphTableUtils.ts           (user-specific)
├── skillgraphTeamColumns.tsx         (user-specific)
├── skillgraphTeamTableUtils.ts       (user-specific)
├── contributorCarousel.ts            (repo-specific)
└── useCarouselNavigation.ts          (repo-specific)
```

**Expected State - lib/dashboard**: Organize into entity-based subfolders
```
lib/dashboard/
├── shared/                           (truly shared utilities)
│   ├── MultiTimeRangeContext.tsx
│   ├── TimeRangeContext.tsx
│   ├── TimeRangeFilter.tsx
│   ├── timeRangeTypes.ts
│   ├── chartConstants.ts
│   └── trendHelpers.ts
├── userDashboard/                    (user dashboard utilities)
│   ├── skillgraphColumns.tsx
│   ├── skillgraphTableUtils.ts
│   ├── skillgraphTeamColumns.tsx
│   └── skillgraphTeamTableUtils.ts
└── repoDashboard/                    (repo dashboard utilities)
    ├── contributorCarousel.ts
    └── useCarouselNavigation.ts
```

---

**Optional - lib/[entity]Dashboard**: Each dashboard lib has 21 files (borderline - could organize by feature)

**Current State** (example: lib/teamDashboard):
```
lib/teamDashboard/
├── collaborationNetworkData.ts
├── collaborationNetworkLayout.ts
├── contributionFlowHelpers.ts
├── contributionFlowLayout.ts
├── designHelpers.ts
├── designMockData.ts
├── designTableColumns.tsx
├── overviewHelpers.ts
├── overviewMockData.ts
├── performanceHelpers.ts
├── performanceMockData.ts
├── performanceTableColumns.tsx
├── performanceTableConfig.ts
├── performanceTypes.ts
├── skillsHelpers.ts
├── skillsMockData.ts
├── skillsMockDataGenerator.ts
├── spofContributionData.ts
├── spofHelpers.ts
├── spofMockData.ts
└── types.ts
```

**Optional Expected State** (feature-based organization):
```
lib/teamDashboard/
├── collaborationNetwork/
│   ├── data.ts
│   └── layout.ts
├── contributionFlow/
│   ├── helpers.ts
│   └── layout.ts
├── design/
│   ├── helpers.ts
│   ├── mockData.ts
│   └── tableColumns.tsx
├── overview/
│   ├── helpers.ts
│   └── mockData.ts
├── performance/
│   ├── helpers.ts
│   ├── mockData.ts
│   ├── tableColumns.tsx
│   ├── tableConfig.ts
│   └── types.ts
├── skills/
│   ├── helpers.ts
│   ├── mockData.ts
│   └── mockDataGenerator.ts
├── spof/
│   ├── contributionData.ts
│   ├── helpers.ts
│   └── mockData.ts
└── types.ts
```

**Note**: This optional organization applies to:
- lib/orgDashboard (21 files - could organize by: chaosMatrix, design, overview, ownership, performance, skillgraph, spof)
- lib/teamDashboard (21 files - features shown above)
- lib/repoDashboard (21 files - same structure as teamDashboard)

---

**Impact Summary**:
- **Components**: Difficult to find components (53 files at same level), unclear ownership
- **lib/dashboard**: Mixed shared and entity-specific files causing confusion
- **Optional lib/[entity]**: 21 files per dashboard not terrible but could be clearer with feature grouping
- Violates "intent-based folders" and "organize when 10+ files" principles
- Affects ~150+ import statements across codebase

**Effort**:
- Components organization: Large (6-8 hours - move 40+ files + update ~100 imports)
- lib/dashboard organization: Medium (3-4 hours - move 12 files + update ~30 imports)
- Optional lib/[entity] organization: Large per dashboard (4-6 hours each, 12-18 hours total for 3 dashboards)

**Priority**: HIGH (components + lib/dashboard), MEDIUM (optional lib/[entity] feature grouping)

---

### CV-5: Duplicate Route Structure 🚨
**Rule**: "Each feature should have ONE canonical URL path"

**Violation**: Two complete route hierarchies exist for repository features

**Current State**:
```
app/org/[orgId]/
├── repo/[repoId]/              ❌ STUB PLACEHOLDER
│   ├── page.tsx                    (placeholder: <div>Repo</div>)
│   ├── design/page.tsx
│   ├── performance/page.tsx
│   ├── skillgraph/page.tsx
│   └── spof/page.tsx
│
└── repository/[repoId]/        ✅ REAL IMPLEMENTATION
    ├── page.tsx                    (RepoOverviewPageClient)
    ├── design/page.tsx
    ├── performance/page.tsx
    ├── skillgraph/page.tsx
    └── spof/page.tsx
```

**Problem**:
- Users can access BOTH `/org/1/repo/123` AND `/org/1/repository/123`
- One is a stub, the other has real content
- Impossible to know which URL is "correct"
- Navigation links may point to either path randomly
- SEO issues (duplicate content)
- Every bug fix/feature needs checking both paths

**Decision Needed**:
- Option A: Keep `/repository/[repoId]/` (more professional, full word)
- Option B: Keep `/repo/[repoId]/` (shorter, matches Team/Org pattern)

**Solution**:
1. **Decide canonical path** (recommend: `/repository/` for consistency with professional naming)
2. **Delete stub directory** (`/repo/` directory tree)
3. **Update all navigation links** in tabs, breadcrumbs, sidebars
4. **Add redirect** from old path to new path (Next.js middleware or rewrites)
5. **Update route utilities** in `/lib/routes.ts`
6. **Search codebase** for hardcoded paths and update

**Impact**:
- CRITICAL: Blocks navigation clarity
- User confusion (which URL to use?)
- Developer confusion (where to make changes?)
- Potential production bugs (features working in one path, broken in other)
- SEO and analytics split across two URLs

**Effort**: Medium (3-4 hours - delete directory, update links, add redirects, test navigation)
**Priority**: CRITICAL

---

### CV-6: Triple TimeRange Implementation 🔁🔁
**Rule**: "Don't Repeat Yourself - single source of truth"

**Violation**: Three separate implementations of time range system causing type incompatibility

**Current State**:
```typescript
// Implementation 1: lib/contexts/TimeRangeContext.tsx (124 lines)
interface TimeRangeContextState {
  timeRange: TimeRangeKey;
  setTimeRange: (range: TimeRangeKey) => void;
  resetTimeRange: () => void;
}

// Implementation 2: lib/dashboard/TimeRangeContext.tsx (321 lines)
interface TimeRangeContextValue extends UseTimeRangeResult {
  resetTimeRange: () => void;
  // + 6 additional hooks: useTimeRange(), useTimeRangeWithReset(), etc.
  // + Higher-order component: withTimeRange()
}

// Type definitions duplicated in 3 locations:
// - lib/dashboard/timeRangeTypes.ts (152 lines)
// - lib/orgDashboard/timeRangeTypes.ts (10 lines)
// - lib/shared/types/timeRangeTypes.ts (exists but inconsistent)

// Each defines:
export type TimeRangeKey = "1m" | "3m" | "1y" | "max";
export const TIME_RANGE_OPTIONS = [/* same array 3 times! */];
```

**Problem**:
- Same `TimeRangeKey` type defined 3+ times
- Same `TIME_RANGE_OPTIONS` array duplicated 3+ times
- Two complete context implementations with different APIs
- Import confusion: which path should developers use?
- Risk of type mismatch errors
- Different files import from different locations (28 files affected)
- Already causing lint errors and type incompatibility

**Solution**:
1. **Keep ONLY** `/lib/shared/types/timeRangeTypes.ts` for type definitions
2. **Keep ONLY** `/lib/dashboard/TimeRangeContext.tsx` (most comprehensive implementation)
3. **Delete** `/lib/contexts/TimeRangeContext.tsx`
4. **Delete** `/lib/orgDashboard/timeRangeTypes.ts`
5. **Delete** `/lib/dashboard/timeRangeTypes.ts` (move any unique content to shared)
6. **Update all imports** across 28 files to use canonical paths
7. **Add deprecation comments** if gradual migration needed

**Impact**:
- CRITICAL: Type safety issues
- Import confusion across 28 files
- Risk of runtime errors from type mismatch
- Maintenance nightmare (update 3 places for one change)
- Integration bugs between components using different implementations

**Effort**: Large (4-5 hours - consolidate implementations, update 28 import statements, test thoroughly)
**Priority**: CRITICAL

---

### CV-7: Massive Unused Code and Dead Imports 🗑️
**Rule**: "No dead code: Remove unused imports, variables, and functions"

**Violations**: 59 lint warnings + 35 TypeScript errors

**Unused Imports** (19 instances):
```typescript
// Avatar components imported but never used
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const userInitials = userName.split(" ").map(n => n[0]).join("");
// ❌ All 4 never used in render!

// Badge imported in 4 files, never used
import { Badge } from "@/components/shared/Badge";
// ❌ BaseTeamsTable.tsx, designTableColumns.tsx (team + repo), ChartInsights.tsx

// React hooks imported but unused
import { useMemo, useRef, useCallback } from "react";
// ❌ ContributorCardsCarousel, multiple chart components

// Types imported but unused
import type { TimeRangeKey } from "...";
// ❌ PerformanceChart.tsx, multiple files
```

**Unused Variables** (12 instances):
```typescript
// Mock data generation noise variables
const allocNoise3 = noise(seed + 2003);  // ❌ Never used
const chaosNoise4 = noise(seed + 3004);  // ❌ Never used
// Duplicated in BOTH team AND repo designMockData!

// Chart calculation variables
const xMin = d3.min(...);  // ❌ Calculated, never used
const yTicks = [...];      // ❌ Generated, never used
```

**TypeScript `any` Usage** (35 errors):
```typescript
// Type guards using any
export function isOrgDataPoint(point: any): point is OrgChartDataPoint {
  return (point as any).orgId !== undefined;
}

// Event handlers
const handleClick = (event: any) => { ... };

// D3/Plotly types too complex
const layout: any = { ... };
```

**Math.random() for Mock Data** (39 instances):
```typescript
// Non-deterministic mock data
const DEFAULT_PERFORMANCE_GAUGE_VALUE = Math.floor(Math.random() * 100);
// ❌ Can't reproduce specific data states for debugging/testing
```

**Impact**:
- Code bloat (unused imports increase bundle size)
- Developer confusion ("Should I use this? Is it leftover?")
- Maintenance overhead (dead code needs reading/understanding)
- Non-deterministic tests (Math.random() makes testing impossible)
- Type safety reduced (35 `any` usages)

**Solution**:
1. **Remove all unused imports** (run ESLint fix)
2. **Remove unused variables** (manual review required)
3. **Replace `any` types** where feasible (some are acceptable, like D3 force simulation)
4. **Replace Math.random()** with seeded random (pattern already exists: `noise()` function)
5. **Add ESLint pre-commit hook** to prevent future unused code

**Effort**:
- Unused imports: Small (1-2 hours - automated fixes)
- Unused variables: Small (1-2 hours - manual deletion)
- TypeScript any: Medium (4-5 hours - some are hard to type properly)
- Math.random: Medium (3-4 hours - replace 39 instances with seeded approach)
- **Total**: Medium-Large (9-13 hours)

**Priority**: HIGH (cleanup enables better code quality)

---

## Major Violations

### MV-1: Page Client Components Exceeding Line Limits 📏
**Rule**: "Component files must stay under 160–200 lines. Page Client Components MAX 160 lines."

**Violations** (Page Client Components > 160 lines):

| File | Lines | Over Limit | Severity |
|------|-------|------------|----------|
| TeamPerformancePageClient.tsx | 327 | +167 | SEVERE |
| UserSkillGraphPageClient.tsx | 320 | +160 | SEVERE |
| RepoPerformancePageClient.tsx | 310 | +150 | SEVERE |
| TeamSpofPageClient.tsx | 167 | +7 | Minor |
| RepoSpofPageClient.tsx | 167 | +7 | Minor |

**Current State**: Business logic, data processing, state management, UI composition all in one file

**Expected State**: Extract data processing to lib/helpers, extract complex state logic to custom hooks

**Example Refactoring**:
```typescript
// CURRENT: TeamPerformancePageClient.tsx (327 lines)
"use client";

export function TeamPerformancePageClient() {
  const rawData = useMemo(() => generateTeamPerformanceData(...), []);
  const timeFilteredData = useMemo(() => filterByTimeRange(...), []);
  const sampledData = useMemo(() => smartSample(...), []);
  const insights = useMemo(() => getPerformanceInsights(...), []);
  const cumulativeDelta = useMemo(() => calculateCumulative(...), []);
  const membersWithDelta = useMemo(() => calculateDeltas(...), []);
  // ... 200 more lines of logic + UI
}

// SHOULD BE:
// 1. lib/teamDashboard/hooks/useTeamPerformanceData.ts
export function useTeamPerformanceData(teamId: TeamId, timeRange: TimeRangeKey) {
  const rawData = useMemo(() => generateTeamPerformanceData(...), []);
  const timeFilteredData = useMemo(() => filterByTimeRange(...), []);
  const sampledData = useMemo(() => smartSample(...), []);
  const insights = useMemo(() => getPerformanceInsights(...), []);

  return { data: sampledData, insights, ... };
}

// 2. components/dashboard/pages/TeamPerformancePageClient.tsx (~120 lines)
"use client";

export function TeamPerformancePageClient() {
  const { teamId } = useRouteParams();
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("30d");
  const { data, insights } = useTeamPerformanceData(teamId, timeRange);

  return (
    <DashboardSection>
      <PerformanceChart data={data} />
      {/* ... UI only */}
    </DashboardSection>
  );
}
```

**Benefits**:
- Reduces page component size to ~100-120 lines
- Testable data logic
- Reusable across similar pages

**Effort**: Medium (3-4 hours per dashboard)
**Priority**: HIGH

---

### MV-2: Chart Components Exceeding Line Limits 📏
**Rule**: "Component files MAX 200 lines per file"

**Violations** (16 components):

| File | Lines | Over Limit | Severity |
|------|-------|------------|----------|
| PerformanceChart.tsx | 545 | +345 | CRITICAL |
| ChaosMatrixChart.tsx | 466 | +266 | SEVERE |
| ContributorPerformanceBarChart.tsx | 358 | +158 | SEVERE |
| ContributorPerformanceCarousel.tsx | 331 | +131 | Major |
| OwnershipScatter.tsx | 321 | +121 | Major |
| ModulesTable.tsx | 294 | +94 | Major |
| SpofTeamsTable.tsx | 291 | +91 | Major |
| SpofDistributionChart.tsx | 291 | +91 | Major |
| ContributorMetricsChart.tsx | 281 | +81 | Major |
| ContributorCarouselNavigation.tsx | 263 | +63 | Major |
| PerformanceTeamsTable.tsx | 249 | +49 | Major |
| ModuleDetailSheet.tsx | 248 | +48 | Major |
| SankeyContributionChart.tsx | 247 | +47 | Major |
| SPOFTreemap.tsx | 235 | +35 | Moderate |
| CollaborationNetworkGraph.tsx | 234 | +34 | Moderate |
| DesignTeamsTable.tsx | 216 | +16 | Moderate |

**Impact**:
- Violates MAX 200 lines rule
- Hard to test
- Difficult to maintain
- Mixed concerns (rendering + config + state)

**Suggested Splits**:

**PerformanceChart.tsx (545 → ~180 lines)**:
```
PerformanceChart.tsx (main component with props/hooks)
  ├── PerformanceChartPlotly.tsx (Plotly rendering logic)
  ├── PerformanceChartLegend.tsx (already exists)
  └── lib/dashboard/performanceChartConfig.ts (layout configuration)
```

**ChaosMatrixChart.tsx (466 → ~180 lines)**:
```
ChaosMatrixChart.tsx (main component)
  ├── ChaosMatrixPlotly.tsx (Plotly rendering)
  ├── ChaosMatrixAvatarOverlay.tsx (SVG avatars)
  └── lib/orgDashboard/chaosMatrixConfig.ts (quadrant definitions)
```

**Benefits**:
- Each file under 200 lines
- Easier to understand
- Testable rendering logic
- Clear separation of concerns

**Effort**: Medium per chart (2-3 hours each)
**Priority**: HIGH

---

### MV-3: Lib Files Exceeding Line Limits 📏
**Rule**: "Lib files MAX 200 lines per file"

**Violations** (16 files):

| File | Lines | Over Limit | Severity |
|------|-------|------------|----------|
| lib/dashboard/contributorCarousel.ts | 721 | +521 | CRITICAL |
| lib/userDashboard/mockData.ts | 664 | +464 | CRITICAL |
| lib/dashboard/useCarouselNavigation.ts | 489 | +289 | SEVERE |
| lib/repoDashboard/performanceHelpers.ts | 501 | +301 | SEVERE |
| lib/dashboard/performanceChart/types.ts | 386 | +186 | SEVERE |
| lib/dashboard/MultiTimeRangeContext.tsx | 383 | +183 | SEVERE |
| lib/dashboard/TimeRangeContext.tsx | 320 | +120 | Major |
| lib/dashboard/performanceChart/eventGenerators.ts | 297 | +97 | Major |
| lib/dashboard/performanceChart/transformers.ts | 271 | +71 | Major |
| lib/dashboard/TimeRangeFilter.tsx | 256 | +56 | Major |
| lib/teamDashboard/collaborationNetworkData.ts | 217 | +17 | Moderate |
| lib/orgDashboard/spofChartDrawUtils.ts | 217 | +17 | Moderate |
| lib/orgDashboard/ownershipScatterUtils.ts | 218 | +18 | Moderate |
| lib/userDashboard/types.ts | 212 | +12 | Moderate |
| lib/orgDashboard/constants.ts | 211 | +11 | Moderate |
| lib/teamDashboard/performanceHelpers.ts | 209 | +9 | Moderate |

**Impact**: Files too large for single responsibility, hard to navigate

**Suggested Splits**:

**lib/dashboard/contributorCarousel.ts (721 lines)**:
```
lib/dashboard/contributorCarousel/
  ├── types.ts (type definitions)
  ├── state.ts (state management)
  ├── navigation.ts (navigation logic)
  └── builder.ts (builder pattern)
```

**lib/userDashboard/mockData.ts (664 lines)**:
```
lib/userDashboard/mockData/
  ├── performanceData.ts (performance metrics)
  ├── metricCardsData.ts (overview cards)
  ├── spofData.ts (SPOF data)
  └── helpers.ts (shared generators)
```

**lib/dashboard/useCarouselNavigation.ts (489 lines)**:
```
lib/dashboard/carousel/
  ├── useCarouselNavigation.ts (main hook, ~150 lines)
  ├── navigationHelpers.ts (utilities)
  └── types.ts (types)
```

**Effort**: Medium (2-3 hours per file)
**Priority**: MEDIUM

---

### MV-4: Dual Controlled/Uncontrolled Component Pattern ⚠️
**Rule**: React best practices - components should be either controlled OR uncontrolled, not both

**Violations**: 6 table components accept both patterns simultaneously

**Current State**: Components accept optional controlled props AND internal state
```typescript
// BaseTeamsTable.tsx
type BaseTeamsTableProps<T, F extends string> = {
  rows: T[];
  filterTabs: { key: F; label: string }[];
  activeFilter?: F;              // Optional - controlled mode
  onFilterChange?: (filter: F) => void;  // Optional - controlled mode
  defaultFilter: F;              // Required - uncontrolled fallback
  sortFunction: (rows: T[], currentFilter: F) => T[];
};

// Component handles both:
const { currentFilter, handleFilter } = useTableFilter({
  activeFilter,      // undefined = uncontrolled
  onFilterChange,    // undefined = uncontrolled
  defaultFilter,     // always used as fallback
  sortFunction,
});
```

**Problem**:
- **API unclear**: Developers don't know if they should control filter state or not
- **Two code paths** for same feature increases complexity
- **Bugs possible** when mixing controlled/uncontrolled usage
- **defaultFilter required** even in controlled mode (why?)
- Violates React best practices (pick one pattern)

**Expected State**: Make controlled-only (recommended)
```typescript
type BaseTeamsTableProps<T, F extends string> = {
  rows: T[];
  filterTabs: { key: F; label: string }[];
  filter: F;  // Always required
  onFilterChange: (filter: F) => void;  // Always required
  sortFunction: (rows: T[], currentFilter: F) => T[];
};

// Usage:
const [filter, setFilter] = useState<FilterKey>("all");
<BaseTeamsTable
  filter={filter}
  onFilterChange={setFilter}
  // No more activeFilter/defaultFilter confusion
/>
```

**Alternative**: Create two separate components
```typescript
<ControlledBaseTeamsTable filter={filter} onFilterChange={...} />
<UncontrolledBaseTeamsTable defaultFilter="all" />
```

**Impact**:
- Confusing API for developers
- More complex implementation
- Potential bugs from mixed usage
- Violates single responsibility (does two things)

**Affected Components**:
- BaseTeamsTable.tsx
- SkillgraphBySkillTable.tsx
- SkillgraphByTeamTable.tsx
- SpofTeamsTable.tsx
- ModulesTable.tsx
- PerformanceTeamsTable.tsx

**Effort**: Medium (3-4 hours - refactor 6 components + update all usages)
**Priority**: HIGH

---

### MV-5: Magic Numbers Epidemic 🔢
**Rule**: "Extract magic numbers and repeated strings into named constants"

**Violations**: 100+ unexplained numbers across 20+ files

**Examples**:

**Chart Dimensions** (no explanation):
```typescript
// CollaborationNetworkGraph.tsx
const CHART_HEIGHT = 540;  // Why 540?
setWidth(Math.max(460, Math.floor(entry.contentRect.width)));  // Why 460?
layoutGraph(graph, width - 72, CHART_HEIGHT - 64);  // Why 72? Why 64?

// Why these specific numbers? No one knows!
```

**Thresholds** (no justification):
```typescript
const DEFAULT_THRESHOLD = 0.7;  // Why 0.7?
const colorScale = scaleSequential(interpolateViridis).domain([0.05, 1]);  // Why 0.05?
const edgeWidthScale = scaleLinear()
  .domain([0.35, 1])      // Why 0.35?
  .range([1.4, 5.6]);     // Why 1.4-5.6?
```

**Mock Data Generation** (cryptic):
```typescript
// getRangeConfig in collaborationNetworkData.ts
case "1m": return {
  seedOffset: 101,         // Why 101?
  affinityCutoff: 0.58,    // Why 0.58?
  doaVolatility: 0.18      // Why 0.18?
};
case "3m": return {
  seedOffset: 211,         // Why 211?
  affinityCutoff: 0.5,     // Why 0.5?
  doaVolatility: 0.12      // Why 0.12?
};
// Duplicated in repoDashboard with DIFFERENT numbers!
```

**Problem**:
- No one understands why these specific values
- Can't adjust visual design confidently
- Values duplicated across files
- Mock data uses different magic numbers per dashboard
- Team vs repo dashboards diverge in configuration

**Solution**: Extract to documented configuration
```typescript
// lib/dashboard/visualizationConstants.ts
export const COLLABORATION_NETWORK = {
  CHART: {
    HEIGHT: 540,
    MIN_WIDTH: 460,  // Minimum width for readable graph
    PADDING: {
      HORIZONTAL: 72,  // Space for node labels and legend
      VERTICAL: 64,    // Space for title and controls
    },
  },
  THRESHOLDS: {
    COLLABORATION: 0.7,  // Minimum strength to show edge (0-1 scale)
    EDGE_WIDTH_MIN: 0.35,  // Weakest visible edge strength
  },
  VISUAL: {
    COLOR_SCALE_MIN: 0.05,  // Lightest color (preserve visibility on white bg)
    EDGE_WIDTH_RANGE: [1.4, 5.6] as const,  // SVG stroke width: thin to thick
  },
} as const;

/**
 * Time range affects collaboration data variability.
 * - Shorter ranges (1m): Higher volatility, stricter thresholds
 * - Longer ranges (max): Stabilized patterns, broader collaboration
 */
export const TIME_RANGE_CONFIGS = {
  "1m": {
    seedOffset: 101,       // Prime-like for unique random sequences
    affinityCutoff: 0.58,  // Show only strong recent collaborations
    doaVolatility: 0.18,   // High variance (short-term instability)
  },
  // ... with comments explaining each value
} as const;
```

**Impact**:
- Unmaintainable code (no one knows what to change)
- Hard to adjust visual design
- Configuration inconsistent across dashboards
- Copy-paste errors when duplicating
- No central place to tune thresholds

**Categories**:
- **Dimensions**: 40+ instances (540, 460, 72, 64, etc.)
- **Thresholds**: 30+ instances (0.7, 0.58, 0.35, etc.)
- **Colors**: 20+ instances (various hex/RGB)
- **Mock data**: 20+ instances (101, 211, 307, seed multipliers)

**Effort**: Large (6-8 hours - extract constants, document meaning, update 100+ usages)
**Priority**: MEDIUM

---

## Minor Violations

### MinV-1: Hardcoded Colors Instead of DASHBOARD_COLORS 🎨
**Rule**: "Do not hardcode hex or `bg-[#...]` in dashboard components or mock data. Use DASHBOARD_COLORS, DASHBOARD_BG_CLASSES, etc."

**Violations** (32 files with hardcoded hex colors):
- components/dashboard/PerformanceChart.tsx
- components/dashboard/ChaosMatrixChart.tsx
- components/dashboard/OwnershipScatter.tsx
- components/dashboard/SankeyContributionChart.tsx
- components/dashboard/CollaborationNetworkGraph.tsx
- components/dashboard/SPOFTreemap.tsx
- components/dashboard/ContributorPerformanceBarChart.tsx
- components/dashboard/SpofDistributionChart.tsx
- components/dashboard/ContributorMetricsChart.tsx
- components/dashboard/PerformanceChartSVG.tsx
- components/dashboard/PerformanceChartLegend.tsx
- components/dashboard/ComparativePerformanceChartSVG.tsx
- components/dashboard/ContributionFlowSVG.tsx
- components/dashboard/MemberPerformanceChart.tsx
- components/dashboard/D3Gauge.tsx
- components/dashboard/GaugeSection.tsx
- components/dashboard/RepoHealthBar.tsx
- components/dashboard/DomainDistributionBar.tsx
- components/dashboard/SegmentBar.tsx
- components/dashboard/PerformanceTeamsTable.tsx
- components/dashboard/ModuleDetailSheet.tsx
- components/dashboard/DesignTeamsTable.tsx
- components/dashboard/ModulesTable.tsx
- components/dashboard/SkillgraphByTeamTable.tsx
- components/dashboard/SkillgraphBySkillTable.tsx
- components/dashboard/SpofTeamsTable.tsx
- components/dashboard/ContributorCardsCarousel.tsx
- components/dashboard/BaseTeamsTable.tsx
- components/dashboard/pages/RepoPerformancePageClient.tsx
- components/dashboard/pages/TeamPerformancePageClient.tsx
- components/dashboard/pages/UserPerformancePageClient.tsx
- components/dashboard/pages/UserSkillGraphPageClient.tsx

**Examples**:
```typescript
// CURRENT (hardcoded)
fill: "#CA3A31"
className="bg-[#3D81FF]"
backgroundColor: "rgba(202,58,49,0.25)"

// EXPECTED (using constants)
fill: DASHBOARD_COLORS.danger
className={DASHBOARD_BG_CLASSES.blue}
backgroundColor: `${DASHBOARD_COLORS.danger}40`
```

**Impact**:
- Inconsistent colors
- Hard to update theme
- Violates centralized color system

**Effort**: Small-Medium (4-5 hours for all 32 files)
**Priority**: MEDIUM

---

### MinV-2: Inconsistent Time Range Handling ⏱️
**Observation**: Multiple time range contexts exist:
- `/lib/contexts/TimeRangeContext.tsx` (old location)
- `/lib/dashboard/TimeRangeContext.tsx`
- `/lib/dashboard/MultiTimeRangeContext.tsx`

**Impact**: Unclear which to use, potential confusion
**Effort**: Small (1-2 hours - consolidate and document)
**Priority**: LOW

---

## Refactoring Opportunities

### RO-1: Extract Shared Performance Utilities ✅
**Priority**: HIGH

**What**: Create `/lib/shared/performanceUtils.ts` for:
- `smartSample<T>()`
- `filterByTimeRange<T>()`
- `isTimeRangeSufficient<T>()`
- `getPerformanceInsights()`
- Time-based aggregation functions

**Benefits**:
- Eliminates 200+ lines of duplication
- Single source of truth for performance calculations
- Easier to test
- Consistent behavior across all dashboards

**Effort**: Medium (2-3 hours)
**Files Changed**: ~15 files

---

### RO-2: Extract Shared Mock Data Generators ✅
**Priority**: MEDIUM

**What**: Create `/lib/shared/mockDataGenerators.ts` for:
- Network graph generation logic
- Skill data generation patterns
- SPOF data generation

**Current**: Duplicated across repoDashboard/, teamDashboard/
**Benefits**: DRY, consistent mock data patterns
**Effort**: Large (4-6 hours - careful abstraction needed)

---

### RO-3: Extract Page Data Processing Hooks ✅
**Priority**: HIGH (helps with MV-1)

**What**: Create custom hooks to extract complex data pipelines from page components:
- `/lib/teamDashboard/hooks/useTeamPerformanceData.ts`
- `/lib/repoDashboard/hooks/useContributorPerformanceData.ts`
- `/lib/userDashboard/hooks/useUserSkillData.ts`

**Benefits**:
- Reduces page component size to ~100-120 lines
- Testable data logic
- Reusable across similar pages

**Effort**: Medium (3-4 hours per dashboard)

---

### RO-4: Componentize Large Charts ✅
**Priority**: HIGH (helps with MV-2)

**Strategy**: Extract rendering logic from mega-components (see MV-2 for details)

**Benefits**:
- Each file under 200 lines
- Easier to understand
- Testable rendering logic
- Clear separation of concerns

**Effort**: Medium per chart (2-3 hours each)

---

### RO-5: Consolidate Color System Usage 🎨
**Priority**: MEDIUM

**What**:
1. Create color mapping utilities in `/lib/shared/colorMappers.ts`:
   ```typescript
   export function getPerformanceLevelColor(level: PerformanceLevel): string {
     return DASHBOARD_COLORS[performanceLevelToColorKey[level]];
   }
   ```
2. Replace all inline hex with DASHBOARD_COLORS references
3. Update mock data generators to use color constants

**Benefits**:
- Centralized theme
- Easy color scheme changes
- Type-safe color usage

**Effort**: Medium (4-5 hours for all 32 files)

---

### RO-6: Organize Components into Entity-Based Subfolders 📁
**Priority**: HIGH (addresses CV-4)

**What**: Reorganize `/components/dashboard` from flat structure (53 files) to entity-based subfolders:
- `shared/` - Reusable across dashboards (15 files)
- `orgDashboard/` - Org-specific (5 files)
- `teamDashboard/` - Team-specific (5 files)
- `repoDashboard/` - Repo-specific (10 files)
- `userDashboard/` - User-specific (6 files)

**Benefits**:
- Clear component ownership
- Easier to find relevant components
- Matches lib/ folder structure
- Better code organization
- Follows "intent-based folders" principle

**Effort**: Large (6-8 hours - move 40+ files + update ~100 imports)

---

### RO-7: Organize lib/dashboard into Entity-Based Subfolders 📁
**Priority**: HIGH (addresses CV-4)

**What**: Reorganize `/lib/dashboard` from flat structure (12 files) to entity-based subfolders:
- `shared/` - Truly shared utilities (6 files: time range contexts, filters, chart constants, trend helpers)
- `userDashboard/` - User dashboard utilities (4 files: skillgraph columns and utils)
- `repoDashboard/` - Repo dashboard utilities (2 files: contributor carousel, carousel navigation)

**Benefits**:
- Clear utility ownership
- Matches components/dashboard structure
- Follows "intent-based folders" principle
- Easier to find relevant utilities

**Effort**: Medium (3-4 hours - move 12 files + update ~30 imports)

---

### RO-8: OPTIONAL - Organize lib/[entity]Dashboard by Feature 📁
**Priority**: MEDIUM (optional improvement)

**What**: For dashboards with 21 files, organize by feature:
- lib/orgDashboard → chaosMatrix/, design/, overview/, ownership/, performance/, skillgraph/, spof/
- lib/teamDashboard → collaborationNetwork/, contributionFlow/, design/, overview/, performance/, skills/, spof/
- lib/repoDashboard → Same structure as teamDashboard

**Benefits**:
- Clearer feature grouping
- Easier to find related files (e.g., all performance files in one folder)
- Better scalability as features grow

**Note**: 21 files is borderline - acceptable as-is, but feature grouping would improve clarity

**Effort**: Large (4-6 hours per dashboard, 12-18 hours total for 3 dashboards)

---

## Phased Execution Plan

### Phase 1: Quick Wins & Critical Fixes ⚡🔴 (14-19 hours)
**Objective**: Fix critical rule violations, eliminate duplication, remove navigation blockers

**Tasks**:
1. 🔴 **Delete duplicate route structure** (CV-5) **← NEW CRITICAL**
   - Decide canonical path: `/repository/[repoId]/` (recommended) or `/repo/[repoId]/`
   - Delete stub directory (e.g., `/app/org/[orgId]/repo/` if keeping repository)
   - Update all navigation links in tabs, breadcrumbs, sidebars
   - Add redirect from old path to new (Next.js rewrites)
   - Update route utilities in `/lib/routes.ts`
   - **Time**: 3-4 hours
   - **Priority**: CRITICAL (blocks navigation clarity)

2. ✅ Remove barrel exports (CV-1)
   - Delete `/lib/shared/types/index.ts`
   - Delete `/lib/dashboard/performanceChart/index.ts`
   - Update ~50 import statements to direct imports
   - **Time**: 3-4 hours

3. 🔴 **Consolidate TimeRange implementations** (CV-6) **← NEW CRITICAL**
   - Keep ONLY `/lib/shared/types/timeRangeTypes.ts` for types
   - Keep ONLY `/lib/dashboard/TimeRangeContext.tsx` for context
   - Delete `/lib/contexts/TimeRangeContext.tsx`
   - Delete `/lib/orgDashboard/timeRangeTypes.ts`
   - Delete `/lib/dashboard/timeRangeTypes.ts`
   - Update 28 import statements
   - **Time**: 4-5 hours
   - **Priority**: CRITICAL (blocks type safety)

4. ✅ Remove unused code (CV-7 partial) **← NEW**
   - Remove unused imports (19 instances) - automated
   - Remove unused variables (12 instances)
   - Run ESLint --fix
   - **Time**: 2-3 hours

5. ✅ Extract shared performance helpers (CV-2, RO-1)
   - Create `/lib/shared/performanceUtils.ts`
   - Extract `smartSample`, `filterByTimeRange`, `isTimeRangeSufficient`, `getPerformanceInsights`
   - Update imports in repoDashboard, teamDashboard
   - **Time**: 2-3 hours

**Benefits**:
- ✅ Navigation clarity (one canonical URL per feature)
- ✅ Type safety (single TimeRange implementation)
- ✅ Code quality (no unused imports/variables)
- ✅ Immediate rule compliance
- ✅ Eliminate worst duplication (200+ lines)

**Risk**: Medium (route changes affect navigation, TimeRange affects many files)
**Priority**: CRITICAL

**⏸️ APPROVAL GATE**: Present results, get user approval before Phase 2

---

### Phase 2: Component Size Reduction 📏 (15-20 hours)
**Objective**: Bring all components under 200-line limit

**Tasks**:
1. ✅ Split PerformanceChart.tsx (545 → ~180 lines)
   - Extract Plotly rendering to PerformanceChartPlotly.tsx
   - Extract config to lib/dashboard/performanceChartConfig.ts
   - **Time**: 3-4 hours

2. ✅ Split ChaosMatrixChart.tsx (466 → ~180 lines)
   - Extract Plotly rendering to ChaosMatrixPlotly.tsx
   - Extract avatars to ChaosMatrixAvatarOverlay.tsx
   - Extract config to lib/orgDashboard/chaosMatrixConfig.ts
   - **Time**: 3-4 hours

3. ✅ Split 3 largest page components (MV-1)
   - TeamPerformancePageClient.tsx (327 → ~120 lines)
   - UserSkillGraphPageClient.tsx (320 → ~120 lines)
   - RepoPerformancePageClient.tsx (310 → ~120 lines)
   - Extract data hooks to lib/[dashboard]/hooks/
   - **Time**: 6-8 hours

4. ✅ Split 2 more large charts
   - ContributorPerformanceBarChart.tsx (358 lines)
   - ContributorPerformanceCarousel.tsx (331 lines)
   - **Time**: 4-5 hours

**Benefits**:
- All major components under 200 lines
- Improved testability
- Clear separation of concerns
- Easier maintenance

**Risk**: Medium (requires careful component splitting)
**Priority**: HIGH

**⏸️ APPROVAL GATE**: Present results, get user approval before Phase 3

---

### Phase 3: Data Layer Cleanup & Organization 🗄️ (22-28 hours)
**Objective**: DRY data layer, organize component and lib structure

**Tasks**:
1. ✅ Organize components into entity-based subfolders (CV-4 partial, RO-6)
   - Create subfolders: shared/, orgDashboard/, teamDashboard/, repoDashboard/, userDashboard/
   - Move 40+ components to appropriate folders
   - Update ~100 import statements
   - **Time**: 6-8 hours

2. ✅ Organize lib/dashboard into entity-based subfolders (CV-4 partial)
   - Create subfolders: shared/, userDashboard/, repoDashboard/
   - Move 12 files to appropriate folders
   - Update ~30 import statements
   - **Time**: 3-4 hours

3. ✅ Consolidate duplicate data generators (CV-3, RO-2)
   - Extract shared collaboration network logic
   - Extract shared skills generation logic
   - Extract shared SPOF generation logic
   - Create `/lib/shared/mockDataGenerators.ts`
   - **Time**: 6-8 hours

4. ✅ Split mega lib files (MV-3 partial)
   - Split contributorCarousel.ts (721 lines → 4 files)
   - Split userDashboard/mockData.ts (664 lines → 4 files)
   - Split useCarouselNavigation.ts (489 lines → 3 files)
   - **Time**: 6-8 hours

5. ✅ Consolidate time range contexts (MinV-2)
   - Document which context to use when
   - Remove old context location
   - **Time**: 1-2 hours

**Benefits**:
- DRY data layer
- Clear component AND lib organization
- Components and lib match in structure (shared/, orgDashboard/, teamDashboard/, etc.)
- Clearer architecture
- Easier to find code

**Risk**: High (large refactoring with many file moves)
**Priority**: HIGH

**⏸️ APPROVAL GATE**: Present results, get user approval before Phase 4

---

### Phase 4: Comprehensive Color System 🎨 (4-5 hours)
**Objective**: Complete color system consistency

**Tasks**:
1. ✅ Replace remaining hardcoded colors (27 files)
   - All chart components
   - All table components
   - All page components
   - **Time**: 3-4 hours

2. ✅ Update mock data generators
   - Use DASHBOARD_COLORS in all data generation
   - Create color mapping utilities
   - **Time**: 1-2 hours

**Benefits**:
- Consistent theming
- Easy color scheme changes
- Type-safe color usage
- Single source of truth for colors

**Risk**: Low (mostly search & replace)
**Priority**: MEDIUM

**⏸️ APPROVAL GATE**: Present results, get user approval before Phase 5

---

### Phase 5: Polish & Complete Compliance ✨ (32-43 hours)
**Objective**: 100% rule compliance, maximum maintainability, optional feature-based lib organization

**Tasks**:
1. ✅ Split remaining oversized components (13 components)
   - OwnershipScatter.tsx (321 lines)
   - ModulesTable.tsx (294 lines)
   - SpofTeamsTable.tsx (291 lines)
   - ContributorMetricsChart.tsx (281 lines)
   - ContributorCarouselNavigation.tsx (263 lines)
   - PerformanceTeamsTable.tsx (249 lines)
   - ModuleDetailSheet.tsx (248 lines)
   - SankeyContributionChart.tsx (247 lines)
   - SPOFTreemap.tsx (235 lines)
   - CollaborationNetworkGraph.tsx (234 lines)
   - DesignTeamsTable.tsx (216 lines)
   - **Time**: 15-18 hours (1.5-2h per component)

2. ✅ Split remaining oversized lib files (10 files)
   - lib/repoDashboard/performanceHelpers.ts (501 lines)
   - lib/dashboard/performanceChart/types.ts (386 lines)
   - lib/dashboard/MultiTimeRangeContext.tsx (383 lines)
   - lib/dashboard/TimeRangeContext.tsx (320 lines)
   - And 6 more files 200-300 lines
   - **Time**: 8-10 hours

3. ✅ Extract more chart subcomponents
   - Legend components
   - Tooltip components
   - Axis components
   - **Time**: 4-5 hours

4. ✅ Split skillmap components (MV-4)
   - SkillGraph.tsx (382 lines)
   - skillGraphRenderers.ts (368 lines)
   - **Time**: 3-4 hours

5. 🔄 **OPTIONAL**: Organize lib/[entity]Dashboard by feature (CV-4 optional)
   - Organize lib/orgDashboard (21 files → feature-based folders)
   - Organize lib/teamDashboard (21 files → feature-based folders)
   - Organize lib/repoDashboard (21 files → feature-based folders)
   - Group by features: performance/, overview/, skills/, spof/, design/, etc.
   - Update ~60 imports per dashboard
   - **Time**: 12-18 hours (4-6 hours per dashboard)
   - **Note**: This is optional - 21 files is borderline acceptable

**Benefits**:
- 100% rule compliance
- All files under 200 lines
- Maximum maintainability
- Comprehensive separation of concerns
- (Optional) Feature-based organization for easier navigation

**Risk**: Medium (requires careful splitting)
**Priority**: LOW (polish)

**⏸️ FINAL APPROVAL**: All refactoring complete

---

## Architecture Compliance Status

### ✅ Good Patterns Observed:
1. Server Component wrappers in `app/` (all pages are thin wrappers)
2. Page Client Components use `"use client"` directive
3. Named exports (not default) for Client Components
4. All page components use `useRouteParams()` (not `useParams()`)
5. Route utilities in `lib/routes.ts`
6. Centralized color system exists (`DASHBOARD_COLORS`)
7. Proper folder structure (no kebab-case in components/dashboard)
8. PascalCase component files, camelCase utility files
9. DashboardSection pattern used consistently
10. TimeRangeFilter pattern used
11. SegmentBar pattern used
12. BaseTeamsTable abstraction exists

### ❌ Missing Patterns:
1. GaugeWithInsights not used everywhere (some pages use GaugeSection directly)
2. Some charts manage time range internally instead of receiving filtered data
3. Some mock data files generate colors instead of using DASHBOARD_COLORS

---

## Effort Estimates

### Summary by Phase

| Phase | Focus | Hours | Risk | Priority |
|-------|-------|-------|------|----------|
| 1 | Critical Fixes & Quick Wins | 14-19 | Medium | CRITICAL |
| 2 | Component Size | 15-20 | Medium | HIGH |
| 3 | Organization & Data | 22-28 | High | HIGH |
| 4 | Color System | 4-5 | Low | MEDIUM |
| 5 | Polish (+ Optional) | 20-25 (+12-18) | Medium | LOW |
| **TOTAL** | | **85-115 hours** | | |
| **REQUIRED** | (Phases 1-4 + 5 core) | **73-97 hours** | | |
| **OPTIONAL** | (Phase 5 lib feature org) | **+12-18 hours** | | |

### Detailed Task Breakdown

| Priority | Task | Files Changed | Lines Affected | Hours | Risk |
|----------|------|---------------|----------------|-------|------|
| 🔴 CRITICAL | Delete duplicate routes (repo vs repository) | ~15 | ~8 pages + nav | 3-4 | Medium |
| 🔴 CRITICAL | Consolidate TimeRange implementations | ~35 | ~1000 | 4-5 | Medium |
| 🔴 CRITICAL | Remove unused code (imports/variables) | ~40 | ~100 | 2-3 | Low |
| CRITICAL | Remove barrel exports | ~50 | ~200 | 3-4 | Low |
| CRITICAL | Extract shared helpers | ~15 | ~500 | 2-3 | Low |
| CRITICAL | Split PerformanceChart | 3 | 545 | 3-4 | Medium |
| CRITICAL | Split page components (3) | 9 | ~960 | 6-8 | Medium |
| HIGH | Consolidate 21 duplicate dashboard files | ~45 | ~4000 | 12-15 | High |
| HIGH | Organize components | ~100 | ~1000 imports | 6-8 | High |
| HIGH | Organize lib/dashboard | ~40 | ~300 imports | 3-4 | Medium |
| HIGH | Extract page hooks | ~18 | ~800 | 8-10 | Medium |
| HIGH | Fix dual controlled/uncontrolled pattern | ~20 | ~300 | 3-4 | Medium |
| HIGH | Split mega lib files (3) | ~12 | ~1800 | 6-8 | Medium |
| MEDIUM | Replace hardcoded colors | 32 | ~150 | 4-5 | Low |
| MEDIUM | Split remaining components (15) | ~40 | ~3000 | 20-25 | Medium |
| LOW | Split remaining lib files (10) | ~30 | ~2000 | 8-10 | Medium |
| LOW | Polish & extras | ~20 | ~1000 | 7-9 | Low |
| OPTIONAL | Organize lib/[entity] by feature | ~180 | ~1800 imports | 12-18 | Medium |

---

## Approval Process

After each phase:
1. ✅ Present completed work
2. 📊 Show metrics (lines reduced, files split, violations fixed)
3. 🧪 Run tests and linting
4. 📝 Document changes
5. ⏸️ **Wait for user approval**
6. ➡️ Proceed to next phase only after approval

---

## Success Criteria

### Phase 1 Success:
- ✅ Zero barrel export files
- ✅ Zero duplicate performance helper functions
- ✅ Top 5 charts using DASHBOARD_COLORS
- ✅ All tests passing
- ✅ Lint clean

### Phase 2 Success:
- ✅ PerformanceChart < 200 lines
- ✅ ChaosMatrixChart < 200 lines
- ✅ All page components < 160 lines
- ✅ Top 2 large charts < 200 lines
- ✅ All tests passing
- ✅ Lint clean

### Phase 3 Success:
- ✅ Components organized in entity-based subfolders
- ✅ All imports updated and working
- ✅ Zero duplicate data generator logic
- ✅ Top 3 lib files < 200 lines
- ✅ Single time range context pattern
- ✅ All tests passing
- ✅ Lint clean

### Phase 4 Success:
- ✅ Zero hardcoded hex colors in components
- ✅ All mock data using DASHBOARD_COLORS
- ✅ Color mapping utilities created
- ✅ All tests passing
- ✅ Lint clean

### Phase 5 Success:
- ✅ 100% of components < 200 lines
- ✅ 100% of lib files < 200 lines
- ✅ Zero project rule violations
- ✅ All tests passing
- ✅ Lint clean
- ✅ Documentation updated

---

## Next Steps

1. Review this plan
2. Approve Phase 1 or request modifications
3. Execute Phase 1
4. Gate: Review Phase 1 results
5. Approve Phase 2 or request changes
6. Continue phased execution with approval gates

---

**Ready to begin Phase 1?** 🚀
