# Dashboard Shared Utilities

This directory contains utilities, types, hooks, and components shared across all dashboard entities (contributor, member, team, user).

## Directory Structure

```
shared/
├── types/          # Shared type definitions
├── hooks/          # Shared React hooks
├── utils/          # Shared utility functions and constants
├── mocks/          # Shared mock data generators
├── contexts/       # React contexts
├── components/     # Shared React components
└── charts/         # Chart-specific utilities
    ├── gauge/
    ├── tooltip/
    └── performanceChart/
```

## Time Range System

**Single Source of Truth**: All time range functionality is centralized.

### Type Definitions
- **Location**: `/lib/shared/types/timeRangeTypes.ts`
- **Exports**: `TimeRangeKey`, `TIME_RANGE_OPTIONS`
- **Usage**: Import types from here, not from context files

```typescript
import type { TimeRangeKey } from '@/lib/shared/types/timeRangeTypes';
import { TIME_RANGE_OPTIONS } from '@/lib/shared/types/timeRangeTypes';
```

### Context Provider
- **Location**: `/lib/dashboard/shared/contexts/TimeRangeContext.tsx`
- **Provider**: `TimeRangeProvider` - Wraps the entire app (in `app/layout.tsx`)
- **Hook**: `useTimeRange()` - Access time range state in any component

```typescript
import { useTimeRange } from '@/lib/dashboard/shared/contexts/TimeRangeContext';

function MyComponent() {
  const { timeRange, setTimeRange, options } = useTimeRange();
  // ...
}
```

### Components
- **TimeRangeFilter**: Dropdown filter component (works with or without context)
- **GlobalTimeRangeFilter**: Global time range selector for dashboard
- **RouteParamsProvider**: Context provider for route parameters

## Performance Chart System

Shared chart configuration and utilities for performance visualizations.

### Key Files
- `charts/performanceChart/types.ts` - Chart data types
- `charts/performanceChart/transformers.ts` - Data transformation utilities
- `charts/performanceChart/eventGenerators.ts` - Event and annotation generators
- `utils/performanceChartConfig.ts` - Plotly configuration
- `utils/performanceChartShapes.ts` - SVG shape definitions

## Other Shared Utilities

### Colors & Styling
- **utils/colors.ts** - Centralized dashboard color palette (hex, Tailwind classes, badge styles)
  ```typescript
  import { DASHBOARD_COLORS, DASHBOARD_BG_CLASSES } from '@/lib/dashboard/shared/utils/colors';
  ```

### Chart Utilities
- **utils/chartConstants.ts** - Chart dimensions, styling constants
- **utils/trendHelpers.ts** - Trend calculation and formatting utilities
- **utils/collaborationNetworkScales.ts** - D3 scales for collaboration network graphs
- **utils/collaborationNetworkTooltips.ts** - Tooltip formatters for network graphs
- **charts/tooltip/chartTooltip.ts** - Generic chart tooltip utilities
- **charts/gauge/gaugeUtils.ts** - Gauge chart utilities

## Usage Guidelines

1. **Import from shared/** when utilities are used across multiple dashboard entities
2. **Import from entities/{entity}/** for entity-specific utilities
3. **Never duplicate** - if the same utility is needed elsewhere, move it to shared/
4. **Document exports** - add new utilities to this README when created
5. **Use barrel exports** - import from `shared/utils/` index for commonly used utilities

## Import Patterns

```typescript
// Utilities
import { DASHBOARD_COLORS } from '@/lib/dashboard/shared/utils/colors';
import { chartConstants } from '@/lib/dashboard/shared/utils/chartConstants';

// Contexts
import { useTimeRange } from '@/lib/dashboard/shared/contexts/TimeRangeContext';
import { useRouteParams } from '@/lib/dashboard/shared/contexts/RouteParamsProvider';

// Chart utilities
import { chartTooltip } from '@/lib/dashboard/shared/charts/tooltip/chartTooltip';
import { gaugeUtils } from '@/lib/dashboard/shared/charts/gauge/gaugeUtils';
```
