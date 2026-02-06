# Phase 4: Remaining Tabs - Research

**Researched:** 2026-02-06
**Domain:** React component reuse, D3.js charts, Next.js App Router dashboard patterns
**Confidence:** HIGH

## Summary

Phase 4 completes the 5-tab team dashboard structure by implementing Design, Skills Graph, and SPOF tabs. The primary research finding is that this phase requires **component adaptation, not component creation**. All required chart components already exist in the org dashboard and accept data via props. The core technical challenge is adapting these components to consume member-level data instead of team-level data, which requires understanding prop interfaces and data transformation patterns.

The established pattern from Phase 3 (Performance tab) provides a proven blueprint: each tab uses `BaseTeamsTable` with custom column definitions, tab-specific filter logic, and adapts existing chart components via prop transformation. The codebase uses TypeScript discriminated unions to maintain type safety between member and team data, preventing accidental data misuse.

**Primary recommendation:** Follow the Performance tab pattern exactly—reuse org dashboard charts unchanged, transform member data to match chart prop interfaces, use BaseTeamsTable for all member lists, and implement tab-specific filters that make semantic sense for each domain.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Chart types & data visualization:**
- **Skills Graph tab:** Reuse the same SkillGraph component that org dashboard uses - no need to create new sunburst/treemap components
- **Design tab charts:** Reuse org dashboard Design tab charts (ownership health and chaos index) - feed member data instead of team data
- **SPOF tab charts:** Reuse org dashboard SPOF tab charts (SPOF distribution and repository health) - no custom visualizations needed

**Component reuse strategy:**
- **Member tables:** Use BaseTeamsTable pattern (like Performance tab) with tab-specific column configurations - not MemberTable component
- **Page layouts:** Each tab mirrors its org dashboard counterpart's layout exactly - Design tab layout matches org Design, Skills matches org Skills, SPOF matches org SPOF
- **Filter tabs:** Tab-specific filters that make sense for each tab's data (Design: health levels, Skills: domain counts, SPOF: risk levels) - not the same 6-filter pattern across all tabs

### Claude's Discretion

- Specific filter tab labels and criteria for each tab
- Column definitions for each tab's BaseTeamsTable
- Mock data generation patterns for design metrics, skills, and SPOF data
- How to adapt org dashboard components to consume member-level data
- ChartInsights content for each tab

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope.

</user_constraints>

## Standard Stack

The established libraries/tools for this implementation:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router framework | Project foundation, file-based routing for dashboard tabs |
| React | 19.2.3 | UI library | Component composition and reuse patterns |
| TypeScript | 5.x | Type system | Discriminated unions prevent member/team data mixing |
| d3 | ^7.9.0 | Chart rendering | All existing charts (OwnershipScatter, ChaosMatrix, SpofDistributionChart, SkillGraph) use d3 |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-tooltip | ^1.2.8 | Tooltip provider | Wrap all dashboard pages (pattern from Performance tab) |
| @radix-ui/react-toggle-group | ^1.1.11 | View mode toggles | Skills Graph "By Team / By Skill" toggle (org pattern) |
| lucide-react | ^0.563.0 | Icons | Trend icons in table columns (TrendingUp, TrendingDown, ArrowRight) |
| clsx | ^2.1.1 | Conditional styling | Badge active states, table cell colors |

### Pattern Libraries (Custom)
| Component | Location | Purpose |
|-----------|----------|---------|
| BaseTeamsTable | components/dashboard/BaseTeamsTable.tsx | Generic table with typed columns and filters |
| DashboardSection | components/dashboard/DashboardSection.tsx | Section wrapper with title and action slot |
| ChartInsights | components/dashboard/ChartInsights.tsx | Insights panel (right side of charts) |
| TimeRangeFilter | components/dashboard/TimeRangeFilter.tsx | Time range selector (used by Design tab) |

**No new dependencies required.** All necessary libraries and components already exist.

## Architecture Patterns

