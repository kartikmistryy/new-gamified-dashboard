# Folder Structure Guide

Complete guide to the codebase directory organization.

## 📁 Root Directory

```
gamified-dashboard/
├── app/                    # Next.js App Router (pages & layouts)
├── components/             # React components
├── lib/                    # Business logic & utilities
├── public/                 # Static assets
├── documentation/          # This documentation
├── .planning/             # Project planning docs
├── refactor_docs/         # Refactoring documentation
├── node_modules/          # Dependencies (gitignored)
├── .next/                 # Next.js build output (gitignored)
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── next.config.ts         # Next.js configuration
```

## 🗂️ /app - Next.js App Router

**Purpose**: File-system based routing and page definitions

```
app/
├── layout.tsx                              # Root layout (entire app)
├── page.tsx                                # Home page (/)
├── globals.css                             # Global styles
│
├── org/[orgId]/                           # Organization routes
│   ├── layout.tsx                         # Org-level layout wrapper
│   ├── page.tsx                           # Org overview (/org/1)
│   ├── design/page.tsx                    # Org design (/org/1/design)
│   ├── performance/page.tsx               # Org performance
│   ├── skillgraph/page.tsx               # Org skillgraph
│   ├── spof/page.tsx                     # Org SPOF
│   │
│   ├── team/[teamId]/                    # Team routes
│   │   ├── layout.tsx                    # Team-level layout
│   │   ├── page.tsx                      # Team overview
│   │   ├── design/page.tsx               # Team design
│   │   ├── performance/page.tsx          # Team performance
│   │   ├── skillgraph/page.tsx          # Team skillgraph
│   │   └── spof/page.tsx                # Team SPOF
│   │
│   ├── repository/[repoId]/              # Repository routes
│   │   ├── layout.tsx                    # Repo-level layout
│   │   ├── page.tsx                      # Repo overview
│   │   ├── design/page.tsx               # Repo design
│   │   ├── performance/page.tsx          # Repo performance
│   │   ├── skillgraph/page.tsx          # Repo skillgraph
│   │   └── spof/page.tsx                # Repo SPOF
│   │
│   └── user/[userId]/                    # User routes
│       ├── layout.tsx                    # User-level layout
│       ├── page.tsx                      # User overview
│       ├── skillgraph/page.tsx          # User skillgraph
│       └── spof/page.tsx                # User SPOF
```

### How Routing Works

**File → URL mapping**:
```
app/org/[orgId]/team/[teamId]/performance/page.tsx
  ↓
URL: /org/123/team/456/performance
  ↓
params: { orgId: "123", teamId: "456" }
```

**Layout nesting**:
```
app/layout.tsx (root)
  └─> app/org/[orgId]/layout.tsx (org sidebar)
      └─> app/org/[orgId]/team/[teamId]/layout.tsx (team breadcrumbs)
          └─> app/org/[orgId]/team/[teamId]/performance/page.tsx
```

## 📦 /components - React Components

**Purpose**: All UI components organized by feature/entity

```
components/
├── shared/                                # Global shared components
│   ├── Badge.tsx                         # UI primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   └── UserAvatar.tsx
│
├── ui/                                   # shadcn/ui components
│   ├── button.tsx                        # Base components
│   ├── card.tsx
│   ├── table.tsx
│   └── ...
│
├── dashboard/                            # Dashboard-specific components
│   │
│   ├── layout/                          # Layout components
│   │   ├── DashboardSidebar.tsx         # Main navigation
│   │   ├── DashboardHeader.tsx          # Top bar
│   │   └── Breadcrumbs.tsx              # Navigation trail
│   │
│   ├── pages/                           # Page-level client components
│   │   ├── OrgOverviewPageClient.tsx
│   │   ├── TeamPerformancePageClient.tsx
│   │   ├── RepoDesignPageClient.tsx
│   │   └── ...                          # One per route
│   │
│   ├── shared/                          # Shared dashboard components
│   │   ├── PerformanceChart.tsx         # Used by all performance pages
│   │   ├── GaugeWithInsights.tsx        # Used by all overview pages
│   │   ├── BaseTeamsTable.tsx           # Reusable table base
│   │   ├── SPOFTreemap.tsx              # SPOF visualization
│   │   └── TimeRangeFilter.tsx          # Time range selector
│   │
│   ├── orgDashboard/                    # Organization-specific
│   │   ├── TeamTable.tsx                # Teams within org
│   │   ├── ChaosMatrixChart.tsx         # Org design chart
│   │   └── OwnershipScatter.tsx         # Org design chart
│   │
│   ├── teamDashboard/                   # Team-specific
│   │   ├── MemberTable.tsx              # Members within team
│   │   ├── CollaborationNetworkGraph.tsx
│   │   └── SpofTeamsTable.tsx
│   │
│   ├── repoDashboard/                   # Repository-specific
│   │   ├── ContributorTable.tsx         # Contributors to repo
│   │   ├── ContributorCardsCarousel.tsx
│   │   └── ModulesTable.tsx
│   │
│   └── userDashboard/                   # User-specific
│       ├── SkillgraphBySkillTable.tsx
│       └── SkillgraphByTeamTable.tsx
│
└── skillmap/                            # Skillmap feature
    ├── SkillGraph.tsx
    └── skillGraphTypes.ts
```

