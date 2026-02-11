# Page Rendering Flow

Complete guide to how pages are built and rendered.

## 🎬 Overview

When a user visits a dashboard page, here's what happens:

```
User visits URL
  ↓
Next.js Router matches route
  ↓
Server Component loads (page.tsx)
  ↓
Layouts wrap content (nested)
  ↓
Client Component hydrates
  ↓
Hooks fetch/generate data
  ↓
Components render with data
  ↓
Charts/Tables display
  ↓
User sees complete page
```

## 📊 Example: Team Performance Page

Let's trace exactly how `/org/1/team/2/performance` renders.

### Step 1: Route Matching

```
URL: /org/1/team/2/performance
  ↓
Matches: app/org/[orgId]/team/[teamId]/performance/page.tsx
Params: { orgId: "1", teamId: "2" }
```

### Step 2: Server Component Execution

**File**: `app/org/[orgId]/team/[teamId]/performance/page.tsx`

```typescript
// Runs on SERVER
export default async function TeamPerformancePage({
  params
}: {
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  // 1. Await params
  const { orgId, teamId } = await params;

  // 2. Return client component
  return <TeamPerformancePageClient teamId={teamId} orgId={orgId} />;
}
```

**What happens**:
- ✅ Executes on server
- ✅ No bundle size impact
- ✅ SEO friendly (pre-rendered HTML)
- ✅ Could fetch server-side data here (future)

### Step 3: Layout Wrapping

The page is wrapped by **3 nested layouts**:

```typescript
// 1. Root Layout (app/layout.tsx)
<html>
  <body>
    <TimeRangeProvider>
      {/* 2. Org Layout (app/org/[orgId]/layout.tsx) */}
      <div className="flex">
        <DashboardSidebar />
        <main>
          {/* 3. Team Layout (app/org/[orgId]/team/[teamId]/layout.tsx) */}
          <Breadcrumbs />
          {/* 4. Page Component */}
          <TeamPerformancePageClient />
        </main>
      </div>
    </TimeRangeProvider>
  </body>
</html>
```

### Step 4: Client Component Hydration

**File**: `components/dashboard/pages/TeamPerformancePageClient.tsx`

```typescript
"use client";  // Runs in BROWSER

import { useTeamPerformanceData } from "@/lib/dashboard/entities/member/hooks/useTeamPerformanceData";

export function TeamPerformancePageClient({ teamId, orgId }) {
  // 1. Get time range from context
  const { timeRange } = useTimeRange();

  // 2. Get route params from context
  const params = useRouteParams();

  // 3. Fetch/generate data with hook
  const {
    members,
    membersWithDelta,
    sampledData,
    gaugeValue,
    insights
  } = useTeamPerformanceData(teamId, timeRange);

  // 4. Filter state
  const [activeFilter, setActiveFilter] = useState<PerformanceFilter>("all");

  // 5. Calculate derived state
  const teamPerformanceValue = useMemo(() => {
    return calculateTeamPerformanceValue(members);
  }, [members]);

  // 6. Render UI
  return (
    <DashboardLayout>
      <GaugeSection value={gaugeValue} />
      <PerformanceChart data={sampledData} />
      <PerformanceTable data={membersWithDelta} />
    </DashboardLayout>
  );
}
```

**What happens**:
- ✅ Hydrates in browser
- ✅ Can use React hooks
- ✅ Interactive (clicks, filters, state)

### Step 5: Data Hook Execution

**File**: `lib/dashboard/entities/member/hooks/useTeamPerformanceData.ts`

```typescript
export function useTeamPerformanceData(teamId: string, timeRange: TimeRangeKey) {
  // 1. Generate member rows (memoized)
  const members = useMemo(() => {
    const rows = getMemberPerformanceRowsForTeam(52, teamId, 6);
    return addPerformanceMetrics(rows, teamId);
  }, [teamId]);

  // 2. Generate time series data
  const rawData = useMemo(
    () => generateMemberPerformanceTimeSeries(members),
    [members]
  );

  // 3. Apply time range filtering
  const timeFilteredData = useMemo(
    () => filterByTimeRange(rawData, timeRange),
    [rawData, timeRange]
  );

  // 4. Apply smart sampling (for performance)
  const sampledData = useMemo(
    () => smartSample(timeFilteredData),
    [timeFilteredData]
  );

  // 5. Calculate insights
  const insights = useMemo(
    () => getPerformanceInsights(members, sampledData, timeRange),
    [members, sampledData, timeRange]
  );

  // 6. Return all processed data
  return {
    members,
    membersWithDelta,
    rawData,
    sampledData,
    gaugeValue,
    insights
  };
}
```

