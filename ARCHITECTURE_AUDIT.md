# Architecture Audit - Alignment with Best Practices

**Date**: 2026-02-08
**Audited Against**: `routing-knowledge.md` best practices
**Status**: 🟡 Partially Aligned - Improvements Needed

---

## Executive Summary

The codebase demonstrates **good alignment** with several core architectural principles but has opportunities for improvement in key areas:

### ✅ Strengths
1. **Hierarchical routing** - Already using `/org/[orgId]/` structure
2. **Route utilities exist** - `lib/routes.ts` provides centralized route functions
3. **Path aliases configured** - Using `@/*` imports throughout
4. **Feature-based components** - Components organized in `components/dashboard/`

### ⚠️ Areas for Improvement
1. **No RouteParamsProvider** - Missing React Context for route params
2. **Mixed page/client logic** - Pages are client components with business logic
3. **Manual route param extraction** - Using `useParams()` directly in components
4. **Manual URL building in helpers** - Some duplication of route logic
5. **No strict context pattern** - Missing type-safe context factory

---

## Detailed Analysis

### 1. ✅ Feature-Based Organization (ALIGNED)

**Status**: ✅ **Good**

**Current Implementation**:
```
components/
  dashboard/
    GaugeSection.tsx
    TeamTable.tsx
    ChartInsights.tsx
    layout/
      DashboardHeader.tsx
      DashboardSidebar.tsx
```

**Evidence**:
- Components are organized by feature/domain in `components/dashboard/`
- No route-based duplication found (e.g., no separate `/team/components/`, `/user/components/`)
- Shared components are reused across different route contexts

**Compliance**: ✅ Follows the "Feature-Based Organization Over Route-Based Organization" principle

**Recommendation**: Maintain this pattern. Continue placing shared components in `components/dashboard/` rather than route-specific directories.

---

### 2. ⚠️ Separation of Concerns: Page vs Component Logic (NEEDS IMPROVEMENT)

**Status**: ⚠️ **Partially Aligned**

**Current Implementation**:
```tsx
// app/org/[orgId]/page.tsx
"use client";  // ❌ All pages are client components

export default function OrgSummaryPage() {
  const [gaugeValue] = useState(() => Math.floor(Math.random() * 101));
  const teamRows = useMemo(/* ... */);  // ❌ Business logic in page

  return (/* Complex UI */);  // ❌ UI logic in page
}
```

**Issues**:
1. **Pages are client components** - All pages start with `"use client"`
2. **Business logic in pages** - State management, memoization, data processing
3. **No separation layer** - No dedicated Client Component pattern

**Expected Pattern**:
```tsx
// ✅ Page as thin data-fetching layer
export default async function OrgSummaryPage({ params }: { params: { orgId: string } }) {
  const data = await fetchOrgData(params.orgId);  // Server-side data fetching
  return <OrgSummaryPageClient data={data} />;
}

// ✅ Client component with business logic
// components/dashboard/OrgSummaryPageClient.tsx
"use client";
export function OrgSummaryPageClient({ data }: { data: OrgData }) {
  const [gaugeValue] = useState(data.performance);
  // All business logic, state, and UI here
}
```

**Impact**:
- Missing benefits of Server Components (server-side rendering, reduced bundle)
- Harder to test business logic in isolation
- Pages cannot perform async data fetching on server

**Recommendation**:
1. Create Client Component variants for each page (e.g., `OrgSummaryPageClient.tsx`)
2. Move state management and business logic to Client Components
3. Keep pages as thin wrappers (server components when possible)

**Priority**: 🔴 **High** - This is a fundamental architectural pattern

---

### 3. ⚠️ Centralized Routing Logic (PARTIALLY ALIGNED)

**Status**: ⚠️ **Good utilities, but not consistently used**

#### 3a. Route Utilities (✅ EXISTS)

**Current Implementation** in `lib/routes.ts`:
```typescript
// ✅ Good: Centralized route builders
export function getOrgPath(orgId: string, tab?: string): string
export function getTeamPath(orgId: string, teamId: string, tab?: string): string
export function getUserPath(orgId: string, userId: string, tab?: string): string
export function getRepoPath(orgId: string, repoId: string, tab?: string): string

// ✅ Good: Centralized extractors
export function extractOrgId(pathname: string | null | undefined): string | null
export function extractTeamId(pathname: string | null | undefined): string | null
```

