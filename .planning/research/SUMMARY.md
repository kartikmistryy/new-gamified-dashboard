# Project Research Summary

**Project:** Team Dashboard Extension
**Domain:** Member-level analytics dashboard (nested within org-level dashboard)
**Researched:** 2026-02-06
**Confidence:** HIGH

## Executive Summary

The Team Dashboard is a drill-down extension of the existing Organization Dashboard, showing member-level analytics where the Org Dashboard shows team-level analytics. The recommended approach is **zero new dependencies** — the existing Next.js 16 App Router, React 19, TypeScript 5.x, Shadcn/Radix UI, and D3.js stack provides all necessary capabilities. The core challenge is not technical stack selection, but rather **semantic adaptation**: transforming aggregate components (team-level) to individual components (member-level) while maintaining visual consistency and data integrity.

Research reveals that the primary risk is assuming team-level components work unchanged for member data. A team's `typeDistribution: { star: 10, timeBomb: 9 }` (30 members classified) cannot translate directly to a single member's classification. Success depends on establishing parallel type definitions (`MemberRow` separate from `TeamPerformanceRow`), bidirectional mock data consistency (members aggregate to teams mathematically), and component adaptation patterns that extract business logic from UI primitives. The existing codebase already has 27 reusable dashboard components and routing infrastructure that handles nested dynamic routes — the work is composition and adaptation, not building from scratch.

The key insight from research: this is not a greenfield project, but a **pattern-following exercise**. Mirror the 5-tab structure (Overview, Performance, Design, Skills Graph, SPOF), reuse generic components (BaseTeamsTable, GaugeSection, ChartInsights), and establish member-specific data models that aggregate correctly to team totals. The pitfall to avoid is thinking this is "just filtering by team" — it's a dimensional drill-down requiring different aggregation semantics and scale-appropriate design tokens.

## Key Findings

### Recommended Stack

**No new dependencies needed.** The existing stack is comprehensive:

**Core technologies:**
- **Next.js 16.1.6 (App Router)**: Nested dynamic routes `/org/[orgId]/team/[teamId]` are native features; already handles team context
- **TypeScript 5.x**: Utility types (`Pick`, `Omit`, mapped types) transform team types to member types without runtime libraries
- **Shadcn/Radix UI + D3.js 7.9.0**: All visualization components (gauges, charts, tables) work for both team and member data
- **BaseTeamsTable (custom generic table)**: Already demonstrates reusable pattern; adapt for members without duplication
- **DiceBear API**: Reuse for member avatars (switch from "shapes" to "avataaars" style)

**Critical version note:** Next.js 16 changed `params` from object to Promise. All route handlers must use `await params` in Server Components or `use(params)` hook in Client Components.

**What NOT to add:**
- Runtime validation libraries (Zod, Yup) — mock data only, no API validation needed yet
- @tanstack/react-table — BaseTeamsTable already provides needed functionality
- State management (Zustand, Redux) — React state and Server Components handle current needs
- Additional animation libraries — Framer Motion already installed

**Confidence:** HIGH — verified against existing package.json and codebase patterns.

### Expected Features

**Must have (table stakes):**
- Member tables mirroring team tables for all 5 tabs (Overview, Performance, Design, Skills Graph, SPOF)
- Same 6 metric categories (Star, Time Bomb, Key Role, Bottleneck, Risky, Legacy) applied to individual members
- D3Gauge aggregated from member data showing team performance
- Same filtering/sorting patterns (Most Productive, Least Productive, Most Improved, Most Regressed)
- Time range filters (1w, 1m, 3m, 6m, 1y, 5y) on Performance tab
- ChartInsights panels with member-specific trend insights
- Member performance percentile within team context ("You're 3rd of 8" without naming others)
- Member-to-team contribution visibility ("John is 15% of team performance")

**Should have (competitive differentiators):**
- Skills gap highlighting (team expected skills vs. member actual skills)
- Comparative trend lines (member performance overlaid on team average)
- Member-specific SPOF risk score (individual code ownership concentration)
- Anonymized peer comparison (percentile ranking without public leaderboards)
- Skill proficiency trend (not just usage, but mastery over time)