### Project Structure (Existing)
```
app/org/[orgId]/team/[teamId]/
├── page.tsx                    # Overview tab (Phase 2)
├── performance/page.tsx        # Performance tab (Phase 3) ← PATTERN TO FOLLOW
├── design/page.tsx            # Design tab (Phase 4) ← TO CREATE
├── skillgraph/page.tsx        # Skills Graph tab (Phase 4) ← TO CREATE
└── spof/page.tsx              # SPOF tab (Phase 4) ← TO CREATE

components/dashboard/
├── BaseTeamsTable.tsx         # Generic table (REUSE)
├── OwnershipScatter.tsx       # Design chart (REUSE)
├── ChaosMatrix.tsx            # Design chart (REUSE)
├── SpofDistributionChart.tsx  # SPOF chart (REUSE)
├── RepoHealthBar.tsx          # SPOF chart (REUSE)
└── SkillGraph.tsx             # Skills chart (in components/skillmap/, REUSE)

lib/teamDashboard/
├── overviewMockData.ts        # getMemberPerformanceRowsForTeam() (REUSE)
├── designMockData.ts          # Design metrics generators (CREATE)
├── skillsMockData.ts          # Skills data generators (CREATE)
└── spofMockData.ts            # SPOF data generators (CREATE)
```

### Pattern 1: BaseTeamsTable with Custom Columns (PROVEN - Performance Tab)

**What:** Generic table component that accepts typed row data, filter tabs, sort function, and column definitions

**When to use:** Every member list in every tab (Overview uses MemberTable, but all subsequent tabs use BaseTeamsTable)

**Example from Performance tab:**
```typescript
// Source: app/org/[orgId]/team/[teamId]/performance/page.tsx (lines 64-143)

// Define filter type
type PerformanceFilter = "mostProductive" | "leastProductive" | "mostImproved" |
                         "mostRegressed" | "highestChurn" | "lowestChurn";

// Define filter tabs
const PERFORMANCE_FILTER_TABS: { key: PerformanceFilter; label: string }[] = [
  { key: "mostProductive", label: "Most Productive" },
  { key: "leastProductive", label: "Least Productive" },
  // ... more tabs
];

// Define sort function
function performanceSortFunction(
  rows: MemberPerformanceRow[],
  currentFilter: PerformanceFilter
): MemberPerformanceRow[] {
  const copy = [...rows];
  switch (currentFilter) {
    case "mostProductive":
      return copy.sort((a, b) => b.performanceValue - a.performanceValue);
    case "leastProductive":
      return copy.sort((a, b) => a.performanceValue - b.performanceValue);
    // ... more cases
  }
}

// Define columns with render functions
const PERFORMANCE_COLUMNS: BaseTeamsTableColumn<MemberPerformanceRow, PerformanceFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
    render: (_, index) => {
      const displayRank = index + 1;
      return (
        <span className={displayRank <= 3 ? "text-foreground font-bold" : DASHBOARD_TEXT_CLASSES.rankMuted}>
          {displayRank}
        </span>
      );
    },
  },
  {
    key: "member",
    header: "Member",
    render: (row) => (
      <div className="flex items-center gap-3">
        <TeamAvatar teamName={row.memberName} className="size-4" />
        <p className="font-medium text-gray-900">{row.memberName}</p>
      </div>
    ),
  },
  // ... more columns
];

// Usage in page
<BaseTeamsTable<MemberPerformanceRow, PerformanceFilter>
  rows={members}
  filterTabs={PERFORMANCE_FILTER_TABS}
  activeFilter={activeFilter}
  onFilterChange={setActiveFilter}
  defaultFilter="mostProductive"
  sortFunction={performanceSortFunction}
  columns={PERFORMANCE_COLUMNS}
  getRowKey={(row) => row.memberName}
/>
```

**Key insights:**
- Filter tabs are OUTSIDE the table as badges (line 255 in performance/page.tsx shows `showFilters` not used, filters rendered manually)
- Sort function is pure - takes rows and filter, returns sorted rows
- Columns use render functions with access to row data and index
- Generic types ensure type safety: `BaseTeamsTable<RowType, FilterType>`

### Pattern 2: Chart Component Prop Adaptation (NOT Modification)

**What:** Org dashboard charts accept data via props; member data must be transformed to match those prop interfaces

**When to use:** All three tabs - Design, Skills, SPOF

