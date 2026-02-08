# Phase 5: Architectural Alignment with Best Practices - Research

**Researched:** 2026-02-08
**Domain:** Next.js App Router architecture, routing patterns, React Context, component separation
**Confidence:** HIGH

## Summary

This phase implements five architectural improvements identified in `ARCHITECTURE_AUDIT.md` to align the codebase with Next.js App Router best practices. The research confirms all improvements are feasible and identifies a clear implementation path.

**Current State:** The codebase has solid foundations (hierarchical routing, centralized route utilities, feature-based organization) but needs architectural refinements to fully leverage Next.js App Router capabilities.

**Key Findings:**
1. **10 client component pages** need Server/Client separation (all currently have `"use client"` directive)
2. **5 locations** use `useParams()` directly and need migration to context-based approach
3. **3 existing contexts** should adopt strict context pattern for type safety
4. **1 helper file** (`dashboardTabHelpers.ts`) manually builds URLs instead of using centralized route utilities
5. **No RouteParamsProvider exists** - this is the foundational piece enabling all other improvements

**Primary recommendation:** Implement improvements in dependency order: (1) strict context utility, (2) RouteParamsProvider, (3) refactor URL building, (4) migrate useParams() usage, (5) Client Component extraction pattern.

## 1. Current State Analysis

### 1.1 Page Structure (10 Total Pages)

**All pages use client components with business logic:**

```
app/org/[orgId]/
├── page.tsx                         ✅ "use client" (org overview)
├── performance/page.tsx             ✅ "use client" (org performance)
├── design/page.tsx                  ✅ "use client" (org design)
├── skillgraph/page.tsx              ✅ "use client" (org skills)
├── spof/page.tsx                    ✅ "use client" (org SPOF)
├── team/[teamId]/
│   ├── page.tsx                     ✅ "use client" (team overview)
│   ├── performance/page.tsx         ✅ "use client" (team performance)
│   ├── design/page.tsx              ✅ "use client" (team design)
│   ├── skillgraph/page.tsx          ✅ "use client" (team skills)
│   └── spof/page.tsx                ✅ "use client" (team SPOF)
├── user/[userId]/page.tsx           ✅ "use client" (user overview)
└── repo/[repoId]/page.tsx           ✅ "use client" (repo overview)
```

**Total: 12 pages, 10 currently client components** (2 placeholders: user, repo)

**Pattern observed:**
```tsx
// CURRENT: All in one file
"use client";
export default function TeamPage() {
  const params = useParams();              // ❌ Direct param extraction
  const teamId = params.teamId as string;  // ❌ Type casting
  const [state, setState] = useState();    // Business logic in page
  const data = useMemo(() => /* ... */);   // Data processing in page
  return <ComplexUI />;                    // UI rendering in page
}
```

### 1.2 Direct useParams() Usage (5 Files)

Files using `useParams()` directly (from grep analysis):

1. `app/org/[orgId]/team/[teamId]/page.tsx` - Line 4, 16
2. `app/org/[orgId]/team/[teamId]/performance/page.tsx` - Line 4, 32
3. `app/org/[orgId]/team/[teamId]/design/page.tsx` - Line 4, 30
4. `app/org/[orgId]/team/[teamId]/skillgraph/page.tsx` - Line 4
5. `app/org/[orgId]/team/[teamId]/spof/page.tsx` - Line 4

**Pattern:**
```tsx
import { useParams } from "next/navigation";
const params = useParams();
const teamId = params.teamId as string; // Type casting required
```

**Note:** Org-level pages don't use params (they're static), user and repo pages are placeholders.

### 1.3 Existing Route Utilities (lib/routes.ts)

**Already implemented - HIGH CONFIDENCE:**

```typescript
// URL builders (lines 1-19)
getOrgPath(orgId: string, tab?: string): string
getTeamPath(orgId: string, teamId: string, tab?: string): string
getUserPath(orgId: string, userId: string, tab?: string): string
getRepoPath(orgId: string, repoId: string, tab?: string): string

// Extractors (lines 21-43)
extractOrgId(pathname: string): string | null
extractTeamId(pathname: string): string | null
extractUserId(pathname: string): string | null
extractRepoId(pathname: string): string | null

// Helpers (lines 45-58)
detectDashboardType(pathname: string): DashboardType
isRepoDetailPage(pathname: string): boolean
```