**Defer (v2+):**
- Collaboration metrics (PR reviews, mentoring, unblocking) — requires new data sources not yet tracked
- Role-based metric weighting (IC vs lead vs senior) — requires role taxonomy and complex weighting
- Custom metric definitions — avoid premature abstraction

**Anti-features to AVOID:**
- Public leaderboards (ranked members visible to all) — creates toxic culture
- Individual lines of code / commit counts — encourages quantity over quality
- Real-time live updating member metrics — surveillance culture
- Individual performance tied to compensation display — perverse incentives
- Drill-down to individual commit/PR details — micromanagement
- Side-by-side member A vs B comparison — ignores context, toxic

**Confidence:** HIGH — based on UX consistency expectations, 2026 engineering metrics best practices, and privacy-first design principles.

### Architecture Approach

The Team Dashboard follows the established **nested dynamic route pattern**: `app/org/[orgId]/team/[teamId]/[tab]/page.tsx`. The existing routing infrastructure in `lib/routes.ts` already extracts `teamId` from paths, and `DashboardTabs` component already recognizes team dashboard type.

**Major components:**
1. **Parallel Data Layer** (`lib/teamDashboard/`) — Member-focused mock data generators separate from org-level, with bidirectional consistency (members aggregate to teams mathematically)
2. **Adapted Table Components** (`MemberTable.tsx`) — Reuse `BaseTeamsTable` generic structure with member-specific columns and filters; avoid duplication
3. **Reused Visualization Components** — GaugeSection, ChartInsights, DashboardSection, SegmentBar, D3Gauge work as-is with member data passed as props
4. **Context-Aware Navigation** — Existing tab helpers already build team-scoped hrefs; `resolveActiveTab()` handles team context detection
5. **Client Component Pages** — Follow existing "use client" pattern for all dashboard pages (required for D3.js, state management, interactivity)

**Structure:**
```
app/org/[orgId]/team/[teamId]/
  page.tsx              # Team Overview
  performance/page.tsx  # NEW
  design/page.tsx       # NEW
  skillgraph/page.tsx   # NEW
  spof/page.tsx         # NEW

lib/teamDashboard/      # NEW directory
  types.ts              # MemberPerformanceRow, MemberTableFilter
  overviewMockData.ts   # Member performance data
  [4 more mock files]

components/dashboard/
  MemberTable.tsx       # NEW - adapts BaseTeamsTable
  [27 existing]         # REUSE - GaugeSection, ChartInsights, etc.
```

**Patterns to follow:**
- **Component Adaptation via Props** — Pass different data types through consistent interfaces; minimize duplication
- **Parallel Mock Data Organization** — Build members FIRST, derive team aggregates from them (not independent generation)
- **TypeScript Utility Types** — Use `Omit`, intersection types (`&`) to transform team types to member types
- **"Use Client" Boundary** — All dashboard pages are Client Components for D3.js and state management

**Confidence:** HIGH — architecture verified against existing codebase structure; all routing utilities and navigation patterns already in place.

### Critical Pitfalls

1. **Assuming aggregate components work unchanged for individual data** — Team components show `typeDistribution: { star: 10, timeBomb: 9 }` (30 members classified). A single member cannot have "10 stars" — they're one person with one classification. **Avoid:** Create parallel `MemberRow` types with single classification (`memberType: "star"`) instead of count distributions. Use discriminated unions to prevent `TeamRow` where `MemberRow` is expected.

2. **Mock data drift between team and member levels** — Independently generated team and member mocks create mathematical contradictions: team shows 60% stars but members show only 20%. **Avoid:** Build member mocks FIRST, then derive team aggregates with `aggregateTeamMetrics(members[])`. Add validation tests ensuring `sum(member.performanceValue) / count ≈ team.performanceValue`.

