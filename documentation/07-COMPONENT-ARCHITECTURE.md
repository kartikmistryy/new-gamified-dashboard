# Component Architecture

Understanding how components are organized and how they work together.

## 🏗️ Component Hierarchy

```
UI Primitives (shadcn/ui)
  └─ components/ui/
      ├─ button.tsx
      ├─ card.tsx
      ├─ table.tsx
      └─ badge.tsx
            ↓
Shared Basic Components
  └─ components/shared/
      ├─ Badge.tsx
      ├─ UserAvatar.tsx
      └─ Button.tsx
            ↓
Dashboard Shared Components
  └─ components/dashboard/shared/
      ├─ PerformanceChart.tsx
      ├─ GaugeWithInsights.tsx
      ├─ BaseTeamsTable.tsx
      └─ TimeRangeFilter.tsx
            ↓
Entity-Specific Components
  └─ components/dashboard/[entity]Dashboard/
      ├─ TeamTable.tsx
      ├─ MemberTable.tsx
      ├─ ContributorTable.tsx
      └─ CollaborationNetworkGraph.tsx
            ↓
Page Components
  └─ components/dashboard/pages/
      ├─ TeamPerformancePageClient.tsx
      ├─ RepoOverviewPageClient.tsx
      └─ OrgDesignPageClient.tsx
```

## 📁 Component Locations

### `/components/ui/` - shadcn/ui Primitives

**Purpose**: Base UI building blocks from shadcn/ui library

```
components/ui/
├── button.tsx          # Base button component
├── card.tsx            # Base card container
├── table.tsx           # Base table components
├── badge.tsx           # Base badge component
├── dialog.tsx          # Modal dialogs
├── dropdown-menu.tsx   # Dropdown menus
├── select.tsx          # Select inputs
├── tabs.tsx            # Tab navigation
└── ...
```

**Usage**:
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
```

**When to use**: Never modify these directly. Use them as building blocks for higher-level components.

---

### `/components/shared/` - Global Shared Components

**Purpose**: Components used across the entire application (not dashboard-specific)

```
components/shared/
├── Badge.tsx           # Custom badge with variants
├── Button.tsx          # Custom button styles
├── Card.tsx            # Custom card wrapper
└── UserAvatar.tsx      # User avatar display
```

**Usage**:
```typescript
import { Badge } from "@/components/shared/Badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
```

**When to use**: For components that could be used outside the dashboard (future marketing pages, auth pages, etc.)

---

### `/components/dashboard/layout/` - Dashboard Layout

**Purpose**: Navigation and layout structure components

```
components/dashboard/layout/
├── DashboardSidebar.tsx    # Main sidebar navigation
├── DashboardHeader.tsx     # Top header bar
└── Breadcrumbs.tsx         # Navigation breadcrumbs
```

**Example - Sidebar**:
```typescript
// components/dashboard/layout/DashboardSidebar.tsx

export function DashboardSidebar({ orgId }: { orgId: string }) {
  return (
    <aside className="w-64 bg-gray-100">
      <OrgSelector />

      <NavSection title="Organization">
        <NavItem href={`/org/${orgId}`}>Overview</NavItem>
        <NavItem href={`/org/${orgId}/performance`}>Performance</NavItem>
        <NavItem href={`/org/${orgId}/design`}>Design</NavItem>
      </NavSection>

      <NavSection title="Teams">
        {teams.map(team => (
          <NavItem href={`/org/${orgId}/team/${team.id}`}>
            {team.name}
          </NavItem>
        ))}
      </NavSection>
    </aside>
  );
}
```

---

### `/components/dashboard/shared/` - Dashboard Shared Components

**Purpose**: Components used by **multiple entities** in the dashboard

```
components/dashboard/shared/
├── PerformanceChart.tsx        # Performance line chart (all entities use)
├── GaugeWithInsights.tsx       # Gauge + insights panel
├── BaseTeamsTable.tsx          # Reusable table base
├── TimeRangeFilter.tsx         # Time range selector
├── DashboardCard.tsx           # Dashboard-specific card
└── SPOFTreemap.tsx             # SPOF visualization
```

**Example - Performance Chart**:
```typescript
// components/dashboard/shared/PerformanceChart.tsx

