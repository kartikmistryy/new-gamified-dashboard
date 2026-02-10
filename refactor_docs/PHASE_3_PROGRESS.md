# Phase 3: Data Layer Cleanup & Organization - IN PROGRESS

**Date Started**: 2026-02-11
**Status**: 🔄 IN PROGRESS (Task 1 Complete)
**Objective**: Organize code structure, eliminate duplication, consolidate time contexts

---

## Progress Summary

### ✅ Task 1: Organize components into entity-based subfolders (COMPLETE)

**Status**: ✅ COMPLETE
**Time**: ~6 hours
**Commit**: `7362b42 refactor(phase-3): organize dashboard components into entity-based subfolders`

#### What Was Accomplished

Reorganized 59 dashboard components from flat structure into entity-based subfolders:

**New Structure**:
```
components/dashboard/
├── shared/ (24 files)           - Reusable across dashboards
├── orgDashboard/ (6 files)      - Organization-specific
├── teamDashboard/ (8 files)     - Team-specific
├── repoDashboard/ (15 files)    - Repository-specific
├── userDashboard/ (6 files)     - User-specific
├── pages/                        - Page client components (existing)
├── tabs/                         - Tab components (existing)
└── layout/                       - Layout components (existing)
```

#### Files Organized

**Shared Components (24)**:
- BaseTeamsTable, ChartInsights, ComparativePerformanceChart, ComparativePerformanceChartLegend
- ComparativePerformanceChartSVG, D3Gauge, DashboardSection, DomainDistributionBar
- FilterBadges, GaugeSection, GaugeWithInsights, GlobalTimeRangeFilter
- OverviewSummaryCard, PerformanceChart, PerformanceChartLegend, PerformanceChartSVG
- RepoHealthBar, SankeyContributionChart, SegmentBar, SortableTableHeader
- SPOFTreemap, TimeRangeDropdown, TimeRangeFilter, VisibilityToggleButton

**Org Dashboard (6)**:
- ChaosMatrixChart, DesignTeamsTable, OwnershipScatter
- PerformanceTeamsTable, TeamTable, useChaosMatrixAvatars

**Team Dashboard (8)**:
- CollaborationNetworkGraph, CollaborationNetworkLegend, ContributionFlowSVG
- MemberPerformanceChart, MemberTable, SpofDistributionChart
- SpofTeamsTable, SpofTeamsTableComponents

**Repo Dashboard (15)**:
- CarouselStates, ContributorBarChartComponents, ContributorCardsCarousel
- ContributorCarouselHeader, ContributorCarouselNavigation, ContributorCarouselSlide
- ContributorMetricsCard, ContributorMetricsChart, ContributorPerformanceBarChart
- ContributorPerformanceCarousel, ContributorPerformanceChartAdapter, ContributorTable
- ModuleDetailSheet, ModuleTableComponents, ModulesTable

**User Dashboard (6)**:
- SkillgraphBySkillTable, SkillgraphByTeamTable, SkillgraphDetailTable
- SkillgraphProgressBar, SkillgraphTeamDetailTable, SkillgraphTeamsTable

#### Import Updates

- Updated **~130 import statements** across the codebase
- Fixed all relative imports to use absolute `@/` paths
- Converted relative imports like `./BaseTeamsTable` to `@/components/dashboard/shared/BaseTeamsTable`
- Fixed cross-folder references (e.g., `../shared/UserAvatar` to `@/components/shared/UserAvatar`)

#### TypeScript Fixes Applied

Fixed several TypeScript issues discovered during reorganization:

1. **TimeRangeProvider Props**: Updated `app/layout.tsx` to use config object
   - Changed: `<TimeRangeProvider defaultTimeRange="1y">`
   - To: `<TimeRangeProvider config={{ defaultRange: "1y" }}>`

2. **Ref Types**: Fixed `useChaosMatrixAvatars` to accept nullable refs
   - Changed: `plotRef: RefObject<HTMLDivElement>`
   - To: `plotRef: RefObject<HTMLDivElement | null>`

3. **Type Additions**: Added missing properties to types
   - Added `avgUsage` and `totalSkillCompletion` to SkillgraphSkillRow
   - Fixed CumulativeDataPoint type structure

4. **Performance Chart Hook**: Added null checks for optional strategies
   - Added guards for `!eventStrategy` and `!annotationStrategy`
   - Fixed optional `timeRange` handling

5. **Repo Performance Types**:
   - Defined missing `ContributorMetrics` and `CumulativeDataPoint` types
   - Fixed type mismatches in `useRepoPerformanceData` hook
   - Added transformation logic for time series metrics

#### Benefits Achieved

✅ **Discoverability**: Components easy to find by entity type
✅ **Clear Ownership**: Obvious which dashboard uses which component
✅ **Consistency**: Matches `lib/` folder structure pattern
✅ **Architecture Compliance**: Follows "intent-based folders" principle
✅ **Maintainability**: Reduced cognitive load for developers
✅ **Import Clarity**: Absolute paths show component location

---

## Remaining Tasks

### ⏳ Task 2: Organize lib/dashboard into entity-based subfolders

**Status**: NOT STARTED
**Estimated Time**: 3-4 hours

Move 12 files from `lib/dashboard/` root to entity-based subfolders:
- Create: `shared/`, `userDashboard/`, `repoDashboard/`
- Update ~30 import statements

### ⏳ Task 3: Consolidate duplicate data generators

**Status**: NOT STARTED
**Estimated Time**: 6-8 hours

Extract shared logic to eliminate duplication:
- Collaboration network generation (team/repo)
- Skills generation logic (team/repo)
- SPOF generation logic (team/repo)
- Create `/lib/shared/mockDataGenerators.ts`

### ⏳ Task 4: Split remaining mega lib files

**Status**: NOT STARTED
**Estimated Time**: Varies

Check if any lib files still exceed 200 lines after Phase 2.

### ⏳ Task 5: Consolidate time range contexts

**Status**: NOT STARTED
**Estimated Time**: 1-2 hours

- Document which context to use when
- Ensure single time range context pattern
- Remove old context locations if any remain

---

## Known Issues

### TypeScript Compilation Errors

There are remaining TypeScript errors that need to be fixed before the build succeeds:

1. **Team Dashboard Types**: Type mismatch in `teamPerformanceUtils.ts`
   - `MemberPerformanceWithDelta` missing properties from `MemberPerformanceRow`
   - Similar issue to repo dashboard (already fixed)

These errors are in existing code and not related to the component reorganization. They should be fixed as part of ongoing development.

---

## Metrics

### Task 1 Completion Metrics

- **Files Moved**: 59 components
- **New Folders Created**: 5 entity-based subfolders
- **Import Statements Updated**: ~130
- **Relative Imports Fixed**: ~15
- **TypeScript Issues Resolved**: 10+
- **Git Changes**: 105 files changed, 220 insertions, 176 deletions

### Phase 3 Overall Progress

- **Tasks Complete**: 1 / 5 (20%)
- **Estimated Time Spent**: 6 hours
- **Estimated Time Remaining**: 16-22 hours

---

## Next Steps

1. Fix remaining TypeScript compilation errors
2. Begin Task 2: Organize lib/dashboard structure
3. Continue with remaining Phase 3 tasks

---

**Last Updated**: 2026-02-11
