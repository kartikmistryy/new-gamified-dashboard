# Architecture Overview

High-level overview of the application architecture and design decisions.

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│                   (Server Components)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
┌─────────▼────────┐    ┌──────────▼──────────┐
│  Client Pages    │    │   Layout System     │
│  (use client)    │    │  - Sidebar          │
│  - TeamPerf      │    │  - Header           │
│  - RepoOverview  │    │  - Breadcrumbs      │
│  - OrgDesign     │    │                     │
└─────────┬────────┘    └──────────┬──────────┘
          │                        │
          └────────────┬───────────┘
                       │
          ┌────────────▼────────────┐
          │   Component Layer       │
          │  - Shared Components    │
          │  - Entity Components    │
          │  - UI Primitives        │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   Business Logic        │
          │  - Hooks                │
          │  - Utils                │
          │  - Data Generators      │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   Data Layer            │
          │  - Mock Data            │
          │  - Type Definitions     │
          │  - Constants            │
          └─────────────────────────┘
```

## 🎯 Core Principles

### 1. Entity-Based Organization

The app displays metrics across **4 entity levels**:

| Entity | Level | Example |
|--------|-------|---------|
| **Organization** | Top | Teams within GitHub org |
| **Team** | Mid | Members within a team |
| **Repository** | Mid | Contributors to a repo |
| **User** | Individual | User's personal metrics |

Each entity has its own:
- **Data models** (types)
- **Mock generators** (mocks)
- **Business logic** (utils, hooks)
- **UI configurations** (tables, charts)

### 2. Intent-Based File Organization

Files are organized by **what they do**, not by entity:

```
lib/dashboard/entities/team/
├── types.ts          # "I define data structures"
├── mocks/            # "I generate test data"
├── utils/            # "I process/transform data"
├── tables/           # "I configure table displays"
├── charts/           # "I configure chart displays"
└── hooks/            # "I manage component state"
```

### 3. Shared vs Specific

```
Is this code used by multiple entities?
  YES → lib/dashboard/shared/
  NO  → lib/dashboard/entities/[entity]/
```

## 🏗️ Technology Stack

### Frontend Framework
- **Next.js 16** (App Router)
  - Server-side rendering
  - File-based routing
  - React Server Components

### UI Layer
- **React 19**
  - Component-based architecture
  - Hooks for state management
  - Client/Server component split

### Styling
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Centralized colors** - Consistent palette

### Data Visualization
- **D3.js** - Custom SVG charts
- **Plotly** - Interactive charts
- **Recharts** - Declarative charts

### Type Safety
- **TypeScript** - Strict typing
- **Zod** - Runtime validation (where needed)

## 📐 Architectural Patterns

### 1. Server/Client Component Split

```typescript
// app/org/[orgId]/team/[teamId]/page.tsx
// Server Component (default)
export default async function TeamPage({ params }) {
  // Can access server-side APIs, databases
  return <TeamPageClient teamId={params.teamId} />;
}

// components/dashboard/pages/TeamPageClient.tsx
// Client Component (interactive)
"use client";

export function TeamPageClient({ teamId }) {
  // Can use hooks, state, browser APIs
  const data = useTeamData(teamId);
  return <TeamDashboard data={data} />;
}
```

**Why?**
- Server components reduce bundle size
- Client components handle interactivity
- Clear separation of concerns

### 2. Layout Composition

```
app/org/[orgId]/layout.tsx (Org-level wrapper)
  └─> app/org/[orgId]/team/[teamId]/layout.tsx (Team-level wrapper)
      └─> app/org/[orgId]/team/[teamId]/performance/page.tsx (Page)
```

Each layout wraps its children, providing:
- Navigation (sidebar, breadcrumbs)
- Context providers
- Consistent styling

### 3. Data Flow Pattern

```typescript
// 1. Mock Data Generator
export function generateTeamMembers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Member ${i}`,
    performance: Math.random() * 100
  }));
}

// 2. React Hook (data processing)
export function useTeamData(teamId: string) {
  const members = useMemo(() => generateTeamMembers(50), [teamId]);
  const filtered = useMemo(() => members.filter(...), [members]);
  return { members, filtered };
}

// 3. Component (rendering)
export function TeamTable() {
  const { members } = useTeamData("team-1");
  return <Table data={members} />;
}
```

### 4. Context for Global State

```typescript
// TimeRange is shared across all dashboard pages
<TimeRangeProvider>
  <DashboardPage />  {/* Can access timeRange */}
</TimeRangeProvider>

// Usage in any component
const { timeRange, setTimeRange } = useTimeRange();
```

## 🗂️ Code Organization Philosophy

### Duplication vs Abstraction

We **intentionally duplicate** code between similar entities (contributor/member) rather than creating complex abstractions:

