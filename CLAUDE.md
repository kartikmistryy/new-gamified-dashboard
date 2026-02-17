# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4

**Key Pattern:** Server Component wrappers + Client Components

```
app/org/[orgId]/*/page.tsx          → Server Component (thin wrapper, ~10 lines)
components/dashboard/pages/*Client.tsx → Client Component (business logic, state)
components/dashboard/               → Reusable UI components (props-driven)
lib/orgDashboard/                   → Data, utilities, types
```

### Data Flow

1. Page wrapper renders Client Component
2. Client Component uses `useRouteParams()` for route params
3. `useMemo` hooks call mock data generators from `lib/orgDashboard/*MockData.ts`
4. Processed data passed as props to chart/table components
5. Components are pure rendering—no data fetching inside

### Route Params

Always use `useRouteParams()` from `@/lib/RouteParamsProvider`, never `useParams()` directly:
```tsx
const { orgId, teamId, getTeamUrl } = useRouteParams();
```

For URL building, use `@/lib/routes.ts`:
```tsx
import { getTeamPath } from "@/lib/routes";
getTeamPath(orgId, teamId, "performance")  // not template literals
```

### Key Abstractions

- **BaseTeamsTable<T, F>**: Generic table with filtering tabs—extend with column definitions
- **DashboardSection**: Section wrapper with title and optional action slot (filters)
- **SegmentBar**: Visual segment bars (ownership, chaos)—colors from `lib/orgDashboard/colors.ts`
- **TimeRangeFilter**: Controlled filter component—page manages state

## Code Style

- **Exports:** Named exports only, no default exports
- **Imports:** Use `@/` alias, never relative paths like `../`
- **Strings:** Double quotes preferred
- **Components:** Functional with hooks, typed props, no `any`
- **File size:** Components/utils 160-200 lines max; split if larger
- **No barrel exports:** Import directly from source files

## Do Not Edit

- `components/ui/*` — shadcn components, use CLI only
- `app/globals.css` — except for theme variables

## Dashboard Colors

Use constants from `@/lib/orgDashboard/colors.ts`:
```tsx
import { DASHBOARD_BG_CLASSES, DASHBOARD_TEXT_CLASSES } from "@/lib/orgDashboard/colors";
```
Never hardcode hex values in components.

## Adding New Features

**New dashboard page:**
1. Create `app/org/[orgId]/[feature]/page.tsx` (Server Component wrapper)
2. Create `components/dashboard/pages/[Feature]PageClient.tsx` (Client Component with `"use client"`)
3. Add mock data in `lib/orgDashboard/[feature]MockData.ts`
4. Add types in `lib/orgDashboard/types.ts`

**New table variant:**
1. Define row type and filter enum in `lib/orgDashboard/types.ts`
2. Compose with `BaseTeamsTable` or create custom in `components/dashboard/`

**Shared components:** `components/shared/` for cross-domain reuse
