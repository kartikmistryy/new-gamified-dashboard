# Data Flow & State Management

Understanding how data moves through the application and how state is managed.

## 🌊 Data Flow Overview

```
Mock Data Generator
  ↓
React Hook (Processing)
  ↓
Page Component
  ↓
Child Components
  ↓
Rendered UI
```

## 📊 Complete Data Flow Example

### Team Performance Page

```
1. User visits: /org/1/team/2/performance
   ↓
2. Next.js routes to: app/org/[orgId]/team/[teamId]/performance/page.tsx
   ↓
3. Server Component extracts params
   ↓
4. Returns: <TeamPerformancePageClient teamId="2" orgId="1" />
   ↓
5. Client Component calls: useTeamPerformanceData("2", timeRange)
   ↓
6. Hook calls mock generators:
   - getMemberPerformanceRowsForTeam(52, "2", 10)
   - generateMemberPerformanceTimeSeries(members)
   ↓
7. Hook processes data:
   - filterByTimeRange(rawData, timeRange)
   - smartSample(filteredData)
   - getPerformanceInsights(members, timeRange)
   ↓
8. Hook returns processed data to component
   ↓
9. Component renders with data:
   - <GaugeWithInsights value={gaugeValue} />
   - <PerformanceChart data={sampledData} />
   - <MemberTable data={members} />
   ↓
10. User sees rendered page
```

## 🎯 State Types

### 1. Server State (Route Params)

**Where**: URL parameters from Next.js routing

**Example**:
```typescript
// URL: /org/1/team/2/performance
// Params: { orgId: "1", teamId: "2" }

// In Server Component
export default async function TeamPage({ params }) {
  const { orgId, teamId } = await params;
  return <TeamPageClient orgId={orgId} teamId={teamId} />;
}

// In Client Component (via context)
import { useRouteParams } from "@/lib/dashboard/shared/contexts/RouteParamsProvider";

export function MyComponent() {
  const { orgId, teamId } = useRouteParams();
  // Use params
}
```

**When to use**: For entity IDs from URL

---

### 2. Global State (Context)

**Where**: React Context at app level

**Example - Time Range**:
```typescript
// Provider (app/layout.tsx)
<TimeRangeProvider>
  <DashboardPages />
</TimeRangeProvider>

// Consumer (any component)
import { useTimeRange } from "@/lib/dashboard/shared/contexts/TimeRangeContext";

export function PerformanceChart() {
  const { timeRange, setTimeRange } = useTimeRange();

  return (
    <div>
      <Select
        value={timeRange}
        onChange={(value) => setTimeRange(value)}
      >
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </Select>
      <Chart timeRange={timeRange} />
    </div>
  );
}
```

**Current global state**:
- `TimeRangeContext` - Selected time range (7d, 30d, 90d, etc.)
- `RouteParamsProvider` - Route parameters (orgId, teamId, etc.)

**When to use**: For state needed by many components across the tree

---

### 3. Local State (Component State)

**Where**: Individual component state with `useState`

**Example**:
```typescript
export function MemberTable({ data }) {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const filteredData = useMemo(() => {
    return data.filter(member => {
      if (filter === "all") return true;
      if (filter === "high") return member.performanceValue > 80;
      if (filter === "low") return member.performanceValue < 50;
      return true;
    });
  }, [data, filter]);

  return (
    <div>
      <FilterButtons
        activeFilter={filter}
        onFilterChange={setFilter}
      />
      <Table
        data={filteredData}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
    </div>
  );
}
```

**When to use**: For UI state that doesn't need to be shared (filters, modals, form inputs)

---

### 4. Derived State (Computed Values)

**Where**: Calculated from other state using `useMemo`

**Example**:
```typescript
export function TeamPerformancePageClient({ teamId }) {
  const { timeRange } = useTimeRange();

  // Base data
  const members = useMemo(
    () => getMemberPerformanceRowsForTeam(52, teamId, 10),
    [teamId]
  );

  // Derived: filtered by time range
  const filteredMembers = useMemo(
    () => filterByTimeRange(members, timeRange),
    [members, timeRange]
  );

  // Derived: top performers
  const topPerformers = useMemo(
    () => filteredMembers.filter(m => m.performanceValue > 80),
    [filteredMembers]
  );

  // Derived: team average
  const teamAverage = useMemo(
    () => filteredMembers.reduce((sum, m) => sum + m.performanceValue, 0) / filteredMembers.length,
    [filteredMembers]
  );

  return (
    <div>
      <p>Team Average: {teamAverage}</p>
      <TopPerformersTable data={topPerformers} />
    </div>
  );
}
```

**Why use `useMemo`?**
- Avoids recalculating on every render
- Only recalculates when dependencies change
- Performance optimization

---

### 5. Form State (User Input)

**Where**: Controlled inputs with `useState`

**Example**:
```typescript
export function MemberFilterForm() {
  const [nameFilter, setNameFilter] = useState("");
  const [performanceMin, setPerformanceMin] = useState(0);

  return (
    <form>
      <input
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
        placeholder="Filter by name"
      />
      <input
        type="number"
        value={performanceMin}
        onChange={(e) => setPerformanceMin(Number(e.target.value))}
        placeholder="Min performance"
      />
    </form>
  );
}
```