**Example - OwnershipScatter (Design tab):**
```typescript
// Source: components/dashboard/OwnershipScatter.tsx (lines 15-20)
type OwnershipScatterProps = {
  data?: DeveloperPoint[];  // Optional - has default synthetic data
  range?: OwnershipTimeRangeKey;
};

// DeveloperPoint structure (from lib/orgDashboard/ownershipScatterTypes.ts):
type DeveloperPoint = {
  name: string;           // Member name
  team: string;           // Team name (will be same for all in team dashboard)
  totalKarmaPoints: number;
  ownershipPct: number;
  inNormalRange: boolean;
  outlierType?: "high" | "low";
};

// Adaptation strategy:
// 1. Generate member-level ownership data in lib/teamDashboard/designMockData.ts
// 2. Transform to DeveloperPoint[] format
// 3. Pass to <OwnershipScatter data={memberOwnershipData} range={range} />
```

**Example - ChaosMatrix (Design tab):**
```typescript
// Source: components/dashboard/ChaosMatrix.tsx (lines 17-24)
type ChaosMatrixProps = {
  data?: ChaosPoint[];
  range?: ChaosTimeRangeKey;
  visibleTeams?: Record<string, boolean>;  // Filter visibility
  teamNames?: string[];                    // Labels for synthetic data
};

type ChaosPoint = {
  team: string;          // For team dashboard, use member name
  name: string;          // Developer name (for tooltip)
  medianWeeklyKp: number;
  churnRatePct: number;
};

// Adaptation strategy:
// 1. Generate member chaos data (medianWeeklyKp, churnRate per member)
// 2. Use member names in 'team' field (chart treats this as grouping label)
// 3. Use visibleTeams with member names to filter chart display
```

**Example - SkillGraph (Skills tab):**
```typescript
// Source: components/skillmap/SkillGraph.tsx (lines 39-44)
type SkillGraphProps = {
  width?: number;
  height?: number;
  domainWeights?: Record<string, number>;  // { "Frontend": 1500, "Backend": 2000 }
  skillVisibility?: Record<string, boolean>; // { "React": true, "Vue": false }
};

// Adaptation strategy:
// For SINGLE MEMBER view (team dashboard), show only that member's skills
// 1. Calculate member's domain weights (skill usage per domain)
// 2. Filter out skills member doesn't use (skillVisibility = false)
// 3. Graph renders voronoi treemap with member's skill distribution
```

**Example - SpofDistributionChart (SPOF tab):**
```typescript
// Source: components/dashboard/SpofDistributionChart.tsx (lines 21-31)
type SpofDistributionChartProps = {
  data: SpofDataPoint[];
  visibleTeams: Record<string, boolean>;
  showNormalFit?: boolean;
};

type SpofDataPoint = {
  score: number;  // SPOF risk score (0-6)
  team: string;   // Team name (for team dashboard, use member name)
};

// Adaptation strategy:
// 1. Generate SPOF score per member (0-6 scale)
// 2. Create SpofDataPoint[] with member names in 'team' field
// 3. Chart histograms by score, colored by member
```

**Anti-Pattern:** DO NOT modify chart components to add "member mode". Charts are data-agnostic; they render what they're given.

### Pattern 3: Page Layout Mirroring (Org Dashboard → Team Dashboard)

**What:** Each team dashboard tab copies the exact layout structure of its org dashboard counterpart

**When to use:** All three tabs