**Assessment:** Utilities are complete and well-structured. No gaps identified.

### 1.4 Manual URL Building (dashboardTabHelpers.ts)

**Location:** `components/dashboard/layout/helpers/dashboardTabHelpers.ts`

**Issue - Lines 86-116:**
```typescript
// ❌ Manual extraction (duplicates lib/routes.ts)
const orgId = extractOrgId(pathname);
const teamId = extractTeamId(pathname);
const userId = extractUserId(pathname);
const repoId = extractRepoIdFromRoutes(pathname);

// ❌ Manual URL building (duplicates route utilities)
if (dashboardType === "team" && teamId) {
  href = tab.key === "overview"
    ? `/org/${orgId}/team/${teamId}`
    : `/org/${orgId}/team/${teamId}/${tab.key}`
}
// ... similar for user, repo, org
```

**Should use:** `getTeamPath(orgId, teamId, tab.key === "overview" ? undefined : tab.key)`

### 1.5 Existing Context Usage (3 Files)

**Files using createContext/useContext (standard pattern):**

1. `components/ui/sidebar.tsx` - Lines 44-49
   ```tsx
   const SidebarContext = React.createContext<SidebarContextProps | null>(null);
   function useSidebar() {
     const context = React.useContext(SidebarContext);
     if (!context) {
       throw new Error("useSidebar must be used within a SidebarProvider.");
     }
   ```
   **Assessment:** ✅ Already has runtime check, but not using strict pattern

2. `components/ui/toggle-group.tsx` - Lines 9-17
   ```tsx
   const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
     size: "default",
     variant: "default",
   });
   ```
   **Assessment:** ⚠️ No runtime check, provides default value (lower risk)

3. `components/dashboard/layout/SidebarHighlight.tsx` - Lines 9-17
   ```tsx
   const HighlightContext = React.createContext<{ onItemHover: ... } | null>(null);
   function useHighlight() {
     const ctx = React.useContext(HighlightContext);
     if (!ctx) throw new Error("...");
   }
   ```
   **Assessment:** ✅ Already has runtime check

**Observation:** 2 of 3 contexts already implement runtime checks manually. Strict context pattern would standardize this.

### 1.6 Layout Hierarchy

**Current layout structure:**

```
app/
└── layout.tsx                          # Root layout (wraps with DashboardSidebar)
    └── org/[orgId]/
        └── (NO LAYOUT) ⚠️              # RouteParamsProvider should go here
```

**Key finding:** No layout exists at `app/org/[orgId]/layout.tsx` - this is the ideal location for RouteParamsProvider.

### 1.7 Data Fetching Pattern

**All data is currently client-side mocks:**

```tsx
// Example from team/[teamId]/page.tsx
const memberRows = useMemo(
  () => getMemberPerformanceRowsForTeam(52, teamId, 6),
  [teamId]
);
```

**Assessment:**
- No async server-side data fetching currently exists
- Migration to Server Components won't break existing data fetching
- Mock functions can be called in Server Component wrapper or passed as props

## 2. Implementation Approach

### 2.1 Create Strict Context Utility (lib/get-strict-context.tsx)

**Purpose:** Type-safe context factory that prevents null access errors

**Implementation (from routing-knowledge.md lines 313-330):**

```typescript
// lib/get-strict-context.tsx
import { createContext, useContext, Context } from 'react';

export function getStrictContext<T>(displayName: string) {
  const context = createContext<T | null>(null);
  context.displayName = displayName;

  function useStrictContext() {
    const value = useContext(context);
    if (value === null) {
      throw new Error(`${displayName} must be used within its Provider`);
    }
    return value;
  }

  return [context, useStrictContext] as const;
}
```

**Usage example:**
```typescript
const [MyContext, useMyContext] = getStrictContext<MyContextValue>('MyContext');
// useMyContext() never returns null, TypeScript knows this
```

**Confidence:** HIGH - Pattern is proven from routing-knowledge.md and similar to existing manual checks in codebase

