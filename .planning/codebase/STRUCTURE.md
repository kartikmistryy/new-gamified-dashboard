# Codebase Structure

**Analysis Date:** 2026-02-06

## Directory Layout

```
new-gamified-dashboard/
├── app/                           # Next.js App Router pages and layouts
│   ├── layout.tsx                 # Root layout (sidebar wrapper, global styles)
│   ├── page.tsx                   # Home redirect to /org/gitroll
│   ├── favicon.ico
│   ├── globals.css                # Global Tailwind + custom styles
│   └── org/[orgId]/               # Organization dashboard routes
│       ├── page.tsx               # Org summary/overview page
│       ├── design/                # Design analysis dashboard
│       ├── performance/           # Performance metrics dashboard
│       ├── skillgraph/            # Skill/domain mapping dashboard
│       ├── spof/                  # Single Point of Failure analysis
│       ├── repo/[repoId]/         # Repository detail page
│       ├── team/[teamId]/         # Team detail page
│       └── user/[userId]/         # User detail page
│
├── components/                    # React components (organized by layer)
│   ├── ui/                        # Shadcn/Radix primitive components (15 files)
│   ├── shared/                    # Reusable non-domain components
│   ├── dashboard/                 # Domain-specific dashboard components (37 files)
│   │   ├── layout/                # Application shell components
│   │   │   ├── hooks/             # Sidebar and dashboard hooks
│   │   │   └── helpers/           # Dashboard navigation helpers
│   │   ├── tabs/                  # Tab navigation constants and types
│   │   └── [27 chart/table components]
│   └── skillmap/                  # Skillgraph visualization components
│       └── data/
│
├── lib/                           # Utility functions and data
│   ├── orgDashboard/              # Domain-specific utilities (20 files)
│   │   ├── *MockData.ts           # Mock data generators (overview, design, spof, skillgraph, etc.)
│   │   ├── *Utils.ts              # Data transformation utilities (chart, table, scatter)
│   │   ├── types.ts               # Domain type definitions (all row/filter types)
│   │   ├── constants.ts           # Constants (team names, colors, ranks)
│   │   └── colors.ts              # Color palette definitions
│   ├── hooks/                     # Shared custom hooks (useTabIndicator, etc.)
│   ├── routes.ts                  # Route path definitions
│   ├── gauge.ts                   # Gauge rendering utilities
│   ├── chartTooltip.ts            # D3 tooltip factory
│   └── utils.ts                   # General utilities
│
├── hooks/                         # Root-level React hooks
│   └── use-mobile.ts              # Mobile media query hook
│
├── types/                         # Global TypeScript type definitions
│   └── sidebar.ts                 # Org/Team/Repo/Person domain types
│
├── __mocks__/                     # Mock data for development
│   └── sidebar/
│       └── organizations.ts       # Organization fixtures (GitRoll, Acme Inc, TechCorp)
│
├── public/                        # Static assets (currently empty in usage)
│
├── .cursor/                       # Cursor IDE rules (ignored in git)
│
├── .planning/                     # GSD planning documents
│   └── codebase/
│
├── Config Files:
│   ├── tsconfig.json              # TypeScript with path alias @/* pointing to root
│   ├── next.config.ts             # Remote image domains for dicebear, github, cryptoicons
│   ├── tailwind.config.ts         # Tailwind CSS v4 configuration
│   ├── postcss.config.mjs          # PostCSS with Tailwind plugin
│   ├── eslint.config.mjs           # ESLint 9+ flat config
│   ├── components.json            # Shadcn component registry
│   └── package.json               # Dependencies: Next 16, React 19, Tailwind 4, etc.
│
└── node_modules/                  # Dependencies (excluded from git)
```

## Directory Purposes

**app/ (App Router):**
- Purpose: Next.js routing and page-level components
- Contains: Page components (page.tsx), root layout, global styles
- Key files: `layout.tsx` (root layout), `page.tsx` (home redirect), org dashboard pages

**components/ui/ (UI Primitives):**
- Purpose: Shadcn/Radix UI wrapper components (unstyled base + Tailwind)
- Contains: card, button, table, sidebar, tooltip, avatar, badge, input, checkbox, etc.
- Key files: All 15 UI component files are single responsibility wrappers
- Pattern: Each file exports a component or collection (e.g., `Table`, `TableHead`, `TableBody`, `TableCell`)

**components/shared/ (Shared Components):**
- Purpose: Reusable components not specific to dashboard domain
- Contains: TeamAvatar (DiceBear avatar wrapper), Badge (custom badge), LightThemeScript (theme injection)
- Key files: `TeamAvatar.tsx`, `Badge.tsx`, `LightThemeScript.tsx`