**Example - Design Tab Layout:**
```typescript
// Source: app/org/[orgId]/design/page.tsx (structure lines 44-109)
return (
  <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
    {/* Section 1: Ownership Misallocation Detector */}
    <DashboardSection
      title="Ownership Misallocation Detector"
      action={<TimeRangeFilter options={...} value={...} onChange={...} />}
    >
      <div className="flex flex-row gap-5">
        <div className="w-[65%] shrink-0">
          <OwnershipScatter range={ownershipRange} />
        </div>
        <div className="w-[35%] min-w-0 shrink">
          <ChartInsights insights={chartInsights} />
        </div>
      </div>
    </DashboardSection>

    {/* Section 2: Engineering Chaos Matrix */}
    <DashboardSection
      title="Engineering Chaos Matrix"
      action={<TimeRangeFilter options={...} value={...} onChange={...} />}
    >
      <ChaosMatrix range={chaosRange} visibleTeams={visibleTeams} teamNames={designTeamNames} />
    </DashboardSection>

    {/* Section 3: Teams Table */}
    <DashboardSection
      title="Teams"
      action={<div className="flex flex-row flex-wrap gap-2">{/* Filter badges */}</div>}
    >
      <DesignTeamsTable rows={...} activeFilter={...} />
    </DashboardSection>
  </div>
);

// Team dashboard version should be:
return (
  <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
    {/* Section 1: Ownership Misallocation Detector */}
    <DashboardSection
      title="Member Ownership Analysis"  // Adapt title for member context
      action={<TimeRangeFilter ... />}
    >
      <div className="flex flex-row gap-5">
        <div className="w-[65%] shrink-0">
          <OwnershipScatter data={memberOwnershipData} range={ownershipRange} />  // Member data
        </div>
        <div className="w-[35%] min-w-0 shrink">
          <ChartInsights insights={memberDesignInsights} />  // Member insights
        </div>
      </div>
    </DashboardSection>

    {/* Section 2: Engineering Chaos Matrix */}
    <DashboardSection
      title="Member Chaos Analysis"  // Adapt title
      action={<TimeRangeFilter ... />}
    >
      <ChaosMatrix data={memberChaosData} range={chaosRange} visibleTeams={visibleMembers} />
    </DashboardSection>

    {/* Section 3: Members Table (NOT Teams) */}
    <DashboardSection
      title="Team Members"
      action={<div className="flex flex-row flex-wrap gap-2">{/* Filter badges */}</div>}
    >
      <BaseTeamsTable<MemberDesignRow, DesignMemberFilter>
        rows={memberDesignRows}
        columns={DESIGN_MEMBER_COLUMNS}
        // ... rest of props
      />
    </DashboardSection>
  </div>
);
```

**Key insight:** Three-section structure is universal across all dashboard tabs:
1. Primary visualization + ChartInsights (65/35 split)
2. Secondary visualization (full width)
3. Data table with filters

### Pattern 4: Tab-Specific Filter Logic (NOT Universal Filters)

**What:** Each tab's filters reflect the semantic meaning of that tab's data, not a generic "most/least" pattern

**When to use:** All three tabs - Design, Skills, SPOF

**Example - Design Filters (from org dashboard):**
```typescript
// Source: components/dashboard/DesignTeamsTable.tsx (DESIGN_FILTER_TABS)
type DesignTableFilter =
  | "mostOutliers"              // Teams with most ownership outliers
  | "mostSkilledAIBuilders"     // Skilled AI users (high KP, low churn)
  | "mostUnskilledVibeCoders"   // Unskilled AI users (high KP, high churn)
  | "mostLegacyDevs";           // Traditional devs (low KP, low churn)

// For member-level Design tab, adapt to member context:
type DesignMemberFilter =
  | "highestOwnershipHealth"    // Members with best ownership/KP balance
  | "lowestOwnershipHealth"     // Members with worst ownership misallocation
  | "skilledAIUsers"            // High KP, low churn
  | "traditionalDevelopers"     // Low KP, low churn
  | "highestChaos"              // High churn rate
  | "lowestChaos";              // Low churn rate
```

**Example - Skills Filters (from org dashboard):**
```typescript
// Org dashboard has "By Team" and "By Skill" VIEW TOGGLE (not filters)
// Filter tabs are for the table below:
type SkillgraphTableFilter =
  | "mostUsage"                 // Teams with most total skill usage
  | "leastUsage"
  | "mostPercentOfChart"        // Teams dominating the chart
  | "leastPercentOfChart";

// For member-level Skills tab:
type SkillsMemberFilter =
  | "mostDomains"               // Members working across most domains
  | "leastDomains"              // Specialists (1-2 domains)
  | "mostSkills"                // Broad skillset
  | "leastSkills"               // Deep but narrow
  | "highestProficiency"        // Best avg skill completion
  | "lowestProficiency";
```

**Example - SPOF Filters:**
```typescript
// SPOF measures risk concentration
type SpofMemberFilter =
  | "highestRisk"               // Members with highest SPOF score
  | "lowestRisk"                // Well-distributed ownership
  | "mostCriticalRepos"         // Owns most critical repositories
  | "mostBusFactorRisk";        // Would cause most damage if unavailable
```

