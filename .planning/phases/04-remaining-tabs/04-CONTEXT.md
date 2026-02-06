# Phase 4: Remaining Tabs - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the 5-tab team dashboard structure by implementing three additional tabs: Design (member ownership health and chaos index), Skills Graph (member skill distribution visualization), and SPOF (single point of failure risk analysis). Each tab displays member-level data using the existing org dashboard chart components and follows established team dashboard patterns. Creating new chart types or adding additional tabs beyond these three is out of scope.

</domain>

<decisions>
## Implementation Decisions

### Chart types & data visualization
- **Skills Graph tab:** Reuse the same SkillGraph component that org dashboard uses - no need to create new sunburst/treemap components
- **Design tab charts:** Reuse org dashboard Design tab charts (ownership health and chaos index) - feed member data instead of team data
- **SPOF tab charts:** Reuse org dashboard SPOF tab charts (SPOF distribution and repository health) - no custom visualizations needed

### Component reuse strategy
- **Member tables:** Use BaseTeamsTable pattern (like Performance tab) with tab-specific column configurations - not MemberTable component
- **Page layouts:** Each tab mirrors its org dashboard counterpart's layout exactly - Design tab layout matches org Design, Skills matches org Skills, SPOF matches org SPOF
- **Filter tabs:** Tab-specific filters that make sense for each tab's data (Design: health levels, Skills: domain counts, SPOF: risk levels) - not the same 6-filter pattern across all tabs

### Claude's Discretion
- Specific filter tab labels and criteria for each tab
- Column definitions for each tab's BaseTeamsTable
- Mock data generation patterns for design metrics, skills, and SPOF data
- How to adapt org dashboard components to consume member-level data
- ChartInsights content for each tab

</decisions>

<specifics>
## Specific Ideas

- Maximum component reuse - use existing org dashboard charts without modification where possible
- BaseTeamsTable with custom columns per tab (proven pattern from Performance tab)
- Each tab has its own filter logic appropriate to its data domain
- Layout structure follows org dashboard precedent, not team-dashboard-invented patterns
- All three tabs maintain visual consistency with Overview and Performance tabs

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 04-remaining-tabs*
*Context gathered: 2026-02-06*