### Component Organization Logic

```
Where does a component go?

Is it a UI primitive (button, card, badge)?
  └─> components/ui/ or components/shared/

Is it shared across ALL dashboards?
  └─> components/dashboard/shared/

Is it specific to one entity?
  └─> components/dashboard/[entity]Dashboard/

Is it a full page component?
  └─> components/dashboard/pages/
```

## 🧠 /lib - Business Logic

**Purpose**: All non-UI code (data, utilities, hooks)

```
lib/
├── dashboard/                            # Dashboard business logic
│   │
│   ├── shared/                          # Cross-entity shared code
│   │   ├── types/                       # Shared type definitions
│   │   │   └── index.ts                 # Barrel export
│   │   │
│   │   ├── hooks/                       # Shared React hooks
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                       # Shared utilities
│   │   │   ├── colors.ts                # Color palette (IMPORTANT!)
│   │   │   ├── chartConstants.ts        # Chart configurations
│   │   │   ├── trendHelpers.ts          # Trend calculations
│   │   │   └── index.ts                 # Barrel export
│   │   │
│   │   ├── contexts/                    # React contexts
│   │   │   ├── TimeRangeContext.tsx     # Global time range state
│   │   │   ├── TimeRangeFilter.tsx      # Time range UI
│   │   │   └── RouteParamsProvider.tsx  # Route params access
│   │   │
│   │   ├── components/                  # Shared UI logic
│   │   │
│   │   ├── charts/                      # Chart utilities
│   │   │   ├── gauge/
│   │   │   │   └── gaugeUtils.ts
│   │   │   ├── tooltip/
│   │   │   │   └── chartTooltip.ts
│   │   │   └── performanceChart/
│   │   │       ├── types.ts
│   │   │       ├── transformers.ts
│   │   │       └── eventGenerators.ts
│   │   │
│   │   └── README.md                    # Shared code documentation
│   │
│   └── entities/                        # Entity-specific code
│       │
│       ├── contributor/                 # Repository-level (contributors)
│       │   ├── types.ts                 # Contributor data types
│       │   │
│       │   ├── mocks/                   # Mock data generators
│       │   │   ├── overviewMockData.ts
│       │   │   ├── performanceMockData.ts
│       │   │   ├── designMockData.ts
│       │   │   └── spofMockData.ts
│       │   │
│       │   ├── utils/                   # Helper functions
│       │   │   ├── performanceHelpers.ts
│       │   │   ├── designHelpers.ts
│       │   │   └── repoPerformanceUtils.ts
│       │   │
│       │   ├── hooks/                   # React hooks
│       │   │   └── useRepoPerformanceData.ts
│       │   │
│       │   ├── tables/                  # Table configurations
│       │   │   ├── performanceTableColumns.tsx
│       │   │   ├── performanceTableConfig.ts
│       │   │   └── designTableColumns.tsx
│       │   │
│       │   └── charts/                  # Chart-specific code
│       │       ├── contributorCarousel/
│       │       ├── collaborationNetwork/
│       │       └── contributionFlow/
│       │
│       ├── member/                      # Team-level (team members)
│       │   ├── types.ts
│       │   ├── mocks/
│       │   ├── utils/
│       │   ├── hooks/
│       │   │   └── useTeamPerformanceData.ts
│       │   ├── tables/
│       │   └── charts/
│       │       ├── collaborationNetwork/
│       │       └── contributionFlow/
│       │
│       ├── team/                        # Org-level (teams)
│       │   ├── types.ts
│       │   ├── mocks/
│       │   ├── utils/
│       │   ├── hooks/
│       │   │   └── useTableFilter.ts
│       │   ├── tables/
│       │   └── charts/
│       │       ├── chaosMatrix/
│       │       ├── ownershipScatter/
│       │       ├── spof/
│       │       └── performanceChart/
│       │
│       ├── user/                        # User-level
│       │   ├── types.ts
│       │   ├── mocks/
│       │   ├── utils/
│       │   ├── tables/
│       │   ├── sheets/                  # User-specific: sheet utils
│       │   └── charts/
│       │       ├── skillgraph/
│       │       ├── spof/
│       │       └── performance/
│       │
│       └── README.md                    # Entity system docs
│
├── shared/                              # Global shared utilities
│   ├── types/
│   │   └── timeRangeTypes.ts           # Time range type definitions
│   └── skillsMockData.ts                # Global skills data
│
├── hooks/                               # Global hooks
│   └── useTabIndicator.ts               # Tab selection indicator
│
├── routes.ts                            # Route definitions
├── utils.ts                             # Global utilities
├── get-strict-context.tsx              # Context helper
└── README.md                            # Lib folder documentation
```