---

## 🔄 Data Flow Patterns

### Pattern 1: Mock Data → Hook → Component

```typescript
// 1. Mock Data Generator
// lib/dashboard/entities/member/mocks/performanceMockData.ts

export function getMemberPerformanceRowsForTeam(
  weeks: number,
  teamId: string,
  memberCount: number
): MemberPerformanceRow[] {
  return Array.from({ length: memberCount }, (_, i) => ({
    memberName: `Member ${i}`,
    performanceValue: Math.random() * 100,
    trend: Math.random() > 0.5 ? "up" : "down",
    teamId
  }));
}
```

```typescript
// 2. React Hook (Data Processing)
// lib/dashboard/entities/member/hooks/useTeamPerformanceData.ts

export function useTeamPerformanceData(teamId: string, timeRange: TimeRangeKey) {
  // Generate base data (memoized)
  const members = useMemo(
    () => getMemberPerformanceRowsForTeam(52, teamId, 10),
    [teamId]
  );

  // Process data (memoized)
  const processedData = useMemo(
    () => processMembers(members, timeRange),
    [members, timeRange]
  );

  return { members, processedData };
}
```

```typescript
// 3. Component (Rendering)
// components/dashboard/pages/TeamPerformancePageClient.tsx

export function TeamPerformancePageClient({ teamId }) {
  const { timeRange } = useTimeRange();
  const { members, processedData } = useTeamPerformanceData(teamId, timeRange);

  return (
    <div>
      <MemberTable data={members} />
      <PerformanceChart data={processedData} />
    </div>
  );
}
```

---

### Pattern 2: Context → Hook → Component

```typescript
// 1. Context Provider
// lib/dashboard/shared/contexts/TimeRangeContext.tsx

export function TimeRangeProvider({ children }) {
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("30d");

  return (
    <TimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
      {children}
    </TimeRangeContext.Provider>
  );
}
```

```typescript
// 2. Hook uses context
// lib/dashboard/entities/member/hooks/useTeamPerformanceData.ts

export function useTeamPerformanceData(teamId: string) {
  const { timeRange } = useTimeRange();  // Get from context

  const filteredData = useMemo(
    () => filterByTimeRange(rawData, timeRange),
    [rawData, timeRange]
  );

  return { filteredData };
}
```

```typescript
// 3. Component uses hook
// components/dashboard/pages/TeamPerformancePageClient.tsx

export function TeamPerformancePageClient({ teamId }) {
  const { filteredData } = useTeamPerformanceData(teamId);
  // timeRange is automatically used via hook

  return <Chart data={filteredData} />;
}
```

---

### Pattern 3: Props → State → Derived State

```typescript
export function MemberTable({
  data,  // Props (from parent)
  defaultFilter = "all"
}: {
  data: MemberPerformanceRow[];
  defaultFilter?: string;
}) {
  // Local state
  const [filter, setFilter] = useState(defaultFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Derived state (from props + local state)
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filter
    if (filter !== "all") {
      result = result.filter(m => m.category === filter);
    }

    // Apply sort
    result.sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      return direction * (a.performanceValue - b.performanceValue);
    });

    return result;
  }, [data, filter, sortDirection]);

  return (
    <div>
      <FilterSelect value={filter} onChange={setFilter} />
      <SortButton onClick={() => setSortDirection(d => d === "asc" ? "desc" : "asc")} />
      <Table data={processedData} />
    </div>
  );
}
```

---

## 🎨 State Management Strategies

### When to Use Each

| State Type | Use Case | Example |
|------------|----------|---------|
| **Server State** | URL-based data | `orgId`, `teamId`, `repoId` |
| **Global Context** | Cross-component shared state | Time range, theme, auth |
| **Local State** | Component-specific UI | Filter buttons, modal open/closed |
| **Derived State** | Calculated from other state | Filtered lists, totals, averages |
| **Form State** | User input | Search box, filter inputs |

### Decision Tree

```
Do multiple components need this state?
  YES → Use Context
  NO  ↓

Is this derived from other state?
  YES → Use useMemo (derived state)
  NO  ↓

Is this from the URL?
  YES → Use route params
  NO  ↓

Is this UI state?
  YES → Use useState (local state)
```

---

## 🔄 State Updates

### Synchronous Updates

```typescript
const [count, setCount] = useState(0);

// Direct update
setCount(5);

// Functional update (based on previous value)
setCount(prev => prev + 1);
```

### Asynchronous Effects

```typescript
const [data, setData] = useState(null);

useEffect(() => {
  // Fetch data when component mounts
  fetchData().then(result => setData(result));
}, []);  // Empty array = run once on mount
```

### Conditional Updates

```typescript
const [filter, setFilter] = useState("all");
const [data, setData] = useState([]);

useEffect(() => {
  // Only refetch when filter changes
  if (filter !== "all") {
    setData(fetchFilteredData(filter));
  }
}, [filter]);  // Run when filter changes
```

---

## 🎯 Performance Optimization

### 1. Memoization with `useMemo`

