# Dashboard Entities

Understanding the entity system that powers all dashboard pages.

## 🎯 What Are Entities?

**Entities** are the core organizational units of the dashboard. Each entity represents a different level of aggregation in your organization.

```
Organization (Top Level)
  ↓
Teams (within org)
  ↓
Members (within team)
  ↓
Repositories (across org)
  ↓
Contributors (to repos)
  ↓
Users (individuals)
```

## 📊 The 4 Entity Types

### 1. Team (Organization-Level)

**What it represents**: Teams within your organization

**Data scope**: Organization → Teams

**Example page**: `/org/1/performance`

**Shows**:
- List of teams in the organization
- Team performance metrics
- Team collaboration patterns
- Organization design (Chaos Matrix, Ownership Scatter)

**File location**: `lib/dashboard/entities/team/`

**Key files**:
```
lib/dashboard/entities/team/
├── types.ts                           # TeamPerformanceRow, TeamDesignRow
├── mocks/
│   ├── overviewMockData.ts           # generateTeams()
│   ├── performanceMockData.ts        # generateTeamPerformanceData()
│   ├── designMockData.ts             # generateDesignData()
│   └── spofMockData.ts               # generateSpofData()
├── utils/
│   ├── performanceHelpers.ts         # calculateTeamMetrics()
│   └── designHelpers.ts              # processDesignData()
└── charts/
    ├── chaosMatrix/                   # Chaos Matrix chart
    ├── ownershipScatter/              # Ownership Scatter plot
    ├── spof/                          # SPOF treemap
    └── performanceChart/              # Performance time series
```

---

### 2. Member (Team-Level)

**What it represents**: Members of a specific team

**Data scope**: Team → Members

**Example page**: `/org/1/team/2/performance`

**Shows**:
- List of team members
- Individual member performance
- Member collaboration within team
- Member skill distribution

**File location**: `lib/dashboard/entities/member/`

**Key files**:
```
lib/dashboard/entities/member/
├── types.ts                           # MemberPerformanceRow, MemberDesignRow
├── mocks/
│   ├── overviewMockData.ts           # getMemberPerformanceRowsForTeam()
│   ├── performanceMockData.ts        # generateMemberPerformanceTimeSeries()
│   ├── designMockData.ts             # generateMemberDesignData()
│   └── spofMockData.ts               # generateMemberSpofData()
├── utils/
│   ├── performanceHelpers.ts         # calculateMemberMetrics()
│   └── metricCalculations.ts         # addPerformanceMetrics()
├── hooks/
│   └── useTeamPerformanceData.ts     # Main data hook for team performance
├── tables/
│   └── performanceTableColumns.tsx   # Table column definitions
└── charts/
    ├── collaborationNetwork/          # Team collaboration graph
    └── contributionFlow/              # Contribution flow diagram
```

**Note**: Member and Contributor entities are **intentionally similar** (88% overlap) but kept separate for clarity.

---

### 3. Contributor (Repository-Level)

**What it represents**: Contributors to a specific repository

**Data scope**: Repository → Contributors

**Example page**: `/org/1/repository/3/performance`

**Shows**:
- List of contributors to the repository
- Contributor performance metrics
- Contributor collaboration patterns
- Repository health metrics

**File location**: `lib/dashboard/entities/contributor/`

**Key files**:
```
lib/dashboard/entities/contributor/
├── types.ts                           # ContributorPerformanceRow, ContributorDesignRow
├── mocks/
│   ├── overviewMockData.ts           # getContributorPerformanceRowsForRepo()
│   ├── performanceMockData.ts        # generateContributorPerformanceTimeSeries()
│   ├── designMockData.ts             # generateContributorDesignData()
│   └── spofMockData.ts               # generateContributorSpofData()
├── utils/
│   ├── performanceHelpers.ts         # calculateContributorMetrics()
│   ├── designHelpers.ts              # processContributorDesign()
│   └── repoPerformanceUtils.ts       # Repository-specific calculations
├── hooks/
│   └── useRepoPerformanceData.ts     # Main data hook for repo performance
├── tables/
│   ├── performanceTableColumns.tsx   # Contributor table columns
│   └── designTableColumns.tsx        # Design view columns
└── charts/
    ├── contributorCarousel/           # Top contributors carousel
    ├── collaborationNetwork/          # Contributor network graph
    └── contributionFlow/              # Contribution flow chart
```

