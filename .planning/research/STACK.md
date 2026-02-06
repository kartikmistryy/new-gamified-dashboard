# Stack Research: Team Dashboard Extension

**Domain:** Team-level dashboard extension (member views)
**Researched:** 2026-02-06
**Confidence:** HIGH

## Executive Summary

Building the Team Dashboard requires **zero new dependencies**. The existing stack (Next.js 16 App Router, React 19, TypeScript 5.x, Shadcn/Radix UI, D3.js) provides all necessary capabilities for adapting organization-level components to member-level views. Focus should be on TypeScript utility types for data transformation, component composition patterns for reuse, and Next.js routing best practices.

## Existing Stack (Confirmed)

### Core Framework
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Next.js | 16.1.6 | App Router, nested dynamic routes | **Keep as-is** |
| React | 19.2.3 | Server/Client Components, hooks | **Keep as-is** |
| TypeScript | 5.x | Type safety, utility types | **Keep as-is** |

### UI & Visualization
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Tailwind CSS | 4.x | Styling | **Keep as-is** |
| Shadcn/Radix UI | Latest | Component primitives | **Keep as-is** |
| D3.js | 7.9.0 | Gauge, charts, visualizations | **Keep as-is** |
| Framer Motion | 12.29.2 | Animations | **Keep as-is** |
| Lucide React | 0.563.0 | Icons | **Keep as-is** |

### Data & Tables
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| @tanstack/react-table | 8.21.3 | Not currently used but available | **Optional** |
| BaseTeamsTable (custom) | N/A | Generic table component | **Adapt for members** |

### Development
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| ESLint | 9.x | Linting | **Keep as-is** |
| PostCSS | 4.x (Tailwind) | CSS processing | **Keep as-is** |

## No New Dependencies Needed

**Rationale:** The existing stack provides comprehensive capabilities for the Team Dashboard extension.

### What the Existing Stack Provides

1. **Next.js 16 App Router** - Nested dynamic routes `/org/[orgId]/team/[teamId]` are native features
2. **TypeScript Utility Types** - `Pick`, `Omit`, mapped types for transforming team data to member data
3. **Generic Components** - `BaseTeamsTable` already demonstrates reusable patterns
4. **D3.js** - Can render member-level gauges and charts without changes
5. **Shadcn/UI** - Cards, tables, badges work for both team and member levels
6. **Mock Data Generators** - Pattern established in `lib/orgDashboard/*MockData.ts`

## Architectural Approaches (No New Tools Required)

### 1. TypeScript Data Transformation Patterns

**Use built-in utility types** to adapt team types to member types.

```typescript
// Example: Adapt TeamPerformanceRow to MemberPerformanceRow
type MemberPerformanceRow = Omit<TeamPerformanceRow, 'teamName' | 'teamColor'> & {
  memberName: string;
  memberAvatar: string;
  role: string;
};
```

