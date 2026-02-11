# Lib Directory Structure

This directory contains all business logic, utilities, and configurations for the application.

## High-Level Organization

```
lib/
├── dashboard/              # All dashboard-related code
│   ├── shared/            # Cross-entity shared code
│   └── entities/          # Entity-specific code
│
├── hooks/                 # Global hooks (non-dashboard)
├── shared/                # Global shared utilities
├── routes.ts              # Route definitions
├── utils.ts               # Global utilities
└── get-strict-context.tsx # React context helper
```

## Dashboard Organization

All dashboard code lives in `/lib/dashboard/` and follows an **intent-based** structure:

### `/lib/dashboard/shared/` - Cross-Entity Code

Code shared across multiple dashboard entities (org/team/repo/user).

**Structure by concern type:**
- `types/` - Shared type definitions
- `hooks/` - Shared React hooks
- `utils/` - Shared utility functions
- `mocks/` - Shared mock generators
- `contexts/` - React contexts
- `components/` - Shared components
- `charts/` - Shared chart utilities

**See**: [`/lib/dashboard/shared/README.md`](./dashboard/shared/README.md)

### `/lib/dashboard/entities/` - Entity-Specific Code

Code specific to individual dashboard entity types.

**Entity types:**
- `contributor/` - Repository-level (contributors to a repo)
- `member/` - Team-level (members of a team)
- `team/` - Org-level (teams in organization)
- `user/` - User-level (user's personal dashboard)

**Structure within each entity:**
- `types.ts` - Type definitions
- `mocks/` - Mock data generators
- `utils/` - Utility functions
- `tables/` - Table configurations
- `charts/` - Chart-specific code
- `hooks/` - React hooks
- `sheets/` - Sheet utilities (user only)

**See**: [`/lib/dashboard/entities/README.md`](./dashboard/entities/README.md)

## Decision Tree: Where Should I Put This File?

### 1. Is this dashboard-related code?

**NO** → Use root `/lib/` folders:
- Global hooks → `/lib/hooks/`
- Global utilities → `/lib/utils.ts`
- Route definitions → `/lib/routes.ts`
- Shared utilities → `/lib/shared/`

**YES** → Continue to step 2 ↓

### 2. Is this shared across multiple entities?

**YES** → `/lib/dashboard/shared/`
- Types → `shared/types/`
- Hooks → `shared/hooks/`
- Utils → `shared/utils/`
- Mocks → `shared/mocks/`
- Contexts → `shared/contexts/`
- Charts → `shared/charts/{chartType}/`
- Components → `shared/components/`

**NO** (Entity-specific) → `/lib/dashboard/entities/{entity}/`
- Types → `entities/{entity}/types.ts`
- Mocks → `entities/{entity}/mocks/`
- Utils → `entities/{entity}/utils/`
- Tables → `entities/{entity}/tables/`
- Charts → `entities/{entity}/charts/{chartType}/`
- Hooks → `entities/{entity}/hooks/`

### 3. Which entity?

- **Contributor** = Repo-level (contributors to a repository)
- **Member** = Team-level (members of a team)
- **Team** = Org-level (teams within organization)
- **User** = User-level (user's personal dashboard)

## Import Path Patterns

```typescript
// Shared dashboard code
import { COLORS } from '@/lib/dashboard/shared/utils/colors';
import { useFilter } from '@/lib/dashboard/shared/hooks/useFilter';
import { ChartTooltip } from '@/lib/dashboard/shared/charts/tooltip/chartTooltip';

// Entity-specific code
import { ContributorType } from '@/lib/dashboard/entities/contributor/types';
import { mockData } from '@/lib/dashboard/entities/member/mocks/mockData';
import { teamHelper } from '@/lib/dashboard/entities/team/utils/helpers';

// Global utilities
import { useTabIndicator } from '@/lib/hooks/useTabIndicator';
import { formatDate } from '@/lib/utils';
```

## Key Principles

1. **Intent-based organization**: File location indicates purpose and scope
2. **Clear boundaries**: Shared vs entity-specific is always obvious
3. **Consistent structure**: All entities follow same organizational pattern
4. **Organized duplication**: Duplication between entities is intentional and visible
5. **Scalable**: Adding new entities or concerns follows established patterns

## Migration Notes

This structure was established in Phase 4 refactoring (February 2026) to address:
- Competing structures (old root entity folders vs new dashboard structure)
- Heavy duplication between repo and team dashboards (88% overlap)
- Mixed concerns within folders
- Unclear boundaries between shared locations

**Previous structure** (deprecated):
- ❌ `/lib/repoDashboard/`, `/lib/teamDashboard/`, `/lib/orgDashboard/`, `/lib/userDashboard/`
- ❌ `/lib/contexts/` (empty)

**Current structure** (established):
- ✅ `/lib/dashboard/shared/` - Clear shared code location
- ✅ `/lib/dashboard/entities/{entity}/` - Clear entity-specific code
