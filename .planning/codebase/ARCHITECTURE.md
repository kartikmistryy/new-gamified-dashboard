# Architecture

**Analysis Date:** 2026-02-06

## Pattern Overview

**Overall:** Next.js App Router with Server/Client Component Hybrid

**Key Characteristics:**
- Client-side interactive dashboards using React 19 with "use client" boundaries
- App Router with dynamic route segments (`[orgId]`, `[teamId]`, etc.) for organizational hierarchy
- Composition-based component design with specialized table and visualization components
- Mock data layer providing deterministic, memoized data generation
- Separation between UI primitives (Shadcn/Radix), shared components, and domain-specific dashboard components

## Layers

**App Layer (Pages & Routing):**
- Purpose: Define public routes and page-level composition, handle redirects
- Location: `app/` directory with nested route segments
- Contains: Page components (`page.tsx`), root layout, global styles
- Depends on: Dashboard components, mock data, types
- Used by: Next.js router - entry point for all navigation

**Page Components (Org Dashboards):**
- Purpose: Orchestrate dashboard sections with business logic (state, memoization, filtering)
- Location: `app/org/[orgId]/*.tsx` (design, performance, skillgraph, spof, repo, team, user routes)
- Contains: State management (`useState`), memoized data retrieval, section composition
- Depends on: Dashboard components, chart utilities, mock data generators
- Used by: Router - renders specific org dashboard views

**Dashboard Components:**
- Purpose: Reusable, self-contained visualization and table components
- Location: `components/dashboard/` (27 components)
- Contains: Chart components (D3Gauge, OrgPerformanceChart, ChaosMatrix), table variants (BaseTeamsTable, SkillgraphTeamsTable, etc.), utility components (SegmentBar, ChartInsights)
- Depends on: UI primitives, shared components, chart utilities, mock data types
- Used by: Page components, other dashboard components

**Shared Components:**
- Purpose: Non-domain-specific reusable components (avatars, badges, scripts)
- Location: `components/shared/` (TeamAvatar, Badge, LightThemeScript)
- Contains: Generic React components, shared styling utilities
- Depends on: UI primitives
- Used by: Dashboard and UI components

**UI Primitives (Shadcn/Radix):**
- Purpose: Unstyled, accessible base components from Radix UI with Tailwind styling
- Location: `components/ui/` (card, button, table, sidebar, tooltip, etc.)
- Contains: Wrapped Radix UI and custom HTML components with Tailwind classes
- Depends on: Radix UI, Tailwind CSS, Lucide icons
- Used by: All other component layers

**Layout Container:**
- Purpose: Application shell with sidebar navigation and header
- Location: `components/dashboard/layout/` (DashboardSidebar, DashboardTabs, etc.)
- Contains: Sidebar structure, navigation tabs, org/team/person switching
- Depends on: UI primitives, hooks, types, mock data
- Used by: Root layout in `app/layout.tsx`

**Data & Utilities Layer:**
- Purpose: Mock data generation, calculations, and helper functions
- Location: `lib/orgDashboard/` (20+ files), `lib/` root utilities
- Contains: Mock data factories (overviewMockData, designMockData, etc.), chart utilities, table utilities, constants
- Depends on: TypeScript types
- Used by: Page components, dashboard components

**Hooks Layer:**
- Purpose: Reusable stateful logic for table filtering, dashboard metadata, sidebar interactions
- Location: `hooks/`, `lib/hooks/`, `components/dashboard/layout/hooks/`
- Contains: `use-mobile`, `useTabIndicator`, `useDashboardMeta`, `useSidebarData`, `useTableFilter`, etc.
- Depends on: React hooks, Next.js navigation, types
- Used by: Dashboard components, layout components, page components

**Types & Constants:**
- Purpose: Shared type definitions and configuration constants
- Location: `types/`, `lib/orgDashboard/` (types.ts, constants.ts)
- Contains: Organization, Team, Repository, Person domain types; filter enums; chart data structures
- Depends on: Lucide icons type
- Used by: All other layers

## Data Flow

**Page Load Flow:**

1. URL routes to `app/org/[orgId]/[section]/page.tsx` (e.g., `/org/gitroll/design`)
2. Page component renders with "use client" boundary
3. `useMemo` hooks trigger data generation from `lib/orgDashboard/*MockData.ts`
4. Mock data factory functions generate deterministic rows with memoization keys (time ranges, filters)
5. State setters `useState` track active filters and visibility toggles
6. Dashboard components receive processed data as props and render with memoized calculations
7. Event handlers (`onClick`, `onMouseEnter`) update state or navigate
8. Re-renders update only affected components (memoization prevents recalculation)

**Sidebar Navigation Flow:**

1. DashboardSidebar wraps all pages in App Router layout
2. `useSidebarData` hook provides organizations, teams, repositories, people from mock data
3. Sidebar visibility toggles stored in state (`showAllTeams`, `showAllRepos`, etc.)
4. DashboardTabs render based on pathname parsing (orgId, teamId, etc.)
5. Favorites managed via `useFavorites` hook with localStorage sync
6. Organization switching via `OrganizationSwitcher` resets sidebar visibility

**Table Filtering Flow:**

