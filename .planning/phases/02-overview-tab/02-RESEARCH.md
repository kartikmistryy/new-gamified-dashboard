# Phase 2: Overview Tab - Research

**Researched:** 2026-02-06
**Domain:** React dashboard UI composition, D3 gauge integration, metric card aggregation, insights panel patterns
**Confidence:** HIGH

## Summary

Phase 2 completes the team overview page by integrating three additional components (D3Gauge, OverviewSummaryCard, ChartInsights) with the existing MemberTable from Phase 1. The research confirms that all required components already exist in the codebase and are designed for reuse with different data sources.

The org dashboard (`app/org/[orgId]/page.tsx`) serves as the canonical layout reference: a two-column section with GaugeSection (left) and ChartInsights (right), followed by a responsive 6-column grid of metric cards, followed by the table section. The exact CSS classes and spacing are documented and must be replicated precisely for visual consistency.

D3Gauge accepts a single numeric value (0-100) as a prop and doesn't calculate aggregates internally, so the page component must calculate the team average from member data before passing it. Metric cards count members by summing each category count from member typeDistributions (same pattern as org dashboard which sums team typeDistributions). ChartInsights accepts an array of insight objects with static mocked data for Phase 2.

**Primary recommendation:** Reuse existing components unchanged, calculate team gauge value as average of member performanceValues in the page component, derive metric card counts by summing typeDistribution fields across all members, use static mocked insights with member names for personalization, match org dashboard layout CSS exactly (gap-8, gap-5, gap-4, space-y-8).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D3Gauge data source:**
- Gauge displays team aggregate performance calculated from member data (validates aggregation correctness)
- Use simple average: sum all member performanceValues ÷ count
- Mock data approach: Generate members independently first, derive team value from their average (change from Phase 1's "team value first" approach)
- **Claude's Discretion:** Whether gauge calculates aggregate internally or receives it as a prop (choose based on existing D3Gauge API pattern)

**Metric card counting:**
- **Claude's Discretion:** Counting method for categories (primary category, threshold-based, or fractional) — choose most logical approach
- Cards show count only, no percentages or trends (matches org dashboard pattern)
- Cards are informational only, do not filter the table on click (use existing filter tabs for that)
- Card order matches org dashboard order exactly (visual consistency)

**ChartInsights content:**
- Focus on team composition insights (distribution patterns like "3 star performers, 1 risky member")
- Use static mocked insights for Phase 2 (validates UI, faster implementation)
- Display 3-4 insight items (matches typical org dashboard pattern)
- Insights mention specific member names for personalization (e.g., "Alice is a star performer")

**Page layout & composition:**
- Match org dashboard layout exactly for visual consistency
- Page heading changes from "Team Members" to "Overview" (matches tab name)
- Keep existing MemberTable from Phase 1 and integrate new components around it (don't rebuild from scratch)
- Defer responsive behavior (mobile optimization) to later phase — focus on desktop layout for Phase 2
- **Claude's Discretion:** Exact spacing, gaps, and component sizing to match org dashboard

### Claude's Discretion

**Gauge calculation location:**
- **Decision:** D3Gauge receives aggregate as prop (existing API pattern from `components/dashboard/D3Gauge.tsx` — accepts `value` prop, doesn't calculate internally)
- Page component calculates `teamGaugeValue = members.reduce((sum, m) => sum + m.performanceValue, 0) / members.length`

**Metric card counting method:**
- **Decision:** Sum typeDistribution fields across all members (matches org dashboard pattern from `lib/orgDashboard/overviewMockData.ts:getOverviewSummaryCardsForGauge`)
- Each member has `typeDistribution: { star: number, timeBomb: number, ... }` with values summing to 30
- Card count = sum of that field across all members (e.g., Star count = member1.typeDistribution.star + member2.typeDistribution.star + ...)
- This is logical because typeDistribution represents fractional composition, not a single primary category

**Layout spacing:**
- **Decision:** Match org dashboard exactly:
  - Outer container: `flex flex-col gap-8 px-6 pb-8`
  - Inner CardContent: `space-y-8`
  - Gauge + Insights row: `flex flex-row gap-5`
  - Metric cards grid: `grid grid-cols-3 gap-4 @[1050px]:grid-cols-6` (responsive: 3 cols on mobile, 6 on desktop ≥1050px)
  - Table heading: `mb-4 text-2xl font-semibold`

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

## Standard Stack

The established libraries and components for this phase:

### Core
| Library/Component | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| D3Gauge | Existing | Performance visualization (0-100 gauge) | Already used in org dashboard, proven D3-based gauge implementation with animation |
| OverviewSummaryCard | Existing | Metric count cards (Star, Time Bomb, etc.) | Already used in org dashboard with exact visual styling needed |
| ChartInsights | Existing | Insights panel with sparkle icon | Already used in org dashboard, simple list-based UI component |
| MemberTable | Phase 1 | Member performance table | Created in Phase 1, reuses BaseTeamsTable with member-specific columns |

### Supporting
| Utility/Function | Location | Purpose | When to Use |
|---------|---------|---------|-------------|
| getPerformanceGaugeLabel() | lib/orgDashboard/utils.ts | Converts gauge value to label (Underperforming, etc.) | Gauge label generation (already used in member mocks) |
| getPerformanceBarColor() | lib/orgDashboard/tableUtils.ts | Converts value to color hex code | Performance bar colors (already used in member mocks) |
| TYPE_DIST_REF interpolation | lib/teamDashboard/overviewMockData.ts | Generates realistic typeDistribution for members | Already implemented in Phase 1 member mocks |

### Layout Dependencies
| Pattern | CSS Classes | Purpose |
|---------|---------|---------|
| Container spacing | `gap-8`, `px-6`, `pb-8` | Matches org dashboard outer spacing |
| Section spacing | `space-y-8` | Matches org dashboard CardContent vertical rhythm |
| Two-column row | `flex flex-row gap-5` | Gauge + Insights side-by-side |
| Responsive grid | `grid grid-cols-3 gap-4 @[1050px]:grid-cols-6` | 6 metric cards, 3 cols mobile, 6 cols desktop |
| Table section | `mb-4` on heading | Space above member table |

**Installation:**
```bash
# No new dependencies required - using existing components
```

---

## Architecture Patterns

### Recommended Page Structure
```
app/org/[orgId]/team/[teamId]/page.tsx:
  - Calculate teamGaugeValue (average of member performanceValues)
  - Calculate metricCardCounts (sum typeDistribution fields)
  - Generate static insights array (3-4 items with member names)
  - Render layout:
    ├── Heading: "Overview"
    ├── Row: GaugeSection (left) + ChartInsights (right)
    ├── Grid: 6 OverviewSummaryCards
    └── Section: MemberTable

lib/teamDashboard/:
  - overviewMockData.ts: getMemberPerformanceRowsForTeam() (Phase 1)
  - types.ts: MemberPerformanceRow (Phase 1)
  - NEW: overviewHelpers.ts: calculateTeamGaugeValue(), getMetricCardCounts(), getMemberInsights()
```

### Pattern 1: Gauge Receives Aggregate (Not Calculate)
**What:** D3Gauge is a pure presentation component that receives `value` prop
**When to use:** When displaying performance gauges (org or team level)
**Example:**
```typescript
// Source: components/dashboard/D3Gauge.tsx (lines 20-33)
export function D3Gauge({
  value,
  label,
  labelColor,
  valueDisplay,
  spec = defaultGaugeSpec,
}: {
  value: number;  // ← Receives aggregate, doesn't calculate
  label: string;
  labelColor?: string;
  valueDisplay?: string;
  spec?: GaugeSpec;
})
```

**Application to Phase 2:**
```typescript
// app/org/[orgId]/team/[teamId]/page.tsx
const memberRows = useMemo(() => getMemberPerformanceRowsForTeam(52, teamId, 6), [teamId]);

// Calculate team gauge value as average of member values
const teamGaugeValue = useMemo(() => {
  if (memberRows.length === 0) return 0;
  const sum = memberRows.reduce((acc, m) => acc + m.performanceValue, 0);
  return Math.round(sum / memberRows.length);
}, [memberRows]);

// Pass calculated aggregate to D3Gauge
<GaugeSection
  gaugeValue={teamGaugeValue}
  labelVariant="performance"
/>
```

### Pattern 2: Metric Cards Count via Aggregation
**What:** Sum typeDistribution fields across all entities (teams at org level, members at team level)
**When to use:** Generating counts for OverviewSummaryCard components
**Example:**
```typescript
// Source: lib/orgDashboard/overviewMockData.ts (lines 107-122)
export function getOverviewSummaryCardsForGauge(gaugeValue: number): OverviewSummaryCardConfig[] {
  const rows = getTeamPerformanceRowsForGauge(gaugeValue);
  const totals = { star: 0, timeBomb: 0, keyRole: 0, bottleneck: 0, risky: 0, legacy: 0 };
  for (const row of rows) {
    totals.star += row.typeDistribution.star;
    totals.timeBomb += row.typeDistribution.timeBomb;
    totals.keyRole += row.typeDistribution.keyRole;
    totals.bottleneck += row.typeDistribution.bottleneck;
    totals.risky += row.typeDistribution.risky;
    totals.legacy += row.typeDistribution.legacy;
  }
  return BASE_CARD_CONFIG.map((base, i) => ({
    ...base,
    count: totals[CARD_KEY_TO_DIST_KEY[i]],
  }));
}
```

**Application to Phase 2:**
```typescript
// lib/teamDashboard/overviewHelpers.ts (NEW FILE)
import type { MemberPerformanceRow } from "./types";
import type { OverviewSummaryCardConfig } from "@/lib/orgDashboard/types";

const BASE_CARD_CONFIG: Omit<OverviewSummaryCardConfig, "count">[] = [
  { key: "star", title: "Star", priority: "Optimal", descriptionLine1: "Low SPOF", descriptionLine2: "Skilled AI Builder", bg: "#D9F9E6", iconColor: "#55B685", badgeColor: "text-white bg-[#6BC095]" },
  { key: "time-bomb", title: "Time Bomb", priority: "P0", descriptionLine1: "High SPOF", descriptionLine2: "Unskilled Vibe Coder", bg: "#F9E3E2", iconColor: "#CA3A31", badgeColor: "text-white bg-[#CA3A31]" },
  { key: "key-player", title: "Key Role", priority: "P1", descriptionLine1: "High SPOF", descriptionLine2: "Skilled AI Builder", bg: "#FCEED8", iconColor: "#E87B35", badgeColor: "text-white bg-[#E87B35]" },
  { key: "bottleneck", title: "Bottleneck", priority: "P1", descriptionLine1: "High SPOF", descriptionLine2: "Manual Coder", bg: "#FCEED8", iconColor: "#E87B35", badgeColor: "text-white bg-[#E9A23B]" },
  { key: "risky", title: "Risky", priority: "P2", descriptionLine1: "Low SPOF", descriptionLine2: "Unskilled Vibe Coder", bg: "#FCF3CC", iconColor: "#E9A23B", badgeColor: "text-white bg-[#E9A23B]" },
  { key: "stable", title: "Legacy", priority: "P3", descriptionLine1: "Low SPOF", descriptionLine2: "Manual Coder", bg: "#FDF9C9", iconColor: "#E2B53E", badgeColor: "text-white bg-[#E2B53E]" },
];

const CARD_KEY_TO_DIST_KEY: (keyof MemberPerformanceRow["typeDistribution"])[] = [
  "star", "timeBomb", "keyRole", "bottleneck", "risky", "legacy",
];

export function getMemberMetricCards(members: MemberPerformanceRow[]): OverviewSummaryCardConfig[] {
  const totals = { star: 0, timeBomb: 0, keyRole: 0, bottleneck: 0, risky: 0, legacy: 0 };
  for (const member of members) {
    totals.star += member.typeDistribution.star;
    totals.timeBomb += member.typeDistribution.timeBomb;
    totals.keyRole += member.typeDistribution.keyRole;
    totals.bottleneck += member.typeDistribution.bottleneck;
    totals.risky += member.typeDistribution.risky;
    totals.legacy += member.typeDistribution.legacy;
  }
  return BASE_CARD_CONFIG.map((base, i) => ({
    ...base,
    count: totals[CARD_KEY_TO_DIST_KEY[i]],
  }));
}
```

### Pattern 3: Static Insights with Member Names
**What:** Generate personalized insights mentioning specific member names for team composition
**When to use:** ChartInsights panel on team overview page
**Example:**
```typescript
// Source: lib/orgDashboard/overviewMockData.ts (lines 133-145)
const CHART_INSIGHTS_MOCK: ChartInsight[] = [
  { id: "baseline", text: "Performance stayed mostly above baseline..." },
  { id: "milestones", text: "Leadership and delivery milestones drive outsized gains..." },
  // ... more insights
];

export function getChartInsightsMock(): ChartInsight[] {
  return [...CHART_INSIGHTS_MOCK];
}
```

**Application to Phase 2:**
```typescript
// lib/teamDashboard/overviewHelpers.ts
import type { ChartInsight } from "@/lib/orgDashboard/types";
import type { MemberPerformanceRow } from "./types";

export function getMemberInsights(members: MemberPerformanceRow[]): ChartInsight[] {
  if (members.length === 0) return [];

  const insights: ChartInsight[] = [];

  // Count members by category (highest typeDistribution value)
  const categoryCounts = { star: 0, timeBomb: 0, risky: 0, bottleneck: 0, keyRole: 0, legacy: 0 };
  const categoryMembers: Record<string, string[]> = { star: [], timeBomb: [], risky: [], bottleneck: [], keyRole: [], legacy: [] };

  for (const member of members) {
    const dist = member.typeDistribution;
    const maxKey = Object.keys(dist).reduce((a, b) => dist[a as keyof typeof dist] > dist[b as keyof typeof dist] ? a : b) as keyof typeof dist;
    categoryCounts[maxKey]++;
    categoryMembers[maxKey].push(member.memberName);
  }

  // Generate insights mentioning member names
  if (categoryCounts.star > 0) {
    const names = categoryMembers.star.slice(0, 2).join(" and ");
    insights.push({
      id: "stars",
      text: `${categoryCounts.star} star performer${categoryCounts.star > 1 ? 's' : ''} (${names}) are driving high performance with low SPOF risk.`
    });
  }

  if (categoryCounts.timeBomb > 0) {
    const names = categoryMembers.timeBomb[0];
    insights.push({
      id: "timebombs",
      text: `${categoryCounts.timeBomb} time bomb${categoryCounts.timeBomb > 1 ? 's' : ''} detected${names ? ` including ${names}` : ''} — high SPOF risk with low skill level.`
    });
  }

  if (categoryCounts.risky > 0) {
    insights.push({
      id: "risky",
      text: `${categoryCounts.risky} risky member${categoryCounts.risky > 1 ? 's' : ''} require upskilling to reduce vibe coding patterns.`
    });
  }

  // Team composition summary
  const topPerformers = members.filter(m => m.performanceValue >= 75);
  if (topPerformers.length > 0) {
    insights.push({
      id: "topperformers",
      text: `${topPerformers.length} member${topPerformers.length > 1 ? 's' : ''} achieving "Extreme Outperforming" status (75+) this period.`
    });
  }

  return insights.slice(0, 4); // Max 4 insights
}
```

### Pattern 4: Exact Layout Matching
**What:** Replicate org dashboard layout CSS classes precisely for visual consistency
**When to use:** Team overview page layout structure
**Example:**
```typescript
// Source: app/org/[orgId]/page.tsx (lines 28-62)
return (
  <TooltipProvider>
    <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
      <Card className="w-full border-none bg-white p-0 shadow-none">
        <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
          <h2 className="text-2xl font-semibold text-foreground">
            Organization Overview
          </h2>

          <div className="flex flex-row gap-5">
            <GaugeSection gaugeValue={gaugeValue} labelVariant="performance" />
            <ChartInsights insights={chartInsights} />
          </div>

          <div className="@container w-full">
            <div className="grid grid-cols-3 gap-4 @[1050px]:grid-cols-6">
              {summaryCards.map((item) => (
                <OverviewSummaryCard key={item.key} item={item} />
              ))}
            </div>
          </div>

          <section className="w-full" aria-labelledby="teams-heading">
            <h2 id="teams-heading" className="mb-4 text-2xl font-semibold text-foreground">
              Teams
            </h2>
            <TeamTable rows={teamRows} />
          </section>
        </CardContent>
      </Card>
    </div>
  </TooltipProvider>
);
```

**Application to Phase 2:**
```typescript
// app/org/[orgId]/team/[teamId]/page.tsx
export default function TeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const memberRows = useMemo(() => getMemberPerformanceRowsForTeam(52, teamId, 6), [teamId]);
  const teamGaugeValue = useMemo(() => {
    if (memberRows.length === 0) return 0;
    const sum = memberRows.reduce((acc, m) => acc + m.performanceValue, 0);
    return Math.round(sum / memberRows.length);
  }, [memberRows]);
  const metricCards = useMemo(() => getMemberMetricCards(memberRows), [memberRows]);
  const insights = useMemo(() => getMemberInsights(memberRows), [memberRows]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            {/* Changed from "Team Members" to "Overview" */}
            <h2 className="text-2xl font-semibold text-foreground">
              Overview
            </h2>

            {/* NEW: Gauge + Insights row */}
            <div className="flex flex-row gap-5">
              <GaugeSection
                gaugeValue={teamGaugeValue}
                labelVariant="performance"
              />
              <ChartInsights insights={insights} />
            </div>

            {/* NEW: Metric cards grid */}
            <div className="@container w-full">
              <div className="grid grid-cols-3 gap-4 @[1050px]:grid-cols-6">
                {metricCards.map((item) => (
                  <OverviewSummaryCard key={item.key} item={item} />
                ))}
              </div>
            </div>

            {/* EXISTING: Member table from Phase 1 */}
            <section className="w-full" aria-labelledby="members-heading">
              <h2 id="members-heading" className="mb-4 text-2xl font-semibold text-foreground">
                Team Members
              </h2>
              <MemberTable rows={memberRows} />
            </section>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
```

### Anti-Patterns to Avoid
- **Don't modify D3Gauge to calculate aggregates:** Component is pure presentation; calculation belongs in page component
- **Don't create new metric card counting logic:** Use same typeDistribution summation pattern as org dashboard
- **Don't deviate from org dashboard CSS classes:** Even minor changes (gap-4 → gap-3) break visual consistency
- **Don't make insights generic:** User wants member names mentioned for personalization
- **Don't make cards interactive/clickable:** User specified informational only; filter tabs already handle filtering

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gauge visualization | Custom SVG gauge from scratch | Existing D3Gauge component | Already has D3 animation, tooltip, segment colors, proven in org dashboard |
| Metric card UI | Custom card component | Existing OverviewSummaryCard | Already has exact styling (icons, badges, trends, colors) matching design |
| Insights panel | Custom list component | Existing ChartInsights | Already has sparkle icon header, correct spacing, card styling |
| Member aggregation math | Custom averaging logic | Pattern from getOverviewSummaryCardsForGauge | Proven summation pattern for typeDistribution fields |
| Layout spacing | Eyeball gaps and padding | Exact CSS classes from org dashboard page.tsx | User wants "exact visual consistency" — copy don't approximate |
| Performance color mapping | New thresholds | Existing getPerformanceBarColor() | Consistent color bands (0-24 danger, 25-44 warning, etc.) already in use |

**Key insight:** Every component and pattern needed for Phase 2 already exists in the codebase, proven working in the org dashboard. The primary task is composition (arranging components with correct props) not creation (building new components). Copy the org dashboard layout structure exactly — don't approximate.

---

## Common Pitfalls

### Pitfall 1: Gauge Shows Wrong Value (Not Matching Member Average)
**What goes wrong:** Gauge displays 52 (hardcoded) but member average is 67
**Why it happens:** Not calculating team gauge value from member data, using hardcoded default
**How to avoid:** Calculate `teamGaugeValue = Math.round(members.reduce((sum, m) => sum + m.performanceValue, 0) / members.length)` before passing to GaugeSection
**Warning signs:** Gauge doesn't update when member data changes; gauge value doesn't validate member mock aggregation

### Pitfall 2: Metric Card Counts Don't Add Up
**What goes wrong:** Sum of all metric card counts ≠ total typeDistribution values across members
**Why it happens:** Using wrong counting method (e.g., counting primary category only instead of summing all typeDistribution fields)
**How to avoid:** Sum typeDistribution fields: `totals.star = member1.typeDistribution.star + member2.typeDistribution.star + ...` (each member contributes their fractional composition to each category)
**Warning signs:** Card counts sum to 6 (one per member) instead of 180 (6 members × 30 distribution points each)

### Pitfall 3: Layout Doesn't Match Org Dashboard Visually
**What goes wrong:** Spacing looks "off," components don't align properly
**Why it happens:** Approximating CSS classes instead of copying exactly from org dashboard
**How to avoid:** Copy-paste layout structure from `app/org/[orgId]/page.tsx` (lines 28-62) and only change component names and data props
**Warning signs:** Gap between gauge and insights differs; metric card grid has different gaps; table heading spacing wrong

### Pitfall 4: Insights Are Too Generic (No Member Names)
**What goes wrong:** Insights say "3 star performers" without naming them
**Why it happens:** Following org dashboard pattern too closely (org insights don't name teams individually)
**How to avoid:** Generate insights with member names: "Alice Chen and Bob Martinez are star performers" not "2 star performers detected"
**Warning signs:** User feedback that insights lack personalization; no specific actionable information

### Pitfall 5: Metric Cards Are Interactive (Click to Filter)
**What goes wrong:** Clicking "Star" card filters table to show only star performers
**Why it happens:** Adding interactivity assuming users want it (natural UX pattern)
**How to avoid:** User explicitly stated "cards are informational only, do not filter the table on click" — leave OverviewSummaryCard unchanged (no onClick handlers)
**Warning signs:** Confusion over which filter is active (card filter vs tab filter); conflicting filter states

### Pitfall 6: Creating New Helper File in Wrong Location
**What goes wrong:** Creating `lib/teamDashboard/metricCards.ts` and `lib/teamDashboard/insights.ts` separately
**Why it happens:** Organizing by feature type instead of by phase/functionality
**How to avoid:** Create single `lib/teamDashboard/overviewHelpers.ts` with all helper functions (calculateTeamGaugeValue, getMemberMetricCards, getMemberInsights) — keeps overview-related logic together
**Warning signs:** Too many small files; unclear where to add new overview helper functions later

---

## Code Examples

Verified patterns from existing codebase and application to Phase 2:

### Calculating Team Gauge Value from Members
```typescript
// NEW: app/org/[orgId]/team/[teamId]/page.tsx
"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { getMemberPerformanceRowsForTeam } from "@/lib/teamDashboard/overviewMockData";
import { getMemberMetricCards, getMemberInsights } from "@/lib/teamDashboard/overviewHelpers";
import { GaugeSection } from "@/components/dashboard/GaugeSection";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { OverviewSummaryCard } from "@/components/dashboard/OverviewSummaryCard";
import { MemberTable } from "@/components/dashboard/MemberTable";

export default function TeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  // Generate member data (Phase 1 function)
  const memberRows = useMemo(
    () => getMemberPerformanceRowsForTeam(52, teamId, 6),
    [teamId]
  );

  // Calculate team gauge value as average of member performance
  const teamGaugeValue = useMemo(() => {
    if (memberRows.length === 0) return 0;
    const sum = memberRows.reduce((acc, m) => acc + m.performanceValue, 0);
    return Math.round(sum / memberRows.length);
  }, [memberRows]);

  // Calculate metric cards by summing typeDistribution fields
  const metricCards = useMemo(() => getMemberMetricCards(memberRows), [memberRows]);

  // Generate insights with member names
  const insights = useMemo(() => getMemberInsights(memberRows), [memberRows]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            <h2 className="text-2xl font-semibold text-foreground">
              Overview
            </h2>

            <div className="flex flex-row gap-5">
              <GaugeSection
                gaugeValue={teamGaugeValue}
                labelVariant="performance"
              />
              <ChartInsights insights={insights} />
            </div>

            <div className="@container w-full">
              <div className="grid grid-cols-3 gap-4 @[1050px]:grid-cols-6">
                {metricCards.map((item) => (
                  <OverviewSummaryCard key={item.key} item={item} />
                ))}
              </div>
            </div>

            <section className="w-full" aria-labelledby="members-heading">
              <h2 id="members-heading" className="mb-4 text-2xl font-semibold text-foreground">
                Team Members
              </h2>
              <MemberTable rows={memberRows} />
            </section>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
```

### Metric Card Aggregation Helper
```typescript
// NEW: lib/teamDashboard/overviewHelpers.ts
import type { MemberPerformanceRow } from "./types";
import type { OverviewSummaryCardConfig, ChartInsight } from "@/lib/orgDashboard/types";

/** Base card config (same as org dashboard, but for members instead of teams) */
const BASE_CARD_CONFIG: Omit<OverviewSummaryCardConfig, "count">[] = [
  {
    key: "star",
    title: "Star",
    priority: "Optimal",
    descriptionLine1: "Low SPOF",
    descriptionLine2: "Skilled AI Builder",
    bg: "#D9F9E6",
    iconColor: "#55B685",
    badgeColor: "text-white bg-[#6BC095]"
  },
  {
    key: "time-bomb",
    title: "Time Bomb",
    priority: "P0",
    descriptionLine1: "High SPOF",
    descriptionLine2: "Unskilled Vibe Coder",
    bg: "#F9E3E2",
    iconColor: "#CA3A31",
    badgeColor: "text-white bg-[#CA3A31]"
  },
  {
    key: "key-player",
    title: "Key Role",
    priority: "P1",
    descriptionLine1: "High SPOF",
    descriptionLine2: "Skilled AI Builder",
    bg: "#FCEED8",
    iconColor: "#E87B35",
    badgeColor: "text-white bg-[#E87B35]"
  },
  {
    key: "bottleneck",
    title: "Bottleneck",
    priority: "P1",
    descriptionLine1: "High SPOF",
    descriptionLine2: "Manual Coder",
    bg: "#FCEED8",
    iconColor: "#E87B35",
    badgeColor: "text-white bg-[#E9A23B]"
  },
  {
    key: "risky",
    title: "Risky",
    priority: "P2",
    descriptionLine1: "Low SPOF",
    descriptionLine2: "Unskilled Vibe Coder",
    bg: "#FCF3CC",
    iconColor: "#E9A23B",
    badgeColor: "text-white bg-[#E9A23B]"
  },
  {
    key: "stable",
    title: "Legacy",
    priority: "P3",
    descriptionLine1: "Low SPOF",
    descriptionLine2: "Manual Coder",
    bg: "#FDF9C9",
    iconColor: "#E2B53E",
    badgeColor: "text-white bg-[#E2B53E]"
  },
];

const CARD_KEY_TO_DIST_KEY: (keyof MemberPerformanceRow["typeDistribution"])[] = [
  "star", "timeBomb", "keyRole", "bottleneck", "risky", "legacy",
];

/**
 * Generate metric cards by summing typeDistribution fields across all members.
 * Matches org dashboard pattern: getOverviewSummaryCardsForGauge().
 */
export function getMemberMetricCards(members: MemberPerformanceRow[]): OverviewSummaryCardConfig[] {
  const totals = { star: 0, timeBomb: 0, keyRole: 0, bottleneck: 0, risky: 0, legacy: 0 };

  for (const member of members) {
    totals.star += member.typeDistribution.star;
    totals.timeBomb += member.typeDistribution.timeBomb;
    totals.keyRole += member.typeDistribution.keyRole;
    totals.bottleneck += member.typeDistribution.bottleneck;
    totals.risky += member.typeDistribution.risky;
    totals.legacy += member.typeDistribution.legacy;
  }

  return BASE_CARD_CONFIG.map((base, i) => ({
    ...base,
    count: totals[CARD_KEY_TO_DIST_KEY[i]],
  }));
}

/**
 * Generate team composition insights mentioning specific member names.
 * Static for Phase 2 (validates UI, faster implementation).
 */
export function getMemberInsights(members: MemberPerformanceRow[]): ChartInsight[] {
  if (members.length === 0) return [];

  const insights: ChartInsight[] = [];

  // Find primary category for each member (highest typeDistribution value)
  const categoryCounts = { star: 0, timeBomb: 0, risky: 0, bottleneck: 0, keyRole: 0, legacy: 0 };
  const categoryMembers: Record<string, string[]> = {
    star: [], timeBomb: [], risky: [], bottleneck: [], keyRole: [], legacy: []
  };

  for (const member of members) {
    const dist = member.typeDistribution;
    const entries = Object.entries(dist) as [keyof typeof dist, number][];
    const maxEntry = entries.reduce((max, entry) => entry[1] > max[1] ? entry : max, entries[0]);
    const maxKey = maxEntry[0];
    categoryCounts[maxKey]++;
    categoryMembers[maxKey].push(member.memberName);
  }

  // Star performers insight (personalized with names)
  if (categoryCounts.star > 0) {
    const names = categoryMembers.star.slice(0, 2).join(" and ");
    insights.push({
      id: "stars",
      text: `${categoryCounts.star} star performer${categoryCounts.star > 1 ? 's' : ''} (${names}) are driving high performance with low SPOF risk.`
    });
  }

  // Time bomb warning (personalized with names)
  if (categoryCounts.timeBomb > 0) {
    const names = categoryMembers.timeBomb.slice(0, 1).join(", ");
    insights.push({
      id: "timebombs",
      text: `${categoryCounts.timeBomb} time bomb${categoryCounts.timeBomb > 1 ? 's' : ''} detected${names ? ` including ${names}` : ''} — high SPOF risk with low skill level.`
    });
  }

  // Risky members insight
  if (categoryCounts.risky > 0) {
    insights.push({
      id: "risky",
      text: `${categoryCounts.risky} risky member${categoryCounts.risky > 1 ? 's' : ''} require upskilling to reduce vibe coding patterns.`
    });
  }

  // Top performers summary
  const topPerformers = members.filter(m => m.performanceValue >= 75);
  if (topPerformers.length > 0) {
    insights.push({
      id: "topperformers",
      text: `${topPerformers.length} member${topPerformers.length > 1 ? 's' : ''} achieving "Extreme Outperforming" status (75+) this period.`
    });
  }

  return insights.slice(0, 4); // Display 3-4 items (matches org dashboard pattern)
}

/**
 * Calculate team gauge value as average of member performance values.
 * Validates that member mocks aggregate correctly to team level.
 */
export function calculateTeamGaugeValue(members: MemberPerformanceRow[]): number {
  if (members.length === 0) return 0;
  const sum = members.reduce((acc, m) => acc + m.performanceValue, 0);
  return Math.round(sum / members.length);
}
```

### Understanding typeDistribution Aggregation
```typescript
// Example: How typeDistribution summing works

// Member 1: Alice (high performer)
const alice: MemberPerformanceRow = {
  performanceValue: 85,
  typeDistribution: { star: 10, timeBomb: 0, keyRole: 8, bottleneck: 0, risky: 1, legacy: 11 },
  // ... other fields
};

// Member 2: Bob (low performer)
const bob: MemberPerformanceRow = {
  performanceValue: 35,
  typeDistribution: { star: 2, timeBomb: 15, keyRole: 3, bottleneck: 5, risky: 3, legacy: 2 },
  // ... other fields
};

// Aggregating metric cards:
const totals = { star: 0, timeBomb: 0, keyRole: 0, bottleneck: 0, risky: 0, legacy: 0 };
totals.star += alice.typeDistribution.star;      // 0 + 10 = 10
totals.star += bob.typeDistribution.star;        // 10 + 2 = 12

totals.timeBomb += alice.typeDistribution.timeBomb;  // 0 + 0 = 0
totals.timeBomb += bob.typeDistribution.timeBomb;    // 0 + 15 = 15

// Final card counts:
// Star card: count = 12 (sum of fractional star contributions)
// Time Bomb card: count = 15 (sum of fractional time bomb contributions)

// This is NOT counting "how many members are primarily stars" (would be 0 or 1)
// This IS counting "total star composition across team" (fractional aggregation)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Calculate averages in components | Calculate in page/container component, pass to pure presentation components | React 16.8+ (Hooks, 2019) | Better separation of concerns; components reusable with any data source |
| Hardcoded gauge values in page | Derive gauge from data source (validates aggregation) | Current codebase pattern | Ensures visual matches data; validates mock data correctness |
| Generic insights without personalization | Name-specific insights for individual-level dashboards | [Dashboard personalization trends 2026](https://www.fanruan.com/en/blog/top-admin-dashboard-design-ideas-inspiration) | Higher engagement; actionable information |
| Fixed layout components | Container queries for responsive layouts | [Tailwind 3.2+ @container](https://tailwindcss.com/docs/container-queries) | Better responsive behavior without breakpoints; used in org dashboard |
| Each tab has separate layout | Consistent layout across tabs for visual rhythm | Current codebase UX pattern | Users recognize patterns; reduced cognitive load |

**Current best practices (2026):**
- **Dashboard layouts:** Grid-based with container queries for responsiveness ([React Dashboard Layout](https://www.syncfusion.com/react-components/react-dashboard-layout), [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout))
- **Metric cards:** Use existing card components unchanged; count by domain-specific aggregation logic
- **Performance visualization:** D3-based gauges with animation for dynamic feel
- **Insights personalization:** Mention specific entity names (members, teams) for actionable insights ([Personalization Reporting](https://www.dynamicyield.com/blog/personalization-reporting/))

**Deprecated/outdated:**
- Manual layout with fixed pixel widths: Replaced by CSS Grid + container queries
- Component-level data fetching/calculation: Moved to page/container level with React Server Components
- Generic insights without entity names: Replaced by personalized insights mentioning specific members

---

## Open Questions

Things that couldn't be fully resolved:

1. **Member mock data correctness validation**
   - What we know: Phase 1 created getMemberPerformanceRowsForTeam() which generates members with offsets summing to 0 (so average ≈ teamValue)
   - What's unclear: Whether Phase 1 implementation actually produces correct aggregation (needs manual verification)
   - Recommendation: After implementing gauge calculation, verify gauge value matches member average within 5% tolerance; if not, adjust member mock generator offsets

2. **Card order definition source**
   - What we know: User wants "card order matches org dashboard order exactly"
   - What's confirmed: Org dashboard uses order [Star, Time Bomb, Key Role, Bottleneck, Risky, Legacy] (from BASE_CARD_CONFIG array order in overviewMockData.ts)
   - Recommendation: Use same BASE_CARD_CONFIG order for member cards (already shown in code examples above)

3. **Insights tone and style**
   - What we know: User wants "team composition insights" with member names, "3-4 insight items"
   - What's unclear: Exact tone (formal vs casual), whether to include recommendations ("Consider upskilling Alice") or just observations
   - Recommendation: Use observational tone matching org dashboard insights (factual statements without recommendations); save recommendations for future AI features

---

## Sources

### Primary (HIGH confidence)
- Existing codebase:
  - `app/org/[orgId]/page.tsx` — Org dashboard layout reference (lines 28-62)
  - `components/dashboard/D3Gauge.tsx` — Gauge component API (lines 20-33)
  - `components/dashboard/OverviewSummaryCard.tsx` — Metric card component
  - `components/dashboard/ChartInsights.tsx` — Insights panel component
  - `lib/orgDashboard/overviewMockData.ts` — Metric card aggregation pattern (lines 107-122)
  - `lib/teamDashboard/overviewMockData.ts` — Member mock generator (Phase 1)
  - `lib/teamDashboard/types.ts` — MemberPerformanceRow type (Phase 1)

### Secondary (MEDIUM confidence)
- [React Dashboard Layout - Syncfusion](https://www.syncfusion.com/react-components/react-dashboard-layout) — Grid-based dashboard layout patterns
- [react-grid-layout - GitHub](https://github.com/react-grid-layout/react-grid-layout) — Draggable/resizable grid layout library
- [Top Admin Dashboard Design Ideas for 2026](https://www.fanruan.com/en/blog/top-admin-dashboard-design-ideas-inspiration) — Real-time data visualization, AI-driven insights trends
- [Top 10 Employee Performance Dashboard Examples for 2026](https://www.fanruan.com/en/blog/top-10-employee-performance-dashboard-examples) — Performance metrics visualization patterns
- [Personalization Reporting – Insights to help drive experimentation](https://www.dynamicyield.com/blog/personalization-reporting/) — Personalized dashboard insights best practices

### Tertiary (LOW confidence)
- [D3 Gauge Chart · GitHub](https://gist.github.com/kurotanshi/cb778c1c563e31f6997808ca3b93bf89) — D3 gauge implementation examples (generic, not specific to this codebase)
- [Building Customizable Dashboard Widgets Using React Grid Layout | Medium](https://medium.com/@antstack/building-customizable-dashboard-widgets-using-react-grid-layout-234f7857c124) — Dashboard widget patterns (general guidance, not project-specific)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All components exist in codebase, proven working in org dashboard
- Architecture patterns: HIGH — Exact layout CSS classes documented from org dashboard page.tsx
- Metric card aggregation: HIGH — Pattern verified in getOverviewSummaryCardsForGauge() function
- Layout matching: HIGH — Org dashboard serves as canonical reference with exact CSS classes
- Insights generation: MEDIUM — User requirements clear (static, member names, 3-4 items) but exact tone/content is planner's discretion

**Research date:** 2026-02-06
**Valid until:** 30 days (stable patterns — layout and component APIs unlikely to change)