**Anti-Pattern:** Don't create a single `MemberFilter` type with 20+ options used across all tabs. Each tab's filters should be semantically meaningful for that domain.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Member ownership scatter plot | Custom SVG scatter | OwnershipScatter component | Already handles outlier detection, trend lines, confidence bands, tooltips, responsive sizing |
| Skills visualization | Sunburst or treemap from scratch | SkillGraph component | Complex voronoi treemap algorithm, d3-voronoi-treemap dependency, click interactions, drill-down state |
| SPOF distribution histogram | Canvas or SVG histogram | SpofDistributionChart | Stacked histograms by team/member, normal curve overlay, sigma lines, statistical calculations |
| Table with filters and sorting | HTML table + useState | BaseTeamsTable | Generic typed columns, filter state management, sort logic abstraction, accessibility |
| Time range selector | Dropdown or button group | TimeRangeFilter | Disabled state for insufficient data, consistent styling, time range type definitions |
| Tooltip system | CSS :hover or title attr | createChartTooltip (lib/chartTooltip.ts) | D3-compatible, positioning logic, z-index handling, show/hide/move API |

**Key insight:** The codebase has 6 months of dashboard development. Every chart component, helper function, and pattern needed for Phase 4 already exists. The task is **composition and data transformation**, not component creation.

## Common Pitfalls

### Pitfall 1: Modifying Chart Components for "Member Mode"

**What goes wrong:** Developer adds `isMemberView` prop to chart components, duplicating rendering logic

**Why it happens:** Assumption that charts need to "know" whether they're displaying team or member data

**How to avoid:**
- Charts are **data-agnostic**—they render DeveloperPoint[], ChaosPoint[], etc. regardless of source
- The `team` field in chart data types is just a string label (can be team name or member name)
- Transform member data to match chart prop interfaces in mock data layer, not in components

**Warning signs:**
- Adding `if (isMemberView)` conditionals to chart components
- Creating `OwnershipScatterMember` duplicate component
- Modifying chart TypeScript interfaces to add mode flags

### Pitfall 2: Creating New Table Components Instead of Using BaseTeamsTable

**What goes wrong:** Developer creates `DesignMemberTable`, `SkillsMemberTable`, `SpofMemberTable` components

**Why it happens:** Misunderstanding that BaseTeamsTable is already generic and handles all use cases

**How to avoid:**
- BaseTeamsTable accepts generic `<RowType, FilterType>` - it's designed for any data shape
- The ONLY difference between tabs is: column definitions, filter tabs, and sort function
- Performance tab (Phase 3) proves this pattern works—no custom table component needed

**Warning signs:**
- Copy-pasting BaseTeamsTable code to create specialized versions
- Creating wrapper components around BaseTeamsTable that just pass props through
- Ignoring the generic type parameters

### Pitfall 3: Inconsistent Filter Semantics Across Tabs

**What goes wrong:** All tabs use "Most Productive" / "Least Productive" filters even when meaningless

**Why it happens:** Copy-pasting Performance tab filters without adapting to domain context

**How to avoid:**
- Design tab filters should reflect **ownership health and chaos** (not productivity)
- Skills tab filters should reflect **domain breadth and proficiency** (not productivity)
- SPOF tab filters should reflect **risk concentration** (not productivity)
- Each filter type name should make sense when you read it in the UI

**Warning signs:**
- "Most Productive" filter on Skills Graph tab (skills ≠ productivity)
- "Highest Churn" filter on SPOF tab (churn ≠ SPOF risk)
- Filter labels that don't match the data being displayed

### Pitfall 4: Forgetting Team Context in Member Data

**What goes wrong:** Charts show member names but lose team affiliation context

**Why it happens:** Team dashboard focuses on members, forgetting they're still part of a team

**How to avoid:**
- Member data should include `teamId: string` field (already in MemberPerformanceRow type)
- Chart tooltips should show "Member Name (Team Name)"
- SkillGraph for members should still color-code by domain (not by member)
- ChaosMatrix should identify which members are in which chaos category

**Warning signs:**
- Member names without team context in tooltips
- Unable to tell which team a member belongs to from chart alone
- Missing team color or team name in member data structures

### Pitfall 5: Overcomplicating Mock Data Generation

**What goes wrong:** Creating complex random data generators with distributions, seeds, correlations

**Why it happens:** Trying to make mock data "realistic" by simulating real-world variance

**How to avoid:**
- Phase 3 Performance tab uses **deterministic seed-based generation** (lines 159-174)
- Use member name + index as seed: `row.memberName.charCodeAt(0) + index * 100`
- Apply `Math.sin(seed)` for pseudo-random but consistent values
- Keep it simple—mock data just needs to demonstrate UI, not statistical validity