3. **Hardcoded team assumptions in "reusable" components** — BaseTeamsTable filters calculate risk as `timeBomb count + risky count` (team aggregate logic). This doesn't apply to individual members. **Avoid:** Extract filter logic into parameterized functions or strategy pattern. Pass entity-specific behavior as configuration, not hardcode in render functions.

4. **Nested dynamic route parameter mismanagement** — Components at `/org/:orgId/team/:teamId` incorrectly handle multiple params, causing wrong data fetching or hydration mismatches. **Avoid:** Always use `"use client"` with `useParams()`. Destructure both params explicitly: `const { orgId, teamId } = useParams<{ orgId: string; teamId: string }>()`. Add validation with `notFound()` for invalid IDs.

5. **Visual inconsistency from unscaled design tokens** — Components designed for 5 teams display poorly with 50 members. Color palettes run out, table scrolling becomes excessive, chart labels overlap. **Avoid:** Establish scale-aware design tokens (team scale: 5 items, member scale: 15-50 items). Add pagination for member tables. Use hash-based color generation for members (not fixed palette). Test responsive behavior at target data scale.

**Confidence:** HIGH — pitfalls identified through codebase analysis and verified against common dashboard development mistakes documented in 2026 best practices.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Data Foundation & Type System
**Rationale:** Establishing correct data models prevents cascading errors. Pitfall #1 (aggregate vs individual data) and #2 (mock data drift) must be addressed before building any UI.

**Delivers:**
- `lib/teamDashboard/types.ts` with member-specific types (`MemberPerformanceRow`, `MemberTableFilter`, etc.)
- Bidirectional mock data generators (members → team aggregates)
- Validation tests ensuring mathematical consistency between team and member data
- TypeScript discriminated unions preventing misuse of team types for member data

**Addresses:**
- Table stakes: Foundation for all member tables and metrics
- Pitfall #1: Separate `MemberRow` vs `TeamPerformanceRow` types
- Pitfall #2: Bidirectional consistency (members aggregate to teams)

**Avoids:** Building UI before data semantics are correct (would require complete rebuild)

---

### Phase 2: Team Overview Tab (Proof of Concept)
**Rationale:** Build one complete tab to validate component adaptation patterns before scaling to all 5 tabs. Establishes reusable patterns for remaining phases.

**Delivers:**
- `app/org/[orgId]/team/[teamId]/page.tsx` (Team Overview)
- `components/dashboard/MemberTable.tsx` adapting BaseTeamsTable
- Member avatar generation (DiceBear with "avataaars" style)
- Routing validation with `notFound()` guards
- D3Gauge showing team aggregate from member data

**Uses:**
- Next.js 16 nested dynamic routes with Promise params
- BaseTeamsTable generic pattern for MemberTable
- Existing GaugeSection, DashboardSection components

**Implements:**
- Component Adaptation via Props pattern
- Context-Aware Tab Navigation (already exists, validates it works)

**Addresses:**
- Table stakes: Team Overview with member tables
- Pitfall #3: Extract generic logic from BaseTeamsTable for reuse
- Pitfall #4: Validate nested route parameter handling

**Research flag:** Standard patterns — no additional research needed. Follow existing org dashboard page structure.

---

### Phase 3: Performance & Time Range Filtering
**Rationale:** Performance tab adds complexity (time ranges, comparative metrics) beyond Overview. Validates that filtering/sorting patterns work at member scale.

**Delivers:**
- `app/org/[orgId]/team/[teamId]/performance/page.tsx`
- Time range filters (1w, 1m, 3m, 6m, 1y, 5y) applied to member data
- Member performance percentile calculation ("3rd of 8 within team")
- Comparative trend lines (member overlay on team average)
- ChartInsights for member-specific trends

**Uses:**
- Existing TimeRangeFilter component
- Mock data with time series for member performance
- Member-to-team contribution percentage calculations

**Addresses:**
- Table stakes: Time range filters, performance percentile
- Differentiators: Comparative trend lines
- Pitfall #5: Scale-appropriate pagination (50+ members need paging)