**What happens**:
- ✅ Calls mock data generators
- ✅ Processes data (filters, transforms)
- ✅ Memoizes expensive calculations
- ✅ Returns structured data

### Step 6: Component Tree Rendering

```typescript
<TeamPerformancePageClient>
  ├─ <Card> (Gauge Section)
  │   └─ <GaugeWithInsights
  │       value={gaugeValue}
  │       insights={insights}
  │     />
  │       └─ <D3Gauge />  {/* D3 chart */}
  │
  ├─ <Card> (Performance Chart)
  │   └─ <PerformanceChart data={sampledData} />
  │       └─ <PerformanceChartSVG />  {/* Custom SVG */}
  │
  └─ <Card> (Performance Table)
      └─ <BaseTeamsTable
          data={membersWithDelta}
          columns={PERFORMANCE_MEMBER_COLUMNS}
        />
          └─ <Table>  {/* shadcn/ui */}
```

### Step 7: Data Binding

Each component receives data:

```typescript
// Gauge
<GaugeWithInsights
  value={75}  // From hook: gaugeValue
  insights={[
    { label: "Top Performer", value: "Alice" },
    { label: "Team Average", value: "75" }
  ]}
/>

// Chart
<PerformanceChart
  data={[
    { date: "2024-01-01", value: 70 },
    { date: "2024-01-08", value: 72 },
    { date: "2024-01-15", value: 75 },
  ]}
/>

// Table
<BaseTeamsTable
  data={[
    { memberName: "Alice", performanceValue: 85, delta: +5 },
    { memberName: "Bob", performanceValue: 72, delta: -2 },
  ]}
/>
```

## 🔄 Detailed Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User navigates to /org/1/team/2/performance              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Next.js Server                                            │
│    - Matches route                                           │
│    - Loads page.tsx (Server Component)                       │
│    - Executes: await params                                  │
│    - Returns: <TeamPerformancePageClient />                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Layout System                                             │
│    RootLayout (contexts, styles)                             │
│      └─> OrgLayout (sidebar)                                 │
│          └─> TeamLayout (breadcrumbs)                        │
│              └─> TeamPerformancePageClient                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. HTML Sent to Browser                                      │
│    - Pre-rendered static HTML                                │
│    - Includes placeholders for client components             │
│    - Includes JavaScript bundles                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Browser Hydration                                         │
│    - JavaScript executes                                     │
│    - React components "hydrate" (attach to HTML)             │
│    - Event listeners attached                                │
│    - State initialized                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Data Hook Execution                                       │
│    useTeamPerformanceData(teamId, timeRange)                 │
│      ├─> getMemberPerformanceRowsForTeam()                   │
│      ├─> generateMemberPerformanceTimeSeries()               │
│      ├─> filterByTimeRange()                                 │
│      ├─> smartSample()                                       │
│      └─> getPerformanceInsights()                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Component Rendering                                       │
│    <GaugeWithInsights /> ─── D3 renders gauge                │
│    <PerformanceChart /> ──── SVG renders chart               │
│    <BaseTeamsTable /> ────── Table renders rows              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Interactive Page                                          │
│    - User can filter table                                   │
│    - User can change time range                              │
│    - Charts respond to interactions                          │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Component Lifecycle

### Initial Render

```typescript
1. Component mounts
   └─> useTeamPerformanceData() executes
       └─> useMemo() creates data
           └─> Component renders with data

2. Effects run (if any)
   └─> useEffect(() => { ... }, [])

3. Layout effects run
   └─> useLayoutEffect(() => { ... }, [])

4. Browser paints
   └─> User sees content
```

### Re-render on State Change

```typescript
1. User clicks filter button
   └─> setActiveFilter("high-performers")

2. State updates
   └─> Component re-renders

3. Memoized calculations check dependencies
   └─> filteredData recalculates (dependency changed)
   └─> otherData uses cached value (dependency unchanged)

4. Child components re-render with new props
   └─> Table updates rows

5. Browser re-paints
   └─> User sees filtered data
```

### Re-render on Context Change

```typescript
1. User changes time range (global state)
   └─> setTimeRange("30d")

2. TimeRangeContext updates
   └─> All consumers re-render

3. Hook dependencies update
   └─> useTeamPerformanceData(teamId, timeRange)  // new timeRange
       └─> timeFilteredData recalculates

4. Components re-render with new data
   └─> Chart shows last 30 days

5. Browser re-paints
```

