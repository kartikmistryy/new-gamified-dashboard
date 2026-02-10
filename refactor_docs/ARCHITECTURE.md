# Dashboard Architecture Guide

## Overview

The org and team dashboard architecture follows a strict separation of concerns pattern:

```
app/               → Page composition (thin, delegation only)
components/        → UI components (rendering only)
lib/               → Business logic, data, utilities
lib/shared/        → Cross-dashboard shared code
```

## Layer Responsibilities

### Pages Layer (`app/`)
- Route definition
- Data fetching (future: API calls)
- Filter state management
- Component composition
- NO business logic
- NO data transformation
- MAX 160 lines per page

### Components Layer (`components/`)
- Pure rendering
- Props-driven
- Reusable across contexts
- NO data fetching
- NO business logic
- MAX 200 lines per component

### Lib Layer (`lib/`)
- Data transformation
- Mock data generation (future: API adapters)
- Business logic
- Pure functions
- Type definitions
- MAX 200 lines per file

## Data Flow

```
Backend API (future)
    ↓
lib/[dashboard]/mockData.ts  → Will become API adapters
    ↓
lib/[dashboard]/helpers.ts   → Transform raw data
    ↓
app/[page].tsx               → Manage state, compose UI
    ↓
components/[Component].tsx   → Render UI
```

## Key Patterns

### 1. Table Pattern

All tables use `BaseTeamsTable` with configuration:

```typescript
<BaseTeamsTable
  rows={data}
  columns={COLUMN_DEFINITIONS}      // From lib/
  filterTabs={FILTER_TABS}          // From lib/
  sortFunction={sortFunction}       // From lib/
  activeFilter={filter}             // From page state
  onFilterChange={setFilter}        // From page state
  getRowKey={(row) => row.id}
/>
```

**Backend Integration**: Replace `rows={mockData}` with `rows={apiData}`

### 2. Chart Pattern

Charts receive processed data as props:

```typescript
<PerformanceChart
  data={chartData}                  // Processed in page
  timeRange={timeRange}             // From page state
  visibleTeams={visibleTeams}       // From page state
/>
```

**Backend Integration**: Process API data in page, pass to chart

### 3. Filter Pattern

Filters live in page, passed to components:

```typescript
// Page
const [timeRange, setTimeRange] = useState<TimeRangeKey>("3m");

// Render
<TimeRangeFilter value={timeRange} onChange={setTimeRange} />
<Chart data={data} timeRange={timeRange} />
```

**Backend Integration**: Filter API calls based on state

## Component Hierarchy

```
DashboardSection
├─ TimeRangeFilter (optional, in action slot)
└─ children
    ├─ Charts (PerformanceChart, ChaosMatrix, etc.)
    ├─ Tables (BaseTeamsTable with config)
    └─ Composite (GaugeWithInsights)
```

## Type System

```
lib/shared/types/
├─ performanceTypes.ts  → BasePerformanceEntity, DeveloperTypeDistribution
├─ chartTypes.ts        → ChartDataPoint (org/team/member levels)
├─ timeRangeTypes.ts    → TimeRangeKey, time utilities
├─ entityTypes.ts       → MemberId, TeamId, OrgId (branded)
└─ utilityTypes.ts      → Generic utilities

lib/orgDashboard/types.ts    → Org-specific types
lib/teamDashboard/types.ts   → Team-specific types
```

**Backend Integration**: Map API responses to these types

## Styling System

### Colors

Centralized in `lib/orgDashboard/colors.ts`:

```typescript
import { DASHBOARD_COLORS, DASHBOARD_BG_CLASSES } from "@/lib/orgDashboard/colors";

// Use in components
<div className={DASHBOARD_BG_CLASSES.blue}>
```

**DO NOT**:
- Hardcode hex colors
- Use `bg-[#...]` syntax
- Define colors in components

### Tailwind

- Use Tailwind utility classes
- Follow existing patterns
- Add custom CSS only to `app/globals.css` (theme variables only)

## File Organization

### Intent-Based Folders

```
components/
├─ dashboard/     → Dashboard-specific components
├─ shared/        → Reusable across app
└─ ui/           → Base UI primitives (shadcn)
```

### Naming Conventions

- **Components**: PascalCase (`TeamTable.tsx`)
- **Utilities**: camelCase (`tableUtils.ts`)
- **Types**: camelCase with suffix (`performanceTypes.ts`)
- **Folders**: lowercase (`dashboard/`, not `Dashboard/`)

## Future: Backend Integration

### Current (Mock Data)