**Research flag:** Standard patterns — time series filtering already implemented in org Performance page.

---

### Phase 4: Design, Skills Graph, SPOF Tabs (Pattern Replication)
**Rationale:** Remaining tabs follow established patterns from Overview and Performance. Can be developed in parallel once patterns are validated.

**Delivers:**
- `app/org/[orgId]/team/[teamId]/design/page.tsx`
- `app/org/[orgId]/team/[teamId]/skillgraph/page.tsx`
- `app/org/[orgId]/team/[teamId]/spof/page.tsx`
- Member design metrics (code ownership patterns)
- Member skill usage with percentage of team total
- Member SPOF risk score (individual dependency concentration)

**Uses:**
- Same patterns from Phase 2 & 3 (MemberTable, filtering, gauges)
- Reuse SegmentBar for skill distribution
- Adapt SPOF distribution logic for individual members

**Addresses:**
- Table stakes: Complete 5-tab structure
- Differentiators: Member-specific SPOF risk, skills gap highlighting
- Pitfall #5: Visual consistency across all tabs (same spacing, colors, typography)

**Research flag:** Standard patterns — mirror org dashboard tabs exactly.

---

### Phase 5: Polish & Differentiation Features
**Rationale:** After core functionality is complete, add competitive features that weren't table stakes but enhance value.

**Delivers:**
- Anonymized peer comparison (percentile ranking without names)
- Skills gap highlighting (team expected vs. member actual)
- Skill proficiency trend (mastery over time, not just usage)
- Responsive behavior validation at member scale (50+ rows)
- Empty states ("No members match filter")
- Breadcrumb navigation (Org → Team → Members)

**Uses:**
- Differentiator features from FEATURES.md
- Scale-aware design tokens
- Privacy-first patterns (no public leaderboards)

**Addresses:**
- Differentiators: All "should have" competitive features
- Pitfall #5: Visual scaling validation (test with 5, 15, 50, 100 members)
- UX pitfalls: Contextual labels, breadcrumbs, empty states

**Research flag:** Needs targeted research — anonymized comparison patterns not well-documented; may need `/gsd:research-phase` during execution.

---

### Phase Ordering Rationale

- **Foundation first (Phase 1):** Type system and data consistency prevent rework. Pitfalls #1 and #2 are blockers if not addressed early.
- **Single tab validation (Phase 2):** Proves component adaptation patterns before scaling to 5 tabs. Catches integration issues early.
- **Complexity graduation (Phase 3):** Performance tab adds time series and comparative metrics. Validates scaling before replicating pattern.
- **Parallel replication (Phase 4):** Once patterns proven, remaining tabs follow same structure. Low risk, high throughput.
- **Polish after validation (Phase 5):** Differentiators added once core is validated. Avoids premature optimization.

**Dependency chain:**
```
Phase 1 (types, mocks)
  → Phase 2 (Overview POC)
    → Phase 3 (Performance complexity)
      → Phase 4 (remaining tabs in parallel)
        → Phase 5 (differentiation)
```

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 5 (Polish & Differentiation):** Anonymized peer comparison patterns not well-documented. Privacy-preserving percentile ranking needs best practices validation. Consider `/gsd:research-phase` for anonymization strategies.

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** TypeScript utility types are well-documented; mock data patterns exist in codebase
- **Phase 2:** Next.js nested routes have official documentation; component adaptation follows React patterns
- **Phase 3:** Time series filtering already implemented in org Performance page; copy pattern
- **Phase 4:** Exact mirror of org dashboard tabs; established patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All dependencies exist; verified in package.json; Next.js 16 routing documented |
| Features | HIGH | Table stakes derived from UX consistency; differentiators from 2026 best practices |
| Architecture | HIGH | Verified against existing codebase; routing infrastructure already in place |
| Pitfalls | HIGH | Identified through codebase analysis and common dashboard mistakes |

**Overall confidence:** HIGH