**Why separate from Member?**
- Different context (repo vs team)
- Different metrics (commits vs team performance)
- Different UI patterns
- Clear, organized duplication is better than complex abstraction

---

### 4. User (Individual-Level)

**What it represents**: Individual user's personal metrics

**Data scope**: User → Personal data

**Example page**: `/org/1/user/4/skillgraph`

**Shows**:
- User's skill distribution
- User's contributions across teams
- User's SPOF risk
- Personal performance trends

**File location**: `lib/dashboard/entities/user/`

**Key files**:
```
lib/dashboard/entities/user/
├── types.ts                           # UserSkillRow, UserSpofRow
├── mocks/
│   ├── skillgraphMockData.ts         # generateUserSkills()
│   ├── spofMockData.ts               # generateUserSpofData()
│   └── performanceMockData.ts        # generateUserPerformance()
├── utils/
│   ├── skillGenerators.ts            # Skill data generators
│   └── performanceCalculators.ts     # User metric calculations
├── tables/
│   ├── skillgraphBySkillColumns.tsx  # Skills table
│   └── skillgraphByTeamColumns.tsx   # Teams table
├── sheets/
│   └── moduleDetailSheetUtils.ts     # Module detail sheet logic
└── charts/
    ├── skillgraph/                    # Skill visualization
    ├── spof/                          # User SPOF chart
    └── performance/                   # Performance trends
```

**Unique to User**:
- `sheets/` folder (user-specific sheet utilities)
- Focus on individual skills and contributions
- Personal view vs team/org aggregation

---

## 🗂️ Entity Structure Pattern

**Every entity follows the same structure**:

```
lib/dashboard/entities/[entity]/
├── types.ts              # "What is the data shape?"
├── mocks/               # "How do I generate test data?"
├── utils/               # "How do I process this data?"
├── hooks/               # "How do components get this data?"
├── tables/              # "How do I display this in a table?"
└── charts/              # "How do I visualize this in charts?"
    └── [chartType]/    # Each chart type in its own folder
```

This **intent-based organization** makes it immediately clear:
- What you're looking for (types, mocks, utils, etc.)
- Where to find it (in the entity folder)
- Where to add new code (follow the pattern)

## 🔍 Finding Entity Code

### "I need contributor performance calculations"

```
Need: Contributor performance logic
Entity: contributor (repo-level)
Type: utils (calculations/processing)
Path: lib/dashboard/entities/contributor/utils/performanceHelpers.ts
```

### "I need team mock data"

```
Need: Team test data
Entity: team (org-level)
Type: mocks (data generators)
Path: lib/dashboard/entities/team/mocks/performanceMockData.ts
```

### "I need member table configuration"

```
Need: Member table setup
Entity: member (team-level)
Type: tables (table config)
Path: lib/dashboard/entities/member/tables/performanceTableColumns.tsx
```

### "I need user skill types"

```
Need: User skill data types
Entity: user (individual-level)
Type: types (TypeScript definitions)
Path: lib/dashboard/entities/user/types.ts
```

## 🎨 Entity vs View

**Important distinction**:

```
Entity = Data Scope (What level of aggregation?)
  - Team, Member, Contributor, User

View = Display Type (What page are we on?)
  - Overview, Performance, Design, Skillgraph, SPOF
```

**Example**:
```
Page: /org/1/team/2/performance
  ↓
Entity: Member (team-level data)
View: Performance (performance metrics)
  ↓
Data from: lib/dashboard/entities/member/
UI from: components/dashboard/teamDashboard/
```

## 📦 Entity Data Flow

