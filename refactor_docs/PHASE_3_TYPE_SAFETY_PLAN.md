# Phase 3: Type Safety Support Plan

**Date**: 2026-02-11
**Status**: 🚧 In Progress
**Agent**: TypeScript Pro
**Objective**: Ensure TypeScript type safety throughout Phase 3 organizational changes

---

## Critical Type Issues Identified

### 1. ❌ Missing TimeRange Type Imports (8 files)
**Severity**: CRITICAL - Blocks compilation

**Files Affected**:
- `lib/dashboard/MultiTimeRangeContext.tsx`
- `lib/dashboard/multiTimeRangeUtils.ts`
- `lib/dashboard/TimeRangeFilter.tsx`
- `lib/orgDashboard/designMockData.ts`
- `lib/orgDashboard/performanceChartHelpers.ts`

**Root Cause**: These files import from `./timeRangeTypes` but the types have been consolidated to `/lib/shared/types/timeRangeTypes.ts`

**Fix Required**:
```typescript
// CURRENT (broken)
import type { TimeRangeKey } from "./timeRangeTypes";

// SHOULD BE
import type { TimeRangeKey } from "@/lib/shared/types/timeRangeTypes";
```

**Action**: Update all import paths to point to canonical location
**Estimated Time**: 30 minutes
**Priority**: P0 - Must fix before any file moves

---

### 2. ❌ Type Mismatches in Repo Performance Utilities (15 errors)
**Severity**: HIGH - Data layer broken

**File**: `lib/repoDashboard/repoPerformanceUtils.ts`
**Root Cause**: Confusion between `EnrichedContributor` (real data type) and `ContributorPerformanceRow` (display type)

**Type Errors**:
- Missing properties: `contributorName`, `performanceValue` on `EnrichedContributor`
- Type mismatch: `EnrichedContributor[]` vs `ContributorPerformanceRow[]`
- Missing exports: `ContributorMetrics`, `CumulativeDataPoint`

**Fix Strategy**:
1. Define proper type transformer: `EnrichedContributor → ContributorPerformanceRow`
2. Export missing types from `performanceHelpers.ts`
3. Use correct property names from `EnrichedContributor` type (check real data structure)

**Action**: Audit type definitions and create proper transformers
**Estimated Time**: 2 hours
**Priority**: P1 - Breaks repo performance page

---

### 3. ❌ Type Mismatches in Team Performance Utilities (2 errors)
**Severity**: HIGH - Data layer broken

**File**: `lib/teamDashboard/teamPerformanceUtils.ts`
**Root Cause**: Similar to repo - missing properties in return type

**Fix Strategy**: Create proper type transformer for team data
**Estimated Time**: 1 hour
**Priority**: P1 - Breaks team performance page

---

### 4. ❌ User Skill Graph Type Errors (4 errors)
**Severity**: HIGH - Feature broken

**File**: `lib/dashboard/userSkillGraphUtils.ts`
**Type Errors**:
- Missing properties: `avgUsage`, `totalSkillCompletion` in `SkillgraphSkillRow`
- Unknown property: `domainColor` doesn't exist on type
- Wrong property access: `Technology.totalUsage`, `Roadmap.color`

**Fix Strategy**:
1. Review actual `Technology` and `Roadmap` types in real data
2. Create proper type mapping from real data → display types
3. Add missing properties or fix type definitions

**Estimated Time**: 1.5 hours
**Priority**: P1 - Breaks skill graph page

---

### 5. ❌ Undefined Strategy Types (4 errors)
**Severity**: MEDIUM - Potential runtime errors

**File**: `lib/dashboard/performanceChart/usePerformanceChartData.ts`
**Issue**: Passing `undefined` to functions expecting strategy types

**Fix Strategy**:
```typescript
// Add default strategies or make parameters optional
function generateEvents(
  data: NormalizedPerformanceDataPoint[],
  strategy: EventGenerationStrategy = { mode: "none" } // Default
): ChartEvent[] {
  // ...
}
```

**Estimated Time**: 30 minutes
**Priority**: P2

---

### 6. ❌ Carousel State Type Error (1 error)
**Severity**: MEDIUM

**File**: `lib/dashboard/useCarouselNavigation.ts`
**Issue**: `isAutoPlaying: void` instead of `boolean`

**Fix Strategy**: Remove void return from function call
**Estimated Time**: 15 minutes
**Priority**: P2

---

### 7. ❌ Chaos Matrix Type Errors (2 errors)
**Severity**: MEDIUM

**Files**:
- `lib/orgDashboard/chaosMatrixConfig.ts` - Plotly type mismatch
- `lib/orgDashboard/chaosMatrixProcessing.ts` - Missing `team` property on `StackedPoint`