**Files to migrate (optional):**
- `components/ui/sidebar.tsx` - Replace manual check with strict pattern
- `components/ui/toggle-group.tsx` - Add runtime safety
- `components/dashboard/layout/SidebarHighlight.tsx` - Replace manual check

### 2.2 Create RouteParamsProvider (lib/RouteParamsProvider.tsx)

**Purpose:** Centralized React Context providing type-safe route parameters and URL builders to all components

**Design (based on routing-knowledge.md lines 227-275):**

```typescript
// lib/RouteParamsProvider.tsx
'use client';

import { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import {
  extractOrgId,
  extractTeamId,
  extractUserId,
  extractRepoId,
  getOrgPath,
  getTeamPath,
  getUserPath,
  getRepoPath,
} from '@/lib/routes';

interface RouteParamsContextValue {
  // Route parameters
  orgId: string | null;
  teamId: string | null;
  userId: string | null;
  repoId: string | null;

  // URL builders (pre-bound with orgId)
  getOrgUrl: (tab?: string) => string;
  getTeamUrl: (teamId: string, tab?: string) => string;
  getUserUrl: (userId: string, tab?: string) => string;
  getRepoUrl: (repoId: string, tab?: string) => string;
}

const RouteParamsContext = createContext<RouteParamsContextValue | null>(null);

export function RouteParamsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const orgId = extractOrgId(pathname);
  const teamId = extractTeamId(pathname);
  const userId = extractUserId(pathname);
  const repoId = extractRepoId(pathname);

  const value: RouteParamsContextValue = {
    orgId,
    teamId,
    userId,
    repoId,
    getOrgUrl: (tab) => getOrgPath(orgId!, tab),
    getTeamUrl: (teamId, tab) => getTeamPath(orgId!, teamId, tab),
    getUserUrl: (userId, tab) => getUserPath(orgId!, userId, tab),
    getRepoUrl: (repoId, tab) => getRepoPath(orgId!, repoId, tab),
  };

  return (
    <RouteParamsContext.Provider value={value}>
      {children}
    </RouteParamsContext.Provider>
  );
}

export function useRouteParams() {
  const context = useContext(RouteParamsContext);
  if (!context) {
    throw new Error('useRouteParams must be used within RouteParamsProvider');
  }
  return context;
}
```

**Could also use strict context pattern:**
```typescript
import { getStrictContext } from '@/lib/get-strict-context';

const [RouteParamsContext, useRouteParams] =
  getStrictContext<RouteParamsContextValue>('RouteParamsContext');
```

**Confidence:** HIGH - Pattern from routing-knowledge.md, builds on existing route utilities

**Route parameters needed:**
- ✅ orgId - Used in all routes
- ✅ teamId - Used in 5 team pages
- ✅ userId - Used in 1 user page (placeholder)
- ✅ repoId - Used in 1 repo page (placeholder)

### 2.3 Integrate RouteParamsProvider into Layout

**Create:** `app/org/[orgId]/layout.tsx`

```tsx
import { RouteParamsProvider } from '@/lib/RouteParamsProvider';

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteParamsProvider>
      {children}
    </RouteParamsProvider>
  );
}
```

