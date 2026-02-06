# Codebase Concerns

**Analysis Date:** 2026-02-06

## Tech Debt

**Mock Data Dependency - Production Blocker:**
- Issue: Entire application relies exclusively on mock data. All pages and tables render static generated data with no real backend integration or API calls.
- Files: `lib/orgDashboard/spofMockData.ts`, `lib/orgDashboard/skillgraphMockData.ts`, `lib/orgDashboard/designMockData.ts`, `lib/orgDashboard/overviewMockData.ts`, `app/org/[orgId]/page.tsx`, `app/org/[orgId]/performance/page.tsx`, `app/org/[orgId]/design/page.tsx`, `app/org/[orgId]/skillgraph/page.tsx`
- Impact: Application cannot be deployed to production without complete backend integration. All metrics are hardcoded. Real user data cannot be displayed. Dynamic filtering and sorting work on fake data only.
- Fix approach: Build API layer (REST or GraphQL) to replace all mock data generators. Create data fetching hooks/utilities to replace mock imports. Implement loading states and error boundaries for API failures.

**No Error Handling - Silent Failures:**
- Issue: Application contains zero try-catch blocks or error handling logic. No validation of data integrity.
- Files: All `.tsx` and `.ts` files except `skillGraphRenderers.ts`
- Impact: API failures, malformed data, and edge cases will cause unhandled exceptions, broken UI, or silent data loss. Users won't know when things fail.
- Fix approach: Add error boundaries at page and component level. Implement try-catch in data fetching. Add defensive null checks and validation using Zod (already in dependencies).

**No Testing Coverage:**
- Issue: Zero test files exist in codebase (no `.test.ts`, `.spec.ts`, or test directory). No test framework configured (Jest, Vitest, etc.).
- Files: Entire codebase
- Impact: No safety net for refactoring. Bugs introduced in one part of app propagate to users. Complex components like `SkillgraphBySkillTable.tsx` (425 lines) and `OrgPerformanceChart.tsx` (363 lines) have no regression tests.
- Fix approach: Set up Jest or Vitest. Add unit tests for utilities (data formatting, sorting logic). Add component tests for tables and charts. Target 70%+ coverage for critical paths.

**Large Complex Components - Maintenance Risk:**
- Issue: Multiple components exceed 400+ lines of code with deeply nested logic and state management.
- Files: `components/dashboard/SkillgraphBySkillTable.tsx` (425 lines), `components/dashboard/SkillgraphByTeamTable.tsx` (389 lines), `components/skillmap/SkillGraph.tsx` (382 lines), `components/dashboard/OrgPerformanceChart.tsx` (363 lines), `components/ui/sidebar.tsx` (728 lines)
- Impact: Difficult to understand, test, and modify. High bug risk. Reusable logic is trapped inside components.
- Fix approach: Extract repeated table logic into shared component (`SkillgraphTableBase`). Move sorting/filtering logic to custom hooks (`useTableSort`, `useTableFilter`). Split `sidebar.tsx` into smaller focused components.

**Hardcoded Colors and Values:**
- Issue: Colors, scores, and configuration values hardcoded throughout components and utilities with no centralized configuration system.
- Files: `lib/orgDashboard/spofMockData.ts` (team colors hardcoded), `components/skillmap/skillGraphRenderers.ts` (font sizes computed with magic numbers), `components/skillmap/SkillGraph.tsx` (weight calculations), `lib/orgDashboard/constants.ts`, `lib/orgDashboard/colors.ts`
- Impact: Changing visual or data thresholds requires hunting through multiple files. Inconsistent styling across features.
- Fix approach: Create centralized config file for all magic numbers. Use theme provider for colors. Use environment variables for data thresholds.

**State Synchronization Issues:**
- Issue: Parent-child prop drilling for state (e.g., `visibleDomains` and `onVisibilityChange` in tables). Dual state management pattern with fallback to internal state causes sync bugs.
- Files: `components/dashboard/SkillgraphBySkillTable.tsx` (lines 88-96), `components/dashboard/SkillgraphByTeamTable.tsx` (lines 61-78)
- Impact: Visibility state can desynchronize between parent and child. Changes don't propagate correctly if parent doesn't provide handler.
- Fix approach: Use React Context for shared state or upgrade to custom state management library (Zustand recommended). Replace prop drilling with context consumers.

