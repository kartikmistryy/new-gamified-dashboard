# Pitfalls Research

**Domain:** Team Dashboard - Adapting Team-Level Components for Member-Level Views
**Researched:** 2026-02-06
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Assuming Aggregated Components Work Unchanged for Individual Data

**What goes wrong:**
Components designed for team aggregates (like `TeamPerformanceRow` with `typeDistribution` showing counts of 30 members) are directly reused for individual members, causing nonsensical displays. For example, a single member cannot have "star: 10, timeBomb: 9" — they're one person with one classification.

**Why it happens:**
The component interface appears compatible because both use the same TypeScript types, and the BaseTeamsTable is generic. Developers assume "if it compiles, it works" without considering semantic differences between aggregate counts and individual attributes.

**How to avoid:**
- Create parallel type definitions: `MemberRow` separate from `TeamPerformanceRow`
- For members, replace count-based fields (`typeDistribution: { star: 10, ... }`) with single classification (`memberType: "star"`)
- Add compile-time guards: use discriminated unions where `entityType: "team" | "member"` forces different data shapes
- Validate mock data generation: member mocks should have sum-to-1 distributions or single classifications, not sum-to-30

**Warning signs:**
- Seeing numbers like "5 stars, 3 time bombs" in member detail view
- SegmentBar showing multiple segments for a single member
- Metric cards at member level showing counts > 1 for mutually exclusive categories
- Test data with `typeDistribution` totaling 30 instead of 1

**Phase to address:**
Phase 1 (Data Modeling) — establish distinct member vs. team types before building components

---

### Pitfall 2: Mock Data Drift Between Team and Member Levels

**What goes wrong:**
Team-level metrics don't mathematically align with the sum/average/distribution of their constituent members. For example, a team shows 60% "star" members but individual member data shows only 2 out of 10 are stars (20%). This breaks trust in the dashboard and makes cross-level analysis impossible.

**Why it happens:**
Mock generators are created independently for teams (`getTeamPerformanceRowsForGauge`) and members (`getMemberPerformanceRows`), with no referential consistency. The team gauge value (0-100) doesn't derive from member data, it's random.

**Consequences:**
- Users notice contradictions: "My team is 80/100 but all members are below 50"
- Navigation from team → members reveals inconsistencies
- Testing fails to catch because there's no cross-validation
- Business logic decisions based on aggregates become meaningless

**How to avoid:**
- Build member mocks FIRST, then derive team aggregates from them
- Create bidirectional generators: `getMembersForTeam(teamId) → members[]` then `aggregateTeamMetrics(members[]) → TeamRow`
- Add consistency validation: test suite verifying `sum(member.performanceValue) / count ≈ team.performanceValue`
- Document aggregation formulas explicitly (average, median, weighted, etc.)

**Warning signs:**
- Creating `memberMockData.ts` and `teamMockData.ts` as separate files with no shared logic
- Using different random number seeds for team vs. member generation
- No unit tests validating aggregate consistency
- Mock data functions not accepting parent entity IDs as parameters

**Phase to address:**
Phase 2 (Mock Data Creation) — establish bidirectional consistency before UI implementation

---

### Pitfall 3: Hardcoded Team Assumptions in "Reusable" Components

**What goes wrong:**
Components claiming to be reusable have hardcoded team-specific logic buried in render functions, filter implementations, or column definitions. For example, `TeamTable` has a filter "Most Risky" that calculates risk as `timeBomb count + risky count`, which doesn't apply to individual members.

**Why it happens:**
Components were abstracted into `BaseTeamsTable` for table structure reuse, but domain logic (filters, sorting, calculations) remained team-specific. The abstraction stopped at UI primitives, not business logic.

**Consequences:**
- Copy-paste component variants proliferate (`TeamTable`, `MemberTable`, `UserTable`)
- Filters break or show wrong results when applied to member data
- Rank calculations malfunction (showing "Rank 1" for all 5 members)
- Bug fixes must be applied to multiple component variants

**How to avoid:**
- Extract filter logic into separate, parameterized functions: `createRiskFilter<T>(getTimeBombCount: (t: T) => number, getRiskyCount: (t: T) => number)`
- Use strategy pattern for entity-specific behavior: pass `entityConfig` defining how to extract/calculate metrics
- Generic type constraints ensuring compile-time verification: `BaseTable<T extends { performanceValue: number }>`
- Component composition over configuration: `<BaseTable><RiskFilter entity="member" /></BaseTable>`