**Warning signs:**
- Complex statistical distributions in mock data
- Random number generators that produce different data on every render
- Mock data that doesn't match the expected ranges for chart display

### Pitfall 6: Not Wrapping Pages with TooltipProvider

**What goes wrong:** Chart tooltips don't work, console errors about missing TooltipProvider context

**Why it happens:** Charts use Radix UI tooltip primitives that require provider in React tree

**How to avoid:**
- Every dashboard page must wrap content with `<TooltipProvider>`
- Pattern from Performance tab (line 207): `return <TooltipProvider><div>...</div></TooltipProvider>`
- This is required even if you don't explicitly use Tooltip components (charts use them internally)

**Warning signs:**
- React context errors in console
- Tooltips not appearing on chart hover
- Missing TooltipProvider import from `@/components/ui/tooltip`

## Code Examples

Verified patterns from existing codebase:

### Example 1: Page Structure (Performance Tab Pattern)

```typescript
// Source: app/org/[orgId]/team/[teamId]/performance/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { BaseTeamsTable, type BaseTeamsTableColumn } from "@/components/dashboard/BaseTeamsTable";
import { TimeRangeFilter } from "@/components/dashboard/TimeRangeFilter";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { getMemberPerformanceRowsForTeam } from "@/lib/teamDashboard/overviewMockData";
import type { MemberPerformanceRow } from "@/lib/teamDashboard/types";

type TabFilter = "filter1" | "filter2" | "filter3";

const FILTER_TABS: { key: TabFilter; label: string }[] = [
  { key: "filter1", label: "Filter 1" },
  // ...
];

const COLUMNS: BaseTeamsTableColumn<MemberPerformanceRow, TabFilter>[] = [
  {
    key: "rank",
    header: "Rank",
    className: "w-14",
    render: (_, index) => <span>{index + 1}</span>,
  },
  // ...
];

function sortFunction(rows: MemberPerformanceRow[], filter: TabFilter): MemberPerformanceRow[] {
  // Sorting logic
  return rows;
}

export default function TabPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [activeFilter, setActiveFilter] = useState<TabFilter>("filter1");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("1m");

  const members = useMemo(() => getMemberPerformanceRowsForTeam(52, teamId, 6), [teamId]);
  const insights = useMemo(() => generateInsights(members), [members]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            <h2 className="text-2xl font-semibold text-foreground">Tab Title</h2>

            {/* Section 1: Main chart + insights */}
            <div className="flex flex-row gap-5">
              <div className="flex-1">
                {/* Chart component here */}
              </div>
              <ChartInsights insights={insights} />
            </div>

            {/* Section 2: Members table */}
            <section className="w-full">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">Team Members</h2>
              <BaseTeamsTable<MemberPerformanceRow, TabFilter>
                rows={members}
                filterTabs={FILTER_TABS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                defaultFilter="filter1"
                sortFunction={sortFunction}
                columns={COLUMNS}
                getRowKey={(row) => row.memberName}
              />
            </section>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
```

### Example 2: Chart Data Transformation (Member → Chart Props)

```typescript
// Source: Pattern derived from org dashboard chart prop interfaces

// 1. Define member-level data type
type MemberOwnershipData = {
  memberName: string;
  teamId: string;
  totalKarmaPoints: number;
  ownershipPct: number;
};

// 2. Transform to chart's expected format
function transformToOwnershipScatterData(
  members: MemberOwnershipData[]
): DeveloperPoint[] {
  const allKP = members.map(m => m.totalKarmaPoints);
  const allOwnership = members.map(m => m.ownershipPct);

  const avgKP = allKP.reduce((a, b) => a + b, 0) / allKP.length;
  const avgOwnership = allOwnership.reduce((a, b) => a + b, 0) / allOwnership.length;

  return members.map(member => {
    const kpDelta = member.totalKarmaPoints - avgKP;
    const ownDelta = member.ownershipPct - avgOwnership;

    // Determine outlier type based on position relative to mean
    let outlierType: "high" | "low" | undefined;
    if (kpDelta > 0 && ownDelta > 0) outlierType = "high";
    else if (kpDelta < 0 && ownDelta < 0) outlierType = "low";

    return {
      name: member.memberName,
      team: "Current Team",  // Or actual team name from teamId lookup
      totalKarmaPoints: member.totalKarmaPoints,
      ownershipPct: member.ownershipPct,
      inNormalRange: !outlierType,
      outlierType,
    };
  });
}

// 3. Use in page component
const memberOwnershipData = useMemo(
  () => transformToOwnershipScatterData(memberOwnershipMetrics),
  [memberOwnershipMetrics]
);

// 4. Pass to chart (unchanged component)
<OwnershipScatter data={memberOwnershipData} range={timeRange} />
```