**Compliance**: ✅ Utilities exist and follow best practices

#### 3b. Route Params Provider (❌ MISSING)

**Current Implementation**:
```tsx
// ❌ Direct useParams() usage in components
const params = useParams();
const teamId = params.teamId as string;  // Manual extraction + type casting
```

**Expected Pattern**:
```tsx
// ✅ RouteParamsProvider wrapping layouts
export function RouteParamsProvider({ children }) {
  const pathname = usePathname();
  const params = parseRouteParams(pathname);
  // Provide route IDs and URL builders via context
}

// ✅ Components use hook
const { teamId, getTeamUrl } = useRouteParams();
```

**Issues**:
1. **No RouteParamsProvider** - Missing React Context for route params
2. **Direct useParams() usage** - Components manually extract route params
3. **Type casting required** - `params.teamId as string`
4. **Scattered route logic** - Manual URL building in helper files

**Evidence of Manual Usage**:
- `app/org/[orgId]/team/[teamId]/page.tsx:16` - `const teamId = params.teamId as string;`
- `components/dashboard/layout/helpers/dashboardTabHelpers.ts:86-89` - Manual extraction from pathname

**Impact**:
- Duplicated param extraction logic across components
- Risk of inconsistent URL building
- Harder to refactor route structure later

**Recommendation**:
1. Create `lib/RouteParamsProvider.tsx` (see routing-knowledge.md lines 227-275)
2. Wrap app/org/[orgId]/layout.tsx with provider
3. Replace all `useParams()` calls with `useRouteParams()`
4. Update `buildTabConfigs` to use context instead of manual extraction

**Priority**: 🟡 **Medium-High** - Improves consistency and maintainability

---

### 4. ⚠️ Import Path Strategy (ALIGNED)

**Status**: ✅ **Good**

**Current Implementation**:
```tsx
// ✅ Path aliases configured in tsconfig.json
"paths": {
  "@/*": ["./*"]
}

// ✅ Consistent usage across codebase
import { Card } from "@/components/ui/card";
import { getTeamPath } from "@/lib/routes";
```

**Evidence**:
- All imports use `@/` alias
- No relative imports found (no `../../../../` patterns)
- tsconfig.json properly configured

**Compliance**: ✅ Follows import path best practices

**Recommendation**: Maintain this pattern. Continue using `@/` for all imports.

---

### 5. ❌ Context Management (NOT IMPLEMENTED)

**Status**: ❌ **Missing Type-Safe Context Pattern**

**Current Implementation**:
```tsx
// ❌ Standard context usage (no strict pattern)
const value = useContext(SomeContext);  // Could be null!
```

**Expected Pattern**:
```typescript
// ✅ Type-safe context factory
import { getStrictContext } from '@/lib/get-strict-context';

const [CodeIssueContext, useCodeIssueContext] =
  getStrictContext<CodeIssueContextValue>('CodeIssueContext');

// ✅ Runtime safety
export { useCodeIssueContext };  // Never returns null, throws if outside provider
```

**Issues**:
1. **No `lib/get-strict-context.tsx`** - Missing utility file
2. **Standard context usage** - No runtime provider validation
3. **Potential null values** - TypeScript can't guarantee provider exists

**Files Using Context**:
- `components/ui/sidebar.tsx` - Uses createContext/useContext (standard pattern)
- `components/ui/toggle-group.tsx` - Uses createContext/useContext (standard pattern)

**Impact**:
- Runtime errors if context used outside provider
- Less clear error messages
- TypeScript allows null values

**Recommendation**:
1. Create `lib/get-strict-context.tsx` (see routing-knowledge.md lines 313-330)
2. Migrate existing contexts to use strict pattern
3. Apply pattern to new RouteParamsProvider

**Priority**: 🟢 **Low-Medium** - Nice to have, improves DX and type safety

---

### 6. ⚠️ Manual URL Building in Helpers (INCONSISTENT)

**Status**: ⚠️ **Partial duplication**

**Issue**: Route building logic appears in both `lib/routes.ts` AND helper files