**Warning signs:**
- Finding `if (isTeamLevel)` conditionals inside "reusable" components
- TypeScript type parameters that aren't actually generic (`T extends TeamPerformanceRow`)
- Column definitions referencing specific field names instead of accessor functions
- Filter functions directly accessing `.typeDistribution.timeBomb` instead of using adapters

**Phase to address:**
Phase 3 (Component Adaptation) — refactor domain logic out of UI components before cloning for members

---

### Pitfall 4: Nested Dynamic Route Parameter Mismanagement

**What goes wrong:**
Components at `/org/:orgId/team/:teamId` incorrectly handle multiple dynamic parameters, leading to: (1) reading wrong parameter (`orgId` instead of `teamId`), (2) race conditions where params update out of sync, (3) static rendering failures in Next.js App Router, or (4) incorrect data fetching based on stale params.

**Why it happens:**
Developers forget that `useParams()` only works in client components, fail to handle parent-child param inheritance, or assume params are immediately available on mount. Next.js App Router's static-first rendering catches developers off guard when dynamic APIs aren't explicitly used.

**Consequences:**
- Team dashboard shows org-level data instead of team-specific data
- Refreshing the page works but navigation from org → team fails
- Next.js pre-renders static HTML for dynamic routes, causing hydration mismatches
- SEO suffers because 404s are returned as 200s with broken UI

**How to avoid:**
- Always add `"use client"` to components calling `useParams()`
- Destructure both params explicitly: `const { orgId, teamId } = useParams<{ orgId: string; teamId: string }>()`
- Add validation and notFound() calls: `if (!teamId) notFound()`
- Use `generateStaticParams()` for known routes or mark dynamic with `export const dynamic = 'force-dynamic'`
- Type params with Zod or similar: `const params = paramsSchema.parse(useParams())`

**Warning signs:**
- Error: "useParams() can only be used in Client Components"
- Data fetching using `orgId` where `teamId` is expected
- Static rendering warnings in Next.js build output for dynamic routes
- Broken deep links (direct URL access fails but navigation works)
- Hydration errors mentioning parameter values

**Phase to address:**
Phase 4 (Routing Implementation) — validate parameter handling before building page components

---

### Pitfall 5: Visual Inconsistency from Unscaled Design Tokens

**What goes wrong:**
Components designed for 5 teams display poorly when showing 50 members. Visual elements don't scale: table row heights optimized for 5 rows create endless scrolling with 50, color palettes designed for 5 entities run out of distinguishable colors, gauges/charts have labels overlapping, and responsive breakpoints fail at different data cardinalities.

**Why it happens:**
Design systems are built for specific scales (team-level with 5-10 entities) and developers assume the same spacing, sizing, and color schemes work universally. The visual tokens (padding, font sizes, color arrays) are hardcoded for team scale.

**Consequences:**
- Member tables require excessive scrolling, hurting usability
- Color collisions: 5 team colors from `TEAM_COLORS_BY_RANK` reused for 50 members causes confusion
- Chart labels overlap when too many data points render
- Responsive behavior breaks (mobile/tablet views optimized for 5 items, not 50)
- Visual hierarchy disappears (everything looks equally important)

**How to avoid:**
- Establish scale-aware design tokens: `teamScale: { itemsPerPage: 5 }`, `memberScale: { itemsPerPage: 15 }`
- Use pagination or virtualization for member lists (not needed for 5 teams, critical for 50+ members)
- Color generation strategies: team colors are fixed palette, member colors use hash-based generation
- Responsive testing at different data scales: test with 5, 15, 50, 100 items
- Chart library configurations: set `maxLabelCount`, `minHeight`, `autoSkipLabels` per scale

**Warning signs:**
- Copy-pasting `TEAM_COLORS_BY_RANK` array for member colors
- Tables without pagination showing 50+ rows
- Chart containers with fixed heights that worked for 5 items
- No `maxItems` or `pageSize` props in component interfaces
- Single breakpoint system used for both team and member views