**Fix Strategy**:
1. Cast Plotly config properly: `as Partial<PlotData>`
2. Add `team` property to `StackedPoint` type or fix property access

**Estimated Time**: 45 minutes
**Priority**: P2

---

### 8. ❌ Ownership Scatter Type Errors (9 errors)
**Severity**: LOW - Implicit `any` types

**File**: `lib/orgDashboard/ownershipScatterPlotly.ts`
**Issue**: Missing type annotations on lambda parameters

**Fix Strategy**: Add explicit types or use `ProcessedOwnershipData` interface
**Estimated Time**: 30 minutes
**Priority**: P3 - Strict mode compliance

---

### 9. ❌ App Layout TimeRange Provider Error (1 error)
**Severity**: MEDIUM

**File**: `app/layout.tsx`
**Issue**: Invalid prop `defaultTimeRange` on `TimeRangeProvider`

**Fix Strategy**: Check provider API and use correct prop name (likely `config.defaultRange`)
**Estimated Time**: 15 minutes
**Priority**: P2

---

### 10. ⚠️ Duplicate Route Type Issues (3 errors)
**Severity**: LOW - Will be deleted

**Files**: `.next/types/app/org/[orgId]/repo/[repoId]/page.ts`
**Issue**: Missing module for stub route

**Fix Strategy**: Delete entire `/app/org/[orgId]/repo/` directory as planned
**Estimated Time**: 5 minutes
**Priority**: P3 - Cleanup

---

## Phase 3 Type Safety Checklist

### Pre-Reorganization (MUST DO FIRST)
- [ ] **Fix all timeRange import paths** (8 files) - P0
- [ ] **Fix repo performance type mismatches** (15 errors) - P1
- [ ] **Fix team performance type mismatches** (2 errors) - P1
- [ ] **Fix user skill graph types** (4 errors) - P1
- [ ] **Fix performance chart strategy types** (4 errors) - P2
- [ ] **Fix carousel state type** (1 error) - P2
- [ ] **Fix app layout provider** (1 error) - P2
- [ ] **Fix chaos matrix types** (2 errors) - P2
- [ ] **Fix ownership scatter types** (9 errors) - P3
- [ ] **Delete duplicate repo route** (3 errors) - P3
- [ ] **Run `npx tsc --noEmit` and verify 0 errors**

### During Component Reorganization (Task #1)
- [ ] **Create barrel-free import structure** in new folders
- [ ] **No `index.ts` re-exports** - import from source files directly
- [ ] **Use absolute imports** with `@/components/dashboard/shared/...`
- [ ] **Update all import paths** after each file move
- [ ] **Verify TypeScript compilation** after each subfolder
- [ ] **Check for circular dependencies** using import graph

**Import Pattern Template**:
```typescript
// ❌ WRONG - Barrel export
import { PerformanceChart } from "@/components/dashboard/shared";

// ✅ CORRECT - Direct import
import { PerformanceChart } from "@/components/dashboard/shared/PerformanceChart";
```

**New Structure**:
```
components/dashboard/
├── shared/
│   ├── BaseTeamsTable.tsx
│   ├── PerformanceChart.tsx
│   └── ... (no index.ts!)
├── orgDashboard/
│   ├── ChaosMatrixChart.tsx
│   └── ... (no index.ts!)
├── teamDashboard/
│   └── ... (no index.ts!)
├── repoDashboard/
│   └── ... (no index.ts!)
└── userDashboard/
    └── ... (no index.ts!)
```

### During Lib Organization (Task #2)
- [ ] **Create entity-based folders** in `lib/dashboard/`
- [ ] **Move files to appropriate folders**
- [ ] **Update all import paths** systematically
- [ ] **Verify no broken imports**
- [ ] **Check type exports** are accessible from new locations

**New Structure**:
```
lib/dashboard/
├── shared/
│   ├── MultiTimeRangeContext.tsx
│   ├── TimeRangeContext.tsx
│   ├── timeRangeTypes.ts ❌ DELETE - use lib/shared/types/timeRangeTypes.ts
│   ├── chartConstants.ts
│   └── trendHelpers.ts
├── userDashboard/
│   ├── skillgraphColumns.tsx
│   ├── skillgraphTableUtils.ts
│   ├── skillgraphTeamColumns.tsx
│   └── skillgraphTeamTableUtils.ts
└── repoDashboard/
    ├── contributorCarousel.ts
    ├── contributorCarouselConfig.ts
    ├── contributorCarouselTypes.ts
    └── useCarouselNavigation.ts
```