**Example from `components/dashboard/layout/helpers/dashboardTabHelpers.ts:95-116`**:
```typescript
// ❌ Manual URL building (duplicates lib/routes.ts logic)
if (dashboardType === "team" && teamId) {
  href = tab.key === "overview"
    ? `/org/${orgId}/team/${teamId}`
    : `/org/${orgId}/team/${teamId}/${tab.key}`
} else if (dashboardType === "user" && userId) {
  href = tab.key === "overview"
    ? `/org/${orgId}/user/${userId}`
    : `/org/${orgId}/user/${userId}/${tab.key}`
}
```

**Better Approach**:
```typescript
// ✅ Use existing route utilities
import { getTeamPath, getUserPath } from '@/lib/routes';

if (dashboardType === "team" && teamId) {
  href = getTeamPath(orgId, teamId, tab.key === "overview" ? undefined : tab.key);
} else if (dashboardType === "user" && userId) {
  href = getUserPath(orgId, userId, tab.key === "overview" ? undefined : tab.key);
}
```

**Impact**:
- Duplicated route building logic
- Risk of inconsistencies if route structure changes
- Harder to maintain

**Recommendation**:
1. Refactor `buildTabConfigs` to use `getTeamPath`, `getUserPath`, etc.
2. Remove manual string concatenation
3. Ensure all URL building uses `lib/routes.ts` utilities

**Priority**: 🟡 **Medium** - Prevents future inconsistencies

---

### 7. ✅ Hierarchical Route Structure (ALIGNED)

**Status**: ✅ **Good**

**Current Implementation**:
```
app/
  org/[orgId]/
    page.tsx                    → /org/:orgId
    performance/page.tsx        → /org/:orgId/performance
    team/[teamId]/
      page.tsx                  → /org/:orgId/team/:teamId
      performance/page.tsx      → /org/:orgId/team/:teamId/performance
    user/[userId]/page.tsx      → /org/:orgId/user/:userId
    repo/[repoId]/page.tsx      → /org/:orgId/repo/:repoId
```

**Compliance**: ✅ Perfect alignment with org-scoped routing pattern

**Recommendation**: Continue this pattern. Structure is excellent.

---

## Priority Action Items

### 🔴 High Priority

1. **Implement Client Component Pattern**
   - [ ] Create `components/dashboard/pages/` directory
   - [ ] Extract page logic to Client Components (e.g., `OrgSummaryPageClient.tsx`)
   - [ ] Refactor pages to be thin wrappers
   - [ ] Migrate one page as proof-of-concept

   **Estimated Effort**: 2-3 days
   **Impact**: Enables Server Components, improves testability

2. **Create RouteParamsProvider**
   - [ ] Create `lib/RouteParamsProvider.tsx`
   - [ ] Create layout wrapper at `app/org/[orgId]/layout.tsx`
   - [ ] Add `useRouteParams` hook
   - [ ] Test provider with existing pages

   **Estimated Effort**: 1 day
   **Impact**: Centralized route context, cleaner component code

### 🟡 Medium Priority

3. **Refactor URL Building in Helpers**
   - [ ] Update `buildTabConfigs` to use `lib/routes.ts` utilities
   - [ ] Remove manual URL construction
   - [ ] Add tests for route building

   **Estimated Effort**: 0.5 days
   **Impact**: Consistency, easier maintenance

4. **Replace Direct useParams() Usage**
   - [ ] Find all `useParams()` calls
   - [ ] Replace with `useRouteParams()` hook
   - [ ] Remove type casting (`as string`)

   **Estimated Effort**: 1-2 days (depends on usage count)
   **Impact**: Cleaner, type-safe code

### 🟢 Low Priority

5. **Implement Strict Context Pattern**
   - [ ] Create `lib/get-strict-context.tsx`
   - [ ] Migrate existing contexts
   - [ ] Document pattern for team

   **Estimated Effort**: 0.5 days
   **Impact**: Better error messages, type safety

---

## Migration Checklist

Based on routing-knowledge.md migration strategy (lines 453-507):

### Phase 1: Create Infrastructure ✅ (MOSTLY COMPLETE)
- [x] Centralized directories (`components/dashboard/`)
- [x] Route utilities (`lib/routes.ts`)
- [ ] **RouteParamsProvider** (`lib/RouteParamsProvider.tsx`) ⚠️ **MISSING**
- [ ] Context utilities (`lib/get-strict-context.tsx`) ⚠️ **MISSING**
- [x] Path aliases configured in tsconfig.json