export function PerformanceChart({
  data,
  entityType
}: {
  data: PerformanceDataPoint[];
  entityType: "team" | "member" | "contributor";
}) {
  return (
    <Card>
      <CardHeader>Performance Trend</CardHeader>
      <CardContent>
        <svg>{/* D3 chart rendering */}</svg>
      </CardContent>
    </Card>
  );
}
```

**Used by**:
- Team Performance page
- Member Performance page
- Contributor Performance page

---

### `/components/dashboard/[entity]Dashboard/` - Entity-Specific Components

**Purpose**: Components specific to **one entity** only

#### Organization Components (`/orgDashboard/`)

```
components/dashboard/orgDashboard/
├── TeamTable.tsx               # Teams table (org-level)
├── ChaosMatrixChart.tsx        # Chaos Matrix (org design)
└── OwnershipScatter.tsx        # Ownership Scatter (org design)
```

**Example**:
```typescript
// components/dashboard/orgDashboard/TeamTable.tsx

export function TeamTable({ teams }: { teams: TeamPerformanceRow[] }) {
  return (
    <BaseTeamsTable
      data={teams}
      columns={TEAM_PERFORMANCE_COLUMNS}
      entityType="team"
    />
  );
}
```

**Used only by**: Organization-level pages (`/org/[orgId]/...`)

#### Team Components (`/teamDashboard/`)

```
components/dashboard/teamDashboard/
├── MemberTable.tsx             # Members table (team-level)
├── CollaborationNetworkGraph.tsx  # Team collaboration graph
└── SpofTeamsTable.tsx          # SPOF teams table
```

**Used only by**: Team-level pages (`/org/[orgId]/team/[teamId]/...`)

#### Repository Components (`/repoDashboard/`)

```
components/dashboard/repoDashboard/
├── ContributorTable.tsx        # Contributors table (repo-level)
├── ContributorCardsCarousel.tsx  # Top contributors carousel
└── ModulesTable.tsx            # Modules table
```

**Used only by**: Repository pages (`/org/[orgId]/repository/[repoId]/...`)

#### User Components (`/userDashboard/`)

```
components/dashboard/userDashboard/
├── SkillgraphBySkillTable.tsx  # Skills table
└── SkillgraphByTeamTable.tsx   # Teams table
```

**Used only by**: User pages (`/org/[orgId]/user/[userId]/...`)

---

### `/components/dashboard/pages/` - Page Components

**Purpose**: Top-level client components for each route

```
components/dashboard/pages/
├── OrgOverviewPageClient.tsx
├── OrgPerformancePageClient.tsx
├── OrgDesignPageClient.tsx
├── TeamPerformancePageClient.tsx
├── TeamDesignPageClient.tsx
├── RepoOverviewPageClient.tsx
├── RepoPerformancePageClient.tsx
└── UserSkillgraphPageClient.tsx
```

**Pattern**: One page component per route

**Example**:
```typescript
// components/dashboard/pages/TeamPerformancePageClient.tsx
"use client";

export function TeamPerformancePageClient({
  teamId,
  orgId
}: {
  teamId: string;
  orgId: string;
}) {
  // 1. Get data from hook
  const { members, sampledData, gaugeValue, insights } =
    useTeamPerformanceData(teamId, timeRange);

  // 2. Render with components
  return (
    <DashboardLayout>
      <GaugeWithInsights value={gaugeValue} insights={insights} />
      <PerformanceChart data={sampledData} />
      <MemberTable data={members} />
    </DashboardLayout>
  );
}
```

---

## 🎨 Component Patterns

### Pattern 1: Server/Client Component Split

```typescript
// app/org/[orgId]/team/[teamId]/performance/page.tsx
// Server Component (default)

export default async function TeamPerformancePage({ params }) {
  const { orgId, teamId } = await params;

  // Server-only code here (if needed)

  return <TeamPerformancePageClient orgId={orgId} teamId={teamId} />;
}
```

```typescript
// components/dashboard/pages/TeamPerformancePageClient.tsx
// Client Component (interactive)

"use client";