Research based on:
- Existing codebase analysis (37 dashboard components, routing utilities, mock data patterns verified)
- Official Next.js 16, TypeScript, React 19 documentation
- 2026 engineering metrics and privacy best practices
- Common pitfalls in dashboard development

### Gaps to Address

**Minor gaps requiring validation during implementation:**

1. **Color palette exhaustion at member scale:** Research identified need for hash-based color generation for 50+ members (vs. fixed palette for 5 teams). Implementation approach is clear, but specific color algorithm not researched. **Resolution:** Test color generation in Phase 2; adjust in Phase 5 if needed.

2. **Pagination thresholds:** Research suggests pagination for 30+ member rows, but optimal page size (15? 20? 25?) not validated. **Resolution:** Start with 15 per page (mirrors team scale of 5 items visible); A/B test if users complain.

3. **Anonymized peer comparison UI patterns:** Research identified requirement for privacy-preserving percentile ranking, but specific UI patterns not researched (how to show "3rd of 8" without revealing identities in small teams). **Resolution:** Phase 5 research flag; consider `/gsd:research-phase` during execution.

4. **Skill proficiency calculation:** Differentiator feature "skill proficiency trend" requires defining "proficiency" (usage count? code complexity? PR review quality?). Not researched. **Resolution:** Defer to v2+ or define during Phase 5 planning.

All gaps are minor and addressable during execution. None are blockers for Phase 1-4.

## Sources

### Primary (HIGH confidence)
- **Next.js Documentation:** [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes), [Routing Guide](https://nextjs.org/docs/app/building-your-application/routing), [Next.js 16 Blog](https://nextjs.org/blog/next-16)
- **TypeScript Documentation:** [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html), [Type Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- **React Documentation:** [Thinking in React](https://react.dev/learn/thinking-in-react)
- **Codebase Analysis:** Verified 37 components in `/components/dashboard/`, routing utilities in `/lib/routes.ts`, tab configuration in `/components/dashboard/tabs/constants.ts`, all org pages use "use client" pattern

### Secondary (MEDIUM-HIGH confidence)
- **Engineering Metrics Best Practices:** [Swarmia Engineering Metrics 2026](https://www.swarmia.com/blog/engineering-metrics-for-leaders/), [Monday.com 30 Essential KPIs](https://monday.com/blog/rnd/engineering-metrics/), [Jellyfish 26 Engineering KPIs](https://jellyfish.co/blog/engineering-kpis/)
- **Dashboard Design Patterns:** [Pencil & Paper UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards), [UXPin Dashboard Principles 2025](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- **Next.js 2026 Patterns:** [TheLinuxCode Next.js Guide 2026](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/), [Medium Advanced Patterns](https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7)
- **TypeScript Patterns:** [Better Stack Utility Types](https://betterstack.com/community/guides/scaling-nodejs/ts-utility-types/), [Total TypeScript Narrowing](https://www.totaltypescript.com/books/total-typescript-essentials/unions-literals-and-narrowing)

### Tertiary (MEDIUM confidence)
- **Privacy & Individual Metrics:** [RDEL #106 Individual vs Team Metrics](https://rdel.substack.com/p/rdel-106-what-happens-when-organizations), [Laura Tacho Developer Performance](https://lauratacho.com/blog/using-metrics-to-measure-individual-developer-performance), [byteiota DX Platforms 2026](https://byteiota.com/developer-experience-platforms-2026-measuring-roi-now/)
- **Common Mistakes:** [Dev.to React Admin Mistakes](https://dev.to/vaibhavg/common-mistakes-in-react-admin-dashboards-and-how-to-avoid-them-1i70), [Upsun Next.js Mistakes](https://upsun.com/blog/avoid-common-mistakes-with-next-js-app-router/)
- **DiceBear Avatar API:** [GitHub Repository](https://github.com/dicebear/dicebear), [AlternativeTo Comparison](https://alternativeto.net/software/dicebear-avatars/)

---
*Research completed: 2026-02-06*
*Ready for roadmap: yes*