**components/dashboard/ (Dashboard Components):**
- Purpose: Domain-specific visualizations and tables
- Contains: Chart components (D3Gauge, OrgPerformanceChart, ChaosMatrix, OwnershipScatter, SpofDistributionChart), table variants (DesignTeamsTable, SkillgraphTeamsTable, PerformanceTeamsTable, SpofTeamsTable, TeamTable), utility components (SegmentBar, DashboardSection, ChartInsights)
- Key files:
  - Base: `BaseTeamsTable.tsx` (generic table template)
  - Tables: `DesignTeamsTable.tsx`, `SkillgraphByTeamTable.tsx`, `SkillgraphBySkillTable.tsx`, `PerformanceTeamsTable.tsx`, `SpofTeamsTable.tsx`, `TeamTable.tsx`
  - Charts: `D3Gauge.tsx`, `OrgPerformanceChart.tsx`, `ChaosMatrix.tsx`, `OwnershipScatter.tsx`, `SpofDistributionChart.tsx`
  - Utility: `DashboardSection.tsx`, `SegmentBar.tsx`, `ChartInsights.tsx`, `OverviewSummaryCard.tsx`, `TimeRangeFilter.tsx`, `VisibilityToggleButton.tsx`

**components/dashboard/layout/ (Application Shell):**
- Purpose: Persistent navigation and organization switching UI
- Contains: DashboardSidebar (main app shell), DashboardHeader, DashboardTabs, MainNavigation, SidebarContentSections, FavoritesList, UserFooter, OrganizationSwitcher
- Key files: `DashboardSidebar.tsx` (root wrapper), `SidebarContentSections.tsx` (teams/repos/people lists)
- Hooks subdirectory: `useSidebarData`, `useDashboardMeta`, `useFavorites`, `useSidebarVisibility`

**lib/orgDashboard/ (Domain Logic & Data):**
- Purpose: Mock data generation, calculations, and chart utilities
- Contains:
  - Mock data: `overviewMockData.ts`, `designMockData.ts`, `spofMockData.ts`, `skillgraphMockData.ts`, `chaosMatrixData.ts`
  - Utilities: `orgPerformanceChartUtils.ts`, `orgPerformanceChartData.ts`, `ownershipScatterUtils.ts`, `spofChartUtils.ts`, `spofChartDrawUtils.ts`, `tableUtils.ts`
  - Types: `types.ts` (all row types: TeamPerformanceRow, DesignTeamRow, SkillgraphTeamRow, SkillgraphSkillRow; filter enums)
  - Config: `constants.ts` (TEAM_NAMES, TEAM_COLORS_BY_RANK, RANKS_BY_TEAM, team count constants), `colors.ts` (color palette), `timeRangeTypes.ts`
  - Hooks: `useTableFilter.ts` (table filter state management)
- Key files: Any mock data file can be modified to change baseline dashboard data

**lib/hooks/ (Shared Hooks):**
- Purpose: Reusable React hooks for common logic
- Contains: `useTabIndicator.ts` (active tab indicator positioning)
- Key files: Currently minimal; primary hooks in `components/dashboard/layout/hooks/`

**lib/ root (General Utilities):**
- Purpose: Shared utilities across app
- Contains: `routes.ts` (route path helpers), `gauge.ts` (gauge calculation helpers), `chartTooltip.ts` (D3 tooltip factory), `utils.ts` (general helpers)

**hooks/ (Root Hooks):**
- Purpose: App-wide utility hooks
- Contains: `use-mobile.ts` (mobile breakpoint detection)

**types/ (Global Types):**
- Purpose: Shared TypeScript type definitions
- Contains: `sidebar.ts` (Organization, Team, Repository, Person, FavoriteItem, NavItem types)

**__mocks__/ (Mock Data):**
- Purpose: Test/development fixtures
- Contains: Organization list (GitRoll, Acme Inc, TechCorp)
- Key files: `__mocks__/sidebar/organizations.ts` - imported by DashboardSidebar

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout wrapping entire app with DashboardSidebar
- `app/page.tsx`: Home page - redirects to /org/gitroll
- `app/org/[orgId]/page.tsx`: Org overview/summary page

**Configuration:**
- `tsconfig.json`: TypeScript - `@/*` alias points to project root
- `next.config.ts`: Next.js - external image domains for avatars
- `tailwind.config.ts`: Tailwind CSS v4 configuration
- `package.json`: Project metadata, Next 16, React 19, Tailwind 4

**Core Logic:**
- `lib/orgDashboard/types.ts`: All domain row types and filter enums
- `lib/orgDashboard/constants.ts`: Team names, colors, thresholds
- `components/dashboard/BaseTeamsTable.tsx`: Reusable table template for all variants

**Mock Data:**
- `lib/orgDashboard/overviewMockData.ts`: Gauge-based team performance rows
- `lib/orgDashboard/designMockData.ts`: Design table rows with ownership/chaos segments
- `lib/orgDashboard/spofMockData.ts`: SPOF analysis rows
- `lib/orgDashboard/skillgraphMockData.ts`: Skill distribution and usage data

**Styling:**
- `app/globals.css`: Global CSS imports and custom utilities
- `components/ui/*.tsx`: All Tailwind classes for UI primitives

## Naming Conventions