### Phase 2: Migrate Components (IN PROGRESS)
- [x] Component organization is feature-based
- [ ] **Client Component pattern not applied** ⚠️ **NEEDS WORK**
- [x] Imports use path aliases

### Phase 3: Update Routing (PARTIAL)
- [ ] **Wrap layouts with RouteParamsProvider** ⚠️ **MISSING**
- [x] URL builders exist in `lib/routes.ts`
- [ ] **Replace pathname parsing with useRouteParams** ⚠️ **NEEDS WORK**

### Phase 4: Clean Up (NOT STARTED)
- [ ] Documentation updates
- [ ] Team guidelines
- [ ] Linting rules

---

## Code Quality Metrics

### Current State
- **Path Aliases**: ✅ 100% usage
- **Feature-Based Organization**: ✅ Good structure
- **Route Utilities**: ✅ Exist but not consistently used
- **Client Component Pattern**: ❌ 0% (all pages are client components with mixed logic)
- **RouteParamsProvider**: ❌ Missing
- **Strict Context Pattern**: ❌ Missing

### Target State (from routing-knowledge.md)
- **Path Aliases**: ✅ 100% usage
- **Feature-Based Organization**: ✅ Maintain current
- **Route Utilities**: ✅ 100% usage (refactor helpers)
- **Client Component Pattern**: ✅ 100% (separate page/client logic)
- **RouteParamsProvider**: ✅ Implemented
- **Strict Context Pattern**: ✅ Implemented

---

## Anti-Patterns Found

### ❌ Anti-Pattern 2: Manual Pathname Parsing ✅ FOUND

**Location**: `components/dashboard/layout/helpers/dashboardTabHelpers.ts`
```typescript
// Line 86-89: Manual extraction (should use context)
const orgId = extractOrgId(pathname)
const teamId = extractTeamId(pathname)
const userId = extractUserId(pathname)
const repoId = extractRepoIdFromRoutes(pathname)
```

**Fix**: Use RouteParamsProvider context

### ❌ Anti-Pattern 3: Mixed Page/Component Logic ✅ FOUND

**Locations**: All page files
```typescript
// app/org/[orgId]/page.tsx, app/org/[orgId]/team/[teamId]/page.tsx, etc.
"use client";  // ❌ Should be server component
export default function Page() {
  const [state, setState] = useState();  // ❌ Business logic in page
  const data = useMemo(() => /* ... */);  // ❌ Data processing in page
  return <ComplexUI />;  // ❌ UI logic in page
}
```

**Fix**: Extract to Client Components

### ❌ Anti-Pattern 5: Unsafe Context Usage ⚠️ POTENTIAL RISK

**Locations**: `components/ui/sidebar.tsx`, `components/ui/toggle-group.tsx`
```typescript
const value = useContext(MyContext);
// No runtime check if value is null
```

**Fix**: Use getStrictContext pattern

---

## Recommendations Summary

### Immediate Actions (This Sprint)
1. ✅ Keep current feature-based organization
2. 🔴 Create `lib/RouteParamsProvider.tsx` and wrapper layout
3. 🔴 Start migrating one page to Client Component pattern (proof of concept)

### Short-term (Next 2 Sprints)
4. 🟡 Refactor `buildTabConfigs` to use route utilities
5. 🟡 Replace all `useParams()` with `useRouteParams()`
6. 🟢 Create `lib/get-strict-context.tsx`

### Long-term (Future Sprints)
7. Migrate all pages to Client Component pattern
8. Add linting rules to prevent anti-patterns
9. Document patterns for team onboarding
10. Consider adding integration tests for routing

---

## Conclusion

The codebase has a **solid foundation** with hierarchical routing and feature-based organization. The main gaps are:

1. **Missing RouteParamsProvider** - Would centralize route context
2. **No Client Component pattern** - Pages mix data fetching, state, and UI
3. **Inconsistent route utility usage** - Some helpers build URLs manually

**Overall Grade**: 🟡 **B-** (Good structure, needs architectural refinement)

**Next Steps**:
1. Review this audit with the team
2. Prioritize RouteParamsProvider implementation
3. Create proof-of-concept for Client Component pattern
4. Plan migration sprints for remaining work

---

**Audited By**: Claude Sonnet 4.5
**Based On**: routing-knowledge.md (synthesized from refactor1-learning.md and refactor2-learning.md)
