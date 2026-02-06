# Phase 1: Foundation & Type System - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish member-specific data models, mock data generators, and routing infrastructure that enable all subsequent dashboard tabs to work correctly. This phase creates the foundation (types, mocks, routes, basic member table) but does NOT implement complete tab functionality — that's Phases 2-4.

</domain>

<decisions>
## Implementation Decisions

### Type System Design
- Claude's discretion on shared vs separate base interfaces
- Claude's discretion on type safety mechanism (discriminated unions vs branded types)
- Claude's discretion on metric category definition (union type vs enum vs const)
- Claude's discretion on type validation approach (Zod vs TypeScript-only vs type guards)

### Mock Data Strategy
- **Aggregation strictness:** Approximate (member metrics roughly add up to team within 5-10%)
- **Variance pattern:** Realistic distribution (star performers at 2-5x median, long tail matches real engineering teams)
- **Time series scope:** Partial history (last 30-90 days) — enough to test trends without full dataset
- **Default team size:** Small team (5-8 members) — easier to verify, all visible without scrolling

### Routing & Navigation
- **URL structure:** `/org/:orgId/team/:teamId` — matches existing org dashboard pattern for consistency
- **Navigation method:** Click team in sidebar — always visible team selector
- **Breadcrumbs:** Full breadcrumb (Org Name > Team Name) showing hierarchy with click-to-navigate
- **Tab structure:** Identical 5 tabs as org dashboard (Overview, Performance, Design, Skills Graph, SPOF) — familiar and consistent

### Claude's Discretion
- Type system architecture (shared interfaces, discriminated unions, branded types)
- Metric category type definition approach
- Runtime validation strategy
- Specific mock data generation algorithms
- Member table column implementation details (covered by success criteria)
- Tab navigation component implementation

</decisions>

<specifics>
## Specific Ideas

- Mock data should mirror realistic engineering team distributions (not uniform)
- Small default team size makes it easy to verify aggregation correctness visually
- Route pattern must match existing org dashboard for hierarchy consistency
- Breadcrumb navigation reinforces org > team relationship

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-type-system*
*Context gathered: 2026-02-06*