**Files:**
- React components: PascalCase with .tsx extension (e.g., `DashboardSidebar.tsx`, `DesignTeamsTable.tsx`)
- Utilities/helpers: camelCase with .ts extension (e.g., `useTableFilter.ts`, `chartTooltip.ts`)
- Mock data: Named with pattern `*MockData.ts` or `*Data.ts` (e.g., `overviewMockData.ts`, `chaosMatrixData.ts`)
- Types: Named `.ts` file with export type statements (e.g., `types.ts`, `sidebar.ts`)
- Hooks: Named `use*.ts` following React convention (e.g., `use-mobile.ts`, `useTableFilter.ts`)

**Directories:**
- Feature/domain areas: kebab-case for nested routes (`[orgId]`, `[teamId]`), lowercase for component dirs (`dashboard`, `shared`, `ui`)
- Organization: Functional grouping (all UI primitives in `ui/`, all dashboard components in `dashboard/`)

**Functions & Variables:**
- Functions: camelCase (e.g., `getTeamPerformanceRowsForGauge`, `slugify`, `lerp`)
- Constants: UPPER_SNAKE_CASE (e.g., `TEAM_NAMES`, `TEAM_COLORS_BY_RANK`, `TYPE_DIST_REF`)
- Component props: PascalCase (e.g., `BaseTeamsTableProps`, `SegmentBarProps`)
- Enums/literal types: camelCase keys (e.g., `"mostOutliers"`, `"mostProductive"`)

**Types:**
- Exported types: PascalCase with suffix indicating purpose (e.g., `TeamPerformanceRow`, `DesignTableFilter`, `ChartInsight`)
- Generic types: Single letter or descriptive (e.g., `<T>` for row type, `<F extends string>` for filter type)

## Where to Add New Code

**New Feature/Dashboard Page:**
1. Create route directory: `app/org/[orgId]/[feature]/page.tsx`
2. Create page component (use "use client" directive)
3. Add state management (useState for filters, visibility)
4. Import/create mock data generator: `lib/orgDashboard/[feature]MockData.ts`
5. Import/create chart/table components from `components/dashboard/`
6. Compose page with DashboardSection wrappers

**New Chart Component:**
1. Create file: `components/dashboard/[ChartName].tsx` with "use client"
2. Import data type from `lib/orgDashboard/types.ts`
3. Use D3 (for geometric calculations) or Recharts (for out-of-box charts)
4. Accept data as props, handle memoization in parent page component
5. Implement D3 tooltip via `createChartTooltip` from `lib/chartTooltip.ts` if needed

**New Table Variant:**
1. If generic filtering: Extend `BaseTeamsTable<T, F>` with custom columns
2. If unique structure: Create new file `components/dashboard/[TableName].tsx`
3. Define row type: Add to `lib/orgDashboard/types.ts` (e.g., `CustomTeamRow`, `CustomFilter`)
4. Define sort function: Create `lib/orgDashboard/[tableName]Utils.ts`
5. Implement filter tabs and sort logic, import from BaseTeamsTable or build custom

**New Sidebar Navigation Item:**
1. Edit `components/dashboard/layout/SidebarContentSections.tsx`
2. Add conditional rendering for new entity type
3. Update `types/sidebar.ts` if new domain type needed
4. Update mock data in `__mocks__/sidebar/organizations.ts` if needed

**Utilities & Helpers:**
- Shared calculations: `lib/orgDashboard/utils.ts`
- Table-specific utilities: `lib/orgDashboard/tableUtils.ts`
- Chart-specific utilities: `lib/orgDashboard/[feature]Utils.ts`
- Chart drawing (D3): `lib/orgDashboard/[feature]DrawUtils.ts`

**Shared Components:**
- Non-domain specific: `components/shared/[ComponentName].tsx`
- Example: `TeamAvatar.tsx` wraps DiceBear API, reused across all tables

**Types & Constants:**
- Domain types: `lib/orgDashboard/types.ts`
- Global types: `types/[domain].ts`
- Feature-specific constants: `lib/orgDashboard/constants.ts`
- Color definitions: `lib/orgDashboard/colors.ts`

## Special Directories

**__mocks__/:**
- Purpose: Mock data fixtures for development and tests
- Generated: No (manually maintained)
- Committed: Yes (checked into git)
- Note: Currently contains only `sidebar/organizations.ts`; other mock data generated dynamically in `lib/orgDashboard/*MockData.ts`

**.planning/:**
- Purpose: GSD planning documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: No (manually created)
- Committed: Yes
- Note: Used by `/gsd:plan-phase` and `/gsd:execute-phase` commands

**.cursor/rules/:**
- Purpose: Cursor IDE-specific instructions (not committed)
- Generated: Yes (user-created in IDE)
- Committed: No (.gitignored)

**.next/:**
- Purpose: Next.js build output and type definitions
- Generated: Yes (build artifact)
- Committed: No (.gitignored)

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (npm install)
- Committed: No (.gitignored)

---

*Structure analysis: 2026-02-06*