export function TeamPerformancePageClient({ orgId, teamId }) {
  // Browser-only code here
  const data = useTeamPerformanceData(teamId);
  const [filter, setFilter] = useState("all");

  return <div>{/* Interactive UI */}</div>;
}
```

**Why?**
- Server components: SEO, fast initial load, reduced bundle
- Client components: Interactivity, hooks, browser APIs

---

### Pattern 2: Composition

```typescript
// Page component composes smaller components

export function TeamPerformancePageClient({ teamId }) {
  const data = useTeamPerformanceData(teamId);

  return (
    <DashboardLayout>           {/* Layout wrapper */}
      <HeaderSection>           {/* Section grouping */}
        <GaugeWithInsights      {/* Shared component */}
          value={data.gaugeValue}
          insights={data.insights}
        />
      </HeaderSection>

      <ChartSection>
        <PerformanceChart       {/* Shared component */}
          data={data.sampledData}
        />
      </ChartSection>

      <TableSection>
        <MemberTable            {/* Entity component */}
          data={data.members}
        />
      </TableSection>
    </DashboardLayout>
  );
}
```

---

### Pattern 3: Props Down, Events Up

```typescript
// Parent component
export function TeamPerformancePageClient() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  return (
    <MemberTable
      data={members}                          // Props down
      onRowClick={(member) => setSelectedMember(member.id)}  // Events up
    />
  );
}

// Child component
export function MemberTable({ data, onRowClick }) {
  return (
    <Table>
      {data.map(member => (
        <TableRow onClick={() => onRowClick(member)}>
          {member.name}
        </TableRow>
      ))}
    </Table>
  );
}
```

---

### Pattern 4: Render Props

```typescript
// Generic table with custom cell rendering

