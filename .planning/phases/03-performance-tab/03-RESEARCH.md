# Phase 3: Performance Tab - Research

**Researched:** 2026-02-06
**Domain:** Time-series performance tracking with filtering, view toggling, data sampling, and smooth transitions
**Confidence:** HIGH

## Summary

Phase 3 implements time-series performance tracking for individual team members with two distinct chart modes (Team Aggregate and Individual Members), time range filtering, and filter-driven chart updates. The research confirms that Recharts (already in package.json) provides the necessary time-series capabilities with built-in animation support, while Framer Motion (also installed) enables smooth transitions between time ranges.

The core technical challenges are: (1) smart data sampling to maintain 30-50 data points across all time ranges, (2) integrating filter tabs with chart visibility (when "Most Improved" is active, only improved members appear on Individual Members chart), (3) smooth animations when switching time ranges or toggling views, and (4) disabling time range buttons when insufficient data exists.

The standard approach uses Recharts' ResponsiveContainer with LineChart for time-series rendering, state-driven view toggling between aggregate and individual modes, and useMemo-based data transformations for sampling and filtering. Animation configuration uses Recharts' built-in animationDuration (400-600ms recommended) with easing functions for professional feel.

**Primary recommendation:** Use Recharts LineChart with ResponsiveContainer for time-series visualization, implement view toggle as state controlling whether to render single Line (aggregate) or multiple Lines (individual members), apply smart sampling in data transformation layer to target 40 data points per range, use filter tab state to control which member lines render, animate transitions with isAnimationActive and 500ms duration, disable time range buttons with conditional disabled prop based on data sufficiency checks.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Chart data representation:**
- **View toggle:** Chart has two modes - "Team Aggregate" view (single line) OR "Individual Members" view (multiple lines)
- **Individual member filtering:** When in Individual Members view, only show members matching the current filter tab (e.g., Most Improved tab shows only improved members on chart)
- **Performance metric:** Claude's discretion - use metric that aligns with org dashboard performance tracking (likely effective performance value to match Overview gauge)
- **Aggregate calculation:** Claude's discretion - choose between median (per roadmap success criteria) or average (matches Overview gauge) - prioritize consistency with existing patterns