### During Data Generator Consolidation (Task #3)
- [ ] **Create generic base types** for shared generators
- [ ] **Use generic constraints** for type safety
- [ ] **Discriminated unions** for variant data types
- [ ] **Type guards** for runtime type narrowing
- [ ] **Document type transformations** in JSDoc

**Generic Pattern Example**:
```typescript
// Base constraint type
interface NetworkNode {
  id: string;
  name: string;
}

// Generic generator with constraint
function generateCollaborationNetwork<T extends NetworkNode>(
  nodes: T[],
  config: NetworkConfig
): CollaborationNetwork<T> {
  // Type-safe implementation
}

// Usage - types flow through
const teamNetwork = generateCollaborationNetwork<TeamMember>(teamMembers, config);
const repoNetwork = generateCollaborationNetwork<Contributor>(contributors, config);
```

**Discriminated Union Pattern**:
```typescript
// For data that varies by entity type
type NetworkData =
  | { entityType: "team"; members: TeamMember[] }
  | { entityType: "repo"; contributors: Contributor[] };

function processNetwork(data: NetworkData) {
  if (data.entityType === "team") {
    // TypeScript knows data.members exists
    data.members.forEach(...)
  } else {
    // TypeScript knows data.contributors exists
    data.contributors.forEach(...)
  }
}
```

### Time Range Context Consolidation (Task #5)
- [ ] **Single source of truth**: `/lib/shared/types/timeRangeTypes.ts`
- [ ] **Delete duplicate type files**
- [ ] **Update all imports** to canonical path
- [ ] **Verify type compatibility** across contexts
- [ ] **Document context usage** in MEMORY.md

**Files to Delete**:
- `lib/dashboard/timeRangeTypes.ts` (if exists)
- `lib/orgDashboard/timeRangeTypes.ts` (if exists)
- Any other duplicate time range type files

**Canonical Import**:
```typescript
import type { TimeRangeKey, TimeRangeConfig } from "@/lib/shared/types/timeRangeTypes";
```

---

## Type Safety Patterns for Phase 3

### 1. Generic Constraint Pattern (for data consolidation)
```typescript
/**
 * Base type for performance entities
 * Use as constraint for generic functions
 */
interface PerformanceEntity {
  id: string;
  name: string;
  performanceValue: number;
  timestamp: number;
}

/**
 * Type-safe performance calculation
 * Works with any entity extending base
 */
function calculatePerformanceDelta<T extends PerformanceEntity>(
  current: T[],
  previous: T[]
): Array<T & { delta: number }> {
  return current.map(curr => {
    const prev = previous.find(p => p.id === curr.id);
    return {
      ...curr,
      delta: prev ? curr.performanceValue - prev.performanceValue : 0
    };
  });
}

// Usage - type flows through
type Contributor = PerformanceEntity & { repoId: string };
type TeamMember = PerformanceEntity & { teamId: string };

const contributorDeltas = calculatePerformanceDelta<Contributor>(...); // typed!
const memberDeltas = calculatePerformanceDelta<TeamMember>(...); // typed!
```

### 2. Discriminated Union Pattern (for variant types)
```typescript
/**
 * Type-safe data source discrimination
 * Enables exhaustive checking
 */
type DashboardData =
  | { type: "org"; teams: Team[]; chaosMetrics: ChaosMetric[] }
  | { type: "team"; members: Member[]; collaborationData: CollabData }
  | { type: "repo"; contributors: Contributor[]; modules: Module[] }
  | { type: "user"; skills: Skill[]; roadmap: Roadmap };

function renderDashboard(data: DashboardData) {
  switch (data.type) {
    case "org":
      return <OrgView teams={data.teams} chaos={data.chaosMetrics} />;
    case "team":
      return <TeamView members={data.members} />;
    case "repo":
      return <RepoView contributors={data.contributors} />;
    case "user":
      return <UserView skills={data.skills} />;
    // TypeScript enforces exhaustiveness!
  }
}
```

### 3. Builder Pattern with Type Safety
```typescript
/**
 * Type-safe configuration builder
 * Immutable with readonly properties
 */
interface ChartConfig {
  readonly width: number;
  readonly height: number;
  readonly timeRange: TimeRangeKey;
  readonly showLegend: boolean;
}

const DEFAULT_CHART_CONFIG: ChartConfig = {
  width: 800,
  height: 400,
  timeRange: "1m",
  showLegend: true,
} as const;

function buildChartConfig(
  overrides: Partial<ChartConfig> = {}
): ChartConfig {
  return { ...DEFAULT_CHART_CONFIG, ...overrides };
}

// Usage - type-safe with autocomplete
const config = buildChartConfig({ timeRange: "3m" }); // ✅
const bad = buildChartConfig({ timeRange: "invalid" }); // ❌ Type error
```