export function BaseTeamsTable<T>({
  data,
  columns,
  renderCell
}: {
  data: T[];
  columns: ColumnDef<T>[];
  renderCell?: (item: T, column: string) => React.ReactNode;
}) {
  return (
    <Table>
      {data.map(item => (
        <TableRow>
          {columns.map(col => (
            <TableCell>
              {renderCell ? renderCell(item, col.id) : item[col.id]}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </Table>
  );
}
```

---

### Pattern 5: Hooks for Logic

```typescript
// Component uses hook for business logic

export function TeamPerformancePageClient({ teamId }) {
  // Hook handles all data logic
  const {
    members,
    loading,
    error,
    refetch
  } = useTeamPerformanceData(teamId);

  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  // Component only handles rendering
  return <MemberTable data={members} />;
}
```

---

## 🔄 Component Communication

### Context (Global State)

```typescript
// Provider at top level (app/layout.tsx)
<TimeRangeProvider>
  <DashboardPages />
</TimeRangeProvider>

// Consumer anywhere in tree
export function PerformanceChart() {
  const { timeRange } = useTimeRange();  // Access global state
  return <Chart timeRange={timeRange} />;
}
```

**Use for**: Time range, route params, theme, auth state

### Props (Direct Communication)

```typescript
// Parent passes data to child
<MemberTable data={members} />

// Child receives props
export function MemberTable({ data }) {
  return <Table data={data} />;
}
```

**Use for**: Parent → Child data flow

### Callbacks (Child → Parent)

```typescript
// Parent provides callback
<FilterButton onFilterChange={handleFilterChange} />

// Child calls callback
export function FilterButton({ onFilterChange }) {
  return (
    <Button onClick={() => onFilterChange("active")}>
      Filter
    </Button>
  );
}
```

**Use for**: Child → Parent events

---

## 📊 Component Lifecycle

### Mounting (Initial Render)

```typescript
export function MyComponent() {
  // 1. Component mounts
  const data = useDataHook();  // Hook executes

  // 2. Effects run
  useEffect(() => {
    console.log("Component mounted");
    // Cleanup on unmount
    return () => console.log("Component unmounted");
  }, []);

  // 3. Component renders
  return <div>{data}</div>;
}
```

### Updating (Re-render)

```typescript
export function MyComponent({ teamId }) {
  const [filter, setFilter] = useState("all");

  // Re-renders when:
  // 1. Props change (teamId)
  // 2. State changes (filter)
  // 3. Context changes (timeRange)

  const data = useMemo(() => {
    return processData(rawData, filter);
  }, [rawData, filter]);  // Only recalculate when dependencies change

  return <div>{data}</div>;
}
```

### Unmounting

```typescript
useEffect(() => {
  // Setup
  const subscription = subscribe();

  // Cleanup
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## 🎯 Component Design Principles

### 1. Single Responsibility

```typescript
// ✅ Good: Each component has one job
export function MemberTable({ data }) {
  return <Table data={data} columns={COLUMNS} />;
}

export function MemberFilter({ onFilterChange }) {
  return <Select onChange={onFilterChange} />;
}

// ❌ Bad: Component does too much
export function MemberSection() {
  // Handles data, filtering, sorting, rendering, export...
}
```

### 2. Composition Over Inheritance

```typescript
// ✅ Good: Compose smaller components
export function DashboardCard({ title, children }) {
  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ❌ Bad: Create class hierarchies
class BaseCard extends React.Component { ... }
class DashboardCard extends BaseCard { ... }
```

### 3. Props Interface Clarity

```typescript
// ✅ Good: Clear, typed props
type MemberTableProps = {
  data: MemberPerformanceRow[];
  onRowClick?: (member: MemberPerformanceRow) => void;
  loading?: boolean;
};

export function MemberTable({ data, onRowClick, loading }: MemberTableProps) {
  // ...
}

// ❌ Bad: Unclear props
export function MemberTable(props) {
  // What props does this accept?
}
```

### 4. Avoid Prop Drilling

```typescript
// ✅ Good: Use context for deep props
export function DashboardPage() {
  return (
    <TimeRangeProvider>
      <DeepNestedComponent />  {/* Can access timeRange */}
    </TimeRangeProvider>
  );
}

// ❌ Bad: Pass through many levels
<A timeRange={timeRange}>
  <B timeRange={timeRange}>
    <C timeRange={timeRange}>
      <D timeRange={timeRange} />  {/* Finally used here */}
    </C>
  </B>
</A>
```

---

## 🔍 Finding Components

### "Where is the team performance chart?"

```
1. Is it shared across entities?
   YES → components/dashboard/shared/PerformanceChart.tsx

2. Is it team-specific?
   YES → components/dashboard/teamDashboard/TeamPerformanceChart.tsx
```

### "Where is the member table?"

```
1. Entity-specific component
2. Look in: components/dashboard/teamDashboard/MemberTable.tsx
```

### "Where is the gauge component?"

```
1. Shared across all dashboard pages
2. Look in: components/dashboard/shared/GaugeWithInsights.tsx
```

---

## 🐛 Debugging Components

### Check Component Renders

```typescript
export function MyComponent() {
  console.log("MyComponent rendered");

  useEffect(() => {
    console.log("MyComponent effect ran");
  });

  return <div>...</div>;
}
```

### Track Prop Changes

```typescript
export function MyComponent({ data }) {
  useEffect(() => {
    console.log("Data changed:", data);
  }, [data]);

  return <div>{data}</div>;
}
```

### React DevTools

1. Open browser DevTools
2. Go to "Components" tab
3. Select component
4. View:
   - Props
   - State
   - Hooks
   - Render count
   - Why component rendered

---

## 📝 Component Checklist

When creating a new component, ask:

- [ ] **Where does it belong?**
  - Used by all entities → `dashboard/shared/`
  - Entity-specific → `dashboard/[entity]Dashboard/`
  - Page component → `dashboard/pages/`

- [ ] **Is it client or server?**
  - Needs interactivity → Add `"use client"`
  - Static rendering → Keep as server component

- [ ] **What are its props?**
  - Define TypeScript interface
  - Document required vs optional

- [ ] **Does it need state?**
  - Local state → `useState`
  - Global state → Context
  - Derived state → `useMemo`

- [ ] **Does it fetch data?**
  - Move data logic to hook
  - Component only renders

- [ ] **Is it reusable?**
  - Make props generic
  - Avoid hardcoded values
  - Use composition

---

**Next**: [Data Flow & State](./08-DATA-FLOW-STATE.md) for understanding state management.
