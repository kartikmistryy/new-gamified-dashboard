# Team Dashboard - Member-Level Analytics

## What This Is

A Team Dashboard that drills down from organization-level to individual team member analytics. It mirrors the existing Org Dashboard's layout, components, and visual design but displays member-level metrics instead of team-level aggregations. Users navigate to `/org/:orgId/team/:teamId` to see detailed performance, skills, and health metrics for individual team members.

## Core Value

Enable users to analyze individual team member performance using the same familiar interface and metric categories they already use at the organization level.

## Requirements

### Validated

<!-- Existing capabilities in the codebase -->

- ✓ Org Dashboard with 5 tabs (Overview, Performance, Design, Skills Graph, SPOF) — existing
- ✓ Reusable chart components (D3Gauge, OrgPerformanceChart, ChaosMatrix, sunburst charts) — existing
- ✓ Reusable table components (BaseTeamsTable, SkillgraphTeamsTable, PerformanceTeamsTable, etc.) — existing
- ✓ Dashboard layout patterns with ChartInsights panels — existing
- ✓ Metric cards with categories (Star, Time Bomb, Key Role, Bottleneck, Risky, Legacy) — existing
- ✓ Mock data infrastructure with deterministic generators — existing
- ✓ Dynamic routing with App Router (`[orgId]` segments) — existing
- ✓ Shared UI primitives (Shadcn/Radix components) — existing
- ✓ TeamAvatar component for member representation — existing

### Active

<!-- Building Team Dashboard with member-level granularity -->

- [ ] Team Dashboard route at `/org/:orgId/team/:teamId` with 5 tabs
- [ ] Overview tab showing member-level metrics (D3Gauge, 6 metric cards, members table)
- [ ] Performance tab with member performance tracking chart and metrics table
- [ ] Design tab with member-level ownership/chaos visualizations
- [ ] Skills Graph tab with member skills sunburst chart and skills breakdown table
- [ ] SPOF tab with member SPOF distribution charts and tables
- [ ] Member-level mock data following same structure as team data
- [ ] Tables showing individual members instead of teams
- [ ] Filters and sorting operating on member data
- [ ] Chart Insights panels providing member-level insights
- [ ] Same visual style, colors, spacing, and responsive behavior as Org Dashboard

### Out of Scope

- Sidebar or layout shell modifications — existing sidebar structure works correctly
- Real API integration — using mock data only
- New metric categories beyond existing six (Star, Time Bomb, Key Role, Bottleneck, Risky, Legacy)
- New chart types beyond what Org Dashboard uses
- Cross-team member comparisons — focused on single team's members
- Historical data beyond what mock generators provide

## Context

This is a brownfield project extending an existing Next.js 16 dashboard application. The Org Dashboard is fully implemented with all visualization components, table components, and layout patterns. The codebase uses:

- **Next.js 16.1.6** with App Router for routing and page structure
- **React 19.2.3** with client-side interactivity ("use client" boundaries)
- **TypeScript 5.x** for type safety across components and data
- **Tailwind CSS** for styling with consistent design system
- **Shadcn/Radix UI** for accessible UI primitives
- **Mock data generators** providing deterministic member/team data

The Org Dashboard shows data at the team level. Users need the same analytical depth for individual team members. The goal is maximum component reuse - the same charts, tables, cards, and layout should work with member-level data with minimal adaptation.

## Constraints

- **No sidebar changes**: The existing sidebar navigation and layout shell must remain untouched
- **Component reuse**: Must reuse existing dashboard components from `components/dashboard/` rather than creating new ones
- **Visual consistency**: Must match Org Dashboard's exact colors, spacing, typography, and responsive behavior
- **Data structure**: Member mock data must mirror team mock data structure (same fields/shape)
- **Chart compatibility**: Charts must work identically, just consuming member data instead of team data
- **Tech stack**: Next.js App Router, React 19, TypeScript - no framework changes
- **Route pattern**: Must follow `/org/:orgId/team/:teamId` structure fitting existing routing hierarchy

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Reuse Org Dashboard components | Components are already built for teams; member data has same structure | — Pending |
| Mirror metric categories | Users understand existing categories; consistency aids comparison | — Pending |
| Create member mocks matching team structure | Enables component reuse without refactoring | — Pending |
| Use identical charts with different data | Avoids code duplication; maintains UX consistency | — Pending |

---
*Last updated: 2026-02-06 after initialization*