### 4. Type Guards for Runtime Safety
```typescript
/**
 * Type guard pattern for external data
 * Narrows unknown to specific type
 */
interface ContributorData {
  id: string;
  name: string;
  contributions: number;
}

function isContributorData(value: unknown): value is ContributorData {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "contributions" in value &&
    typeof value.contributions === "number"
  );
}

// Usage
function processData(data: unknown) {
  if (isContributorData(data)) {
    // TypeScript knows data is ContributorData here
    console.log(data.name); // ✅ Type-safe
  }
}
```

### 5. Mapped Types for Transformations
```typescript
/**
 * Transform all properties to optional
 * Useful for partial updates
 */
type PartialUpdate<T> = {
  [K in keyof T]?: T[K];
};

/**
 * Extract only numeric properties
 * Type-level filtering
 */
type NumericProps<T> = {
  [K in keyof T as T[K] extends number ? K : never]: T[K];
};

// Usage
interface Metrics {
  name: string;
  value: number;
  delta: number;
  timestamp: number;
}

type MetricsUpdate = PartialUpdate<Metrics>; // All optional
type NumericMetrics = NumericProps<Metrics>; // Only value, delta, timestamp
```

---

## Migration Safety Checklist

After each major file move:

1. **Compilation Check**:
   ```bash
   npx tsc --noEmit
   ```
   Should show 0 errors

2. **Import Path Audit**:
   ```bash
   # Find any remaining relative imports that should be absolute
   grep -r "from '\\.\\." components/dashboard/
   grep -r "from '\\.\\." lib/dashboard/
   ```

3. **Circular Dependency Check**:
   ```bash
   # Install if needed: npm install -g madge
   madge --circular --extensions ts,tsx components/
   madge --circular --extensions ts,tsx lib/
   ```

4. **Type Coverage** (optional but recommended):
   ```bash
   # Install if needed: npm install -g type-coverage
   type-coverage --detail
   ```
   Target: > 95% type coverage

5. **Lint Check**:
   ```bash
   npm run lint
   ```

---

## Success Criteria

### Phase 3 Type Safety Goals:
- ✅ **Zero TypeScript errors** after all reorganization
- ✅ **No `any` types added** during consolidation
- ✅ **All imports absolute** (no relative `../..` imports)
- ✅ **No barrel exports** (no index.ts re-exports)
- ✅ **Generic types properly constrained**
- ✅ **Discriminated unions for variants**
- ✅ **Type guards for runtime safety**
- ✅ **Strict mode compliance** maintained

### Type Quality Metrics:
- Type coverage: > 95%
- Explicit `any`: 0 (all existing `any` documented)
- Circular dependencies: 0
- Import errors: 0
- Type assertion usage: Minimal, documented

---

## Risk Mitigation

### High-Risk Operations:
1. **Moving type definition files** - Could break many imports
   - Mitigation: Use TypeScript's "Find All References" before moving
   - Create type alias exports at old location temporarily if needed

2. **Consolidating duplicate generators** - Type signatures must align
   - Mitigation: Create generic base first, then migrate one entity at a time
   - Keep old generators until new ones are proven equivalent

3. **Changing import paths** - Easy to miss some files
   - Mitigation: Use global find/replace with verification
   - Run TypeScript check after each batch of changes

### Recovery Strategy:
- Commit after each successful subfolder reorganization
- If types break, revert last commit and fix incrementally
- Use feature branch for each major type consolidation
- PR review focuses on type safety before merge

---

## Next Actions (Priority Order)

### Immediate (P0 - P1):
1. ✅ Fix all timeRange import paths (30 min)
2. ✅ Fix repo performance type mismatches (2 hours)
3. ✅ Fix team performance type mismatches (1 hour)
4. ✅ Fix user skill graph types (1.5 hours)
5. ✅ Run TypeScript compilation check - verify 0 P0/P1 errors

### Before File Moves (P2):
6. ✅ Fix performance chart strategy types (30 min)
7. ✅ Fix carousel state type (15 min)
8. ✅ Fix app layout provider (15 min)
9. ✅ Fix chaos matrix types (45 min)

### During Reorganization (P3):
10. ✅ Fix ownership scatter types (30 min)
11. ✅ Delete duplicate repo route (5 min)

**Total Estimated Time**: ~7 hours type safety work

---

**Status**: Ready to begin type safety fixes before Phase 3 reorganization 🚀