**Phase to address:**
Phase 5 (Visual Consistency Review) — establish scale-specific design tokens before final implementation

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Cloning component files instead of extracting shared logic | Fast to implement, avoids refactoring existing code | Bug fixes must be applied N times; divergence over time | Never — extract shared logic into composable utilities |
| Using `any` or type assertions for member/team union types | Bypasses TypeScript errors during adaptation | Runtime bugs, no type safety, refactoring nightmares | Never — use discriminated unions and type narrowing |
| Hardcoding member count as 30 in generators | Mirrors team structure exactly (30 team members total) | Breaks when team sizes vary; unrealistic testing | Only in initial POC; replace with parameterized counts in Phase 2 |
| Skipping responsive testing for member scale | Org dashboard already works responsively | Member views break at different scales/devices | Never — responsive behavior is scale-dependent |
| Deriving team metrics manually instead of from member data | Team mocks generate faster independently | Aggregate consistency breaks; cross-drill analysis fails | Only for isolated prototyping; production needs consistency |
| Reusing exact filter labels between team/member views | Consistent terminology reduces user confusion | Filters may have different meanings ("Most Productive Team" vs. "Most Productive Member") | Sometimes acceptable — validate semantic equivalence first |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Next.js App Router params | Calling `useParams()` in server components | Add `"use client"` directive or use params from props in server components |
| TypeScript generics with BaseTeamsTable | Constraining generic to `T extends TeamPerformanceRow` | Use structural constraints: `T extends { performanceValue: number; ... }` |
| Mock data imports | Circular dependencies between team/member generators | Separate concerns: `entities.ts` (base data) → `aggregators.ts` (team from members) → `generators.ts` (exposed API) |
| Responsive Tailwind classes | Assuming breakpoints work the same with 5 vs. 50 items | Test at target scale; use `@container` queries for component-level responsiveness |
| Route validation | Rendering UI even when teamId is invalid | Use `notFound()` from next/navigation for missing resources |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-sorting entire member list on every filter change | Laggy UI when clicking filter tabs | Memoize sort results with `useMemo([rows, currentFilter])` | > 20 members |
| Regenerating all mock data on every render | Page feels slow to load/navigate | Generate once in module scope or use `useMemo` with stable deps | > 50 members |
| Rendering all table rows without pagination | Scroll performance degrades | Implement virtualization (`@tanstack/react-virtual`) or pagination | > 30 rows |
| Recalculating aggregate metrics in render functions | Janky animations, slow interactions | Compute aggregates during data generation, not rendering | > 10 members |
| Deep object spreads in TypeScript generics | Slow TypeScript language server, sluggish IDE | Use interface intersection (`&`) over spreading large types | > 20 type properties |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing actual member PII in mock data | Accidental commit of real names/emails during development | Use generator libraries (faker.js) with deterministic seeds, never real data |
| Hardcoding orgId/teamId in development | Developers forget to parameterize, leaving test IDs in production | Use environment variable defaults, validate params at runtime |
| No authorization checks in nested routes | Users accessing `/org/A/team/B` where team B is from org C | Add authorization middleware validating teamId belongs to orgId |
| Leaking member metrics to unauthorized users | Performance data visible to non-managers | Implement role-based access control even in mock phase (establishes patterns) |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Identical filter labels at team and member levels | Confusion about what "Most Risky" means in different contexts | Add context: "Most Risky Teams" vs. "Members with Highest Risk Score" |
| No breadcrumb or back navigation from member to team | Users get lost in nested hierarchy | Add breadcrumbs: "Org / Frontend Team / Members" with clickable parents |
| Same gauge visualization for team (average) and member (individual) | Misleading comparisons (team aggregate vs. member absolute) | Add visual distinction: team gauge shows range, member gauge shows single point |
| Overloading member view with all team-level features | Cognitive overload; not all team metrics apply to individuals | Prioritize member-relevant metrics; defer less relevant features |
| Color coding members the same way as teams | Users expect member colors to mean same thing as team colors | Use different color semantics: teams by identity, members by performance |
| No empty state for teams with 0 members | Broken UI when filtering leaves empty results | Add empty state: "No members match this filter" with reset action |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Member mock data:** Often missing bidirectional consistency with team aggregates — verify `sum(members.performanceValue)/count ≈ team.performanceValue`
- [ ] **Nested route handling:** Often missing `notFound()` for invalid teamId — verify `/org/1/team/999` returns 404, not broken UI
- [ ] **Component type constraints:** Often missing proper generics, using `any` — verify TypeScript catches wrong data shape at compile time
- [ ] **Responsive behavior:** Often missing scale-appropriate breakpoints — verify member table with 50 rows on mobile
- [ ] **Filter semantics:** Often missing validation that team filters make sense for members — verify "Most Risky" calculates correctly for individual members
- [ ] **Color palette exhaustion:** Often missing color generation for N members — verify 50 members have distinguishable colors
- [ ] **Performance memoization:** Often missing `useMemo` for expensive calculations — verify no re-sorts on unrelated state changes
- [ ] **Pagination/virtualization:** Often missing for member lists — verify smooth scrolling with 100+ members
- [ ] **Empty states:** Often missing "No members" or "No results" views — verify filtering to empty set shows helpful message
- [ ] **TypeScript discriminated unions:** Often missing proper narrowing for member vs. team data — verify no type assertions in production code

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Aggregate components used for individual data | MEDIUM | 1. Create `MemberRow` type with single classification field. 2. Add mapper `teamRowToMemberRow()`. 3. Refactor render logic to handle both. 4. Add discriminator field for type narrowing. |
| Mock data drift | LOW | 1. Implement bottom-up generation (members first). 2. Add aggregation function. 3. Write validation tests. 4. Regenerate all mock data. |
| Hardcoded team logic in components | HIGH | 1. Extract business logic to separate functions. 2. Parameterize with entity type. 3. Use dependency injection for entity-specific behavior. 4. Refactor all call sites. |
| Route parameter bugs | LOW | 1. Add `"use client"` directive. 2. Add Zod validation schema. 3. Add `notFound()` guards. 4. Add integration tests for routing. |
| Visual inconsistency | MEDIUM | 1. Create scale-specific design tokens. 2. Add pagination/virtualization. 3. Implement color generation. 4. Re-test at target scales. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Aggregated components for individual data | Phase 1: Data Modeling | Type system prevents `TeamRow` where `MemberRow` expected |
| Mock data drift | Phase 2: Mock Data Creation | Test suite validates `sum(members) ≈ team` mathematically |
| Hardcoded team assumptions | Phase 3: Component Adaptation | Components work with both team and member data without conditionals |
| Nested route parameter bugs | Phase 4: Routing Implementation | `/org/1/team/999` returns 404; `/org/1/team/1` loads correct data |
| Visual inconsistency | Phase 5: Visual Consistency | Side-by-side comparison shows identical spacing, colors, typography |