1. Page component calls `useMemo` with filter state dependency
2. Mock data factory (e.g., `getDesignTeamRowsForRange`) sorted by filter type
3. `BaseTeamsTable` receives rows and sort function
4. Filter tabs trigger `onFilterChange` callback → page state update
5. `useTableFilter` hook manages active filter and applies sort function
6. Component re-renders sorted rows

**State Management:**

- Local component state only (useState, useCallback)
- No global state management (Redux, Zustand, Context not used)
- Memoization via useMemo with dependency arrays drives optimization
- Mock data remains deterministic by keying on inputs (gauge value, time range, filter type)

## Key Abstractions

**BaseTeamsTable:**
- Purpose: Generic reusable table template for all team/skill rows with filtering tabs
- Examples: `DesignTeamsTable`, `SkillgraphTeamsTable`, `SpofTeamsTable`, `PerformanceTeamsTable` extend or compose this
- Pattern: Generic type parameters `<T, F extends string>` for row type and filter enum; column definitions array; sort function parameter

**SegmentBar:**
- Purpose: Visual representation of segmented data (ownership allocation, engineering chaos) with tooltips
- Examples: Used in DesignTeamsTable for 3-segment and 4-segment bars
- Pattern: Accepts segments array, counts array, calculates flex proportions, renders D3 tooltips on hover

**Chart Components:**
- Purpose: D3 and Recharts-based visualizations (Gauge, Line, Scatter, Distribution)
- Examples: `D3Gauge`, `OrgPerformanceChart`, `OwnershipScatter`, `ChaosMatrix`, `SpofDistributionChart`
- Pattern: Data-driven SVG rendering; D3 calculations for scales/transforms; mock data passed as props

**Dashboard Sections:**
- Purpose: Consistent header + content layout wrapper with optional title and action (filter/button)
- Examples: All pages use DashboardSection wrapping charts and tables
- Pattern: Title prop, optional action node, children content; generates accessible heading with slugified id

**DashboardSidebar:**
- Purpose: App shell providing persistent navigation, organization switching, favorites
- Examples: Wraps children from root layout
- Pattern: Provider pattern for SidebarProvider; hooks for data fetching; conditional rendering based on pathname

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: All requests to any /org/* route
- Responsibilities: Renders `DashboardSidebar` wrapper, applies global CSS (globals.css), injects LightThemeScript

**Home Redirect:**
- Location: `app/page.tsx`
- Triggers: Requests to /
- Responsibilities: Redirects to default org (`/org/gitroll`)

**Org Summary Page:**
- Location: `app/org/[orgId]/page.tsx`
- Triggers: Navigation to `/org/{orgId}`
- Responsibilities: Renders overview dashboard with Gauge, ChartInsights, OverviewSummaryCards, TeamTable

**Design Page:**
- Location: `app/org/[orgId]/design/page.tsx`
- Triggers: Navigation to `/org/{orgId}/design`
- Responsibilities: Renders OwnershipScatter, ChaosMatrix, DesignTeamsTable with time range and filter controls

**Performance Page:**
- Location: `app/org/[orgId]/performance/page.tsx`
- Triggers: Navigation to `/org/{orgId}/performance`
- Responsibilities: Renders OrgPerformanceChart, PerformanceTeamsTable with filter tabs

**Skillgraph Page:**
- Location: `app/org/[orgId]/skillgraph/page.tsx`
- Triggers: Navigation to `/org/{orgId}/skillgraph`
- Responsibilities: Renders skill usage data with SkillgraphByTeamTable and SkillgraphBySkillTable, view toggle, filters

**SPOF (Single Point of Failure) Page:**
- Location: `app/org/[orgId]/spof/page.tsx`
- Triggers: Navigation to `/org/{orgId}/spof`
- Responsibilities: Renders SpofTeamsTable, SpofDistributionChart, dependency analysis

**Detail Pages:**
- Location: `app/org/[orgId]/team/[teamId]/page.tsx`, `user/[userId]/page.tsx`, `repo/[repoId]/page.tsx`
- Triggers: Navigation to specific team/user/repo details
- Responsibilities: Show entity-specific data (currently minimal implementations)

## Error Handling

**Strategy:** Defensive defaults with fallback UI

**Patterns:**
- Organization switcher throws error if no organizations available: "No organizations available" (guards against empty mock data)
- Empty arrays returned from mock data factories if time range invalid
- Component rendering checks for undefined/null data before accessing properties
- Table components handle empty rows array gracefully

## Cross-Cutting Concerns

**Logging:**
- No centralized logging framework; console not explicitly used in components
- Client-side only (browser dev tools)

**Validation:**
- TypeScript strict mode enforces type safety
- No runtime validation of mock data structure (assumed correct)
- URL parameter validation via Next.js route constraints

**Authentication:**
- Not implemented; mock data assumes org/team access without auth
- Mock organizations hardcoded in `__mocks__/sidebar/organizations.ts`

**Styling:**
- Tailwind CSS 4 for all styling
- Light theme via `LightThemeScript` in head (loads theme before render)
- No CSS-in-JS; all classes composed from Tailwind
- Shadcn components use CVA (class-variance-authority) for variant composition

**Accessibility:**
- Semantic HTML (section, h2 with id, aria-labelledby)
- ARIA labels on headings and button regions
- Radix UI components provide built-in keyboard navigation and screen reader support
- Lucide icons marked with aria-hidden where decorative

---

*Architecture analysis: 2026-02-06*