### Example 3: Deterministic Mock Data Generation

```typescript
// Source: app/org/[orgId]/team/[teamId]/performance/page.tsx (lines 159-174)

// Generate deterministic values based on member identity
const members = useMemo(() => {
  const rows = getMemberPerformanceRowsForTeam(52, teamId, 6);

  return rows.map((row, index) => {
    // Use member name and index as seed for deterministic values
    const seed1 = row.memberName.charCodeAt(0) + index * 100;
    const seed2 = row.memberName.length + index * 50;

    // Convert seed to pseudo-random decimal (0-1 range)
    const noise1 = Math.sin(seed1 * 9999) * 10000;
    const noise2 = Math.sin(seed2 * 9999) * 10000;
    const changeSeed = noise1 - Math.floor(noise1);
    const churnSeed = noise2 - Math.floor(noise2);

    return {
      ...row,
      change: (changeSeed - 0.5) * 30,        // -15 to +15 points
      churnRate: Math.round(churnSeed * 40),  // 0-40%
    };
  });
}, [teamId]);
```

### Example 4: Filter Badge Rendering (NOT Inside BaseTeamsTable)

```typescript
// Source: app/org/[orgId]/design/page.tsx (lines 82-97)

// Filters are rendered OUTSIDE BaseTeamsTable as badges
<DashboardSection
  title="Teams"
  className="w-full"
  action={
    <div className="flex flex-row flex-wrap gap-2">
      {DESIGN_FILTER_TABS.map((tab) => (
        <Badge
          key={tab.key}
          onClick={() => setDesignFilter(tab.key)}
          className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
            designFilter === tab.key
              ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
              : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          {tab.label}
        </Badge>
      ))}
    </div>
  }
>
  <DesignTeamsTable
    rows={designTeamRows}
    activeFilter={designFilter}
    onFilterChange={setDesignFilter}
    showFilters={false}  // Don't render filters inside table
    // ...
  />
</DashboardSection>
```

### Example 5: Skills Graph Integration (Single Member Context)