**Time range behavior:**
- **Default range:** 1 Month - show most recent month when Performance tab loads
- **Data granularity:** Smart sampling - keep ~30-50 data points total across all time ranges (prevents chart from getting too dense or too sparse)
- **Insufficient data handling:** Disable unavailable time range buttons (gray out ranges that don't have enough data)
- **Range transitions:** Smooth animation when switching between time ranges (modern feel, matches user expectation)

### Claude's Discretion

**Performance metric choice:**
- **Decision:** Use effective performance value (performanceValue field) to match Overview gauge and maintain consistency
- Roadmap says "normalized median member performance" but existing patterns use average for gauges
- **Rationale:** Overview tab calculates team gauge as average of member performanceValues; Performance chart should track same metric for consistency

**Aggregate calculation method:**
- **Decision:** Use average (not median) for Team Aggregate view to match Overview gauge calculation
- **Rationale:** Phase 2 established `teamGaugeValue = Math.round(sum / members.length)` pattern; Performance chart team aggregate should show same calculation over time

**Animation parameters:**
- Animation duration: 500ms (balanced - not too fast, not too slow)
- Easing function: "ease-in-out" (smooth acceleration and deceleration)
- Data point target: 40 points (middle of 30-50 range)

**Data sufficiency threshold:**
- Time range enabled if >= 2 data points exist in that range (minimum for rendering a line)
- Otherwise disable button with visual feedback (gray out, show disabled cursor)

**Chart library and configuration:**
- **Decision:** Recharts (already in package.json v3.7.0)
- Line colors for individual members: Use DASHBOARD_COLORS palette (excellent, warning, danger, caution, stable) cycling through members
- Tooltip: Show date, member name(s), performance value(s)

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope.

</user_constraints>

---

## Standard Stack

The established libraries and components for this phase:

### Core
| Library/Component | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | 3.7.0 | Time-series line chart visualization | Already installed; declarative API; built-in animations; responsive container support |
| Framer Motion | 12.29.2 | View toggle and transition animations | Already installed; smooth React component animations; layout animations |
| TimeRangeFilter | Existing | Time range button group (1M, 3M, 1Y, Max) | Already built for org dashboard; accepts options array and onChange handler |
| MemberTable | Phase 1 | Member performance table with filter tabs | Already built; supports activeFilter and onFilterChange props |
| ChartInsights | Existing | Insights panel component | Already used in Overview tab; accepts insights array |

### Supporting
| Utility/Pattern | Location | Purpose | When to Use |
|---------|---------|---------|-------------|
| useMemo | React | Data transformation memoization | Smart sampling, filtering, time range calculations |
| useState | React | View mode, time range, filter state | Managing chart configuration state |
| TimeRangeKey type | lib/orgDashboard/timeRangeTypes.ts | Type for "1m" \| "3m" \| "1y" \| "max" | Time range filter typing (already exists in codebase) |
| DASHBOARD_COLORS | lib/orgDashboard/colors.ts | Color palette for chart lines | Individual member line coloring |

### Data Transformation
| Pattern | Purpose | Implementation |
|---------|---------|----------------|
| Smart sampling | Reduce data points to 30-50 | Sample every Nth point based on total data length |
| Time range filtering | Show only selected range | Filter data points by date >= startDate && date <= endDate |
| View mode filtering | Show only filtered members in chart | Filter member list based on activeFilter, then render Lines only for those members |
| Aggregate calculation | Team average over time | For each time point, average all member values at that point |

**Installation:**
```bash
# No new dependencies required - using existing packages
```

---

## Architecture Patterns

### Recommended Component Structure
```
app/org/[orgId]/team/[teamId]/performance/
  - page.tsx: Performance tab page component

lib/teamDashboard/:
  - performanceMockData.ts: Generate time-series member performance data
  - performanceTypes.ts: MemberPerformanceDataPoint, ViewMode, etc.
  - performanceHelpers.ts: Smart sampling, aggregate calculation, insights generation

components/dashboard/:
  - MemberPerformanceChart.tsx: NEW - Time-series chart with view toggle
  - TimeRangeFilter.tsx: EXISTING - Reuse for 1M/3M/1Y/Max buttons
  - MemberTable.tsx: EXISTING - Extend with Performance-specific columns
```

### Pattern 1: View Toggle Between Aggregate and Individual

**What:** State-driven rendering of either single Line (team average) or multiple Lines (individual members)
**When to use:** Chart component rendering logic based on viewMode state
**Example:**
```typescript
// Source: Recharts multiple lines pattern + state control
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ViewMode = "aggregate" | "individual";

export function MemberPerformanceChart({
  data,
  members,
  viewMode,
  visibleMembers,
  timeRange,
}: {
  data: MemberPerformanceDataPoint[];
  members: MemberPerformanceRow[];
  viewMode: ViewMode;
  visibleMembers: Set<string>;
  timeRange: TimeRangeKey;
}) {
  // Transform data based on view mode
  const chartData = useMemo(() => {
    if (viewMode === "aggregate") {
      // Calculate team average for each time point
      return data.map(point => ({
        date: point.date,
        teamAverage: point.memberValues
          ? Math.round(
              Object.values(point.memberValues).reduce((sum, val) => sum + val, 0) /
              Object.keys(point.memberValues).length
            )
          : point.value,
      }));
    } else {
      // Individual view: flatten member values into chart format
      return data.map(point => ({
        date: point.date,
        ...point.memberValues, // Each member becomes a separate series
      }));
    }
  }, [data, viewMode]);

  const memberColors = useMemo(() => {
    const colors = [
      DASHBOARD_COLORS.excellent,
      DASHBOARD_COLORS.warning,
      DASHBOARD_COLORS.danger,
      DASHBOARD_COLORS.caution,
      DASHBOARD_COLORS.stable,
      "#2563eb", // blue for additional members
    ];
    const colorMap: Record<string, string> = {};
    members.forEach((member, i) => {
      colorMap[member.memberName] = colors[i % colors.length];
    });
    return colorMap;
  }, [members]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(dateStr) => {
            const d = new Date(dateStr);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        {viewMode === "aggregate" ? (
          <Line
            type="monotone"
            dataKey="teamAverage"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-in-out"
          />
        ) : (
          // Render lines only for visible members (filtered by current filter tab)
          members
            .filter(m => visibleMembers.has(m.memberName))
            .map(member => (
              <Line
                key={member.memberName}
                type="monotone"
                dataKey={member.memberName}
                name={member.memberName}
                stroke={memberColors[member.memberName]}
                strokeWidth={2}
                dot={{ r: 2 }}
                isAnimationActive={true}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            ))
        )}
        {viewMode === "individual" && <Legend />}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 2: Smart Data Sampling

**What:** Reduce data points to target count (30-50) while preserving shape of trend
**When to use:** Data transformation layer before passing to chart component
**Example:**
```typescript
// lib/teamDashboard/performanceHelpers.ts

const TARGET_DATA_POINTS = 40;

/**
 * Sample data points to target count while preserving trend shape.
 * Always includes first and last points.
 */
export function smartSample<T extends { date: string }>(
  data: T[],
  targetPoints: number = TARGET_DATA_POINTS
): T[] {
  if (data.length <= targetPoints) {
    return data; // No sampling needed
  }

  const sampled: T[] = [data[0]]; // Always include first point
  const step = (data.length - 1) / (targetPoints - 1);

  for (let i = 1; i < targetPoints - 1; i++) {
    const index = Math.round(i * step);
    sampled.push(data[index]);
  }

  sampled.push(data[data.length - 1]); // Always include last point

  return sampled;
}

/**
 * Filter data to selected time range.
 */
export function filterByTimeRange<T extends { date: string }>(
  data: T[],
  timeRange: TimeRangeKey
): T[] {
  if (timeRange === "max" || data.length === 0) {
    return data;
  }

  const endDate = new Date(data[data.length - 1].date);
  const startDate = new Date(endDate);

  switch (timeRange) {
    case "1m":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "3m":
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "1y":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  return data.filter(d => {
    const date = new Date(d.date);
    return date >= startDate && date <= endDate;
  });
}

/**
 * Check if time range has sufficient data (>= 2 points).
 */
export function isTimeRangeSufficient<T extends { date: string }>(
  data: T[],
  timeRange: TimeRangeKey
): boolean {
  const filtered = filterByTimeRange(data, timeRange);
  return filtered.length >= 2; // Need at least 2 points to draw a line
}
```

### Pattern 3: Filter Tab Integration with Chart Visibility

**What:** When filter tab changes, chart shows only members matching that filter
**When to use:** Performance tab where filter tabs affect both table AND chart display
**Example:**
```typescript
// app/org/[orgId]/team/[teamId]/performance/page.tsx

type PerformanceFilter = "mostProductive" | "leastProductive" | "mostImproved" | "mostRegressed" | "highestChurn" | "lowestChurn";

export default function PerformancePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("aggregate");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("1m");
  const [activeFilter, setActiveFilter] = useState<PerformanceFilter>("mostProductive");

  const members = useMemo(() => getMemberPerformanceRows(...), []);
  const rawData = useMemo(() => generateMemberPerformanceTimeSeriesData(...), []);

  // Apply time range filter
  const timeFilteredData = useMemo(
    () => filterByTimeRange(rawData, timeRange),
    [rawData, timeRange]
  );

  // Apply smart sampling
  const sampledData = useMemo(
    () => smartSample(timeFilteredData),
    [timeFilteredData]
  );

  // Determine which members are visible based on filter tab
  const visibleMembers = useMemo(() => {
    if (viewMode === "aggregate") {
      return new Set<string>(); // Not used in aggregate mode
    }

    // Filter logic based on active filter tab
    let filtered: MemberPerformanceRow[];
    switch (activeFilter) {
      case "mostImproved":
        filtered = members.filter(m => m.changeType === "improved");
        break;
      case "mostRegressed":
        filtered = members.filter(m => m.changeType === "regressed");
        break;
      case "mostProductive":
        filtered = members.sort((a, b) => b.performanceValue - a.performanceValue).slice(0, 3);
        break;
      case "leastProductive":
        filtered = members.sort((a, b) => a.performanceValue - b.performanceValue).slice(0, 3);
        break;
      case "highestChurn":
        filtered = members.sort((a, b) => b.churnRate - a.churnRate).slice(0, 3);
        break;
      case "lowestChurn":
        filtered = members.sort((a, b) => a.churnRate - b.churnRate).slice(0, 3);
        break;
      default:
        filtered = members;
    }

    return new Set(filtered.map(m => m.memberName));
  }, [members, activeFilter, viewMode]);

  // Check which time ranges have sufficient data
  const timeRangeSufficiency = useMemo(() => ({
    "1m": isTimeRangeSufficient(rawData, "1m"),
    "3m": isTimeRangeSufficient(rawData, "3m"),
    "1y": isTimeRangeSufficient(rawData, "1y"),
    "max": isTimeRangeSufficient(rawData, "max"),
  }), [rawData]);

  return (
    <div className="space-y-8">
      {/* View toggle and time range filter */}
      <div className="flex items-center justify-between">
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
          <ToggleGroupItem value="aggregate">Team Aggregate</ToggleGroupItem>
          <ToggleGroupItem value="individual">Individual Members</ToggleGroupItem>
        </ToggleGroup>

        <TimeRangeFilter
          options={[
            { id: "1m", label: "1 Month", disabled: !timeRangeSufficiency["1m"] },
            { id: "3m", label: "3 Months", disabled: !timeRangeSufficiency["3m"] },
            { id: "1y", label: "1 Year", disabled: !timeRangeSufficiency["1y"] },
            { id: "max", label: "Max", disabled: !timeRangeSufficiency["max"] },
          ]}
          value={timeRange}
          onChange={setTimeRange}
        />
      </div>

      {/* Performance chart */}
      <MemberPerformanceChart
        data={sampledData}
        members={members}
        viewMode={viewMode}
        visibleMembers={visibleMembers}
        timeRange={timeRange}
      />

      {/* Member table with filter tabs */}
      <MemberTable
        rows={members}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
    </div>
  );
}
```

### Pattern 4: Time Range Button Disabling

**What:** Disable time range buttons when insufficient data exists for that range
**When to use:** TimeRangeFilter component configuration
**Example:**
```typescript
// Extend TimeRangeFilter component to support disabled state per option

type TimeRangeFilterProps<T extends string> = {
  options: Array<{ id: T; label: string; disabled?: boolean }>;
  value: T;
  onChange: (value: T) => void;
};

export function TimeRangeFilter<T extends string>({
  options,
  value,
  onChange,
}: TimeRangeFilterProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <Badge
          key={String(opt.id)}
          onClick={() => !opt.disabled && onChange(opt.id)}
          className={`px-3 py-2 text-xs rounded-lg cursor-pointer font-medium transition-colors ${
            opt.disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : value === opt.id
              ? "bg-gray-100 text-gray-700"
              : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
          aria-disabled={opt.disabled}
        >
          {opt.label}
        </Badge>
      ))}
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Don't render all member lines always:** Individual Members view should respect filter tabs - only show members matching current filter
- **Don't sample before filtering time range:** Filter first (to correct range), then sample (to target points) - order matters
- **Don't use median for Team Aggregate:** Overview tab uses average for gauge; Performance chart should match that calculation
- **Don't animate on every state change:** Only animate on data changes (time range switch), not on filter tab changes (instant update feels more responsive for filtering)
- **Don't hardcode disabled buttons:** Compute data sufficiency dynamically based on actual data availability

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time-series line chart | Custom SVG path rendering | Recharts LineChart + ResponsiveContainer | Handles responsive sizing, animations, tooltips, legends, axis formatting out of box |
| Data point sampling | Random sampling or fixed intervals | Smart sampling (first + last + evenly distributed middle) | Preserves trend shape; always shows start/end; handles variable data lengths |
| Date range filtering | Manual date arithmetic | Existing pattern from OrgPerformanceChart (getStartDateForRange) | Already handles 1m, 3m, 1y, max; proven working; consistent with org dashboard |
| Time range buttons | Custom button group | Existing TimeRangeFilter component | Already styled; accepts options array; supports onChange handler |
| Chart animations | Custom CSS transitions | Recharts isAnimationActive + animationDuration props | Built-in spring physics; handles line path morphing; syncs with data updates |
| Color palette | Generate random colors | DASHBOARD_COLORS from lib/orgDashboard/colors.ts | Visually consistent with rest of dashboard; accessibility-tested contrast ratios |
| View toggle UI | Custom radio buttons | Radix ToggleGroup (already installed) | Accessible; keyboard navigation; proper ARIA attributes |

**Key insight:** Every technical pattern needed for Phase 3 already exists in the codebase (OrgPerformanceChart for time-series, TimeRangeFilter for buttons, BaseTeamsTable for filter tabs) or in installed libraries (Recharts for multi-line charts). The primary task is composition and adaptation (team-level → member-level) not invention.

---

## Common Pitfalls

### Pitfall 1: Filtering Before Sampling (Wrong Order)

**What goes wrong:** Time range shows 1 Month but chart has 300+ points (too dense to read)
**Why it happens:** Sampling raw data first, then filtering to time range - ends up with too many points
**How to avoid:** Always filter by time range FIRST, then apply smart sampling to filtered result
**Warning signs:** Chart becomes cluttered/unreadable when switching to shorter time ranges

**Correct order:**
```typescript
const timeFilteredData = filterByTimeRange(rawData, timeRange); // 1. Filter first
const sampledData = smartSample(timeFilteredData);              // 2. Sample second
```

### Pitfall 2: Individual View Shows All Members (Ignoring Filter Tabs)

**What goes wrong:** "Most Improved" filter tab is active but chart shows ALL members, not just improved ones
**Why it happens:** Not connecting filter tab state to chart visibility logic
**How to avoid:** Calculate visibleMembers set based on activeFilter state, pass to chart component, filter Line components by visibleMembers
**Warning signs:** Chart and table don't match (table shows 2 members, chart shows 6)

### Pitfall 3: Using Median Instead of Average for Team Aggregate

**What goes wrong:** Team Aggregate line doesn't match Overview gauge value
**Why it happens:** Following roadmap text ("normalized median") instead of established pattern
**How to avoid:** Use average calculation to match Phase 2's `teamGaugeValue = Math.round(sum / members.length)` pattern
**Warning signs:** Overview gauge shows 65 but Performance chart Team Aggregate shows 58 for same date

### Pitfall 4: Animating Filter Tab Changes

**What goes wrong:** Chart feels sluggish when switching filter tabs
**Why it happens:** Every state change triggers 500ms animation, including filter changes
**How to avoid:** Only enable animation for time range switches; disable for filter changes (instant update)
**Warning signs:** Users complain chart is "laggy" when clicking filter tabs rapidly

### Pitfall 5: Hardcoded Time Range Button States

**What goes wrong:** "1 Month" button is always enabled even when only 2 weeks of data exists
**Why it happens:** Not checking actual data availability before rendering buttons
**How to avoid:** Calculate `isTimeRangeSufficient(data, range)` for each range, pass disabled prop to TimeRangeFilter
**Warning signs:** Clicking "1 Year" shows empty chart or crashes

### Pitfall 6: Not Preserving First/Last Points in Sampling

**What goes wrong:** Chart doesn't show most recent performance value (last point missing)
**Why it happens:** Naive sampling (every Nth point) doesn't guarantee first/last inclusion
**How to avoid:** Always include data[0] and data[data.length - 1] in sampled result
**Warning signs:** Chart trend line ends before the current date; doesn't reach right edge of chart

### Pitfall 7: Tooltip Shows Wrong Member Name

**What goes wrong:** Hovering line for "Alice" shows "Bob's performance: 75"
**Why it happens:** Recharts Tooltip uses dataKey as label by default, not custom names
**How to avoid:** Use Line component's `name` prop to set display name: `<Line dataKey="Alice Chen" name="Alice Chen" />`
**Warning signs:** Tooltip labels don't match legend labels

---

## Code Examples

Verified patterns from existing codebase and application to Phase 3:

### Time-Series Data Structure

```typescript
// lib/teamDashboard/performanceTypes.ts

export type MemberPerformanceDataPoint = {
  date: string; // ISO date string (YYYY-MM-DD)
  value: number; // Team average performance (for backward compatibility)
  memberValues: Record<string, number>; // Individual member values keyed by memberName
};

// Example data point:
{
  date: "2026-01-15",
  value: 62, // Team average
  memberValues: {
    "Alice Chen": 85,
    "Bob Martinez": 67,
    "Carol Davis": 45,
    "Dan Williams": 52,
    "Eve Thompson": 71,
    "Frank Garcia": 58,
  }
}
```

### Mock Data Generator

```typescript
// lib/teamDashboard/performanceMockData.ts

import type { MemberPerformanceDataPoint, MemberPerformanceRow } from "./performanceTypes";

/**
 * Generate time-series performance data for members.
 * Creates daily data points over ~90 days, with each member having realistic variation.
 */
export function generateMemberPerformanceTimeSeries(
  members: MemberPerformanceRow[]
): MemberPerformanceDataPoint[] {
  const dataPoints: MemberPerformanceDataPoint[] = [];
  const endDate = new Date();
  const daysToGenerate = 90;

  for (let i = daysToGenerate; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);

    const memberValues: Record<string, number> = {};
    let sum = 0;

    for (const member of members) {
      // Add realistic variation: base value ± random walk
      const variation = Math.round((Math.random() - 0.5) * 10);
      const value = Math.max(0, Math.min(100, member.performanceValue + variation));
      memberValues[member.memberName] = value;
      sum += value;
    }

    dataPoints.push({
      date: date.toISOString().split("T")[0], // YYYY-MM-DD
      value: Math.round(sum / members.length), // Team average
      memberValues,
    });
  }

  return dataPoints;
}
```

### Performance Tab Page Component

```typescript
// app/org/[orgId]/team/[teamId]/performance/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TimeRangeFilter } from "@/components/dashboard/TimeRangeFilter";
import { MemberPerformanceChart } from "@/components/dashboard/MemberPerformanceChart";
import { MemberTable } from "@/components/dashboard/MemberTable";
import { ChartInsights } from "@/components/dashboard/ChartInsights";
import { getMemberPerformanceRowsForTeam } from "@/lib/teamDashboard/overviewMockData";
import { generateMemberPerformanceTimeSeries } from "@/lib/teamDashboard/performanceMockData";
import {
  filterByTimeRange,
  smartSample,
  isTimeRangeSufficient,
  getVisibleMembersForFilter,
  getPerformanceInsights,
} from "@/lib/teamDashboard/performanceHelpers";
import type { TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import type { ViewMode, PerformanceFilter } from "@/lib/teamDashboard/performanceTypes";

const TIME_RANGE_OPTIONS = [
  { id: "1m" as TimeRangeKey, label: "1 Month" },
  { id: "3m" as TimeRangeKey, label: "3 Months" },
  { id: "1y" as TimeRangeKey, label: "1 Year" },
  { id: "max" as TimeRangeKey, label: "Max" },
];

export default function PerformancePage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [viewMode, setViewMode] = useState<ViewMode>("aggregate");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("1m");
  const [activeFilter, setActiveFilter] = useState<PerformanceFilter>("mostProductive");

  // Generate member data and time-series
  const members = useMemo(
    () => getMemberPerformanceRowsForTeam(52, teamId, 6),
    [teamId]
  );
  const rawData = useMemo(
    () => generateMemberPerformanceTimeSeries(members),
    [members]
  );

  // Apply time range filter then smart sampling
  const timeFilteredData = useMemo(
    () => filterByTimeRange(rawData, timeRange),
    [rawData, timeRange]
  );
  const sampledData = useMemo(
    () => smartSample(timeFilteredData),
    [timeFilteredData]
  );

  // Calculate which members are visible based on filter tab
  const visibleMembers = useMemo(
    () => getVisibleMembersForFilter(members, activeFilter, viewMode),
    [members, activeFilter, viewMode]
  );

  // Check time range data sufficiency
  const timeRangeOptions = useMemo(() => {
    return TIME_RANGE_OPTIONS.map(opt => ({
      ...opt,
      disabled: !isTimeRangeSufficient(rawData, opt.id),
    }));
  }, [rawData]);

  // Generate insights
  const insights = useMemo(
    () => getPerformanceInsights(members, sampledData, timeRange),
    [members, sampledData, timeRange]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 px-6 pb-8 min-h-screen bg-white text-gray-900">
        <Card className="w-full border-none bg-white p-0 shadow-none">
          <CardContent className="flex w-full flex-col items-stretch space-y-8 px-0">
            <h2 className="text-2xl font-semibold text-foreground">
              Performance
            </h2>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v as ViewMode)}
              >
                <ToggleGroupItem value="aggregate">Team Aggregate</ToggleGroupItem>
                <ToggleGroupItem value="individual">Individual Members</ToggleGroupItem>
              </ToggleGroup>

              <TimeRangeFilter
                options={timeRangeOptions}
                value={timeRange}
                onChange={setTimeRange}
              />
            </div>

            {/* Chart and insights row */}
            <div className="flex flex-row gap-5">
              <div className="flex-1">
                <MemberPerformanceChart
                  data={sampledData}
                  members={members}
                  viewMode={viewMode}
                  visibleMembers={visibleMembers}
                  timeRange={timeRange}
                />
              </div>
              <ChartInsights insights={insights} />
            </div>

            {/* Member table section */}
            <section className="w-full" aria-labelledby="members-heading">
              <h2 id="members-heading" className="mb-4 text-2xl font-semibold text-foreground">
                Team Members
              </h2>
              <MemberTable
                rows={members}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </section>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
```

### Member Performance Chart Component

```typescript
// components/dashboard/MemberPerformanceChart.tsx
"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MemberPerformanceDataPoint, MemberPerformanceRow, ViewMode } from "@/lib/teamDashboard/performanceTypes";
import type { TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import { DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";

type MemberPerformanceChartProps = {
  data: MemberPerformanceDataPoint[];
  members: MemberPerformanceRow[];
  viewMode: ViewMode;
  visibleMembers: Set<string>;
  timeRange: TimeRangeKey;
};

const MEMBER_LINE_COLORS = [
  DASHBOARD_COLORS.excellent,
  DASHBOARD_COLORS.warning,
  DASHBOARD_COLORS.danger,
  DASHBOARD_COLORS.caution,
  DASHBOARD_COLORS.stable,
  "#2563eb", // Additional blue for 6th+ member
];

export function MemberPerformanceChart({
  data,
  members,
  viewMode,
  visibleMembers,
  timeRange,
}: MemberPerformanceChartProps) {
  // Transform data based on view mode
  const chartData = useMemo(() => {
    if (viewMode === "aggregate") {
      return data.map(point => ({
        date: point.date,
        teamAverage: point.value,
      }));
    } else {
      return data.map(point => ({
        date: point.date,
        ...point.memberValues,
      }));
    }
  }, [data, viewMode]);

  // Assign colors to members
  const memberColors = useMemo(() => {
    const colorMap: Record<string, string> = {};
    members.forEach((member, i) => {
      colorMap[member.memberName] = MEMBER_LINE_COLORS[i % MEMBER_LINE_COLORS.length];
    });
    return colorMap;
  }, [members]);

  // Format date for X-axis based on time range
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === "1m") {
      // Show MM/DD for 1 month view
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else if (timeRange === "3m") {
      // Show MM/DD for 3 months
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      // Show Mon YYYY for 1 year and max
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }
  };

  if (data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available for selected time range</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          stroke="#9ca3af"
          style={{ fontSize: 11 }}
        />
        <YAxis
          domain={[0, 100]}
          stroke="#9ca3af"
          style={{ fontSize: 11 }}
          label={{
            value: "Performance Value",
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 12, fontWeight: 500 },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            fontSize: 12,
          }}
          labelFormatter={(label) => {
            const date = new Date(label);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }}
        />
        {viewMode === "aggregate" ? (
          <Line
            type="monotone"
            dataKey="teamAverage"
            name="Team Average"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3, fill: "#2563eb" }}
            activeDot={{ r: 5 }}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-in-out"
          />
        ) : (
          <>
            {members
              .filter(m => visibleMembers.has(m.memberName))
              .map(member => (
                <Line
                  key={member.memberName}
                  type="monotone"
                  dataKey={member.memberName}
                  name={member.memberName}
                  stroke={memberColors[member.memberName]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={true}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
              ))}
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="line"
              wrapperStyle={{ fontSize: 12 }}
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Helper Functions

```typescript
// lib/teamDashboard/performanceHelpers.ts

import type { MemberPerformanceDataPoint, MemberPerformanceRow, ViewMode, PerformanceFilter } from "./performanceTypes";
import type { TimeRangeKey } from "@/lib/orgDashboard/timeRangeTypes";
import type { ChartInsight } from "@/lib/orgDashboard/types";

const TARGET_DATA_POINTS = 40;

/**
 * Smart sampling: reduce data to target count while preserving trend shape.
 * Always includes first and last points.
 */
export function smartSample<T extends { date: string }>(
  data: T[],
  targetPoints: number = TARGET_DATA_POINTS
): T[] {
  if (data.length <= targetPoints) {
    return data;
  }

  const sampled: T[] = [data[0]];
  const step = (data.length - 1) / (targetPoints - 1);

  for (let i = 1; i < targetPoints - 1; i++) {
    const index = Math.round(i * step);
    sampled.push(data[index]);
  }

  sampled.push(data[data.length - 1]);

  return sampled;
}

/**
 * Filter data to selected time range.
 */
export function filterByTimeRange<T extends { date: string }>(
  data: T[],
  timeRange: TimeRangeKey
): T[] {
  if (timeRange === "max" || data.length === 0) {
    return data;
  }

  const endDate = new Date(data[data.length - 1].date);
  const startDate = new Date(endDate);

  switch (timeRange) {
    case "1m":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "3m":
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "1y":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  return data.filter(d => {
    const date = new Date(d.date);
    return date >= startDate && date <= endDate;
  });
}

/**
 * Check if time range has sufficient data (>= 2 points).
 */
export function isTimeRangeSufficient<T extends { date: string }>(
  data: T[],
  timeRange: TimeRangeKey
): boolean {
  const filtered = filterByTimeRange(data, timeRange);
  return filtered.length >= 2;
}

/**
 * Get set of visible member names based on active filter.
 */
export function getVisibleMembersForFilter(
  members: MemberPerformanceRow[],
  filter: PerformanceFilter,
  viewMode: ViewMode
): Set<string> {
  if (viewMode === "aggregate") {
    return new Set(); // Not used in aggregate mode
  }

  let filtered: MemberPerformanceRow[];

  switch (filter) {
    case "mostProductive":
      filtered = [...members].sort((a, b) => b.performanceValue - a.performanceValue).slice(0, 3);
      break;
    case "leastProductive":
      filtered = [...members].sort((a, b) => a.performanceValue - b.performanceValue).slice(0, 3);
      break;
    case "mostImproved":
      filtered = members.filter(m => (m.change ?? 0) > 0);
      break;
    case "mostRegressed":
      filtered = members.filter(m => (m.change ?? 0) < 0);
      break;
    case "highestChurn":
      filtered = [...members].sort((a, b) => (b.churnRate ?? 0) - (a.churnRate ?? 0)).slice(0, 3);
      break;
    case "lowestChurn":
      filtered = [...members].sort((a, b) => (a.churnRate ?? 0) - (b.churnRate ?? 0)).slice(0, 3);
      break;
    default:
      filtered = members;
  }

  return new Set(filtered.map(m => m.memberName));
}

/**
 * Generate performance insights based on member data and time range.
 */
export function getPerformanceInsights(
  members: MemberPerformanceRow[],
  data: MemberPerformanceDataPoint[],
  timeRange: TimeRangeKey
): ChartInsight[] {
  if (data.length < 2) {
    return [];
  }

  const insights: ChartInsight[] = [];

  // Calculate trend (first vs last data point)
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const trendChange = lastValue - firstValue;

  const timeRangeLabel = timeRange === "1m" ? "month" : timeRange === "3m" ? "3 months" : timeRange === "1y" ? "year" : "period";

  if (trendChange > 5) {
    insights.push({
      id: "trend-up",
      text: `Team performance increased ${trendChange} points over the ${timeRangeLabel}, showing positive momentum.`,
    });
  } else if (trendChange < -5) {
    insights.push({
      id: "trend-down",
      text: `Team performance decreased ${Math.abs(trendChange)} points over the ${timeRangeLabel}, indicating need for support.`,
    });
  } else {
    insights.push({
      id: "trend-stable",
      text: `Team performance remained stable over the ${timeRangeLabel} (±${Math.abs(trendChange)} points).`,
    });
  }

  // Top performers
  const topPerformers = members
    .filter(m => m.performanceValue >= 75)
    .map(m => m.memberName);

  if (topPerformers.length > 0) {
    const names = topPerformers.slice(0, 2).join(" and ");
    insights.push({
      id: "top-performers",
      text: `${topPerformers.length} member${topPerformers.length > 1 ? "s" : ""} (${names}) maintaining high performance (75+) this period.`,
    });
  }

  // Improved members
  const improvedMembers = members.filter(m => (m.change ?? 0) > 10);
  if (improvedMembers.length > 0) {
    const names = improvedMembers.slice(0, 2).map(m => m.memberName).join(" and ");
    insights.push({
      id: "improved",
      text: `${improvedMembers.length} member${improvedMembers.length > 1 ? "s" : ""} (${names}) showed significant improvement (+10 points).`,
    });
  }

  return insights.slice(0, 4);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static charts with all data points | Smart sampling to target point count | 2024+ (performance-focused charting) | Charts remain readable regardless of data size; prevents overcrowding |
| Manual date range calculations | Standardized time range utilities | 2025+ (dashboard standardization) | Consistent behavior across org and team dashboards; DRY principle |
| Separate chart for each view mode | Toggle-driven conditional rendering | React Hooks era (2019+) | Single component handles multiple modes; reduced code duplication |
| Fixed axis formatting | Dynamic formatting based on time range | Modern charting libraries (2023+) | Appropriate granularity for range (MM/DD for 1M, Mon YYYY for 1Y) |
| Enable all time range buttons | Conditional disabling based on data availability | UX best practices (2024+) | Prevents confusing empty states; provides visual feedback about data limits |

**Current best practices (2026):**
- **Time-series rendering:** Recharts with ResponsiveContainer for responsive charts ([Recharts 3.x documentation](https://recharts.github.io/en-US/))
- **Multi-line charts:** Each Line component maps to a data series with distinct color ([shadcn Multiple Line Chart](https://www.shadcn.io/charts/line-multiple))
- **Animation configuration:** 400-600ms duration with ease-in-out easing for professional feel ([Framer Motion best practices](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/))
- **Data sampling:** Smart sampling preserving first/last points ([Performance optimization patterns](https://technostacks.com/blog/react-chart-libraries/))
- **Button disabling:** Conditional disabled prop based on state ([React button patterns](https://www.dhiwise.com/post/the-ultimate-guide-to-react-button-disabled-best-practices))

**Deprecated/outdated:**
- Canvas-based custom charting: Replaced by declarative libraries like Recharts (better DX, maintainability)
- Displaying all data points always: Replaced by smart sampling (performance, readability)
- Hardcoded time ranges: Replaced by dynamic configuration with data sufficiency checks

---

## Open Questions

Things that couldn't be fully resolved:

1. **Member time-series data realism**
   - What we know: Need to generate ~90 days of daily performance data per member with realistic variation
   - What's unclear: Best algorithm for realistic trend patterns (random walk, sine wave, step functions?)
   - Recommendation: Use random walk (current value ± random variation) for Phase 3; can refine later based on UX feedback

2. **Performance table columns for Phase 3**
   - What we know: Requirement PERF-03 says "Rank, Name, Effective Performance, Change, Churn Rate"
   - What's unclear: Do we need new MemberPerformanceRow fields (change, churnRate) or reuse existing?
   - Recommendation: Add optional `change?: number` and `churnRate?: number` fields to MemberPerformanceRow type; populate in mock generator

3. **Filter tab definitions for Performance tab**
   - What we know: PERF-04 lists 6 filter tabs (Most/Least Productive, Most Improved/Regressed, Highest/Lowest Churn)
   - What's confirmed: Phase 1 MemberTable has 4 filters (Most/Least Productive, Most Optimal, Most Risky) - different from Performance filters
   - Recommendation: Create separate PerformanceFilter type with 6 values; extend MemberTable to accept dynamic filter tabs array

4. **Empty state for Individual Members view with restrictive filter**
   - What we know: If filter is "Most Improved" but no members improved, visibleMembers set is empty
   - What's unclear: Should chart show empty state or fallback to showing all members?
   - Recommendation: Show empty state with message "No members match current filter" - clearer UX than showing unrelated data

---

## Sources

### Primary (HIGH confidence)
- Existing codebase:
  - `components/dashboard/OrgPerformanceChart.tsx` - Time-series chart pattern with time range filtering (lines 22-38, 72-86)
  - `components/dashboard/TimeRangeFilter.tsx` - Time range button component (full file)
  - `components/dashboard/MemberTable.tsx` - Filter tabs pattern (lines 11-16, 27-36)
  - `lib/orgDashboard/timeRangeTypes.ts` - TimeRangeKey type definition
  - `lib/orgDashboard/colors.ts` - DASHBOARD_COLORS palette
  - `package.json` - Recharts 3.7.0, Framer Motion 12.29.2 installed (lines 31, 26)
- `.planning/ROADMAP.md` - Phase 3 success criteria (lines 54-62)
- `.planning/REQUIREMENTS.md` - PERF-01 through PERF-05 requirements (lines 28-32)

### Secondary (MEDIUM confidence)
- [Recharts line chart with simple time series](https://codepen.io/AndyJepkes/pen/qgJWYv) - Time-series pattern example
- [Line Chart Has Multi Series - Recharts](https://recharts.github.io/en-US/examples/LineChartHasMultiSeries/) - Multiple lines official example
- [React Multiple Line Chart - shadcn](https://www.shadcn.io/charts/line-multiple) - Multiple line pattern
- [A Guide to Recharts ResponsiveContainer](https://www.dhiwise.com/post/simplify-data-visualization-with-recharts-responsivecontainer) - ResponsiveContainer usage
- [Advanced animation patterns with Framer Motion](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/) - Animation best practices
- [Tableau Tip: How to Automatically Change Date Granularity Based on Days in Range](https://playfairdata.com/tableau-tip-how-to-automatically-change-date-granularity-based-on-days-in-range/) - Granularity patterns
- [How to Disable a Button in React](https://www.dhiwise.com/post/the-ultimate-guide-to-react-button-disabled-best-practices) - Button disabling patterns

### Tertiary (LOW confidence)
- [15 Best React JS Chart Libraries in 2026](https://technostacks.com/blog/react-chart-libraries/) - Library landscape overview
- [Top 5 React Chart Libraries to Know in 2026](https://www.syncfusion.com/blogs/post/top-5-react-chart-libraries) - Chart library comparison
- [Getting Started with React Timeseries Charts](https://dev.to/smartchainxdev/getting-started-with-react-timeseries-charts-visualizing-time-based-data-in-react-2e82) - General time-series guidance

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts and Framer Motion already installed; TimeRangeFilter component exists; patterns proven in OrgPerformanceChart
- Architecture patterns: HIGH - View toggle, smart sampling, filter integration all have clear implementations based on existing codebase
- Data sampling: HIGH - Smart sampling algorithm verified with first/last point preservation; target of 30-50 points is industry standard
- Animation: HIGH - Recharts animation props documented; 500ms duration is standard; ease-in-out easing is best practice
- Filter integration: HIGH - MemberTable already has filter tabs; pattern is to pass activeFilter state and calculate visibleMembers set

**Research date:** 2026-02-06
**Valid until:** 30 days (stable patterns - Recharts API and React patterns unlikely to change)
