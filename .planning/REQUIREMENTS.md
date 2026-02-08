# Requirements: Team Dashboard

**Defined:** 2026-02-06
**Core Value:** Enable users to analyze individual team member performance using the same familiar interface and metric categories they already use at the organization level

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Member data type definitions separate from team types (MemberPerformanceRow, MemberTableFilter, etc.)
- [x] **FOUND-02**: Member mock data generators for all 5 tabs that aggregate mathematically to team totals
- [x] **FOUND-03**: Team Dashboard route at `/org/:orgId/team/:teamId` with dynamic segments
- [x] **FOUND-04**: MemberTable component adapted from BaseTeamsTable with member-specific columns
- [x] **FOUND-05**: Tab navigation working for all 5 team dashboard tabs (Overview, Performance, Design, Skills Graph, SPOF)

### Overview Tab

- [x] **OVER-01**: Member table showing rank, name, avatar, effective performance, developer type
- [x] **OVER-02**: D3Gauge displaying team performance aggregated from member data
- [x] **OVER-03**: Six metric cards counting members (Star, Time Bomb, Key Role, Bottleneck, Risky, Legacy)
- [x] **OVER-04**: ChartInsights panel with member-level trend insights
- [x] **OVER-05**: Filter tabs (Most Productive, Least Productive, Most Optimal, Most Risky) working on member data

### Performance Tab

- [x] **PERF-01**: Performance tracking chart showing normalized median over time
- [x] **PERF-02**: Time range filter buttons (1 Month, 3 Months, 1 Year, Max)
- [x] **PERF-03**: Member performance table with columns: Rank, Name, Effective Performance, Change, Churn Rate
- [x] **PERF-04**: Filter tabs (Most Productive, Least Productive, Most Improved, Most Regressed, Highest Churn, Lowest Churn)
- [x] **PERF-05**: ChartInsights panel with performance trend analysis

### Design Tab

- [x] **DSGN-01**: Ownership Health scatter plot or chart adapted for members
- [x] **DSGN-02**: Engineering Chaos Index chart adapted for members
- [x] **DSGN-03**: Member table with ownership health and chaos index scores
- [x] **DSGN-04**: Filter tabs adapted for member-level ownership patterns
- [x] **DSGN-05**: ChartInsights panel with design pattern insights

### Skills Graph Tab

- [x] **SKILL-01**: Skills sunburst/treemap chart showing member's skill distribution
- [x] **SKILL-02**: View toggle (By Team / By Skill) for different skill groupings
- [x] **SKILL-03**: Member skills table showing Domain, Skill, Total Skill Usage, Total Skill Completion, Contributors
- [x] **SKILL-04**: Filter tabs (Most Domains, Least Domains, Most Skills, Least Skills)
- [x] **SKILL-05**: ChartInsights panel with skills insights

### SPOF Tab

- [x] **SPOF-01**: SPOF Owner Distribution histogram/chart for members
- [x] **SPOF-02**: Repository Health Distribution bar chart
- [x] **SPOF-03**: Member table with SPOF distribution and repository health columns
- [x] **SPOF-04**: Filter tabs (Most Domains, Least Domains, Most Skills, Least Skills)
- [x] **SPOF-05**: ChartInsights panel with SPOF risk insights

### Architectural Alignment

- [x] **ARCH-01**: RouteParamsProvider context provides type-safe route parameters to all components
- [x] **ARCH-02**: Page components are thin server-side wrappers with business logic in Client Components
- [x] **ARCH-03**: Strict context utility prevents null context access errors
- [x] **ARCH-04**: All URL building uses centralized route utilities from lib/routes.ts
- [x] **ARCH-05**: No direct useParams() usage - all components use useRouteParams() hook

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Differentiators

- **DIFF-01**: Member performance percentile ranking within team ("You're 3rd of 8 members")
- **DIFF-02**: Member-to-team contribution percentage display ("15% of team performance")
- **DIFF-03**: Skills gap highlighting (team expected skills vs member actual skills)
- **DIFF-04**: Comparative trend lines (member performance overlaid on team average)
- **DIFF-05**: Member-specific SPOF risk score (individual code ownership concentration)
- **DIFF-06**: Skill proficiency trend (mastery improvement over time, not just usage)

### Future Enhancements

- **ENHA-01**: Collaboration metrics (PR reviews, mentoring, unblocking) — requires new data sources
- **ENHA-02**: Role-based metric weighting (IC vs Lead vs Senior) — requires role taxonomy
- **ENHA-03**: Custom metric definitions — avoid premature abstraction until user needs are clear
- **ENHA-04**: Anonymized peer comparison (percentile without public leaderboards)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Public leaderboards (ranked members visible to all) | Creates toxic culture; research shows team-level feedback more effective than individual rankings |
| Individual lines of code / commit counts | Encourages gaming metrics; measures activity, not value delivered |
| Real-time live updating member metrics | Surveillance culture; privacy harm documented in 2026 industry research |
| Individual performance tied to compensation display | Perverse incentives; separates development feedback from compensation conversations |
| Drill-down to individual commit/PR details | Enables micromanagement; dashboard should show trends, not transaction-level detail |
| Side-by-side member A vs B named comparison | Ignores context; toxic competitive dynamics |
| New metric categories beyond existing six | Scope control; validate existing categories work at member level before adding new ones |
| New chart types beyond Org Dashboard set | Visual consistency; reuse D3Gauge, sunburst, scatter plots, histograms from org level |
| Real API integration | Mock data only for v1; validate UX before backend integration |
| Cross-team member comparisons | Single-team focus; comparing members across teams lacks context |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| OVER-01 | Phase 2 | Complete |
| OVER-02 | Phase 2 | Complete |
| OVER-03 | Phase 2 | Complete |
| OVER-04 | Phase 2 | Complete |
| OVER-05 | Phase 2 | Complete |
| PERF-01 | Phase 3 | Complete |
| PERF-02 | Phase 3 | Complete |
| PERF-03 | Phase 3 | Complete |
| PERF-04 | Phase 3 | Complete |
| PERF-05 | Phase 3 | Complete |
| DSGN-01 | Phase 4 | Complete |
| DSGN-02 | Phase 4 | Complete |
| DSGN-03 | Phase 4 | Complete |
| DSGN-04 | Phase 4 | Complete |
| DSGN-05 | Phase 4 | Complete |
| SKILL-01 | Phase 4 | Complete |
| SKILL-02 | Phase 4 | Complete |
| SKILL-03 | Phase 4 | Complete |
| SKILL-04 | Phase 4 | Complete |
| SKILL-05 | Phase 4 | Complete |
| SPOF-01 | Phase 4 | Complete |
| SPOF-02 | Phase 4 | Complete |
| SPOF-03 | Phase 4 | Complete |
| SPOF-04 | Phase 4 | Complete |
| SPOF-05 | Phase 4 | Complete |
| ARCH-01 | Phase 5 | Complete |
| ARCH-02 | Phase 5 | Complete |
| ARCH-03 | Phase 5 | Complete |
| ARCH-04 | Phase 5 | Complete |
| ARCH-05 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35/35
- Unmapped: 0

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-08 after Phase 5 completion*
