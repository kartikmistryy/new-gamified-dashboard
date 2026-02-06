# Phase 1: Foundation & Type System - Research

**Researched:** 2026-02-06
**Domain:** TypeScript type system design, Next.js routing, mock data generation
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational type system, mock data generators, and routing infrastructure for member-level analytics. The existing codebase already has strong patterns: TypeScript 5.x with strict mode enabled, Next.js 16 App Router with nested dynamic routes, and deterministic mock data generators producing aggregatable team metrics.

The research confirms that discriminated unions are the standard TypeScript pattern for type safety, Next.js 16 supports nested dynamic routes (`/org/[orgId]/team/[teamId]`) natively, and member mock generators should follow the same mathematical aggregation patterns already proven in the org dashboard (5 teams with offsets ensuring gauges match).

**Primary recommendation:** Create member types as parallel structures to existing team types using TypeScript discriminated unions with a `level: "team" | "member"` discriminant field, generate member mock data using similar interpolation/distribution logic to `overviewMockData.ts`, and extend the existing tab navigation system to handle team-level routes.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Mock Data Strategy:**
- **Aggregation strictness:** Approximate (member metrics roughly add up to team within 5-10%)
- **Variance pattern:** Realistic distribution (star performers at 2-5x median, long tail matches real engineering teams)
- **Time series scope:** Partial history (last 30-90 days) — enough to test trends without full dataset
- **Default team size:** Small team (5-8 members) — easier to verify, all visible without scrolling

**Routing & Navigation:**
- **URL structure:** `/org/:orgId/team/:teamId` — matches existing org dashboard pattern for consistency
- **Navigation method:** Click team in sidebar — always visible team selector
- **Breadcrumbs:** Full breadcrumb (Org Name > Team Name) showing hierarchy with click-to-navigate
- **Tab structure:** Identical 5 tabs as org dashboard (Overview, Performance, Design, Skills Graph, SPOF) — familiar and consistent

### Claude's Discretion

**Type System Design:**
- Shared vs separate base interfaces
- Type safety mechanism (discriminated unions vs branded types)
- Metric category definition (union type vs enum vs const)
- Runtime validation approach (Zod vs TypeScript-only vs type guards)

**Implementation Details:**
- Specific mock data generation algorithms
- Member table column implementation details (covered by success criteria)
- Tab navigation component implementation

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

## Standard Stack

The established libraries and patterns for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.x (tsconfig: strict mode) | Type safety, domain modeling | Team already using strict mode with discriminated unions in existing types |
| Next.js App Router | 16.1.6 | Routing with dynamic segments | Built-in support for nested params (`[orgId]/[teamId]`), already used for org routes |
| React | 19.2.3 | Component framework | Existing dashboard built on React 19 with "use client" boundaries |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | Mock data generation | Pure TypeScript functions (existing pattern in `lib/orgDashboard/*MockData.ts`) |
| None required | - | Runtime validation | TypeScript-only for trusted internal data (existing pattern - no Zod in codebase) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Discriminated unions | Branded types | Branded types add nominal typing but discriminated unions provide better exhaustiveness checking and are already used in codebase |
| TypeScript-only validation | Zod schemas | Zod adds runtime safety but adds dependency; project currently has no Zod, all data is trusted/internal mocks |
| Separate type files | Shared base interfaces | Shared interfaces reduce duplication but discriminated unions on parallel types provide better type narrowing |

**Installation:**
```bash
# No new dependencies required - using existing stack
```

---

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── orgDashboard/           # Existing team-level logic
│   ├── types.ts            # Team types (TeamPerformanceRow, etc.)
│   ├── overviewMockData.ts # Team mock generators
│   └── ...
├── teamDashboard/          # NEW: Member-level logic
│   ├── types.ts            # Member types (MemberPerformanceRow, etc.)
│   ├── overviewMockData.ts # Member mock generators
│   └── ...
app/
├── org/
│   └── [orgId]/
│       ├── page.tsx        # Org overview (existing)
│       ├── performance/    # Org tabs (existing)
│       └── team/
│           └── [teamId]/
│               ├── page.tsx              # NEW: Team overview (member table)
│               ├── performance/          # NEW: Member performance tab
│               │   └── page.tsx
│               ├── design/               # NEW: Member design tab
│               │   └── page.tsx
│               ├── skillgraph/           # NEW: Member skills tab
│               │   └── page.tsx
│               └── spof/                 # NEW: Member SPOF tab
│                   └── page.tsx
components/
└── dashboard/
    ├── BaseTeamsTable.tsx  # Existing - adapt for members
    ├── MemberTable.tsx     # NEW: Wraps BaseTeamsTable with member columns
    └── ...