**Why this location:**
- All org-scoped routes are children of `/org/[orgId]/`
- orgId is always available in pathname
- Provider wraps all dashboard pages
- No existing layout at this level (won't conflict)

**Confidence:** HIGH - Standard Next.js App Router pattern

### 2.4 Refactor URL Building in dashboardTabHelpers.ts

**Current approach (lines 95-116):**
```typescript
// ❌ Manual string concatenation
if (dashboardType === "team" && teamId) {
  href = tab.key === "overview"
    ? `/org/${orgId}/team/${teamId}`
    : `/org/${orgId}/team/${teamId}/${tab.key}`
}
```

**Improved approach:**
```typescript
// ✅ Use existing route utilities
import { getTeamPath, getUserPath, getRepoPath, getOrgPath } from '@/lib/routes';

if (dashboardType === "team" && teamId) {
  href = getTeamPath(orgId!, teamId, tab.key === "overview" ? undefined : tab.key);
} else if (dashboardType === "user" && userId) {
  href = getUserPath(orgId!, userId, tab.key === "overview" ? undefined : tab.key);
} else if (dashboardType === "repo" && repoId) {
  href = getRepoPath(orgId!, repoId, tab.key === "overview" ? undefined : tab.key);
} else {
  href = getOrgPath(orgId!, tab.key === "overview" ? undefined : tab.key);
}
```

**Alternative (if RouteParamsProvider is in scope):**
```typescript
// Could use context instead of manual extraction
const { orgId, teamId, userId, repoId, getTeamUrl, getUserUrl, getRepoUrl, getOrgUrl } = useRouteParams();
// Then use URL builders directly
```

**Confidence:** HIGH - Direct refactor using existing utilities

### 2.5 Replace useParams() with useRouteParams()

**Migration pattern:**

```tsx
// BEFORE
import { useParams } from "next/navigation";
const params = useParams();
const teamId = params.teamId as string;

// AFTER
import { useRouteParams } from '@/lib/RouteParamsProvider';
const { teamId } = useRouteParams();
// No type casting needed, teamId is string | null
```

**Files to update (5 total):**
1. `app/org/[orgId]/team/[teamId]/page.tsx`
2. `app/org/[orgId]/team/[teamId]/performance/page.tsx`
3. `app/org/[orgId]/team/[teamId]/design/page.tsx`
4. `app/org/[orgId]/team/[teamId]/skillgraph/page.tsx`
5. `app/org/[orgId]/team/[teamId]/spof/page.tsx`

**Confidence:** HIGH - Simple find/replace with type safety improvement

**Risk:** LOW - Pages still use teamId for mock data generation, no behavioral change

### 2.6 Client Component Extraction Pattern

**Goal:** Separate page (Server Component wrapper) from client logic (Client Component)

**Pattern (from routing-knowledge.md lines 66-79):**

```tsx
// Page: app/org/[orgId]/team/[teamId]/page.tsx (Server Component)
import { TeamOverviewPageClient } from '@/components/dashboard/pages/TeamOverviewPageClient';

export default async function TeamOverviewPage({ params }: { params: { orgId: string, teamId: string } }) {
  // Could fetch data here in future:
  // const data = await fetchTeamData(params.teamId);

  // For now, pass params to client component
  return <TeamOverviewPageClient />;
}

// Client Component: components/dashboard/pages/TeamOverviewPageClient.tsx
"use client";

import { useRouteParams } from '@/lib/RouteParamsProvider';
// ... other imports

export function TeamOverviewPageClient() {
  const { teamId } = useRouteParams();
  // All existing business logic, state, useMemo, etc.
  const memberRows = useMemo(() => getMemberPerformanceRowsForTeam(52, teamId!, 6), [teamId]);
  // ... rest of component
}
```

**Alternative (if data needed):**
```tsx
// Pass data as props
export default async function Page() {
  const data = await fetchData(); // Server-side
  return <PageClient data={data} />;
}

export function PageClient({ data }: { data: Data }) {
  // Client-side interactivity
}
```

**Naming convention:**
- Location: `components/dashboard/pages/` (new directory)
- Pattern: `[Feature][Entity]PageClient.tsx`
- Examples:
  - `TeamOverviewPageClient.tsx`
  - `TeamPerformancePageClient.tsx`
  - `TeamDesignPageClient.tsx`
  - `OrgOverviewPageClient.tsx`

**Migration scope (10 client pages):**

**Priority 1 - Team pages (most complex):**
1. `app/org/[orgId]/team/[teamId]/page.tsx` → `TeamOverviewPageClient.tsx`
2. `app/org/[orgId]/team/[teamId]/performance/page.tsx` → `TeamPerformancePageClient.tsx`
3. `app/org/[orgId]/team/[teamId]/design/page.tsx` → `TeamDesignPageClient.tsx`
4. `app/org/[orgId]/team/[teamId]/skillgraph/page.tsx` → `TeamSkillGraphPageClient.tsx`
5. `app/org/[orgId]/team/[teamId]/spof/page.tsx` → `TeamSpofPageClient.tsx`

**Priority 2 - Org pages:**
6. `app/org/[orgId]/page.tsx` → `OrgOverviewPageClient.tsx`
7. `app/org/[orgId]/performance/page.tsx` → `OrgPerformancePageClient.tsx`
8. `app/org/[orgId]/design/page.tsx` → `OrgDesignPageClient.tsx`
9. `app/org/[orgId]/skillgraph/page.tsx` → `OrgSkillGraphPageClient.tsx`
10. `app/org/[orgId]/spof/page.tsx` → `OrgSpofPageClient.tsx`

**Priority 3 - Placeholder pages (skip for now):**
- User and repo pages are minimal placeholders, defer until they have real content

**Confidence:** MEDIUM-HIGH
- Pattern is proven (routing-knowledge.md)
- Current data fetching is all client-side (no async server calls to preserve)
- Migration is mechanical (move code, add wrapper)
- **Risk:** Testing overhead - need to verify all interactions still work

**Data fetching consideration:**
Since all current data is mock/client-side, no async server data fetching exists. Migration won't break anything. Future data fetching can be added to Server Component wrappers.

## 3. Migration Strategy

### 3.1 Implementation Order (Dependency-Based)

**Phase 1: Foundation (No dependencies)**
1. Create `lib/get-strict-context.tsx` (ARCH-05) ✅ Standalone
2. Create `lib/RouteParamsProvider.tsx` (ARCH-01) ✅ Uses get-strict-context (optional)
3. Create `app/org/[orgId]/layout.tsx` (ARCH-01) ✅ Uses RouteParamsProvider

**Phase 2: URL Building Refactor (Depends on Phase 1)**
4. Refactor `dashboardTabHelpers.ts` URL building (ARCH-04) ⚠️ Could use RouteParamsProvider or just route utilities

**Phase 3: Replace Direct Param Usage (Depends on Phase 1)**
5. Replace `useParams()` with `useRouteParams()` in 5 files (ARCH-02) ⚠️ Requires RouteParamsProvider

**Phase 4: Client Component Migration (Depends on Phase 3)**
6. Extract Client Components (ARCH-03) ⚠️ Should use useRouteParams() pattern
   - Start with one proof-of-concept (e.g., team overview)
   - Validate pattern works
   - Migrate remaining 9 pages

**Phase 5: Adopt Strict Context (Optional, No dependencies)**
7. Migrate existing contexts to strict pattern (ARCH-05) ✅ Optional quality improvement

### 3.2 Proof-of-Concept Recommendation

**Start with:** `app/org/[orgId]/team/[teamId]/page.tsx` → `TeamOverviewPageClient.tsx`

**Why:**
- Medium complexity (not simplest, not most complex)
- Uses `useParams()` (validates replacement pattern)
- Has state management and useMemo (validates business logic extraction)
- No complex state interactions (lower risk than performance/design pages)

**Success criteria:**
- Page renders identically
- Tab navigation works
- Member table filtering works
- No console errors
- No TypeScript errors

**If POC succeeds:** Proceed with remaining pages in parallel

### 3.3 Testing Strategy

**Per-task testing:**
1. **Strict context utility:** Unit test with sample context
2. **RouteParamsProvider:** Test param extraction, URL building
3. **URL building refactor:** Test tab href generation for all dashboard types
4. **useParams() replacement:** Visual test - pages render correctly
5. **Client Component extraction:** Visual test + interaction test (filters, sorting, navigation)

**Integration testing:**
- Navigation between tabs
- Deep-linking to specific tabs
- Breadcrumb accuracy
- Sidebar highlighting

**Regression prevention:**
- Take screenshots before/after each migration
- Test all 12 pages after completion

### 3.4 Rollback Strategy

**Each improvement is independently reversible:**

1. **Strict context:** Delete file, revert imports
2. **RouteParamsProvider:** Delete files (layout, provider), revert useParams() calls
3. **URL building:** Git revert dashboardTabHelpers.ts
4. **useParams() replacement:** Git revert affected page files
5. **Client Components:** Delete Client Component files, git revert page files

**Low-risk architecture:** Each improvement is additive, not destructive

## 4. Risk Assessment

### 4.1 Breaking Changes Assessment

**HIGH RISK: None identified**

**MEDIUM RISK:**
- **Client Component migration** - Most complex change, highest testing burden
  - **Mitigation:** POC approach, page-by-page migration, screenshot comparison
  - **Worst case:** 10 pages × 10 minutes testing = 1.6 hours testing time

**LOW RISK:**
- **useParams() replacement** - Simple pattern, no behavior change
  - **Mitigation:** TypeScript will catch errors, visual testing confirms behavior
- **URL building refactor** - Existing utilities are proven
  - **Mitigation:** Tab navigation already works, just centralizing logic
- **RouteParamsProvider** - Context pattern is standard React
  - **Mitigation:** Test param extraction with existing routes

**NO RISK:**
- **Strict context utility** - Pure utility function, doesn't affect existing code until adopted

### 4.2 Testing Needs

**Unit testing (optional but recommended):**
- `lib/get-strict-context.tsx` - Test error throwing when used outside provider
- `lib/RouteParamsProvider.tsx` - Test param extraction for all route types
- `lib/routes.ts` - Already implicitly tested by existing usage

**Integration testing (required):**
- All 12 pages render correctly
- Tab navigation works
- Filters/sorting work
- Breadcrumbs show correct path
- Sidebar highlights correct item

**Visual regression testing (highly recommended):**
- Screenshot before/after for each page
- Compare layouts pixel-perfect
- Catch any unintended UI changes

**Performance testing (low priority):**
- Client Component extraction should slightly improve initial page load (smaller bundle)
- RouteParamsProvider adds negligible overhead (one pathname read per route)

### 4.3 Dependencies and Constraints

**External dependencies:** None - all changes use existing Next.js/React APIs

**Internal dependencies:**
- RouteParamsProvider depends on `lib/routes.ts` (already exists ✅)
- Client Components depend on RouteParamsProvider (implement first ✅)
- URL building refactor can happen independently ✅

**Constraints from STATE.md:**
- Must reuse existing dashboard components (✅ Client Component extraction doesn't change this)
- Mock data structure unchanged (✅ No data model changes needed)
- Component organization unchanged (✅ Only adding new `pages/` directory)

### 4.4 Effort Estimation

**Task breakdown:**

| Task | Complexity | Files | Effort | Confidence |
|------|-----------|-------|--------|-----------|
| Create strict context utility | Low | 1 new | 15 min | HIGH |
| Create RouteParamsProvider | Low | 1 new | 30 min | HIGH |
| Create org layout wrapper | Low | 1 new | 10 min | HIGH |
| Refactor URL building | Medium | 1 edit | 30 min | HIGH |
| Replace useParams() (5 files) | Low | 5 edits | 30 min | HIGH |
| Extract first Client Component (POC) | Medium | 2 files | 45 min | MEDIUM |
| Extract remaining 9 Client Components | Medium | 18 files | 2-3 hrs | MEDIUM |
| Migrate existing contexts (optional) | Low | 3 edits | 30 min | MEDIUM |
| Testing (all changes) | Medium | - | 1-2 hrs | - |
| **Total** | | **32 files** | **5-7 hrs** | **HIGH** |

**Parallelization opportunities:**
- URL building refactor can happen alongside useParams() replacement
- Client Component extraction can happen in parallel (different pages)
- Strict context migration can happen anytime

**Critical path:**
1. Strict context → 2. RouteParamsProvider → 3. Layout → 4. useParams() replacement → 5. Client Components

**Minimum viable delivery:**
- RouteParamsProvider + layout (1 hour)
- Replace useParams() in 5 files (30 min)
- Extract 1 Client Component POC (45 min)
**Total MVP: ~2.5 hours**

## 5. Key Decisions for Planner

### Decision 1: Client Component Migration Scope

**Options:**

**A) Full migration (10 pages)** - RECOMMENDED
- ✅ Complete architectural alignment
- ✅ Consistent pattern across all pages
- ❌ Larger testing burden

**B) Partial migration (5 team pages only)**
- ✅ Smaller scope, faster delivery
- ✅ Team pages are most complex (highest value)
- ❌ Inconsistent architecture (mix of patterns)
- ❌ Org pages still have anti-pattern

