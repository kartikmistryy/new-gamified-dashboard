# Requirements: Team Dashboard

**Defined:** 2026-02-06
**Core Value:** Enable users to analyze individual team member performance using the same familiar interface and metric categories they already use at the organization level

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FOUND-01**: Member data type definitions separate from team types (MemberPerformanceRow, MemberTableFilter, etc.)
- [ ] **FOUND-02**: Member mock data generators for all 5 tabs that aggregate mathematically to team totals
- [ ] **FOUND-03**: Team Dashboard route at `/org/:orgId/team/:teamId` with dynamic segments
- [ ] **FOUND-04**: MemberTable component adapted from BaseTeamsTable with member-specific columns
- [ ] **FOUND-05**: Tab navigation working for all 5 team dashboard tabs (Overview, Performance, Design, Skills Graph, SPOF)

### Overview Tab

- [ ] **OVER-01**: Member table showing rank, name, avatar, effective performance, developer type
- [ ] **OVER-02**: D3Gauge displaying team performance aggregated from member data
- [ ] **OVER-03**: Six metric cards counting members (Star, Time Bomb, Key Role, Bottleneck, Risky, Legacy)
- [ ] **OVER-04**: ChartInsights panel with member-level trend insights
- [ ] **OVER-05**: Filter tabs (Most Productive, Least Productive, Most Optimal, Most Risky) working on member data

### Performance Tab

- [ ] **PERF-01**: Performance tracking chart showing normalized median over time
- [ ] **PERF-02**: Time range filter buttons (1 Month, 3 Months, 1 Year, Max)
- [ ] **PERF-03**: Member performance table with columns: Rank, Name, Effective Performance, Change, Churn Rate
- [ ] **PERF-04**: Filter tabs (Most Productive, Least Productive, Most Improved, Most Regressed, Highest Churn, Lowest Churn)
- [ ] **PERF-05**: ChartInsights panel with performance trend analysis

### Design Tab

- [ ] **DSGN-01**: Ownership Health scatter plot or chart adapted for members
- [ ] **DSGN-02**: Engineering Chaos Index chart adapted for members
- [ ] **DSGN-03**: Member table with ownership health and chaos index scores
- [ ] **DSGN-04**: Filter tabs adapted for member-level ownership patterns
- [ ] **DSGN-05**: ChartInsights panel with design pattern insights

### Skills Graph Tab

- [ ] **SKILL-01**: Skills sunburst/treemap chart showing member's skill distribution
- [ ] **SKILL-02**: View toggle (By Team / By Skill) for different skill groupings
- [ ] **SKILL-03**: Member skills table showing Domain, Skill, Total Skill Usage, Total Skill Completion, Contributors
- [ ] **SKILL-04**: Filter tabs (Most Domains, Least Domains, Most Skills, Least Skills)
- [ ] **SKILL-05**: ChartInsights panel with skills insights

### SPOF Tab

- [ ] **SPOF-01**: SPOF Owner Distribution histogram/chart for members
- [ ] **SPOF-02**: Repository Health Distribution bar chart
- [ ] **SPOF-03**: Member table with SPOF distribution and repository health columns
- [ ] **SPOF-04**: Filter tabs (Most Domains, Least Domains, Most Skills, Least Skills)
- [ ] **SPOF-05**: ChartInsights panel with SPOF risk insights

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
| TBD | TBD | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 30 ⚠️

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-06 after initial definition*
