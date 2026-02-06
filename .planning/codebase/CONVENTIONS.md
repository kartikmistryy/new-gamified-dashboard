# Coding Conventions

**Analysis Date:** 2026-02-06

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `TeamAvatar.tsx`, `SpofTeamsTable.tsx`, `DashboardSection.tsx`)
- Utility/helper files: camelCase (e.g., `utils.ts`, `tableUtils.ts`, `chartTooltip.ts`)
- Type/constant files: camelCase or PascalCase context (e.g., `colors.ts`, `types.ts`, `useTableFilter.ts`)
- Mock data files: camelCase with "Mock" suffix (e.g., `spofMockData.ts`, `designMockData.ts`, `skillgraphMockData.ts`)
- Hooks: camelCase with "use" prefix (e.g., `useTableFilter.ts`, `use-mobile.ts`, `useDashboardMeta.ts`)

**Functions:**
- Component functions: PascalCase (e.g., `function TeamAvatar()`, `export function SpofTeamsTable()`)
- Utility functions: camelCase (e.g., `formatOrgTitle()`, `getGaugeColor()`, `extractOrgId()`)
- Helper functions within components: camelCase (e.g., `sortSpofTeams()`, `getTrendIconForCount()`, `getTeamAvatarUrl()`)
- Private/internal functions: camelCase (e.g., `buildCirclePolygon()`, `applyVoronoiTreemap()`)

**Variables:**
- Component props: camelCase (e.g., `teamName`, `visibleTeams`, `onVisibilityChange`)
- State variables: camelCase (e.g., `currentFilter`, `sortedRows`, `selectedOrg`)
- Constants: UPPER_SNAKE_CASE for true constants (e.g., `DICEBEAR_STYLE`, `MOBILE_BREAKPOINT`, `SPOF_FILTER_TABS`)
- React hooks state: typically paired names like `currentFilter`/`setCurrentFilter`, `isMobile`/`setIsMobile`

**Types:**
- Type declarations: PascalCase (e.g., `type TeamAvatarProps`, `type SpofTeamRow`, `type SpofTableFilter`)
- Interface names: PascalCase (not commonly used; `type` is preferred)
- Union types: describe state/options (e.g., `type SpofTableFilter = "highestRisk" | "lowestRisk"`)

## Code Style

**Formatting:**
- Prettier configured implicitly through ESLint
- 2-space indentation
- Single quotes in JSX attributes, template literals for strings
- Semicolons required at end of statements
- Trailing commas in objects/arrays

**Linting:**
- ESLint with Next.js configuration (`eslint.config.mjs`)
- Config extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`
- Run with: `npm run lint`

**TypeScript:**
- `strict: true` in `tsconfig.json`
- Target: ES2017
- Module resolution: `bundler`
- JSX: `react-jsx`
- Type imports explicitly marked with `import type` keyword (e.g., `import type { SpofTeamRow } from "@/lib/orgDashboard/spofMockData"`)

## Import Organization

**Order:**
1. React and framework imports (e.g., `import * as React from "react"`, `import { useMemo, useState } from "react"`)
2. Third-party library imports (e.g., `import { ArrowRight, TrendingDown } from "lucide-react"`)
3. Project relative imports using path aliases (e.g., `import { cn } from "@/lib/utils"`)
4. Type imports (grouped and marked with `import type`)

**Path Aliases:**
- `@/*` maps to root directory
- Used consistently for absolute imports: `@/components/ui/card`, `@/lib/utils`, `@/lib/orgDashboard/colors`
- No relative paths (`../`) in imports, always use `@/` alias

**Example Import Block:**
```typescript
"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { ArrowRight, TrendingDown } from "lucide-react";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "../shared/Badge";
import { DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
import type { SpofTeamRow } from "@/lib/orgDashboard/spofMockData";
```

## Error Handling

**Patterns:**
- Thrown errors in context providers and hooks when preconditions fail:
  - `if (organizations.length === 0) throw new Error("No organizations available.")`
  - `if (!ctx) throw new Error("SidebarHighlightItem must be used within SidebarHighlight")`
  - `throw new Error("useSidebar must be used within a SidebarProvider.")`
- Try-catch for risky operations (e.g., D3 chart rendering):
  ```typescript
  try {
    d3Lib.voronoiTreemap?.()...
  } catch (error) {
    console.error("Voronoi treemap error:", error);
  }
  ```
- No silent failures; errors are logged or thrown
- Component-level error states managed via `useState`

**Error Messages:**
- Descriptive, user-facing when possible
- Include context about what was expected or what went wrong
- Use imperative language ("must be", "should be")

## Logging

**Framework:** Native `console` object

**Patterns:**
- `console.error()` for error conditions (e.g., `console.error("Voronoi treemap error:", error)`)
- Minimal logging in production code; mostly in error paths
- No debug or info logging in components

## Comments

**When to Comment:**
- Complex algorithmic logic (e.g., sorting functions, D3 rendering, gauge calculations)
- Non-obvious purpose of functions or helper methods
- State management or lifecycle explanations
- Workarounds or temporary solutions

**JSDoc/TSDoc:**
- Used sparingly
- Primarily for public functions and their parameters
- Example: `/** SPOF team row type for the table. */`
- Function parameters documented inline as prop types

**Line Comments:**
- Used for inline explanations of complex logic
- Typically single-line with `// Comment` format
- Example: `return new Date(0); // Return epoch for max (include all data)`