```typescript
// ❌ Bad: Recalculates every render
export function MyComponent({ data }) {
  const filtered = data.filter(item => item.active);  // Runs every render!

  return <Table data={filtered} />;
}

// ✅ Good: Memoized
export function MyComponent({ data }) {
  const filtered = useMemo(
    () => data.filter(item => item.active),
    [data]  // Only recalculate when data changes
  );

  return <Table data={filtered} />;
}
```

### 2. Callback Memoization with `useCallback`

```typescript
// ❌ Bad: New function every render
export function MyComponent() {
  const handleClick = () => console.log("clicked");  // New function!

  return <ExpensiveChild onClick={handleClick} />;  // Child re-renders!
}

// ✅ Good: Memoized callback
export function MyComponent() {
  const handleClick = useCallback(
    () => console.log("clicked"),
    []  // Function never changes
  );

  return <ExpensiveChild onClick={handleClick} />;  // Child doesn't re-render
}
```

### 3. Component Memoization with `React.memo`

```typescript
// Expensive component
export const ExpensiveComponent = React.memo(({ data }) => {
  // Heavy rendering logic
  return <ComplexVisualization data={data} />;
});

// Parent component
export function Parent() {
  const [count, setCount] = useState(0);
  const data = useMemo(() => generateData(), []);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ExpensiveComponent data={data} />  {/* Doesn't re-render when count changes */}
    </div>
  );
}
```

---

## 🔍 Common Patterns

### Pattern: Loading State

```typescript
export function useTeamData(teamId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchTeamData(teamId)
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [teamId]);

  return { data, loading, error };
}

// Usage
export function TeamPage({ teamId }) {
  const { data, loading, error } = useTeamData(teamId);

  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  return <TeamTable data={data} />;
}
```

### Pattern: Debounced Search

```typescript
export function SearchInput({ onSearch }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);  // Only search after user stops typing
    }, 300);

    return () => clearTimeout(timer);  // Cleanup
  }, [value, onSearch]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

### Pattern: Conditional Data Fetching

```typescript
export function useConditionalData(shouldFetch: boolean, teamId: string) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!shouldFetch) return;

    fetchData(teamId).then(setData);
  }, [shouldFetch, teamId]);

  return data;
}
```

---

## 📊 Data Transformation Pipeline

### Example: Team Performance Data

```typescript
export function useTeamPerformanceData(teamId: string, timeRange: TimeRangeKey) {
  // Step 1: Generate base data
  const members = useMemo(
    () => getMemberPerformanceRowsForTeam(52, teamId, 10),
    [teamId]
  );

  // Step 2: Generate time series
  const rawData = useMemo(
    () => generateMemberPerformanceTimeSeries(members),
    [members]
  );

  // Step 3: Filter by time range
  const timeFilteredData = useMemo(
    () => filterByTimeRange(rawData, timeRange),
    [rawData, timeRange]
  );

  // Step 4: Apply smart sampling (performance optimization)
  const sampledData = useMemo(
    () => smartSample(timeFilteredData),
    [timeFilteredData]
  );

  // Step 5: Calculate metrics
  const metrics = useMemo(
    () => calculateMetrics(sampledData),
    [sampledData]
  );

  // Step 6: Generate insights
  const insights = useMemo(
    () => getPerformanceInsights(members, sampledData, timeRange),
    [members, sampledData, timeRange]
  );

  return {
    members,           // Original rows
    rawData,           // Full time series
    sampledData,       // Optimized for charts
    metrics,           // Calculated values
    insights           // AI-generated insights
  };
}
```

**Benefits**:
- Each step is memoized independently
- Only recalculates when dependencies change
- Clear data transformation pipeline
- Easy to debug and test

---

## 🐛 Debugging State

### Log State Changes

```typescript
export function MyComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Count changed to:", count);
  }, [count]);

  return <div>{count}</div>;
}
```

### Track All State

```typescript
export function MyComponent() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    console.log("State:", { filter, sort });
  }, [filter, sort]);

  return <div>...</div>;
}
```

### React DevTools

1. Open browser DevTools
2. Go to "Components" tab
3. Select component
4. View "hooks" section
5. See current state values

---

## 📝 Best Practices

### ✅ DO

```typescript
// Use meaningful variable names
const [selectedMemberId, setSelectedMemberId] = useState(null);

// Memoize expensive calculations
const topPerformers = useMemo(() =>
  members.filter(m => m.performanceValue > 80),
  [members]
);

// Keep state close to where it's used
// If only one component needs it, keep it there

// Use functional updates when new state depends on old
setCount(prev => prev + 1);
```

### ❌ DON'T

```typescript
// Don't use unclear names
const [x, setX] = useState(null);

// Don't recalculate on every render
const topPerformers = members.filter(m => m.performanceValue > 80);  // ✗

// Don't lift state unnecessarily
// If state is only used in one component, don't put it in context

// Don't mutate state directly
members.push(newMember);  // ✗
setMembers([...members, newMember]);  // ✓
```

---

**Next**: [Adding New Features](./09-ADDING-NEW-FEATURES.md) for step-by-step development guides.