**Type Safety Gaps:**
- Issue: Multiple `any` types and loose type definitions. Route parsing uses string regex instead of typed router utilities.
- Files: `lib/routes.ts` (route parsing), `components/dashboard/layout/hooks/useDashboardMeta.ts` (regex-based route matching), various component prop typing
- Impact: Type safety is violated silently. Route changes break without TypeScript catching it. Refactoring is unsafe.
- Fix approach: Use NextJS type-safe routing (`next/navigation`). Create strict route type definitions. Replace string regex with parsed router state.

**Data Validation Missing:**
- Issue: No data validation on chart data, table rows, or API responses. Assumes all data is in expected shape.
- Files: `components/dashboard/OrgPerformanceChart.tsx` (lines 73-85), `components/dashboard/SkillgraphBySkillTable.tsx` (line 42-43), all data processing utilities
- Impact: Malformed data will cause silent failures or incorrect calculations. Edge cases (null values, empty arrays, NaN) can break visualizations.
- Fix approach: Add Zod schemas for all data types. Validate on entry points. Create defensive utilities for data transformation.

## Known Bugs

**Skill Completion Value Fallback Logic - Silent Behavior Change:**
- Symptoms: `getTotalSkillCompletionValue` (line 36-44 in `SkillgraphBySkillTable.tsx`) silently falls back to averaging detail progress if `totalSkillCompletion` is invalid. Users see different values without warning.
- Files: `components/dashboard/SkillgraphBySkillTable.tsx`
- Trigger: When `totalSkillCompletion` is NaN, Infinity, or undefined and `details` array exists
- Workaround: None visible to user. Data appears to work but calculation changed.
- Fix: Explicitly log when fallback is used. Validate data at source (API/mock generation). Use consistent calculation method.

**Sidebar Context Error - Missing Provider:**
- Symptoms: If `useSidebar()` is used outside SidebarProvider, throws "useSidebar must be used within a SidebarProvider"
- Files: `components/ui/sidebar.tsx` (line 47-54)
- Trigger: Importing sidebar hook in component not wrapped by SidebarProvider
- Workaround: Wrap app with SidebarProvider
- Fix: Add provider validation. Create higher-order component for safety.

**Chart Tooltip D3 Error Swallowed:**
- Symptoms: If D3 voronoi treemap fails, only logs to console without notifying user or degrading gracefully
- Files: `components/skillmap/skillGraphRenderers.ts` (line 22)
- Trigger: Missing D3 voronoi plugin or data structure incompatibility
- Workaround: Check browser console for error
- Fix: Throw or return error state. Render fallback visualization. Add error boundary.

## Security Considerations

**No Input Validation on Route Parameters:**
- Risk: Route parameters (`orgId`, `teamId`, `userId`, `repoId`) are extracted via regex without validation. Could allow injection or unexpected behavior.
- Files: `lib/routes.ts`, `components/dashboard/layout/hooks/useDashboardMeta.ts`
- Current mitigation: URL structure limits access patterns, but no strict validation exists
- Recommendations: Whitelist allowed ID formats (UUID, alphanumeric). Validate in middleware or hooks. Throw error on invalid format.

**Client-Side Only Data Filtering:**
- Risk: All data filtering, sorting, and visibility toggling happens on client. No server-side security. If data were real, sensitive information could be exposed via browser inspection.
- Files: All table and chart components
- Current mitigation: Mock data is public, so low risk currently
- Recommendations: When integrating with real API, implement server-side filtering. Never trust client-side security filters. Use row-level security at database level.

**No CSRF or Authentication:**
- Risk: Application has no authentication layer, session management, or CSRF protection.
- Files: All API call sites (currently none - would be critical when added)
- Current mitigation: Mock data only
- Recommendations: Add auth provider (Clerk, Auth0, NextAuth). Implement CSRF tokens. Add rate limiting at API layer.

## Performance Bottlenecks

**D3 Voronoi Treemap Computation - Blocking Render:**
- Problem: `SkillGraph.tsx` applies voronoi treemap with max 400 iterations and strict convergence ratio. Computation blocks main thread.
- Files: `components/skillmap/SkillGraph.tsx` (line 21), `components/skillmap/skillGraphRenderers.ts` (line 16-20)
- Cause: Synchronous D3 computation in render path. No Web Workers or async offloading.
- Improvement path: Use Web Worker for voronoi computation. Memoize computed trees more aggressively. Add loading state while computing. Consider canvas rendering instead of SVG for scale.