## Sources

**Research Methodology:**
This research combined codebase analysis (existing components at `/Users/kartikmistry/Desktop Folders/new-gamified-dashboard/`), web search for 2026 best practices, and pattern recognition from common mistakes in dashboard development.

**WebSearch Findings (MEDIUM confidence - verified against official Next.js and React docs):**
- [Common Mistakes in React Admin Dashboards](https://dev.to/vaibhavg/common-mistakes-in-react-admin-dashboards-and-how-to-avoid-them-1i70) — Information overload, tight coupling, inconsistent component reuse
- [Next.js App Router: common mistakes](https://upsun.com/blog/avoid-common-mistakes-with-next-js-app-router/) — useParams() in server components, missing notFound() calls
- [Nested Dynamic Routes in Next.js](https://medium.com/javascript-decoded-in-plain-english/nested-dynamic-routes-and-file-structure-in-next-js-7409e44b3356) — Parameter handling, file structure
- [Engineering metrics for teams vs. leaders](https://www.swarmia.com/blog/engineering-metrics-for-leaders/) — Team-level aggregates vs. individual metrics
- [Dashboard Testing Best Practices](https://www.toucantoco.com/en/blog/dashboard-testing-best-practices-and-tips) — Data consistency, cross-view validation
- [Visual Consistency in Design Systems 2026](https://www.superside.com/blog/design-systems-examples) — Scaling components, modular systems
- [TypeScript Type Narrowing](https://www.totaltypescript.com/books/total-typescript-essentials/unions-literals-and-narrowing) — Discriminated unions, type guards

**Official Documentation (HIGH confidence):**
- Next.js Dynamic Routes: https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes
- TypeScript Narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

**Codebase Analysis (HIGH confidence - direct inspection):**
- Existing components: `BaseTeamsTable.tsx`, `TeamTable.tsx`, `TeamPerformanceRow` type
- Mock data generators: `overviewMockData.ts` with team-level assumptions
- Existing routing: `app/org/[orgId]/page.tsx`, `app/org/[orgId]/team/[teamId]/page.tsx`

---
*Pitfalls research for: Team Dashboard - Member-Level Analytics*
*Researched: 2026-02-06*