```typescript
// Source: app/org/[orgId]/skillgraph/page.tsx (lines 75-91)

// For team dashboard, calculate domain weights for a SINGLE member
const memberDomainWeights = useMemo(() => {
  const member = members.find(m => m.memberName === selectedMember);
  if (!member || !member.skillDistribution) return undefined;

  // Calculate total usage per domain for this member
  const totals: Record<string, number> = {};
  member.skillDistribution.forEach((skill) => {
    totals[skill.domain] = (totals[skill.domain] ?? 0) + skill.usage;
  });

  return totals;
}, [members, selectedMember]);

// Pass to SkillGraph (unchanged component)
<SkillGraph
  width={700}
  height={700}
  domainWeights={memberDomainWeights}
  skillVisibility={visibleSkills}  // Hide skills member doesn't use
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom table for each page | BaseTeamsTable with generic types | Phase 3 (Performance tab) | Single table component handles all member lists; column definitions are the only difference |
| Creating member-specific chart variants | Prop adaptation via data transformation | Established in org dashboard | Charts don't need to know data source; member data transforms to team data format |
| Component prop drilling | TypeScript generics for compile-time safety | Current (TypeScript 5.x) | BaseTeamsTable<RowType, FilterType> ensures type safety without prop drilling |
| Manual filter state management | useTableFilter hook | Phase 3 | Consistent filter behavior across all tables |
| Random mock data generators | Deterministic seed-based generation | Phase 3 (Performance tab) | Consistent mock data across rerenders; deterministic testing |

**Deprecated/outdated:**
- **MemberTable component**: Used only in Overview tab; all subsequent tabs use BaseTeamsTable pattern
- **Creating new table components per tab**: Phase 3 established that column definitions are sufficient

## Open Questions

### 1. Skills Graph for Single Member vs. Team Aggregation

**What we know:**
- Org dashboard shows all teams' skills aggregated on SkillGraph
- Team dashboard should show individual members' skills
- SkillGraph accepts `domainWeights` prop to control what's displayed

**What's unclear:**
- Should Skills Graph tab show ONE member at a time (with member selector)?
- Or show ALL members aggregated (team's total skill distribution)?
- Or have a toggle between "Team Aggregate" and "Individual Members" like Performance tab?

**Recommendation:**
- **Team Aggregate view by default** - shows combined skills of all team members
- Add member visibility toggles (like org dashboard has team toggles)
- Clicking a member in the table highlights their contribution on the graph
- This matches the "visibleTeams" pattern from org dashboard (line 60-66 in skillgraph/page.tsx)

### 2. SPOF Metrics at Member Level

**What we know:**
- SPOF at org level measures single-point-of-failure risk across teams
- Team dashboard should measure SPOF at member level (bus factor)

**What's unclear:**
- What constitutes "SPOF score" for a member? (number of unique repos owned, criticality of those repos, knowledge concentration?)
- Should Repository Health show repos the member owns, or team's repos?

**Recommendation:**
- **Member SPOF score** = Number of repositories where member is primary/sole contributor
- **Repository Health** = Health distribution of repos member has committed to
- Filter tabs: "Highest Risk" (high SPOF score), "Lowest Risk" (distributed work)
- Mock data: Assign 1-6 SPOF score per member based on repository concentration

### 3. Design Tab Chaos Categories for Members

**What we know:**
- Org Design tab categorizes teams into 4 chaos types: Low-Skill Dev, Traditional Dev, Unskilled AI User, Skilled AI User
- Categories based on medianWeeklyKP (x-axis) and churnRate (y-axis)

**What's unclear:**
- Do these 4 categories make sense at member level?
- Should thresholds change when comparing members vs. teams?

**Recommendation:**
- **Keep the same 4 categories** - they're meaningful at both levels
- Calculate thresholds (median KP, median churn) within the team's member set
- This maintains semantic consistency with org dashboard
- Filters: "Skilled AI Users", "Traditional Developers", "High Chaos", "Low Chaos"

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** - app/org/[orgId]/team/[teamId]/performance/page.tsx (Phase 3 pattern)
- **Codebase analysis** - components/dashboard/BaseTeamsTable.tsx (generic table pattern)
- **Codebase analysis** - components/dashboard/OwnershipScatter.tsx, ChaosMatrix.tsx, SpofDistributionChart.tsx, SkillGraph.tsx (chart prop interfaces)
- **Codebase analysis** - lib/orgDashboard/types.ts (data type definitions)
- **Codebase analysis** - package.json (d3 ^7.9.0, React 19.2.3, Next.js 16.1.6)

### Secondary (MEDIUM confidence)
- [React Design Patterns | Refine](https://refine.dev/blog/react-design-patterns/) - Compound components, prop adaptation patterns
- [Building Reusable React Components in 2026 | Medium](https://medium.com/@romko.kozak/building-reusable-react-components-in-2026-a461d30f8ce4) - Component reuse best practices
- [D3.js: Getting Started (2026)](https://thelinuxcode.com/d3js-getting-started-with-data-driven-documents-for-real-world-visualization-2026/) - D3 data transformation patterns
- [D3 Reusable Chart Pattern](https://www.toptal.com/d3-js/towards-reusable-d3-js-charts) - Props-based chart reusability
- [TypeScript Discriminated Unions](https://basarat.gitbook.io/typescript/type-system/discriminated-unions) - Type safety for member vs. team data
- [Next.js App Router: Creating Layouts and Pages](https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages) - Dashboard routing patterns
- [App Router | Next.js](https://nextjs.org/learn/dashboard-app) - 2026 best practices for dashboard apps

### Tertiary (LOW confidence)
- None - all findings verified with codebase or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies verified in package.json, no new libraries needed
- Architecture patterns: HIGH - Phase 3 Performance tab provides proven blueprint, org dashboard charts have stable prop interfaces
- Component reuse: HIGH - All required components exist and are used in org dashboard
- Mock data patterns: HIGH - Deterministic generation pattern established in Phase 3
- Filter semantics: MEDIUM - Specific filter labels per tab are discretionary (user decision deferred to planning)

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (30 days - stack is stable, patterns established)