**Large Component Re-renders - No Memoization Boundaries:**
- Problem: `OrgPerformanceChart` (363 lines) and skill tables recalculate data on every parent render even if props unchanged.
- Files: `components/dashboard/OrgPerformanceChart.tsx`, `components/dashboard/SkillgraphBySkillTable.tsx`, `components/dashboard/SkillgraphByTeamTable.tsx`
- Cause: Missing `React.memo()` on subcomponents. Excessive re-renders from parent context/props.
- Improvement path: Wrap components with `React.memo`. Move filter state to Context. Use `useCallback` for all event handlers with explicit dependency arrays.

**Mock Data Generation on Every Render:**
- Problem: Functions like `generateSpofData()` and `generateOrgPerformanceData()` run on every component mount/update, recalculating all data.
- Files: `lib/orgDashboard/spofMockData.ts`, `lib/orgDashboard/overviewMockData.ts`, `app/org/[orgId]/page.tsx`
- Cause: Data generation not cached. No memoization of results.
- Improvement path: Cache mock data at module level or use `useMemo` consistently. For production, API responses are naturally cached.

**TanStack Table Re-sorting on Every Render:**
- Problem: Table column definitions rebuilt in every render with `useMemo` but only memoized by `toggleVisibility` and `visibleDomains`. Small prop changes trigger full sort recomputation.
- Files: `components/dashboard/SkillgraphBySkillTable.tsx` (line 116-237), `components/dashboard/SkillgraphByTeamTable.tsx`
- Cause: Complex sorting functions in column definitions. Dependency array too broad.
- Improvement path: Separate sort logic from column rendering. Memoize sort functions independently. Cache column definitions at instance level.

## Fragile Areas

**Table Visibility and Filter State Management:**
- Files: `components/dashboard/SkillgraphBySkillTable.tsx`, `components/dashboard/SkillgraphByTeamTable.tsx`, `components/dashboard/PerformanceTeamsTable.tsx`
- Why fragile: State can be externally controlled or internally managed. If parent passes `onVisibilityChange` but not `visibleDomains`, state desynchronizes. Filter state has similar pattern.
- Safe modification: Before changing visibility logic, audit all callers. Add prop validation. Consider extracting to custom hook with single source of truth.
- Test coverage: No tests exist. Any change is unsafe. Add tests for all state transitions before modifying.

**Route Parameter Extraction:**
- Files: `lib/routes.ts`, `components/dashboard/layout/hooks/useDashboardMeta.ts`
- Why fragile: Regex-based parsing assumes fixed URL structure. No type safety. If routes change, parsing silently fails.
- Safe modification: Create TypeScript types for route segments. Use NextJS router primitives instead of manual parsing. Add tests for all route formats.
- Test coverage: No tests exist for route parsing. Manual testing required for safety.

**D3 Integration - External Dependency on Global State:**
- Files: `components/skillmap/SkillGraph.tsx` (line 9-19), `components/skillmap/skillGraphRenderers.ts`
- Why fragile: Code assumes D3 is loaded globally with optional voronoi plugin. No validation that D3 exists or has required methods.
- Safe modification: Add defensive checks. Make D3 imports explicit. Use ES modules instead of global declaration.
- Test coverage: No tests. Plugin loading can fail silently. Manual browser testing required.

**Chart Dimension Calculations:**
- Files: `components/skillmap/skillGraphRenderers.ts` (line 73), `components/dashboard/OrgPerformanceChart.tsx`
- Why fragile: Font sizes and label lengths calculated with magic numbers based on computed area. Small data changes can break layout.
- Safe modification: Add bounds checks. Test with edge cases (very small/large areas). Consider responsive layout library.
- Test coverage: No tests. Layout can break with different data distributions.

## Scaling Limits

**In-Memory Mock Data:**
- Current capacity: Hardcoded arrays with ~50-200 data points per table
- Limit: Page becomes slow with >1000 rows. No pagination implemented.
- Scaling path: Implement server-side pagination. Virtualize table rows. Use infinite scroll. When moving to real API, implement cursor-based pagination.

