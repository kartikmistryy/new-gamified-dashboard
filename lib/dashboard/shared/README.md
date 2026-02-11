# Dashboard Shared Utilities

This directory contains utilities shared across all dashboard types (org, team, repo, user).

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
- **Location**: `/lib/dashboard/shared/TimeRangeContext.tsx`
- **Provider**: `TimeRangeProvider` - Wraps the entire app (in `app/layout.tsx`)
- **Hook**: `useTimeRange()` - Access time range state in any component

```typescript
import { useTimeRange } from '@/lib/dashboard/shared/TimeRangeContext';

function MyComponent() {
  const { timeRange, setTimeRange, options } = useTimeRange();
  // ...
}
```

### Components
- **TimeRangeFilter**: Dropdown filter component (works with or without context)
- **GlobalTimeRangeFilter**: Global time range selector for dashboard

## Performance Chart System

Shared chart configuration and utilities for performance visualizations.

### Key Files
- `performanceChart/types.ts` - Chart data types
- `performanceChart/transformers.ts` - Data transformation utilities
- `performanceChart/eventGenerators.ts` - Event and annotation generators
- `performanceChartConfig.ts` - Plotly configuration
- `performanceChartShapes.ts` - SVG shape definitions

## Other Shared Utilities

- **chartConstants.ts** - Color palettes, chart dimensions, styling constants
- **trendHelpers.ts** - Trend calculation and formatting utilities
- **collaborationNetworkScales.ts** - D3 scales for collaboration network graphs
- **collaborationNetworkTooltips.ts** - Tooltip formatters for network graphs

## Usage Guidelines

1. **Import from shared/** when utilities are used across multiple dashboard types
2. **Import from userDashboard/**, **repoDashboard/** for entity-specific utilities
3. **Never duplicate** - if the same utility is needed elsewhere, move it to shared/
4. **Document exports** - add new utilities to this README when created