```
✅ GOOD: Clear duplication
lib/dashboard/entities/contributor/utils/performanceHelpers.ts
lib/dashboard/entities/member/utils/performanceHelpers.ts
// 95% same code, but clear and easy to modify independently

❌ BAD: Premature abstraction
lib/dashboard/shared/utils/genericPerformanceHelpers.ts
// Complex generics, hard to understand, tightly coupled
```

**Why?**
- Clarity over DRY (Don't Repeat Yourself)
- Independent evolution of entities
- Easier to understand and modify
- Can be consolidated later if truly needed

### File Size Limits

Maximum **200 lines per file**:
- Forces modular code
- Easier to navigate
- Better separation of concerns

If a file exceeds 200 lines, split it:
```typescript
// Before (300 lines)
performanceUtils.ts

// After
performanceCalculations.ts  (150 lines)
performanceFormatters.ts    (150 lines)
```

## 🎨 Design System

### Color Palette

Centralized in `lib/dashboard/shared/utils/colors.ts`:

```typescript
export const DASHBOARD_COLORS = {
  danger: "#CA3A31",
  warning: "#E87B35",
  good: "#94CA42",
  excellent: "#55B685",
  blue: "#3D81FF",
  // ... more colors
};
```

**Usage everywhere**:
```typescript
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";
```

### Component Hierarchy

```
UI Primitives (shadcn/ui)
  ├─> Button, Card, Table
  └─> Badge, Dialog, Dropdown
       ↓
Shared Components (components/dashboard/shared/)
  ├─> PerformanceChart
  ├─> GaugeWithInsights
  └─> BaseTeamsTable
       ↓
Entity Components (components/dashboard/[entity]/)
  ├─> ContributorTable
  ├─> TeamTable
  └─> MemberTable
       ↓
Page Components (components/dashboard/pages/)
  ├─> TeamPerformancePageClient
  └─> RepoOverviewPageClient
```

## 🔄 Data Lifecycle

### Current: Mock Data

```
Mock Generator → React Hook → Component → UI
```

### Future: Real API

```
API Request → React Hook → Component → UI
      ↑
   (Same hook interface, different implementation)
```

**Why mock data now?**
- Frontend development independent of backend
- Predictable test data
- Easy to swap for real API later

## 🚦 Route Structure

```
/org/[orgId]                              Organization Overview
├─ /design                                Organization Design View
├─ /performance                           Organization Performance
├─ /skillgraph                           Organization Skillgraph
├─ /spof                                 Organization SPOF
│
├─ /team/[teamId]                        Team Overview
│  ├─ /design                            Team Design View
│  ├─ /performance                       Team Performance
│  ├─ /skillgraph                       Team Skillgraph
│  └─ /spof                             Team SPOF
│
├─ /repository/[repoId]                  Repository Overview
│  ├─ /design                            Repo Design View
│  ├─ /performance                       Repo Performance
│  ├─ /skillgraph                       Repo Skillgraph
│  └─ /spof                             Repo SPOF
│
└─ /user/[userId]                        User Overview
   ├─ /skillgraph                        User Skillgraph
   └─ /spof                              User SPOF
```

Each route follows the same pattern but renders entity-specific data.

## 🔐 Type Safety Strategy

### Strict TypeScript

```typescript
// All data structures typed
export type TeamPerformanceRow = {
  teamName: string;
  performanceValue: number;
  trend: "up" | "down" | "flat";
};

// Component props typed
type TeamTableProps = {
  data: TeamPerformanceRow[];
  onRowClick: (row: TeamPerformanceRow) => void;
};

// Hooks typed
function useTeamData(): {
  members: TeamPerformanceRow[];
  loading: boolean;
} { ... }
```

### Import Type Optimization

```typescript
// Types only (no runtime code)
import type { TeamType } from "@/lib/entities/team/types";

// Runtime import
import { generateTeamData } from "@/lib/entities/team/mocks";
```

## 📊 Performance Considerations

### Code Splitting
- Next.js automatically splits routes
- Each page is its own chunk
- Shared components bundled once

### Lazy Loading
```typescript
// Heavy chart component loaded only when needed
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />
});
```

### Memoization
```typescript
// Expensive calculations cached
const processedData = useMemo(() => {
  return expensiveCalculation(rawData);
}, [rawData]);
```

## 🧪 Testing Strategy (Future)

```
Unit Tests
  └─ utils/, hooks/ (business logic)

Component Tests
  └─ components/ (UI logic)

Integration Tests
  └─ Full page rendering

E2E Tests
  └─ User workflows
```

## 🔜 Migration Path

### From Mock to Real Data

1. **Keep hook interfaces the same**
```typescript
// Current
export function useTeamData() {
  return useMemo(() => generateMockData(), []);
}

// Future
export function useTeamData() {
  return useQuery(['team'], () => fetchFromAPI());
}
```

2. **Components unchanged**
```typescript
// This stays the same!
const { data } = useTeamData();
```

---

**Next**: [Folder Structure](./03-FOLDER-STRUCTURE.md) for detailed directory guide.