**C) POC only (1 page)**
- ✅ Validate pattern before full commitment
- ✅ Minimal risk
- ❌ Doesn't achieve architectural goal
- ❌ Leaves 9 pages with anti-pattern

**Recommendation:** Option A (Full migration)
- Testing burden is manageable (1-2 hours)
- Consistency is valuable long-term
- Pages are similar enough that POC validates the rest

### Decision 2: Strict Context Migration Priority

**Options:**

**A) Migrate now (during Phase 5)** - RECOMMENDED
- ✅ Completes ARCH-05 requirement
- ✅ Demonstrates pattern for RouteParamsProvider
- ✅ Only 3 files to update
- ❌ Adds ~30 min to phase

**B) Defer to future phase**
- ✅ Reduces Phase 5 scope
- ❌ Existing contexts remain inconsistent
- ❌ RouteParamsProvider might not use strict pattern (inconsistency)

**Recommendation:** Option A (Migrate now)
- Low effort (30 min)
- High value (completes requirement, shows pattern)
- Natural fit with RouteParamsProvider creation

### Decision 3: URL Building Refactor Approach

**Options:**

**A) Use route utilities directly** - RECOMMENDED
- ✅ Simple refactor (just import functions)
- ✅ No context dependency
- ✅ Clear, explicit code
- ❌ Still manually extracts params from pathname