**TanStack React Table with Large Datasets:**
- Current capacity: Table works smoothly with mock data (<500 rows shown at once)
- Limit: Sorting/filtering large datasets causes noticeable lag
- Scaling path: Implement server-side sorting and filtering. Use API query parameters. Cache sorted results. Consider column virtualization for 100+ columns.

**D3 Voronoi Treemap with Complex Hierarchies:**
- Current capacity: Skill graph renders smoothly with current data depth (3 levels: root → domain → skill)
- Limit: Adding deeper hierarchies (4+ levels) or more nodes (>500) will cause blocking computation
- Scaling path: Use WebWorker for computation. Implement progressive rendering. Add level-of-detail rendering for zoom interactions.

**SVG Rendering - Thousands of DOM Elements:**
- Current capacity: Skill graph renders without noticeable lag
- Limit: Adding animation or interactivity to >2000 SVG elements will degrade performance
- Scaling path: Switch to Canvas rendering. Use SVG with virtualisation. Implement clipping/culling for off-screen elements.

## Dependencies at Risk

**AG Charts Enterprise (Commercial License):**
- Risk: `ag-charts-enterprise@13.0.1` is a commercial package with license restrictions
- Impact: License violations could result in legal issues. Vendor lock-in to AG Grid ecosystem. No open-source alternative if license expires.
- Migration plan: Audit license compliance with legal team. Consider `recharts` (already in dependencies) or `visx` for open-source replacement. Document license in README.

**D3 Plugins - Voronoi Treemap Not Bundled:**
- Risk: Skill graph depends on optional D3 plugin that must be loaded separately. Plugin loading can fail silently.
- Impact: Skill graph breaks without warning. No fallback visualization.
- Migration plan: Bundle voronoi treemap library explicitly. Add error boundary. Implement fallback (e.g., sunburst chart). Consider replacing with simpler treemap algorithm.

**No Version Pinning in package.json:**
- Risk: All dependencies use `^` or `~` ranges. Minor version updates could introduce breaking changes.
- Impact: Builds can become non-deterministic. Unexpected runtime errors in production.
- Migration plan: Add lock file (use pnpm or npm ci). Pin critical dependencies to exact versions (`recharts`, `@radix-ui/*`, `next`). Use Dependabot for security updates.

## Test Coverage Gaps

**No Unit Tests for Utility Functions:**
- What's not tested: Data transformation (sorting, filtering), calculations (opacity scale, skill completion value), date range logic
- Files: `lib/orgDashboard/*.ts`, `lib/routes.ts`, `components/skillmap/skillGraphUtils.ts`
- Risk: Bug fixes and refactoring can silently break calculations. No regression protection.
- Priority: High - these utilities power all data display

**No Component Integration Tests:**
- What's not tested: Table filter buttons change sorting correctly, visibility toggles update chart, parent-child state synchronization
- Files: `components/dashboard/SkillgraphBySkillTable.tsx`, `components/dashboard/SkillgraphByTeamTable.tsx`, `app/org/[orgId]/page.tsx`
- Risk: State management bugs won't be caught. UI interactions may break between releases.
- Priority: High - users interact with these components

**No E2E Tests:**
- What's not tested: Full user journeys (navigate to org → switch teams → filter → export), link navigation, breadcrumb paths
- Files: App routes and page navigation
- Risk: Routing bugs, broken links, navigation failures won't surface until user reports them.
- Priority: Medium - can be covered with manual testing until CI pipeline is set up

**No Chart Rendering Tests:**
- What's not tested: Charts render without errors, axis labels are correct, data points display correctly
- Files: `components/dashboard/OrgPerformanceChart.tsx`, `components/dashboard/D3Gauge.tsx`, `components/skillmap/SkillGraph.tsx`
- Risk: Chart breaking changes won't be caught. Visual regressions unnoticed.
- Priority: Medium - visual testing tools can help (Percy, Chromatic)

**No Error Boundary Tests:**
- What's not tested: Error handling, fallback UI, error recovery
- Files: All components (no error boundaries exist yet)
- Risk: Runtime errors crash entire page instead of showing graceful fallback.
- Priority: High - critical for user experience

---

*Concerns audit: 2026-02-06*
