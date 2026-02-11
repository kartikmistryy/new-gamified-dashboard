# Dashboard Entities

This directory contains entity-specific code for the dashboard, organized by entity type and concern.

## Entity Types

### `contributor/` - Repository-level entities
Contributors to a specific repository. This entity represents individual developers contributing to a repo.

**Used in**: Repository dashboard pages (`/org/[orgId]/repository/[repoId]/...`)

### `member/` - Team-level entities
Members of a specific team. This entity represents individual developers within a team.

**Used in**: Team dashboard pages (`/org/[orgId]/team/[teamId]/...`)

### `team/` - Organization-level entities
Teams within an organization. This entity represents groups/teams at the org level.

**Used in**: Organization dashboard pages (`/org/[orgId]/...`)

### `user/` - User-level entities
User's personal dashboard data. This entity represents individual user metrics and performance.

**Used in**: User dashboard pages (`/org/[orgId]/user/[userId]/...`)

## Structure

Each entity follows the same organizational pattern:

```
{entity}/
├── types.ts                 # TypeScript type definitions
├── mocks/                   # Mock data generators and fixtures
├── utils/                   # Utility functions and helpers
├── tables/                  # Table configurations and column definitions
├── charts/                  # Chart-specific utilities and configurations
│   └── {chartType}/        # Grouped by chart type (e.g., contributorCarousel/)
├── hooks/                   # React hooks
└── sheets/                  # Sheet utilities (user entity only)
```

## Adding New Code

### "Where should I put this file?"

Use this decision tree:

1. **Is it entity-specific?** (Only used for one entity type?)
   - YES → Put it in `/lib/dashboard/entities/{entity}/`
   - NO → Put it in `/lib/dashboard/shared/` (see shared README)

2. **What type of code is it?**
   - Type definitions → `{entity}/types.ts`
   - Mock data → `{entity}/mocks/`
   - Utility function → `{entity}/utils/`
   - Table config → `{entity}/tables/`
   - Chart utility → `{entity}/charts/{chartType}/`
   - React hook → `{entity}/hooks/`
   - Sheet utility → `{entity}/sheets/` (user only)

### Examples

**Adding a new contributor chart:**
```
lib/dashboard/entities/contributor/charts/newChartType/
├── newChartConfig.ts
├── newChartUtils.ts
└── newChartTypes.ts
```

**Adding member-specific utilities:**
```
lib/dashboard/entities/member/utils/
├── memberHelpers.ts
└── memberCalculations.ts
```

## Note on Duplication

The `contributor/` and `member/` entities have significant code overlap (~88% file similarity). This is **intentional** and **organized**:

- Both represent similar concepts (individual contributors/members)
- The duplication is now clearly visible and organized by structure
- If consolidation is needed in the future, the identical structure makes it straightforward
- Current approach prioritizes clarity over DRY principle

## Import Paths

All entity imports use the pattern:
```typescript
import { Type } from '@/lib/dashboard/entities/{entity}/types';
import { helper } from '@/lib/dashboard/entities/{entity}/utils/helper';
import { columns } from '@/lib/dashboard/entities/{entity}/tables/columns';
```

## Related Documentation

- See `/lib/dashboard/shared/README.md` for shared code organization
- See `/lib/README.md` for overall lib structure