### Example: Team Performance Page

```
1. URL: /org/1/team/2/performance
   ↓
2. Route: app/org/[orgId]/team/[teamId]/performance/page.tsx
   ↓
3. Client Component: components/dashboard/pages/TeamPerformancePageClient.tsx
   ↓
4. Hook: lib/dashboard/entities/member/hooks/useTeamPerformanceData.ts
   ↓
5. Mock Data: lib/dashboard/entities/member/mocks/performanceMockData.ts
   ↓
6. Utils: lib/dashboard/entities/member/utils/performanceHelpers.ts
   ↓
7. Table Config: lib/dashboard/entities/member/tables/performanceTableColumns.tsx
   ↓
8. Components: Render with data
```

### Data Flow Diagram

```
Entity Mock Generator
  ↓
Entity Hook (useMemo)
  ↓
Page Component
  ↓
Table/Chart Components
  ↓
Rendered UI
```

## 🔄 Entity Relationships

```
Organization
  ├─ has many Teams
  │    └─ Team has many Members
  │
  └─ has many Repositories
       └─ Repo has many Contributors

Users (Individuals)
  ├─ belong to Teams (as Members)
  └─ contribute to Repos (as Contributors)
```

## 🎯 When to Use Which Entity?

### Use **Team** entity when:
- Viewing organization-level data
- Listing all teams in an org
- Comparing teams against each other
- Organization design patterns

**Pages**: `/org/[orgId]/performance`, `/org/[orgId]/design`

### Use **Member** entity when:
- Viewing team-level data
- Listing members of a specific team
- Team member performance
- Team collaboration

**Pages**: `/org/[orgId]/team/[teamId]/performance`

### Use **Contributor** entity when:
- Viewing repository-level data
- Listing contributors to a repo
- Repository health metrics
- Contributor collaboration

**Pages**: `/org/[orgId]/repository/[repoId]/performance`

### Use **User** entity when:
- Viewing individual user data
- User's personal metrics
- User skills and contributions
- Personal SPOF risk

**Pages**: `/org/[orgId]/user/[userId]/skillgraph`

## 🧩 Entity Code Examples

### Types (What is the data?)

```typescript
// lib/dashboard/entities/member/types.ts

export type MemberPerformanceRow = {
  memberName: string;
  performanceValue: number;
  trend: "up" | "down" | "flat";
  delta: number;
  teamId: string;
};

export type MemberDesignRow = {
  memberName: string;
  complexity: number;
  ownership: number;
  // ...
};
```

### Mocks (How do I generate test data?)

```typescript
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
    delta: Math.random() * 20 - 10,
    teamId
  }));
}
```

### Utils (How do I process data?)

```typescript
// lib/dashboard/entities/member/utils/performanceHelpers.ts

export function calculateTeamAverage(
  members: MemberPerformanceRow[]
): number {
  const sum = members.reduce((acc, m) => acc + m.performanceValue, 0);
  return sum / members.length;
}

export function filterTopPerformers(
  members: MemberPerformanceRow[]
): MemberPerformanceRow[] {
  return members.filter(m => m.performanceValue > 80);
}
```

### Hooks (How do components get data?)

```typescript
// lib/dashboard/entities/member/hooks/useTeamPerformanceData.ts

export function useTeamPerformanceData(teamId: string, timeRange: TimeRangeKey) {
  // Generate base data
  const members = useMemo(
    () => getMemberPerformanceRowsForTeam(52, teamId, 10),
    [teamId]
  );

  // Generate time series
  const rawData = useMemo(
    () => generateMemberPerformanceTimeSeries(members),
    [members]
  );

  // Filter by time range
  const filteredData = useMemo(
    () => filterByTimeRange(rawData, timeRange),
    [rawData, timeRange]
  );

  return { members, rawData, filteredData };
}
```

### Tables (How do I display in a table?)