**B) Use RouteParamsProvider context**
- ✅ Eliminates manual param extraction
- ✅ More aligned with architecture vision
- ❌ Adds context dependency to helper file
- ❌ Helper becomes client component (might be used server-side)

**Recommendation:** Option A (Use utilities directly)
- `buildTabConfigs` is a helper utility, should remain pure
- Manual extraction using existing utilities is acceptable
- Context is better for components, not utilities

### Decision 4: Page Directory Organization

**Options:**

**A) New directory: `components/dashboard/pages/`** - RECOMMENDED
- ✅ Clear separation (pages vs reusable components)
- ✅ Follows routing-knowledge.md pattern
- ✅ Easy to find Client Components
- ❌ Adds one more directory layer

**B) Colocate in existing directories** (e.g., `components/dashboard/overview/OrgOverviewPageClient.tsx`)
- ✅ Groups by feature
- ❌ Mixes page-specific and reusable components
- ❌ Harder to identify Client Components

**C) Keep in app directory** (e.g., `app/org/[orgId]/_components/PageClient.tsx`)
- ✅ Colocated with pages
- ❌ Violates feature-based organization principle
- ❌ Creates route-based organization (anti-pattern)

**Recommendation:** Option A (New `pages/` directory)
- Clear, consistent organization
- Separates page-specific from reusable components
- Aligns with architecture audit recommendation