```

### Pattern 1: Discriminated Unions for Team vs Member Types
**What:** Use a `level` discriminant field to distinguish team-level and member-level data at compile time
**When to use:** Prevents accidentally passing member data to team components and vice versa
**Example:**
```typescript
// Source: Existing pattern in lib/orgDashboard/types.ts + TypeScript best practices
// https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html

// Base shared fields
type BasePerformanceRow = {
  rank: number;
  performanceLabel: string;
  performanceValue: number;
  trend: "up" | "down" | "flat";
  performanceBarColor: string;
  typeDistribution: {
    star: number;
    timeBomb: number;
    keyRole: number;
    bottleneck: number;
    risky: number;
    legacy: number;
  };
};

// Team-level type
export type TeamPerformanceRow = BasePerformanceRow & {
  level: "team";  // Discriminant
  teamName: string;
  teamColor: string;
  changePts?: number;
};

// Member-level type
export type MemberPerformanceRow = BasePerformanceRow & {
  level: "member";  // Discriminant
  memberName: string;
  memberAvatar?: string;
  teamId: string;  // Member belongs to a team
  changePts?: number;
};

// TypeScript narrows correctly:
function processRow(row: TeamPerformanceRow | MemberPerformanceRow) {
  if (row.level === "team") {
    console.log(row.teamName);  // OK - TypeScript knows it's TeamPerformanceRow
  } else {
    console.log(row.memberName);  // OK - TypeScript knows it's MemberPerformanceRow
  }
}
```

### Pattern 2: Mock Data Aggregation (Ensures Parent = Sum of Children)
**What:** Member metrics should aggregate approximately to team totals (within 5-10%)
**When to use:** When generating mock data for hierarchical analytics
**Example:**
```typescript
// Source: Existing pattern in lib/orgDashboard/overviewMockData.ts
// Adapted for member-level generation

// Existing team generator (offset pattern ensures average equals gauge)
const TEAM_VALUE_OFFSETS = [-41, -13, 0, 13, 43]; // Sum = 2, average ≈ gauge
const teamPerformance = TEAM_VALUE_OFFSETS.map((off) => gauge + off);

// NEW: Member generator (distribute team total across members)
function getMemberPerformanceRowsForTeam(
  teamRow: TeamPerformanceRow,
  memberCount: number = 6
): MemberPerformanceRow[] {
  const teamTotal = teamRow.performanceValue;

  // Create skewed distribution (star performers 2-5x median, long tail)
  // Use similar interpolation logic from team generators
  const offsets = createSkewedOffsets(memberCount, teamTotal);

  return offsets.map((value, index) => ({
    level: "member",
    rank: index + 1,
    memberName: MEMBER_NAMES[index],
    teamId: teamRow.teamName,
    performanceValue: Math.max(0, Math.min(100, value)),
    performanceLabel: getPerformanceGaugeLabel(value),
    performanceBarColor: getPerformanceBarColor(value),
    trend: getTrendForMember(value),
    typeDistribution: getTypeDistributionForPerformance(value),
  }));
}

// Offsets that sum to teamTotal with realistic variance
function createSkewedOffsets(count: number, total: number): number[] {
  const median = total / count;
  // Star performers: 2-5x median, long tail: 0.5-1x median
  // Actual distribution algorithm TBD (planner decides)
}
```

### Pattern 3: Component Adaptation via Generic Props
**What:** Reuse BaseTeamsTable for members by changing row type and columns
**When to use:** Adapting existing generic components to new data types
**Example:**
```typescript
// Source: Existing components/dashboard/BaseTeamsTable.tsx

// BaseTeamsTable is already generic:
export function BaseTeamsTable<T, F extends string>({
  rows,
  columns,
  sortFunction,
  // ...
}: BaseTeamsTableProps<T, F>) { /* ... */ }

// NEW: MemberTable wraps it with member-specific columns
export function MemberTable({
  rows,
  activeFilter,
  onFilterChange,
}: MemberTableProps) {
  return (
    <BaseTeamsTable<MemberPerformanceRow, MemberTableFilter>
      rows={rows}
      columns={MEMBER_COLUMNS}  // NEW: Member-specific columns
      sortFunction={memberSortFunction}  // NEW: Member-specific sorting
      getRowKey={(row) => row.memberName}
      // ... other props
    />
  );
}

// NEW: Member-specific columns
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
        <Avatar src={row.memberAvatar} />
        <p>{row.memberName}</p>
      </div>
    ),
  },
  // ... performance, status columns (same logic as team table)
];
```

### Pattern 4: Next.js Dynamic Route Params (Nested)
**What:** Access both orgId and teamId from nested dynamic segments
**When to use:** Building team dashboard pages that need org and team context
**Example:**
```typescript
// Source: Next.js 16 App Router documentation
// https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes

// app/org/[orgId]/team/[teamId]/page.tsx
export default async function TeamDashboardPage(props: {
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  const params = await props.params;
  const { orgId, teamId } = params;

  // Fetch/generate member data for this team
  const members = getMemberPerformanceRowsForTeam(teamId);

  return <TeamOverviewTab members={members} />;
}

// Next.js automatically provides both params from URL:
// /org/acme-inc/team/frontend-dev
// → { orgId: "acme-inc", teamId: "frontend-dev" }
```

### Anti-Patterns to Avoid
- **Don't create separate BaseTable for members:** BaseTeamsTable is already generic; reuse it with MemberPerformanceRow type
- **Don't hardcode member count:** Make it configurable per team (default 5-8, but some teams may have more/less)
- **Don't use string concatenation for nested routes:** Use template literals or path.join to avoid `/org//team` bugs
- **Don't skip type discriminants:** Always include `level: "team" | "member"` to prevent accidental misuse

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dynamic route params extraction | Custom URL parsing with regex/split | Next.js `params` prop | Next.js automatically parses `[orgId]` and `[teamId]` segments; robust error handling built-in |
| Generic table component | New MemberBaseTable from scratch | Existing BaseTeamsTable<T, F> | Already handles sorting, filtering, column rendering; just change type parameter |
| Distribution interpolation | Linear distribution of members | Existing lerp + TYPE_DIST_REF pattern | `overviewMockData.ts` already has proven interpolation for realistic distributions |
| Performance color calculation | New color logic | Existing getPerformanceBarColor() | Consistent color thresholds already defined in `tableUtils.ts` |
| Tab navigation | Custom tab state management | Existing DashboardTabs component | Already handles active tab detection, URL-based routing, animated indicator |

**Key insight:** The codebase already has sophisticated patterns for deterministic mock data generation (lerp-based interpolation, reference distributions, offset patterns) and generic table components. Reusing these patterns ensures consistency and avoids subtle bugs in aggregation math.

---

## Common Pitfalls

### Pitfall 1: Member Metrics Don't Aggregate to Team Totals
**What goes wrong:** Member performance values average to 65 but team gauge shows 52
**Why it happens:** Generating member values independently without constraining sum/average
**How to avoid:** Follow the existing offset pattern from `overviewMockData.ts` - calculate team total first, then distribute across members with constrained offsets
**Warning signs:** Team gauge and member table averages differ by >10%; metric cards show more stars than team distribution claims

### Pitfall 2: Type Confusion Between Team and Member Data
**What goes wrong:** Passing MemberPerformanceRow to TeamTable component causes runtime errors or incorrect rendering
**Why it happens:** Both types have similar shapes but different field names (teamName vs memberName)
**How to avoid:** Use discriminated unions with `level: "team" | "member"` discriminant; TypeScript will catch mismatches at compile time
**Warning signs:** TypeScript errors about missing properties; components rendering undefined values

### Pitfall 3: Hardcoding Team Size in Mock Generators
**What goes wrong:** All teams have exactly 6 members; can't test edge cases (2-person team, 15-person team)
**Why it happens:** Using fixed array like `MEMBER_NAMES` with hardcoded length
**How to avoid:** Make member count a parameter (default 5-8 from locked decision, but configurable per team for testing)
**Warning signs:** Mock data looks unrealistically uniform; can't test scrolling behavior with larger teams

### Pitfall 4: Breaking BaseTeamsTable Generic Constraints
**What goes wrong:** Type errors when passing MemberPerformanceRow to BaseTeamsTable
**Why it happens:** Column render functions expect specific fields that don't exist on member type
**How to avoid:** Define MemberPerformanceRow with all fields needed by column renderers; keep type structure parallel to TeamPerformanceRow
**Warning signs:** TypeScript errors in column render functions; table renders empty cells

### Pitfall 5: Incorrect Tab Navigation Base Path
**What goes wrong:** Clicking "Performance" tab navigates to `/org/acme/performance` instead of `/org/acme/team/frontend/performance`
**Why it happens:** DashboardTabs uses `DASHBOARD_BASE_PATHS` which doesn't include team-level paths yet
**How to avoid:** Extend `DASHBOARD_BASE_PATHS` in `components/dashboard/tabs/constants.ts` to detect team-level routes and use correct base path
**Warning signs:** Tab navigation loses team context; 404 errors on tab clicks

---

## Code Examples

Verified patterns from existing codebase:

### Accessing Dynamic Route Params (Nested)
```typescript
// Source: Next.js 16 App Router
// app/org/[orgId]/team/[teamId]/page.tsx

export default async function TeamOverviewPage(props: {
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  // Next.js 16 requires awaiting params
  const params = await props.params;
  const { orgId, teamId } = params;

  // Use params to fetch/generate member data
  const teamData = getTeamData(orgId, teamId);
  const memberRows = getMemberPerformanceRowsForTeam(teamData);

  return (
    <div>
      <h1>Team: {teamId}</h1>
      <MemberTable rows={memberRows} />
    </div>
  );
}
```

### Discriminated Union Type Definitions
```typescript
// Source: TypeScript Handbook + existing lib/orgDashboard/types.ts pattern

// lib/teamDashboard/types.ts
export type MemberPerformanceRow = {
  level: "member";  // Discriminant for type safety
  rank: number;
  memberName: string;
  memberAvatar?: string;
  teamId: string;
  performanceLabel: string;
  performanceValue: number;
  trend: "up" | "down" | "flat";
  performanceBarColor: string;
  changePts?: number;
  typeDistribution: {
    star: number;
    timeBomb: number;
    keyRole: number;
    bottleneck: number;
    risky: number;
    legacy: number;
  };
};

export type MemberTableFilter =
  | "mostProductive"
  | "leastProductive"
  | "mostOptimal"
  | "mostRisky";
```

### Mock Data Generator with Aggregation Constraint
```typescript
// Source: Existing lib/orgDashboard/overviewMockData.ts pattern
// lib/teamDashboard/overviewMockData.ts

const MEMBER_NAMES = [
  "Alice Chen",
  "Bob Smith",
  "Carol Johnson",
  "David Lee",
  "Eve Martinez",
  "Frank Wilson",
] as const;

// Generate members whose average approximately equals teamPerformanceValue
export function getMemberPerformanceRowsForTeam(
  teamRow: TeamPerformanceRow,
  memberCount: number = 6
): MemberPerformanceRow[] {
  const teamValue = teamRow.performanceValue;

  // Create offsets that center around teamValue (similar to TEAM_VALUE_OFFSETS)
  // For 6 members: [-20, -10, -5, 5, 10, 20] → sum = 0, average = teamValue
  const offsets = createMemberOffsets(memberCount);

  return offsets.map((offset, index) => {
    const performanceValue = Math.max(0, Math.min(100, teamValue + offset));
    return {
      level: "member",
      rank: index + 1,
      memberName: MEMBER_NAMES[index] || `Member ${index + 1}`,
      teamId: teamRow.teamName,
      performanceValue,
      performanceLabel: getPerformanceGaugeLabel(performanceValue),
      performanceBarColor: getPerformanceBarColor(performanceValue),
      trend: getTrend(performanceValue),
      typeDistribution: getTypeDistributionForPerformance(performanceValue),
    };
  });
}

// Create skewed offsets (star performers 2x, long tail) that sum to 0
function createMemberOffsets(count: number): number[] {
  // Algorithm TBD by planner - ensure realistic variance
  // Key: offsets sum to 0 so average stays at teamValue
}
```

### Adapting Generic Table Component
```typescript
// Source: Existing components/dashboard/BaseTeamsTable.tsx usage
// components/dashboard/MemberTable.tsx

import { BaseTeamsTable, type BaseTeamsTableColumn } from "./BaseTeamsTable";
import type { MemberPerformanceRow, MemberTableFilter } from "@/lib/teamDashboard/types";

const MEMBER_COLUMNS: BaseTeamsTableColumn<MemberPerformanceRow, MemberTableFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
    render: (_, index) => (
      <span className={index < 3 ? "font-bold" : "text-gray-500"}>
        {index + 1}
      </span>
    ),
  },
  {
    key: "member",
    header: "Member",
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.memberAvatar} />
        <p className="font-medium">{row.memberName}</p>
      </div>
    ),
  },
  // ... additional columns (performance, status, etc.)
];

function memberSortFunction(
  rows: MemberPerformanceRow[],
  filter: MemberTableFilter
): MemberPerformanceRow[] {
  const copy = [...rows];
  if (filter === "mostProductive") return copy.sort((a, b) => b.performanceValue - a.performanceValue);
  if (filter === "leastProductive") return copy.sort((a, b) => a.performanceValue - b.performanceValue);
  // ... other filters
  return copy;
}

export function MemberTable({ rows }: { rows: MemberPerformanceRow[] }) {
  return (
    <BaseTeamsTable<MemberPerformanceRow, MemberTableFilter>
      rows={rows}
      columns={MEMBER_COLUMNS}
      sortFunction={memberSortFunction}
      filterTabs={[
        { key: "mostProductive", label: "Most Productive" },
        { key: "leastProductive", label: "Least Productive" },
        { key: "mostOptimal", label: "Most Optimal" },
        { key: "mostRisky", label: "Most Risky" },
      ]}
      defaultFilter="mostProductive"
      getRowKey={(row) => row.memberName}
    />
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Shared types for team/member | Discriminated unions with level discriminant | TypeScript 2.0+ (2016) | Type safety improved; compiler catches team/member mismatches |
| Manual type guards | Discriminated unions with exhaustiveness checking | TypeScript 2.0+ | Less boilerplate; switch statements force handling all cases |
| Props drilling for params | Server Component async params prop | Next.js 13+ App Router (2023) | Cleaner param access; better TypeScript inference |
| String-based tab routing | URL-based tab state with DashboardTabs | Current codebase pattern | Shareable URLs; browser back/forward works correctly |
| Independent mock generators | Aggregate-constrained generators (offset pattern) | Current codebase (`overviewMockData.ts`) | Mathematical consistency; team totals match member sums |

**Deprecated/outdated:**
- `getServerSideProps` / `getStaticProps`: Replaced by Server Components in App Router
- `useRouter().query`: Replaced by `params` prop in App Router page components
- Context API for route params: Not needed with Server Components receiving params directly

---

## Open Questions

Things that couldn't be fully resolved:

1. **Tab navigation base path detection**
   - What we know: `DashboardTabs` uses `DASHBOARD_BASE_PATHS` to build tab URLs; team routes need `/org/:orgId/team/:teamId` prefix
   - What's unclear: Whether `detectDashboardType()` helper can distinguish team routes from org routes (both start with `/org/`)
   - Recommendation: Examine `components/dashboard/layout/helpers/dashboardTabHelpers.ts` to understand detection logic; may need to add team-specific detection

2. **Member distribution algorithm specifics**
   - What we know: User wants realistic variance (star performers 2-5x median, long tail)
   - What's unclear: Exact algorithm for creating skewed offsets that sum to 0 (for aggregation constraint)
   - Recommendation: Use exponential distribution (similar to `spofMockData.ts` SPOF score generation) or power law distribution; planner decides specific lambda parameter

3. **Member avatar source**
   - What we know: TeamAvatar component exists for team colors; member rows have optional memberAvatar field
   - What's unclear: Whether to generate avatar URLs or use initials/placeholders
   - Recommendation: Use placeholder initials (first letter of name) for Phase 1; real avatars can be added later if needed

---

## Sources

### Primary (HIGH confidence)
- Next.js App Router Dynamic Routes: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
- TypeScript Discriminated Unions: https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html
- TypeScript Narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- Existing codebase patterns: `lib/orgDashboard/types.ts`, `lib/orgDashboard/overviewMockData.ts`, `components/dashboard/BaseTeamsTable.tsx`

### Secondary (MEDIUM confidence)
- [Discriminated Unions | TypeScript Deep Dive](https://basarat.gitbook.io/typescript/type-system/discriminated-unions)
- [Mastering Discriminated Unions in TypeScript](https://antondevtips.com/blog/mastering-discriminated-unions-in-typescript)
- [Next.js Dynamic Route Segments Guide](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/)
- [TypeScript vs Zod: When to Use Each](https://blog.logrocket.com/when-use-zod-typescript-both-developers-guide/)
- [Domain Modeling in TypeScript](https://medium.com/@matt.denobrega/domain-modeling-in-typescript-a53cb76a7226)

### Tertiary (LOW confidence)
- [Power Law Distributions](https://en.wikipedia.org/wiki/Power_law) - for realistic variance patterns in member performance
- [TypeScript Best Practices 2026](https://johal.in/typescript-best-practices-for-large-scale-web-applications-in-2026/) - general guidance
- WebSearch results on mock data generation strategies (no specific tool recommendations found for this use case)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing dependencies clearly documented in package.json, tsconfig confirms strict TypeScript
- Architecture: HIGH - Existing patterns proven in codebase (BaseTeamsTable generic, overviewMockData aggregation, App Router routes)
- Pitfalls: HIGH - Derived from existing code structure and TypeScript best practices
- Mock data algorithms: MEDIUM - Conceptual approach clear (offset patterns, skewed distributions) but specific parameters TBD by planner

**Research date:** 2026-02-06
**Valid until:** 30 days (stable stack - TypeScript 5.x, Next.js 16, React 19 unlikely to change patterns)