```typescript
// lib/dashboard/entities/member/tables/performanceTableColumns.tsx

export const PERFORMANCE_MEMBER_COLUMNS: ColumnDef<MemberPerformanceRow>[] = [
  {
    accessorKey: "memberName",
    header: "Member",
  },
  {
    accessorKey: "performanceValue",
    header: "Performance",
    cell: ({ row }) => (
      <Badge variant={getBadgeVariant(row.original.performanceValue)}>
        {row.original.performanceValue}
      </Badge>
    )
  },
  {
    accessorKey: "trend",
    header: "Trend",
    cell: ({ row }) => <TrendIndicator trend={row.original.trend} />
  }
];
```

## 🔀 Shared vs Entity-Specific

### Shared Code (`lib/dashboard/shared/`)

Use for code that **multiple entities** use:

```typescript
// lib/dashboard/shared/utils/colors.ts
export const DASHBOARD_COLORS = {
  danger: "#CA3A31",
  warning: "#E87B35",
  excellent: "#55B685"
};

// lib/dashboard/shared/contexts/TimeRangeContext.tsx
export function useTimeRange() { ... }

// lib/dashboard/shared/charts/gauge/gaugeUtils.ts
export function renderGauge() { ... }
```

**Used by**: All entities (team, member, contributor, user)

### Entity-Specific Code

Use for code that **only one entity** uses:

```typescript
// lib/dashboard/entities/contributor/utils/repoPerformanceUtils.ts
export function calculateRepoHealth() { ... }

// lib/dashboard/entities/user/sheets/moduleDetailSheetUtils.ts
export function formatModuleDetails() { ... }
```

**Used by**: Only that specific entity

## 📊 Entity Comparison Table

| Entity | Level | Shows | Data Scope | Example URL |
|--------|-------|-------|------------|-------------|
| **Team** | Org | Teams in org | Organization → Teams | `/org/1/performance` |
| **Member** | Team | Members in team | Team → Members | `/org/1/team/2/performance` |
| **Contributor** | Repo | Contributors to repo | Repo → Contributors | `/org/1/repository/3/performance` |
| **User** | Individual | Personal metrics | User → Personal | `/org/1/user/4/skillgraph` |

## 🎓 Best Practices

### ✅ DO

```typescript
// Keep entity code in its folder
lib/dashboard/entities/contributor/utils/contributorHelpers.ts

// Use shared code for cross-entity patterns
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";

// Follow the folder structure pattern
lib/dashboard/entities/[entity]/{types,mocks,utils,hooks,tables,charts}/
```

### ❌ DON'T

```typescript
// Don't mix entity code with shared code
lib/dashboard/shared/utils/contributorHelpers.ts  // ✗ Wrong

// Don't create entity folders outside the pattern
lib/dashboard/myCustomFolder/  // ✗ Wrong

// Don't skip the entity structure
lib/dashboard/entities/team/teamHelpers.ts  // ✗ Missing utils/ folder
```

## 🔍 Debugging Entity Code

### Find where data comes from

```typescript
// 1. Start at page component
// components/dashboard/pages/TeamPerformancePageClient.tsx

// 2. Look for hook usage
const { members } = useTeamPerformanceData(teamId, timeRange);
//                    ↑ This is the data hook

// 3. Find the hook file
// lib/dashboard/entities/member/hooks/useTeamPerformanceData.ts

// 4. Look for mock imports
import { getMemberPerformanceRowsForTeam } from "../mocks/overviewMockData";
//                                                   ↑ Mock data generator

// 5. Found the data source!
// lib/dashboard/entities/member/mocks/overviewMockData.ts
```

### Understand entity hierarchy

```
Page URL → Entity → Files

/org/1/performance → Team → lib/dashboard/entities/team/
/org/1/team/2/performance → Member → lib/dashboard/entities/member/
/org/1/repository/3/performance → Contributor → lib/dashboard/entities/contributor/
/org/1/user/4/skillgraph → User → lib/dashboard/entities/user/
```

---

**Next**: [Component Architecture](./07-COMPONENT-ARCHITECTURE.md) for component organization patterns.