### Decision 5: Data Fetching Strategy (Future-Proofing)

**Context:** All current data is client-side mocks. Future will need real data fetching.

**Options:**

**A) Server Component wrapper fetches data, passes as props** - RECOMMENDED
- ✅ Leverages Server Components (performance, SEO)
- ✅ Client Component receives data, no loading states
- ✅ Standard Next.js pattern
- ❌ Requires updating both wrapper and client component

**B) Client Component fetches data (current pattern)**
- ✅ No changes to current architecture
- ✅ Simpler migration (just move code)
- ❌ Misses Server Component benefits
- ❌ Client-side loading states, waterfall requests

**C) Hybrid (Server fetches initial, Client fetches updates)**
- ✅ Best of both worlds
- ❌ Most complex
- ❌ Overkill for current use case

**Recommendation:** Option A (Server fetches, props pattern)
- Since we're creating Server Component wrappers anyway, prepare for server data fetching
- Add comment in wrapper: `// Future: const data = await fetchTeamData(params.teamId);`
- Client Component accepts optional data prop
- Easy migration path when real API exists

## 6. Reference Patterns

### 6.1 Strict Context Pattern (Copy-Paste Ready)

```typescript
// lib/get-strict-context.tsx
import { createContext, useContext, Context } from 'react';

/**
 * Creates a type-safe context that prevents null access errors.
 *
 * @param displayName - Context name for error messages
 * @returns [Context, useContext hook]
 *
 * @example
 * const [MyContext, useMyContext] = getStrictContext<MyValue>('MyContext');
 *
 * function MyProvider({ children }) {
 *   return <MyContext.Provider value={...}>{children}</MyContext.Provider>;
 * }
 *
 * function MyComponent() {
 *   const value = useMyContext(); // Never null, runtime error if outside provider
 * }
 */
export function getStrictContext<T>(displayName: string) {
  const context = createContext<T | null>(null);
  context.displayName = displayName;

  function useStrictContext() {
    const value = useContext(context);
    if (value === null) {
      throw new Error(`use${displayName} must be used within ${displayName}Provider`);
    }
    return value;
  }

  return [context, useStrictContext] as const;
}
```