### Entity Structure Pattern

Each entity follows **the same structure**:

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

**Example - Finding contributor performance logic**:
```
Need: Contributor performance calculations
Look: lib/dashboard/entities/contributor/utils/performanceHelpers.ts

Need: Contributor performance mock data
Look: lib/dashboard/entities/contributor/mocks/performanceMockData.ts

Need: Contributor performance React hook
Look: lib/dashboard/entities/contributor/hooks/useRepoPerformanceData.ts
```

## 📄 Configuration Files

```
Root Level:
├── package.json              # Dependencies, scripts
├── tsconfig.json            # TypeScript config
├── next.config.ts           # Next.js config
├── tailwind.config.ts       # Tailwind CSS config
├── postcss.config.mjs       # PostCSS config
├── .eslintrc.json          # ESLint rules
└── .gitignore              # Git ignore patterns
```

## 🎨 /public - Static Assets

```
public/
├── images/                  # Image assets
├── icons/                   # Icon files
└── fonts/                   # Custom fonts
```

## 📚 /documentation - This Guide

```
documentation/
├── README.md                           # Index (you are here!)
├── 01-QUICK-START.md                   # Getting started
├── 02-ARCHITECTURE-OVERVIEW.md         # System design
├── 03-FOLDER-STRUCTURE.md              # This file
├── 04-ROUTING-SYSTEM.md                # Routes & navigation
├── 05-PAGE-RENDERING-FLOW.md           # How pages render
├── 06-DASHBOARD-ENTITIES.md            # Entity system
├── 07-COMPONENT-ARCHITECTURE.md        # Component patterns
├── 08-DATA-FLOW-STATE.md               # Data & state management
├── 09-ADDING-NEW-FEATURES.md           # Development guides
├── 10-STYLING-GUIDE.md                 # Colors & theming
└── 11-COMMON-PATTERNS.md               # Reusable patterns
```

## 🔍 Finding Files

### "Where is the X for Y?"

**Pattern**: `/lib/dashboard/entities/[entity]/[type]/`

| What you need | Entity | Type | Example Path |
|---------------|--------|------|--------------|
| Team types | team | types.ts | `lib/dashboard/entities/team/types.ts` |
| Member mocks | member | mocks/ | `lib/dashboard/entities/member/mocks/performanceMockData.ts` |
| Contributor table | contributor | tables/ | `lib/dashboard/entities/contributor/tables/performanceTableColumns.tsx` |
| User hook | user | hooks/ | `lib/dashboard/entities/user/hooks/useUserData.ts` |

### "Where does this page get its data?"

1. Find page component: `components/dashboard/pages/[PageName].tsx`
2. Look for `import { useXData }` - that's the hook
3. Hook is in: `lib/dashboard/entities/[entity]/hooks/`
4. Hook imports from `../mocks/` - that's the data source

### "Where is the color palette?"

**Always**: `lib/dashboard/shared/utils/colors.ts`

```typescript
import { DASHBOARD_COLORS } from "@/lib/dashboard/shared/utils/colors";
```

## 📊 File Count by Directory

```
/app                  ~40 files    (routes & layouts)
/components           ~150 files   (UI components)
/lib                  ~200 files   (business logic)
/documentation        ~12 files    (this guide)
```

## 🎯 Decision Tree: "Where do I put this file?"

```
New file → What is it?

UI Component?
  ├─ Used by all entities? → components/dashboard/shared/
  ├─ Entity-specific? → components/dashboard/[entity]Dashboard/
  └─ UI primitive? → components/ui/ or components/shared/

Business Logic?
  ├─ Shared across entities? → lib/dashboard/shared/[type]/
  └─ Entity-specific? → lib/dashboard/entities/[entity]/[type]/

Type Definition?
  ├─ Shared? → lib/dashboard/shared/types/
  └─ Entity-specific? → lib/dashboard/entities/[entity]/types.ts

Mock Data?
  → lib/dashboard/entities/[entity]/mocks/

Utility Function?
  ├─ Shared? → lib/dashboard/shared/utils/
  └─ Entity-specific? → lib/dashboard/entities/[entity]/utils/

React Hook?
  ├─ Shared? → lib/dashboard/shared/hooks/
  └─ Entity-specific? → lib/dashboard/entities/[entity]/hooks/

Route/Page?
  → app/org/[orgId]/...

Documentation?
  → documentation/
```

---

**Next**: [Routing System](./04-ROUTING-SYSTEM.md) to understand navigation.