## Function Design

**Size:**
- Small, focused functions preferred (typically 15-40 lines)
- Extracted helper functions for complex operations (e.g., `sortSpofTeams()`, `getTrendIconForCount()`)
- Render-specific logic kept in components, calculation/filtering logic extracted to utilities

**Parameters:**
- Named objects preferred over positional args (e.g., `{ rows, currentFilter, defaultFilter, sortFunction }`)
- Optional parameters with default values (e.g., `className = "size-4"`, `size = 64`)
- Generic type parameters used for reusable utilities (e.g., `useTableFilter<T, F extends string>()`)

**Return Values:**
- Explicit type annotations on return values
- Single responsibility: functions return what they promise
- Consistent patterns for success/failure (thrown errors or state management)

## Module Design

**Exports:**
- Named exports preferred over default exports
- Example: `export function TeamAvatar({ ... })` not `export default TeamAvatar`
- Multiple functions per file allowed if logically grouped
- Type exports use `export type` keyword

**Barrel Files:**
- Not used in this codebase; files are imported directly
- Each component file exports its component and types

**File Structure:**
- One primary export per file (component or utility)
- Related types defined in same file or imported from `types.ts`
- Utilities grouped by domain: `lib/orgDashboard/`, `lib/gauge/`, `lib/chartTooltip/`

## Client Components

**"use client" Directive:**
- Required at top of any file using React hooks (useState, useEffect, useCallback, useMemo)
- Example: `"use client";` as first line before imports
- Present in: components, page components, custom hooks

**React 19 / Next 16 Patterns:**
- Hooks usage: `import { useState, useMemo, useCallback } from "react"`
- No class components
- Functional components with hooks exclusively
- Type-safe props with TypeScript

## Styling

**Tailwind CSS:**
- Inline Tailwind classes in `className` attribute
- Utility merging with `cn()` helper from `@/lib/utils` (uses `clsx` and `tailwind-merge`)
- Custom color scales from `DASHBOARD_COLORS` in `@/lib/orgDashboard/colors`
- CSS classes stored in objects for reusability:
  ```typescript
  export const DASHBOARD_BG_CLASSES = {
    danger: "bg-[#CA3A31]",
    excellent: "bg-[#55B685]",
  };
  ```

**Conditional Classes:**
- Template literals for conditions: `` `${isActive ? "bg-blue-500" : "bg-gray-200"}` ``
- Ternary operators for simple conditions
- `cn()` function for combining multiple class sources

---

*Convention analysis: 2026-02-06*