```typescript
// lib/teamDashboard/performanceMockData.ts
export function generateTeamPerformanceData(
  teamId: string,
  orgId: string
): MemberPerformanceRow[] {
  // Generate mock data
}

// Page
const data = generateTeamPerformanceData(teamId, orgId);
```

### Future (API)

```typescript
// lib/teamDashboard/performanceApi.ts
export async function fetchTeamPerformanceData(
  teamId: TeamId,
  orgId: OrgId,
  timeRange: TimeRangeKey
): Promise<MemberPerformanceRow[]> {
  const response = await api.get(`/api/teams/${teamId}/performance`, {
    params: { timeRange },
  });
  return transformApiResponse(response.data);
}

// Page (with React Query or similar)
const { data, isLoading, error } = useQuery(
  ["team-performance", teamId, timeRange],
  () => fetchTeamPerformanceData(teamId, orgId, timeRange)
);
```

### Migration Steps

1. Create API adapter file next to mock data file
2. Define API response type
3. Create transform function: API response → Row type
4. Update page to use API adapter
5. Keep mock data file for tests

## Testing Strategy

### Unit Tests (Future)

```typescript
// lib/dashboard/__tests__/sortHelpers.test.ts
describe("createPerformanceSortFunction", () => {
  it("sorts by performance value descending", () => {
    const rows = [/* test data */];
    const sorted = sortFunction(rows, "mostProductive");
    expect(sorted[0].performanceValue).toBeGreaterThan(
      sorted[1].performanceValue
    );
  });
});
```

### Component Tests (Future)

```typescript
// components/dashboard/__tests__/BaseTeamsTable.test.tsx
describe("BaseTeamsTable", () => {
  it("renders rows correctly", () => {
    render(<BaseTeamsTable rows={mockRows} {...config} />);
    expect(screen.getByText("Team Alpha")).toBeInTheDocument();
  });
});
```

### Integration Tests (Future)

```typescript
// app/org/[orgId]/__tests__/performance.test.tsx
describe("Performance Page", () => {
  it("filters data by time range", async () => {
    render(<PerformancePage />);
    fireEvent.click(screen.getByText("3 Months"));
    await waitFor(() => {
      expect(screen.queryByText("Old Data")).not.toBeInTheDocument();
    });
  });
});
```

## Performance Optimization

### Current Optimizations

1. **Memoization**: All expensive calculations use `useMemo`
2. **Stable Callbacks**: Event handlers use `useCallback`
3. **Efficient Algorithms**: O(n) single-pass where possible
4. **Smart Rendering**: Avoid unnecessary re-renders

### Future Optimizations

1. **Virtual Scrolling**: For large tables (>100 rows)
2. **Code Splitting**: Dynamic imports for chart libraries
3. **Server Components**: Move data fetching to server
4. **Incremental Static Regeneration**: Cache dashboard views

## Accessibility

- Semantic HTML (`<table>`, `<section>`, etc.)
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Screen reader tested (future)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 14+, Chrome Android

## Dependencies

**Core**:
- React 19.2.3
- Next.js 16.1.6
- TypeScript 5.x
- Tailwind CSS v4

**Charts**:
- D3.js (v7) - force simulation, scales
- Lucide React - icons

**UI**:
- Radix UI - accessible primitives
- Shadcn UI - component library

**Future**:
- React Query - data fetching
- Zod - API response validation

## Project Structure

```
new-gamified-dashboard/
├── app/
│   └── org/
│       └── [orgId]/
│           ├── page.tsx                    # Org Overview
│           ├── performance/
│           ├── design/
│           ├── skillgraph/
│           ├── spof/
│           └── team/
│               └── [teamId]/
│                   ├── page.tsx            # Team Overview
│                   ├── performance/
│                   ├── design/
│                   ├── skillgraph/
│                   └── spof/
├── components/
│   ├── dashboard/                          # Dashboard components
│   ├── shared/                             # Reusable components
│   └── ui/                                 # Base UI primitives
├── lib/
│   ├── orgDashboard/                       # Org dashboard logic
│   ├── teamDashboard/                      # Team dashboard logic
│   ├── shared/
│   │   └── types/                          # Shared type definitions
│   └── utils/                              # Shared utilities
└── refactor_docs/                          # Documentation

```

## Architecture Decisions

### Why Separation of Concerns?

1. **Testability**: Pure functions are easy to test
2. **Reusability**: Components work in any context
3. **Maintainability**: Changes are localized
4. **Backend Ready**: Easy to swap mock → API

