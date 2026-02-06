# Roadmap: Team Dashboard - Member-Level Analytics

## Overview

Transform the organization-level dashboard into a member-level analytics view by creating a parallel Team Dashboard at `/org/:orgId/team/:teamId`. Build foundational data types and mock generators first to ensure mathematical consistency between member and team aggregates, then implement five tabs (Overview, Performance, Design, Skills Graph, SPOF) following established component patterns. The goal is maximum reuse of existing dashboard components while adapting them for individual member data at appropriate scale.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Type System** - Member data models, mock generators, routing infrastructure
- [x] **Phase 2: Overview Tab** - First complete tab validating component adaptation patterns
- [x] **Phase 3: Performance Tab** - Time series filtering and comparative metrics
- [ ] **Phase 4: Remaining Tabs** - Design, Skills Graph, SPOF tabs completing 5-tab structure

## Phase Details

### Phase 1: Foundation & Type System
**Goal**: Establish member-specific data models and routing infrastructure that enable all subsequent tabs to work correctly
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. Member data types exist separate from team types with TypeScript discriminated unions preventing misuse
  2. Mock data generators produce member data that aggregates mathematically to team totals
  3. Team Dashboard route at `/org/:orgId/team/:teamId` renders without errors
  4. MemberTable component displays member rows with name, avatar, and metrics
  5. Tab navigation switches between all 5 team dashboard tabs
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Member types and mock data generators
- [x] 01-02-PLAN.md — MemberTable component, team pages, and tab navigation

### Phase 2: Overview Tab
**Goal**: Users can view team member performance metrics using familiar dashboard interface
**Depends on**: Phase 1
**Requirements**: OVER-01, OVER-02, OVER-03, OVER-04, OVER-05
**Success Criteria** (what must be TRUE):
  1. Member table shows all team members with rank, name, avatar, effective performance, and developer type
  2. D3Gauge displays team performance aggregated from member data
  3. Six metric cards display member counts for each category (Star, Time Bomb, Key Role, Bottleneck, Risky, Legacy)
  4. ChartInsights panel shows member-level trend insights
  5. Filter tabs (Most Productive, Least Productive, Most Optimal, Most Risky) correctly filter member data
**Plans**: 1 plan

Plans:
- [x] 02-01-PLAN.md — Overview helpers, gauge, metric cards, insights, and page composition

### Phase 3: Performance Tab
**Goal**: Users can track individual member performance over time with comparative analysis
**Depends on**: Phase 2
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04, PERF-05
**Success Criteria** (what must be TRUE):
  1. Performance tracking chart displays normalized median member performance over selected time range
  2. Time range filter buttons (1 Month, 3 Months, 1 Year, Max) update chart data
  3. Member performance table shows Rank, Name, Effective Performance, Change, and Churn Rate columns
  4. Filter tabs (Most Productive, Least Productive, Most Improved, Most Regressed, Highest Churn, Lowest Churn) work correctly
  5. ChartInsights panel provides performance trend analysis specific to member data
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Performance types, mock data generator, and helper functions
- [x] 03-02-PLAN.md — MemberPerformanceChart component and page composition

### Phase 4: Remaining Tabs
**Goal**: Users can analyze member-level design patterns, skills distribution, and SPOF risks
**Depends on**: Phase 3
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, SKILL-01, SKILL-02, SKILL-03, SKILL-04, SKILL-05, SPOF-01, SPOF-02, SPOF-03, SPOF-04, SPOF-05
**Success Criteria** (what must be TRUE):
  1. Design tab shows member ownership health and chaos index with charts and table
  2. Design tab filter tabs and ChartInsights work with member data
  3. Skills Graph tab displays member skill distribution with sunburst/treemap chart
  4. Skills Graph view toggle (By Team / By Skill) and filter tabs work correctly
  5. SPOF tab shows member SPOF distribution and repository health with charts and table
  6. All three tabs maintain visual consistency with Overview and Performance tabs
**Plans**: TBD

Plans:
- [ ] TBD (pending plan-phase)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Type System | 2/2 | ✓ Complete | 2026-02-06 |
| 2. Overview Tab | 1/1 | ✓ Complete | 2026-02-06 |
| 3. Performance Tab | 2/2 | ✓ Complete | 2026-02-06 |
| 4. Remaining Tabs | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-06*
*Last updated: 2026-02-06 (Phase 3 complete)*