### 6.2 RouteParamsProvider Pattern (Copy-Paste Ready)

See Section 2.2 for full implementation.

### 6.3 Client Component Extraction Pattern (Copy-Paste Ready)

```tsx
// BEFORE: app/org/[orgId]/team/[teamId]/page.tsx
"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
// ... imports

export default function TeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const memberRows = useMemo(() => getMemberPerformanceRowsForTeam(52, teamId, 6), [teamId]);
  const teamGaugeValue = useMemo(() => calculateTeamGaugeValue(memberRows), [memberRows]);
  // ... more business logic

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        {/* UI components */}
      </div>
    </TooltipProvider>
  );
}

// AFTER: app/org/[orgId]/team/[teamId]/page.tsx (Server Component wrapper)
import { TeamOverviewPageClient } from '@/components/dashboard/pages/TeamOverviewPageClient';

export default async function TeamOverviewPage() {
  // Future: Fetch data server-side
  // const data = await fetchTeamData(params.teamId);

  return <TeamOverviewPageClient />;
}

// AFTER: components/dashboard/pages/TeamOverviewPageClient.tsx (Client Component)
"use client";

import { useMemo } from "react";
import { useRouteParams } from "@/lib/RouteParamsProvider";
// ... imports

export function TeamOverviewPageClient() {
  const { teamId } = useRouteParams();

  const memberRows = useMemo(() => getMemberPerformanceRowsForTeam(52, teamId!, 6), [teamId]);
  const teamGaugeValue = useMemo(() => calculateTeamGaugeValue(memberRows), [memberRows]);
  // ... more business logic

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        {/* Same UI components */}
      </div>
    </TooltipProvider>
  );
}
```

## 7. Success Criteria Validation

Mapping research findings to Phase 5 success criteria:

| Success Criterion | Research Finding | Status |
|-------------------|------------------|--------|
| 1. RouteParamsProvider exists and provides type-safe route parameters | Pattern designed in Section 2.2, builds on existing route utilities | ✅ FEASIBLE |
| 2. Page components are thin server-side wrappers | Pattern designed in Section 2.6, 10 pages identified for migration | ✅ FEASIBLE |
| 3. Strict context utility prevents null context errors | Pattern designed in Section 2.1, 3 existing contexts to migrate | ✅ FEASIBLE |
| 4. All URL building uses centralized route utilities | 1 helper file identified, route utilities exist in lib/routes.ts | ✅ FEASIBLE |
| 5. No direct useParams() usage - all use useRouteParams() | 5 files identified, replacement pattern designed | ✅ FEASIBLE |

**Overall feasibility:** ✅ **HIGH CONFIDENCE** - All improvements are implementable with existing tools and patterns

## 8. Open Questions

None. All architectural patterns are clear and proven. Implementation path is well-defined.

## Sources

### Primary (HIGH confidence)
- `ARCHITECTURE_AUDIT.md` - Current state analysis, improvement recommendations
- `routing-knowledge.md` - Best practices patterns, reference implementations
- `lib/routes.ts` - Existing route utilities (verified implementation)
- `app/org/[orgId]/**/*.tsx` - Current page implementations (verified 10 client components)
- `components/ui/*.tsx` - Existing context patterns (verified 3 contexts)

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` - Project context, prior decisions
- Next.js App Router documentation (general knowledge, verified patterns match docs)

### Metadata

**Confidence breakdown:**
- Current state analysis: HIGH - Verified by reading source files
- RouteParamsProvider design: HIGH - Pattern from routing-knowledge.md + existing utilities
- Client Component pattern: MEDIUM-HIGH - Pattern is proven, but testing burden unknown
- Strict context utility: HIGH - Simple pattern, low complexity
- URL building refactor: HIGH - Direct usage of existing utilities

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days - stable architectural patterns)

---

## RESEARCH COMPLETE

**Ready for planning:** ✅ All architectural patterns researched, implementation approach designed, no blockers identified