## 🎯 Data Flow Patterns

### Pattern 1: Mock Data Generation

```
Mock Generator Function
  ↓
React Hook (useMemo)
  ↓
Component Props
  ↓
Rendered UI
```

**Example**:
```typescript
// 1. Mock generator
export function generateTeamMembers(count: number) {
  return Array.from({ length: count }, () => ({
    name: faker.name(),
    performance: Math.random() * 100
  }));
}

// 2. Hook with memoization
export function useTeamData() {
  const members = useMemo(() => generateTeamMembers(50), []);
  return { members };
}

// 3. Component rendering
export function TeamTable() {
  const { members } = useTeamData();
  return <Table data={members} />;
}
```

### Pattern 2: Derived State

```
Base Data
  ↓
Processing (useMemo)
  ↓
Derived Data
  ↓
Component
```

**Example**:
```typescript
const members = useTeamData();  // Base data

const topPerformers = useMemo(() => {
  return members
    .filter(m => m.performance > 80)
    .sort((a, b) => b.performance - a.performance);
}, [members]);  // Recalculates only when members change

return <TopPerformersTable data={topPerformers} />;
```

### Pattern 3: Context Propagation

```
Context Provider (top level)
  ↓
Consumer Component (any level)
  ↓
Access Context Value
  ↓
Use in Rendering
```

**Example**:
```typescript
// Provider (in layout)
<TimeRangeProvider>
  <DashboardPages />
</TimeRangeProvider>

// Consumer (deep in tree)
function PerformanceChart() {
  const { timeRange } = useTimeRange();  // Access context
  const data = filterByTimeRange(rawData, timeRange);
  return <Chart data={data} />;
}
```

## 🔄 Update Cycles

### User Interaction Update

```
1. User clicks button
   ↓
2. Event handler fires
   ↓
3. setState() called
   ↓
4. React schedules update
   ↓
5. Component re-renders
   ↓
6. Virtual DOM diff
   ↓
7. DOM updates (only changes)
   ↓
8. Browser paints
```

### Time Range Change Update

```
1. User selects "30 days" in dropdown
   ↓
2. TimeRangeContext.setTimeRange("30d")
   ↓
3. All useTimeRange() consumers notified
   ↓
4. Multiple components re-render
   ├─> PerformanceChart (filters data to 30d)
   ├─> PerformanceTable (recalculates metrics)
   └─> Insights (updates statistics)
   ↓
5. DOM updates
   ↓
6. User sees 30-day data across all components
```

## ⚡ Performance Optimizations

### 1. Memoization

```typescript
// ❌ Bad: Recalculates every render
const filtered = data.filter(item => item.active);

// ✅ Good: Memoized
const filtered = useMemo(
  () => data.filter(item => item.active),
  [data]  // Only recalculate when data changes
);
```

### 2. Component Splitting

```typescript
// ❌ Bad: Heavy component re-renders everything
function DashboardPage() {
  const [filter, setFilter] = useState("");
  return (
    <>
      <HeavyChart />  {/* Re-renders on every filter change */}
      <FilterInput value={filter} onChange={setFilter} />
    </>
  );
}

// ✅ Good: Split into separate components
function DashboardPage() {
  return (
    <>
      <HeavyChart />  {/* Doesn't re-render */}
      <FilterSection />  {/* Only this re-renders */}
    </>
  );
}
```

### 3. Lazy Loading

```typescript
// Heavy components loaded only when needed
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />
});
```

### 4. Smart Sampling

```typescript
// Reduce data points for charts
export function smartSample(data: DataPoint[]) {
  if (data.length <= 100) return data;

  // Sample every Nth point
  const step = Math.ceil(data.length / 100);
  return data.filter((_, i) => i % step === 0);
}
```

## 🐛 Debugging Rendering

### Log Renders

```typescript
function MyComponent() {
  console.log("MyComponent rendered");

  useEffect(() => {
    console.log("MyComponent mounted/updated");
  });

  return <div>...</div>;
}
```

### Track Prop Changes

```typescript
function useWhyDidYouUpdate(name: string, props: any) {
  const previousProps = useRef(props);

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};

      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log("[why-did-you-update]", name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// Usage
useWhyDidYouUpdate("MyComponent", props);
```

### React DevTools

1. Install React DevTools extension
2. Open DevTools > Components tab
3. Select component
4. View:
   - Props
   - State
   - Hooks
   - Render count

---

**Next**: [Dashboard Entities](./06-DASHBOARD-ENTITIES.md) to understand the entity system.
