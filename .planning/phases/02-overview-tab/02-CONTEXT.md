# Phase 2: Overview Tab - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the team overview page by adding performance visualization (D3Gauge), six metric cards, and insights panel. This creates the first fully-functional dashboard tab that validates the component adaptation pattern established in Phase 1. The MemberTable from Phase 1 remains and is integrated with the new components.

</domain>

<decisions>
## Implementation Decisions

### D3Gauge data source
- Gauge displays team aggregate performance calculated from member data (validates aggregation correctness)
- Use simple average: sum all member performanceValues ÷ count
- Mock data approach: Generate members independently first, derive team value from their average (change from Phase 1's "team value first" approach)
- **Claude's Discretion:** Whether gauge calculates aggregate internally or receives it as a prop (choose based on existing D3Gauge API pattern)

### Metric card counting
- **Claude's Discretion:** Counting method for categories (primary category, threshold-based, or fractional) — choose most logical approach
- Cards show count only, no percentages or trends (matches org dashboard pattern)
- Cards are informational only, do not filter the table on click (use existing filter tabs for that)
- Card order matches org dashboard order exactly (visual consistency)

### ChartInsights content
- Focus on team composition insights (distribution patterns like "3 star performers, 1 risky member")
- Use static mocked insights for Phase 2 (validates UI, faster implementation)
- Display 3-4 insight items (matches typical org dashboard pattern)
- Insights mention specific member names for personalization (e.g., "Alice is a star performer")

### Page layout & composition
- Match org dashboard layout exactly for visual consistency
- Page heading changes from "Team Members" to "Overview" (matches tab name)
- Keep existing MemberTable from Phase 1 and integrate new components around it (don't rebuild from scratch)
- Defer responsive behavior (mobile optimization) to later phase — focus on desktop layout for Phase 2
- **Claude's Discretion:** Exact spacing, gaps, and component sizing to match org dashboard

</decisions>

<specifics>
## Specific Ideas

- "The gauge should validate that our member mock data aggregates correctly — that's the key test for Phase 1's foundation"
- "Keep the same visual rhythm as the org dashboard so users immediately recognize the pattern"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-overview-tab*
*Context gathered: 2026-02-06*