### Why No State in Components?

1. **Predictable**: Props in, UI out
2. **Debuggable**: State lives in one place (page)
3. **Flexible**: Same component, different data sources
4. **Shareable**: Components work across dashboards

### Why Branded Types?

```typescript
// Prevents bugs like this:
function getData(teamId: TeamId, memberId: MemberId) {
  return api.fetch(teamId, memberId);
}

// ❌ TypeScript error if you swap them:
getData(memberId, teamId); // Type error!
```

### Why Column Definitions in Lib?

1. **Reusability**: Same columns across pages
2. **Maintainability**: Update once, applies everywhere
3. **Testability**: Can test column renderers in isolation
4. **File Size**: Keeps page files under 160 lines

## Common Patterns

### GaugeWithInsights Pattern

Composite component combining gauge, insights, and metric cards:

```typescript
<DashboardSection title="Performance Score">
  <GaugeWithInsights
    gaugeValue={92}
    gaugeVariant="performance"
    insights={["Team performance up 15%", "3 new stars identified"]}
    metricCards={[
      { label: "Stars", value: 8, trend: "up" },
      { label: "Risky", value: 2, trend: "down" },
    ]}
  />
</DashboardSection>
```

### Filter + Table Pattern

Standard pattern for filterable tables:

```typescript
const [filter, setFilter] = useState<FilterType>("mostProductive");
const sortedData = useMemo(
  () => sortFunction(data, filter),
  [data, filter]
);

return (
  <BaseTeamsTable
    rows={sortedData}
    filterTabs={FILTER_TABS}
    activeFilter={filter}
    onFilterChange={setFilter}
    columns={COLUMNS}
  />
);
```

### Chart + TimeRange Pattern

Standard pattern for time-based charts:

```typescript
const [timeRange, setTimeRange] = useState<TimeRangeKey>("3m");
const filteredData = useMemo(
  () => filterByTimeRange(data, timeRange),
  [data, timeRange]
);

return (
  <DashboardSection
    title="Performance Trends"
    action={<TimeRangeFilter value={timeRange} onChange={setTimeRange} />}
  >
    <PerformanceChart data={filteredData} timeRange={timeRange} />
  </DashboardSection>
);
```

## Anti-Patterns to Avoid

### ❌ Fetching Data in Components

```typescript
// Bad
function TeamTable() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/teams').then(r => setData(r.json()));
  }, []);
  // ...
}
```

```typescript
// Good
function TeamPerformancePage() {
  const data = useTeamData(); // Fetch in page
  return <TeamTable data={data} />; // Pass to component
}
```

### ❌ Business Logic in Components

```typescript
// Bad
function TeamTable({ rows }) {
  const sorted = rows.sort((a, b) =>
    b.performance - a.performance
  ); // Logic in component
}
```

```typescript
// Good
function TeamPerformancePage() {
  const sorted = performanceSortFunction(rows, filter); // Logic in lib
  return <TeamTable rows={sorted} />;
}
```

### ❌ Hardcoded Values

```typescript
// Bad
<circle r={5} fill="#3b82f6" />
```

```typescript
// Good
import { CHART_CONSTANTS } from "@/lib/dashboard/chartConstants";
import { DASHBOARD_COLORS } from "@/lib/orgDashboard/colors";

<circle
  r={CHART_CONSTANTS.POINT_RADIUS}
  fill={DASHBOARD_COLORS.blue}
/>
```

## Troubleshooting

### Component Not Rendering

1. Check props are passed correctly
2. Verify data shape matches expected type
3. Look for console errors
4. Check React DevTools for component hierarchy

### Data Not Filtering

1. Verify filter state is updating
2. Check sortFunction is receiving correct filter value
3. Ensure useMemo dependencies are correct
4. Log intermediate values to debug

### Type Errors

1. Check import paths are correct
2. Verify types are exported properly
3. Ensure branded types are created with constructor functions
4. Run `npx tsc --noEmit` to see all errors

## Best Practices

1. **Keep pages thin**: Delegate to components and lib functions
2. **Keep components pure**: Props in, UI out
3. **Use TypeScript strictly**: No `any`, no type assertions
4. **Document public APIs**: Add JSDoc comments
5. **Test transformations**: Unit test all lib functions
6. **Follow naming conventions**: Consistent names aid navigation
7. **Extract magic numbers**: Use named constants
8. **Prefer composition**: Combine simple components into complex ones

---

**Last Updated**: 2026-02-07
**Phase**: 4 (Documentation)
**Status**: Complete
