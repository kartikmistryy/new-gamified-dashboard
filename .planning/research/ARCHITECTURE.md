# Architecture Research: Team Dashboard Integration

**Domain:** Next.js App Router - Nested Dynamic Routes
**Researched:** 2026-02-06
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         App Router Layer                             │
│  app/org/[orgId]/{page,performance,design,skillgraph,spof}/page.tsx │
│  app/org/[orgId]/team/[teamId]/{page,*}/page.tsx (Team Dashboard)   │
│  app/org/[orgId]/user/[userId]/{page,*}/page.tsx                    │
│  app/org/[orgId]/repo/[repoId]/{page,*}/page.tsx                    │
├─────────────────────────────────────────────────────────────────────┤
│                      Layout & Navigation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Sidebar      │  │ DashboardTabs│  │ DashboardHero│              │
│  │ (Global)     │  │ (Context)    │  │ (Context)    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                        │
├─────────┴─────────────────┴─────────────────┴────────────────────────┤
│                       Dashboard Components                           │
│  ┌───────────────┐ ┌────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │ TeamTable     │ │ GaugeSection│ │ ChartInsights│ │ D3Gauge     │ │
│  │ (Reusable)    │ │ (Reusable) │ │ (Reusable)   │ │ (Reusable)  │ │
│  └───────────────┘ └────────────┘ └──────────────┘ └─────────────┘ │
│  ┌───────────────┐ ┌────────────┐ ┌──────────────┐                 │
│  │SegmentBar     │ │TimeRange   │ │DashboardSection│              │
│  │(Reusable)     │ │Filter      │ │(Reusable)      │              │
│  └───────────────┘ └────────────┘ └──────────────┘                 │
├─────────────────────────────────────────────────────────────────────┤
│                          Data Layer                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         lib/orgDashboard/*MockData.ts (Organization)         │   │
│  │         lib/teamDashboard/*MockData.ts (Team - NEW)          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         __mocks__/sidebar/* (Navigation entities)            │   │
│  └──────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                       Shared Utilities                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ lib/     │  │ types/   │  │ components│  │ components│          │
│  │ routes   │  │ sidebar  │  │ /ui       │  │ /shared  │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Page Components** | Route entry points, data aggregation, "use client" boundary | Server Component (default) or Client Component with state |
| **DashboardSidebar** | Global navigation, org/team/user/repo selection | Client Component with state, wraps all dashboards |
| **DashboardTabs** | Context-aware tab navigation (Org/Team/User/Repo) | Client Component, reads pathname to determine context |
| **DashboardHero** | Context-specific header with name/avatar | Client Component, receives props from parent |
| **Dashboard Components** | Reusable visualization & data components | Mix of Client/Server, composition-friendly |
| **Mock Data Generators** | Deterministic test data for UI development | Pure functions returning typed data |
| **Route Utilities** | Path construction, ID extraction, type detection | Pure functions in `lib/routes.ts` |

## Recommended Project Structure

### Current Structure (Verified)

```
app/
├── layout.tsx                    # Root layout with DashboardSidebar wrapper
├── page.tsx                      # Landing page
└── org/[orgId]/
    ├── page.tsx                  # Organization Overview
    ├── performance/page.tsx      # Organization Performance
    ├── design/page.tsx           # Organization Design
    ├── skillgraph/page.tsx       # Organization Skills Graph
    ├── spof/page.tsx             # Organization SPOF
    ├── team/[teamId]/
    │   └── page.tsx              # Team Dashboard (currently stub: <div>Team</div>)
    ├── user/[userId]/page.tsx    # User Dashboard
    └── repo/[repoId]/page.tsx    # Repo Dashboard
```

### Recommended Structure for Team Dashboard

```
app/org/[orgId]/team/[teamId]/
├── page.tsx                      # Team Overview (default route)
├── performance/page.tsx          # Team Performance (NEW)
├── design/page.tsx               # Team Design (NEW)
├── skillgraph/page.tsx           # Team Skills Graph (NEW)
└── spof/page.tsx                 # Team SPOF (NEW)

components/dashboard/
├── TeamTable.tsx                 # ✓ Exists - shows team list (org-level)
├── MemberTable.tsx               # NEW - shows member list (team-level)
├── GaugeSection.tsx              # ✓ Exists - reusable
├── D3Gauge.tsx                   # ✓ Exists - reusable
├── ChartInsights.tsx             # ✓ Exists - reusable
├── DashboardSection.tsx          # ✓ Exists - reusable
├── SegmentBar.tsx                # ✓ Exists - reusable
├── PerformanceTeamsTable.tsx     # ✓ Exists - adapt for members
├── BaseTeamsTable.tsx            # ✓ Exists - generic table base
└── [23 other components]         # ✓ All reusable

lib/
├── teamDashboard/                # NEW directory
│   ├── overviewMockData.ts       # Member performance data
│   ├── performanceMockData.ts    # Member tracking data
│   ├── designMockData.ts         # Member design metrics
│   ├── skillgraphMockData.ts     # Member skill data
│   ├── spofMockData.ts           # Member SPOF data
│   ├── types.ts                  # Team-level type definitions
│   └── utils.ts                  # Team-specific utilities
├── orgDashboard/                 # ✓ Exists - org-level data
│   ├── overviewMockData.ts
│   ├── designMockData.ts
│   ├── skillgraphMockData.ts
│   ├── spofMockData.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── tableUtils.ts
│   └── colors.ts
└── routes.ts                     # ✓ Exists - already handles team routes

__mocks__/sidebar/
├── teams.ts                      # ✓ Exists - team entities
├── people.ts                     # ✓ Exists - member entities
├── organizations.ts              # ✓ Exists
└── repositories.ts               # ✓ Exists

types/
└── sidebar.ts                    # ✓ Exists - Team, Person types defined
```

### Structure Rationale

**Why `lib/teamDashboard/` separate from `lib/orgDashboard/`:**
- **Data Scope:** Team dashboard shows member-level data; org dashboard shows team-level data
- **Type Safety:** Different entity types (Member vs Team) require distinct type definitions
- **Mock Data Independence:** Team mock data generators need member-focused logic
- **Parallel Development:** Allows work on team dashboard without touching org dashboard files

**Why reuse existing components:**
- 27 dashboard components already built with composition in mind
- `BaseTeamsTable.tsx` is generic - can be adapted for `BaseMembersTable`
- `GaugeSection`, `ChartInsights`, `DashboardSection` are context-agnostic
- `SegmentBar` works with any count-based data

**Why existing route structure already supports team dashboard:**
- Route utilities in `lib/routes.ts` already extract `teamId` from paths
- `DashboardTabs` already recognizes `team` dashboard type
- Tab configuration in `components/dashboard/tabs/constants.ts` already defines `TEAM_DASHBOARD_TABS`
- Navigation helpers already build team-scoped hrefs

## Architectural Patterns

### Pattern 1: Nested Dynamic Route Convention

**What:** Next.js App Router uses filesystem-based routing with `[param]` folders for dynamic segments

**When to use:** Multi-tenant dashboards with hierarchical contexts (Org → Team → Member)

**Trade-offs:**
- ✓ **Pro:** Automatic route handling, type-safe params
- ✓ **Pro:** URL structure mirrors data hierarchy
- ✓ **Pro:** Easy to understand and maintain
- ✗ **Con:** Can't share layouts between `/org/[orgId]/page` and `/org/[orgId]/team/[teamId]/page` without custom solution

**Example:**
```typescript
// app/org/[orgId]/team/[teamId]/page.tsx
export default function TeamPage({
  params
}: {
  params: Promise<{ orgId: string; teamId: string }>
}) {
  const { orgId, teamId } = React.use(params)
  // Access both orgId and teamId for context-aware rendering
  return <TeamDashboard orgId={orgId} teamId={teamId} />
}
```

**Current Implementation:**
```typescript
// lib/routes.ts - Already supports nested extraction
export function extractTeamId(pathname: string | null): string | null {
  const match = pathname.match(/^\/org\/[^/]+\/team\/([^/]+)/)
  return match ? match[1] : null
}

export function getTeamPath(orgId: string, teamId: string, tab?: string): string {
  const base = `/org/${orgId}/team/${teamId}`
  return tab ? `${base}/${tab}` : base
}
```

### Pattern 2: Component Adaptation via Props

**What:** Reuse existing dashboard components by passing different data types through consistent interfaces

**When to use:** When team-level and org-level pages show similar visualizations with different entity types

**Trade-offs:**
- ✓ **Pro:** Minimize code duplication
- ✓ **Pro:** Consistent UI across dashboard levels
- ✓ **Pro:** Bug fixes benefit all dashboards
- ✗ **Con:** Need to keep interfaces generic enough for reuse
- ✗ **Con:** May need wrapper components for context-specific behavior

**Example:**
```typescript
// Existing: PerformanceTeamsTable shows teams with performance metrics
// Pattern: Create MemberTable by adapting the same base structure

// components/dashboard/MemberTable.tsx (NEW)
"use client";

import { BaseTeamsTable, type BaseTeamsTableColumn } from "./BaseTeamsTable";
import type { MemberPerformanceRow, MemberTableFilter } from "@/lib/teamDashboard/types";

const MEMBER_COLUMNS: BaseTeamsTableColumn<MemberPerformanceRow, MemberTableFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    render: (_, index) => <span>{index + 1}</span>,
  },
  {
    key: "member",
    header: "Member",
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.avatar} />
        <p>{row.name}</p>
      </div>
    ),
  },
  {
    key: "performance",
    header: "Performance",
    render: (row) => (
      <PerformanceBadge value={row.performanceValue} />
    ),
  },
];

export function MemberTable({ rows }: { rows: MemberPerformanceRow[] }) {
  return (
    <BaseTeamsTable<MemberPerformanceRow, MemberTableFilter>
      rows={rows}
      columns={MEMBER_COLUMNS}
      // ... same props structure as TeamTable
    />
  );
}
```

### Pattern 3: Parallel Mock Data Organization

**What:** Separate mock data by dashboard context to avoid coupling

**When to use:** Building UIs before backend APIs exist

**Trade-offs:**
- ✓ **Pro:** Clear separation of concerns
- ✓ **Pro:** Easy to replace with real API calls later
- ✓ **Pro:** Can generate context-appropriate test data
- ✗ **Con:** Duplication of generator logic across contexts
- ✗ **Con:** Need to maintain consistency between org and team data

**Example:**
```typescript
// lib/teamDashboard/overviewMockData.ts (NEW)
import type { MemberPerformanceRow } from "./types";

const MEMBER_NAMES = [
  "Alice Johnson",
  "Bob Smith",
  "Charlie Davis",
  "Diana Prince",
  "Eve Martinez"
];

export function getMemberPerformanceRows(teamId: string): MemberPerformanceRow[] {
  // Generate member data specific to this team
  return MEMBER_NAMES.map((name, index) => ({
    rank: index + 1,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    performanceValue: Math.floor(Math.random() * 100),
    // ... team-specific member metrics
  }));
}

// Parallel to:
// lib/orgDashboard/overviewMockData.ts (EXISTS)
export function getTeamPerformanceRowsForGauge(gaugeValue: number): TeamPerformanceRow[] {
  // Generate team data for organization
}
```

### Pattern 4: Context-Aware Tab Navigation

**What:** Tab component reads URL to determine context (org/team/user/repo) and renders appropriate tabs

**When to use:** Multi-level dashboards with shared navigation UI

**Trade-offs:**
- ✓ **Pro:** Single navigation component for all contexts
- ✓ **Pro:** Automatic URL-based state management
- ✓ **Pro:** Deep linking works automatically
- ✗ **Con:** Complex pathname parsing logic
- ✗ **Con:** Need comprehensive routing utilities

**Example:**
```typescript
// components/dashboard/layout/helpers/dashboardTabHelpers.ts (EXISTS)
// Already handles team context:

export const resolveActiveTab = (pathname: string | null, basePath: string): ProfileTabKey => {
  // Handles: /org/[orgId]/team/[teamId]/[tab]
  const teamMatch = pathname.match(/^\/org\/[^/]+\/team\/[^/]+(?:\/([^/]+))?/)
  if (teamMatch) return (teamMatch[1] as ProfileTabKey) || "overview"

  // ... handles user, repo, org contexts
}

export const buildTabConfigs = (tabs, basePath, activeTab, pathname): TabConfig[] => {
  const teamId = extractTeamId(pathname)

  if (dashboardType === "team" && teamId) {
    href = tab.key === "overview"
      ? `/org/${orgId}/team/${teamId}`
      : `/org/${orgId}/team/${teamId}/${tab.key}`
  }
  // ... builds hrefs for all contexts
}
```

### Pattern 5: "Use Client" Boundary Optimization

**What:** Place "use client" directive only where client-side state or interactivity is needed

**When to use:** All pages in this app (data visualization requires client-side state)

**Trade-offs:**
- ✓ **Pro:** Access to React hooks (useState, useCallback, useMemo)
- ✓ **Pro:** Can use client libraries (d3, framer-motion, recharts)
- ✓ **Pro:** Simpler mental model for dashboard pages
- ✗ **Con:** No Server Component benefits (streaming, data fetching)
- ✗ **Con:** Bundle sent to client includes React runtime

**Example:**
```typescript
// app/org/[orgId]/team/[teamId]/page.tsx (RECOMMENDED PATTERN)
"use client";

import { useMemo, useState } from "react";
import { getMemberPerformanceRows } from "@/lib/teamDashboard/overviewMockData";
import { MemberTable } from "@/components/dashboard/MemberTable";

export default function TeamOverviewPage({
  params
}: {
  params: Promise<{ orgId: string; teamId: string }>
}) {
  const { orgId, teamId } = React.use(params)
  const [gaugeValue] = useState(() => Math.floor(Math.random() * 101));

  const memberRows = useMemo(
    () => getMemberPerformanceRows(teamId),
    [teamId]
  );

  return (
    <div className="flex flex-col gap-8 px-6 pb-8">
      <h2>Team Overview</h2>
      <MemberTable rows={memberRows} />
    </div>
  );
}
```

**Why this pattern:** All existing org dashboard pages use "use client" for consistent architecture. Team dashboard follows same pattern for consistency.

## Data Flow

### Request Flow

```
User clicks team in sidebar
    ↓
Next.js Router navigates to /org/gitroll/team/frontend
    ↓
app/org/[orgId]/team/[teamId]/page.tsx renders
    ↓
Component extracts params: { orgId: "gitroll", teamId: "frontend" }
    ↓
Mock data generators called: getMemberPerformanceRows("frontend")
    ↓
Dashboard components receive member data as props
    ↓
Client-side state manages filters, visibility toggles
    ↓
Components render with "use client" interactivity
```

### State Management

```
[Page Component State]
    ↓ (useState, useMemo)
[Local Component State] ←→ [User Actions] → [State Updates] → [Re-render]
    ↓ (props)
[Child Dashboard Components]
```

**No global state:** Each dashboard page is self-contained with local state

**URL as state:** Navigation state lives in URL (orgId, teamId, tab)

**Props drilling:** State passed down component tree (acceptable for dashboard complexity)

### Key Data Flows

1. **Navigation Context Flow:**
   - URL pathname → `lib/routes.ts` extractors → IDs (orgId, teamId)
   - IDs → Mock data generators → Entity-specific data
   - Data → Dashboard components → Rendered UI

2. **Tab Navigation Flow:**
   - User clicks tab → Next.js Link → URL changes → Tab helpers detect active → Visual update

3. **Filter/Toggle Flow:**
   - User interacts → Component state updates → Filter applied → Re-render with filtered data

4. **Sidebar Selection Flow:**
   - User selects team → `getTeamPath(orgId, teamId)` → Navigate → Team dashboard renders

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **5-10 teams, 50-100 members** | Current mock data approach works. File-based routing handles complexity. No optimization needed. |
| **50+ teams, 500+ members** | Consider pagination for member tables. May need skeleton loading states. Mock data generators stay, but add pagination logic. |
| **Real API integration** | Replace `lib/teamDashboard/*MockData.ts` with API calls. Add `loading.tsx` files in route folders. Consider React Server Components for data fetching. |

### Scaling Priorities

1. **First bottleneck: Large member lists in tables**
   - **Solution:** Add pagination to `MemberTable` (similar to `BaseTeamsTable` filter pattern)
   - **When:** >100 members per team

2. **Second bottleneck: Mock data generation on every render**
   - **Solution:** Already optimized with `useMemo` in existing pages. Follow same pattern for team pages.
   - **When:** Performance profiling shows data generation cost

3. **Third bottleneck: Bundle size from dashboard components**
   - **Solution:** Dynamic imports for less-used pages
   - **When:** Lighthouse performance score drops below 90

## Anti-Patterns

### Anti-Pattern 1: Duplicating Dashboard Components

**What people do:** Create `TeamPerformanceTable.tsx` as a copy of `PerformanceTeamsTable.tsx` with different props

**Why it's wrong:**
- Code duplication makes bug fixes twice as hard
- Inconsistent UI between org and team dashboards
- Loses benefits of component library approach

**Do this instead:**
- Use `BaseTeamsTable` as foundation for both
- Create `MemberTable` that adapts the base table with member-specific columns
- Share visualization components (`GaugeSection`, `ChartInsights`, etc.) directly

### Anti-Pattern 2: Flat Mock Data Files

**What people do:** Create `lib/mockData.ts` with all mock data for org AND team dashboards

**Why it's wrong:**
- Coupling between unrelated dashboard contexts
- Hard to understand which data belongs to which context
- Mock data file grows too large
- Makes API migration harder (replace one file vs. targeted replacement)

**Do this instead:**
- Separate by context: `lib/orgDashboard/` and `lib/teamDashboard/`
- Each context has its own types, mock data, and utilities
- Clear boundaries make codebase easier to navigate

### Anti-Pattern 3: Server Components with Client Libraries

**What people do:** Try to use d3, recharts, or framer-motion in Server Components

**Why it's wrong:**
- These libraries require browser APIs (window, document)
- Error: "document is not defined"
- Adds complexity trying to split server/client rendering

**Do this instead:**
- Use "use client" directive at page level for dashboard pages
- Keep it simple: all dashboard pages are Client Components
- Follows existing pattern in codebase (verified in all org pages)

### Anti-Pattern 4: Hardcoded Team/Org IDs in Components

**What people do:** Components directly read params or use hardcoded IDs

**Why it's wrong:**
- Components become non-reusable
- Can't use component in different contexts
- Makes testing harder

**Do this instead:**
- Page components extract params and pass as props
- Dashboard components receive data, not IDs
- Keep components pure and context-agnostic

```typescript
// ❌ Bad: Component reads params
export function MemberTable() {
  const params = useParams() // Component now coupled to routing
  const teamId = params.teamId
  // ...
}

// ✅ Good: Component receives data
export function MemberTable({ rows }: { rows: MemberPerformanceRow[] }) {
  // No routing coupling, reusable anywhere
}
```

### Anti-Pattern 5: Creating Parallel Route Files

**What people do:** Try to use `@team` or `(team)` route groups for team dashboard

**Why it's wrong:**
- Adds unnecessary complexity
- Parallel routes are for simultaneous rendering (modals, split views)
- Team dashboard is a sequential navigation, not parallel
- Makes routing harder to understand

**Do this instead:**
- Use standard nested dynamic routes: `app/org/[orgId]/team/[teamId]/page.tsx`
- Follows Next.js conventions
- Matches existing pattern for user and repo dashboards

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Mock Data (Current)** | Pure functions in `lib/` return typed data | No network calls, deterministic for development |
| **API (Future)** | Replace mock functions with `fetch` or API client | Keep same function signatures for easy migration |
| **Sidebar Data** | Read from `__mocks__/sidebar/` files | Teams, members, repos already defined |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Page ↔ Dashboard Components** | Props (one-way data flow) | Page holds state, components render |
| **Sidebar ↔ Main Content** | URL navigation via `lib/routes.ts` | Sidebar triggers navigation, page reads params |
| **Tab Navigation ↔ Page** | URL-based (Next.js Link) | Tabs build hrefs, router handles navigation |
| **Org Dashboard ↔ Team Dashboard** | Independent, no direct communication | Each reads its own mock data, shares components |
| **Mock Data ↔ Page** | Import functions, call with IDs | `getMemberPerformanceRows(teamId)` |

## Build Order & Dependencies

### Phase 1: Foundation (No dependencies)
1. **Create `lib/teamDashboard/types.ts`**
   - Define `MemberPerformanceRow`, `MemberTableFilter`, etc.
   - Mirror structure of `lib/orgDashboard/types.ts`
   - Status: NEW

2. **Create `lib/teamDashboard/utils.ts`**
   - Copy gauge label functions from `lib/orgDashboard/utils.ts`
   - Or import directly if reusable
   - Status: NEW

### Phase 2: Mock Data (Depends: Phase 1)
3. **Create `lib/teamDashboard/overviewMockData.ts`**
   - Generate member performance data
   - Use types from Phase 1
   - Status: NEW

4. **Create remaining mock data files**
   - `performanceMockData.ts`, `designMockData.ts`, `skillgraphMockData.ts`, `spofMockData.ts`
   - Each follows pattern from corresponding org file
   - Status: NEW

### Phase 3: Member Components (Depends: Phase 1, Phase 2)
5. **Create `components/dashboard/MemberTable.tsx`**
   - Adapt `BaseTeamsTable` for members
   - Use `MemberPerformanceRow` type
   - Status: NEW

6. **Adapt other components as needed**
   - Most components (GaugeSection, ChartInsights, etc.) work as-is
   - Create member-specific variants only if needed
   - Status: REUSE EXISTING

### Phase 4: Page Components (Depends: Phase 2, Phase 3)
7. **Implement `app/org/[orgId]/team/[teamId]/page.tsx`**
   - Replace stub with real implementation
   - Mirror structure of `app/org/[orgId]/page.tsx`
   - Status: UPDATE EXISTING

8. **Create team dashboard sub-pages**
   - `performance/page.tsx`, `design/page.tsx`, `skillgraph/page.tsx`, `spof/page.tsx`
   - Each mirrors corresponding org page
   - Status: NEW

### Dependency Graph
```
types.ts → utils.ts
   ↓         ↓
   └─→ mockData.ts
         ↓
    MemberTable.tsx
         ↓
      page.tsx files
```

### Estimated Complexity
- **Phase 1:** 1-2 hours (straightforward type definitions)
- **Phase 2:** 2-4 hours (mock data generation logic)
- **Phase 3:** 2-3 hours (component adaptation)
- **Phase 4:** 4-6 hours (page implementation and testing)

**Total: 9-15 hours** for complete team dashboard integration

## Verification Checklist

Before considering team dashboard complete:

- [ ] All 5 team dashboard pages render without errors
- [ ] Navigation from sidebar to team pages works
- [ ] Tab navigation between team pages works
- [ ] URL structure matches: `/org/[orgId]/team/[teamId]/[tab]`
- [ ] DashboardHero shows correct team name and avatar
- [ ] Mock data generators return member-level data
- [ ] Components are reused from existing dashboard library
- [ ] No code duplication between org and team dashboards
- [ ] All pages follow "use client" pattern consistently
- [ ] TypeScript compiles without errors

## Sources

**Next.js App Router Documentation:**
- [Dynamic Route Segments | Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)
- [Routing: Dynamic Routes | Next.js](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes)
- [Building Your Application: Routing | Next.js](https://nextjs.org/docs/app/building-your-application/routing)

**2026 Best Practices:**
- [Next.js Dynamic Route Segments in the App Router (2026 Guide) – TheLinuxCode](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/)
- [Next.js 16 | Next.js Blog](https://nextjs.org/blog/next-16)
- [Next.js (App Router) — Advanced Patterns for 2026 | Medium](https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7)

**Component Patterns:**
- [Parallel Routes | Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes)
- [The New Architecture of React: Reusability and UX in Next.js Era](https://www.bitcot.com/new-architecture-of-react/)

**Project Files Analyzed (HIGH confidence):**
- Verified: `app/org/[orgId]/team/[teamId]/page.tsx` exists as stub
- Verified: 37 dashboard components in `components/dashboard/`
- Verified: Route utilities in `lib/routes.ts` already handle team paths
- Verified: Tab configuration in `components/dashboard/tabs/constants.ts` defines team tabs
- Verified: All org dashboard pages use "use client" pattern
- Verified: Mock data organized in `lib/orgDashboard/` and `__mocks__/sidebar/`
- Verified: Next.js 16.1.6 in `package.json`

---
*Architecture research for: Team Dashboard Integration into Next.js App Router*
*Researched: 2026-02-06*
*Confidence: HIGH (verified against existing codebase)*