**Confidence:** HIGH - TypeScript utility types are well-documented and stable ([TypeScript Docs](https://www.typescriptlang.org/docs/handbook/utility-types.html), [Better Stack Guide](https://betterstack.com/community/guides/scaling-nodejs/ts-utility-types/))

### 2. Component Composition Patterns

**Container/Presentational Pattern** - Separate data concerns from rendering.

```typescript
// Pattern already established in BaseTeamsTable.tsx
// Adapt for members:
type BaseMembersTableProps<T, F extends string> = {
  rows: T[];
  columns: BaseTableColumn<T, F>[];
  // ... same pattern as BaseTeamsTable
};
```

**Confidence:** HIGH - Pattern already working in codebase, React design pattern standard ([React Dev Docs](https://react.dev/learn/thinking-in-react))

### 3. Next.js 16 Routing Best Practices

**Nested Dynamic Routes** - Use existing App Router patterns.

```typescript
// app/org/[orgId]/team/[teamId]/page.tsx
export default async function TeamPage({
  params
}: {
  params: Promise<{ orgId: string; teamId: string }>
}) {
  const { orgId, teamId } = await params;
  // Fetch team members data
}
```

**Critical:** In Next.js 16, `params` is now a **Promise** that must be awaited in Server Components or unwrapped with `use()` hook in Client Components.

**Confidence:** HIGH - Official Next.js documentation ([Next.js Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes))

### 4. Mock Data Generation Pattern

**Extend existing pattern** from `lib/orgDashboard/overviewMockData.ts`.

```typescript
// lib/teamDashboard/memberMockData.ts
export function getMemberPerformanceRows(
  teamId: string,
  gaugeValue: number
): MemberPerformanceRow[] {
  // Mirror pattern from getTeamPerformanceRowsForGauge()
}
```

**Confidence:** HIGH - Pattern already established and working in codebase

### 5. Avatar Generation

**Reuse DiceBear API** (already used for TeamAvatar).

```typescript
// components/shared/MemberAvatar.tsx
// Copy TeamAvatar pattern, use 'avataaars' or 'personas' style
const DICEBEAR_STYLE = "avataaars"; // Human avatars vs team "shapes"
```

**Confidence:** MEDIUM - DiceBear API is stable ([DiceBear GitHub](https://github.com/dicebear/dicebear)), but style choice is design decision. Alternatives exist (Gravatar, Boring Avatars) if needed ([AlternativeTo](https://alternativeto.net/software/dicebear-avatars/))

## What NOT to Add

### Runtime Validation Libraries (Zod, Yup, etc.)

**Why skip:** Mock data only, no user input or API validation needed.

**When to add:** If/when real API integration happens and you need runtime validation.

**Confidence:** HIGH - No validation requirements in current scope

### @tanstack/react-table

**Why skip:** `BaseTeamsTable` already provides needed functionality.

**When to add:** If member tables need advanced features (column resizing, complex filtering, virtualization) not in BaseTeamsTable.

**Confidence:** HIGH - Current generic table pattern is sufficient

### State Management Libraries (Zustand, Redux, Jotai)

**Why skip:** React state and Next.js Server Components handle current needs.

**When to add:** If cross-route state sharing becomes complex (e.g., filtering preferences persisting across pages).

**Confidence:** HIGH - No state management complexity in current scope

### Animation Libraries (Beyond Framer Motion)

**Why skip:** Framer Motion already installed and sufficient for member views.

**Confidence:** HIGH - Existing animation library is adequate

## Development Utilities (Optional Enhancements)

These are **not required** but could improve developer experience if adopted project-wide.

### Type Generation Utilities

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `type-fest` | Advanced TypeScript utilities | If built-in utilities become insufficient |
| `ts-pattern` | Pattern matching for TypeScript | If complex data transformations emerge |

**Recommendation:** Avoid unless TypeScript utility types prove inadequate. Built-in types are sufficient for member data transformation.

**Confidence:** MEDIUM - Based on common TypeScript patterns, but not required

### Developer Experience

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `@typescript-eslint/strict` | Stricter type checking | Project-wide, not specific to Team Dashboard |
| `prettier` | Code formatting | Project-wide decision, not in package.json currently |

**Recommendation:** Project-wide decisions, not specific to Team Dashboard milestone.

## Data Modeling Patterns

### Transformation Strategy

Use **TypeScript mapped types** to transform team-level data structures to member-level.

```typescript
// Team-level type (existing)
type TeamPerformanceRow = {
  teamName: string;
  performanceValue: number;
  typeDistribution: { star: number; timeBomb: number; /* ... */ };
};

// Member-level type (new)
type MemberPerformanceRow = {
  memberName: string;
  role: string;
  performanceValue: number;
  memberType: 'star' | 'timeBomb' | 'keyRole' | 'bottleneck' | 'risky' | 'legacy';
};
```

**Pattern:** Use `Omit` to remove team-specific fields, intersection types (`&`) to add member-specific fields.

**Confidence:** HIGH - TypeScript fundamentals

### Component Reuse Strategy

**Generic component pattern** (already established in `BaseTeamsTable`):

```typescript
function BaseDashboardTable<TRow, TFilter extends string>({
  rows,
  columns,
  filterTabs,
  sortFunction,
}: Props) { /* ... */ }

// Reuse for both:
// - TeamTable: BaseDashboardTable<TeamPerformanceRow, TeamTableFilter>
// - MemberTable: BaseDashboardTable<MemberPerformanceRow, MemberTableFilter>
```

**Confidence:** HIGH - Pattern already working in codebase

## File Organization Strategy

Follow existing structure from `lib/orgDashboard/`:

```
lib/
  teamDashboard/
    types.ts              # MemberPerformanceRow, MemberTableFilter, etc.
    memberMockData.ts     # getMemberPerformanceRows(), etc.
    colors.ts             # Reuse from orgDashboard or extend
    utils.ts              # Member-specific utilities

components/
  dashboard/
    MemberTable.tsx       # Adapts BaseTeamsTable for members
    GaugeSection.tsx      # Reuse as-is or create MemberGaugeSection variant
  shared/
    MemberAvatar.tsx      # Copy TeamAvatar pattern
```

**Confidence:** HIGH - Mirrors existing, working structure

## Installation Instructions

**No installation needed.** All dependencies already present in `package.json`.

If extending project-wide (not Team Dashboard specific):

```bash
# Optional: Stricter TypeScript (project-wide)
npm install -D @typescript-eslint/eslint-plugin@latest

# Optional: Type utilities (if built-in types insufficient)
npm install type-fest
```

## Version Compatibility Notes

| Package | Current | Compatibility Notes |
|---------|---------|---------------------|
| Next.js 16.1.6 | Latest | `params` is Promise (breaking change from Next.js 15) |
| React 19.2.3 | Latest | `use()` hook for unwrapping promises in Client Components |
| TypeScript 5.x | Latest | All utility types available |
| D3.js 7.9.0 | Latest | No changes needed for member views |

**Critical:** Next.js 16 changed `params` from object to Promise. All route handlers must use:
- `await params` in Server Components
- `use(params)` in Client Components

**Confidence:** HIGH - Official Next.js migration guide ([Next.js Docs](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes))

## Sources

### Official Documentation (HIGH confidence)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) - Nested route params
- [Next.js Routing Guide](https://nextjs.org/docs/app/building-your-application/routing) - App Router patterns
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) - Pick, Omit, mapped types
- [Next.js Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Data fetching patterns
- [React Thinking in React](https://react.dev/learn/thinking-in-react) - Component composition

### Technical Guides (MEDIUM-HIGH confidence)
- [Better Stack TypeScript Guide](https://betterstack.com/community/guides/scaling-nodejs/ts-utility-types/) - Utility types patterns
- [Next.js 2026 Dynamic Routes Guide](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/) - Best practices
- [TypeScript Generic Components (Jan 2026)](https://oneuptime.com/blog/post/2026-01-15-generic-components-react-typescript/view) - Generic table patterns
- [Dev.to React Server Components Guide](https://dev.to/sudiip__17/how-data-fetching-works-in-nextjs-server-vs-client-components-3779) - Data fetching patterns

### Ecosystem Research (MEDIUM confidence)
- [DiceBear GitHub](https://github.com/dicebear/dicebear) - Avatar generation API
- [DiceBear Alternatives](https://alternativeto.net/software/dicebear-avatars/) - Avatar library options
- [Zod Documentation](https://zod.dev/) - Runtime validation (noted as not needed)

---

**Research confidence: HIGH** - All recommendations based on existing stack capabilities verified through official documentation and working codebase patterns. Zero new dependencies required; focus on TypeScript patterns and component composition.
