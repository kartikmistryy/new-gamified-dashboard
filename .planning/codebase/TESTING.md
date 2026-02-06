# Testing Patterns

**Analysis Date:** 2026-02-06

## Test Framework

**Runner:**
- Not detected - No test runner configured
- No Jest, Vitest, or other runner in package.json

**Assertion Library:**
- Not detected

**Run Commands:**
- No test scripts in `package.json`
- Testing infrastructure not present

## Test File Organization

**Current Status:**
- No test files present in codebase
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files found
- `__mocks__/` directory exists but contains only mock data for sidebar (not test mocks)

**Test Data Location:**
- Mock data files co-located in feature directories:
  - `lib/orgDashboard/spofMockData.ts`
  - `lib/orgDashboard/designMockData.ts`
  - `lib/orgDashboard/skillgraphMockData.ts`
  - `lib/orgDashboard/chaosMatrixData.ts`
- Organization mock data: `__mocks__/sidebar/organizations.ts`

## Recommended Testing Approach

Given the codebase has no testing infrastructure, the following recommendations should guide future test implementation:

### Test Structure

**Co-located Testing:**
- Place tests next to source files using `.test.tsx` extension
- Example: `components/shared/TeamAvatar.tsx` → `components/shared/TeamAvatar.test.tsx`
- Keep component and test file together for ease of maintenance

**Test Organization:**
```
src/
├── components/
│   ├── shared/
│   │   ├── TeamAvatar.tsx
│   │   └── TeamAvatar.test.tsx
│   ├── dashboard/
│   │   ├── SpofTeamsTable.tsx
│   │   └── SpofTeamsTable.test.tsx
└── lib/
    ├── utils.ts
    └── utils.test.ts
```

### Test Patterns (To Implement)

**Unit Tests for Utilities:**
```typescript
// lib/orgDashboard/utils.test.ts
import { formatOrgTitle, getGaugeColor } from './utils';

describe('formatOrgTitle', () => {
  it('should capitalize first letter', () => {
    expect(formatOrgTitle('myOrg')).toBe('MyOrg');
  });
});

describe('getGaugeColor', () => {
  it('should return correct color for value range', () => {
    const color = getGaugeColor(50);
    expect(color).toBeDefined();
  });
});
```

**Component Tests with React Testing Library:**
```typescript
// components/shared/TeamAvatar.test.tsx
import { render, screen } from '@testing-library/react';
import { TeamAvatar } from './TeamAvatar';

describe('TeamAvatar', () => {
  it('should render avatar image with team name', () => {
    render(<TeamAvatar teamName="Backend Team" />);
    const img = screen.getByAltText(/Backend Team avatar/);
    expect(img).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<TeamAvatar teamName="Team" className="size-8" />);
    const img = screen.getByRole('img');
    expect(img).toHaveClass('size-8');
  });
});
```

**Hook Tests with @testing-library/react:**
```typescript
// lib/orgDashboard/useTableFilter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useTableFilter } from './useTableFilter';

describe('useTableFilter', () => {
  it('should initialize with default filter', () => {
    const { result } = renderHook(() =>
      useTableFilter({
        rows: [],
        defaultFilter: 'mostProductive',
        sortFunction: (rows) => rows,
      })
    );
    expect(result.current.currentFilter).toBe('mostProductive');
  });

  it('should apply sort function on filter change', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const sortFunction = jest.fn((r) => r);

    const { result } = renderHook(() =>
      useTableFilter({
        rows,
        defaultFilter: 'option1',
        sortFunction,
      })
    );

    act(() => {
      result.current.handleFilter('option2');
    });

    expect(sortFunction).toHaveBeenCalled();
  });
});
```

**Sorting Function Tests:**
```typescript
// components/dashboard/SpofTeamsTable.test.ts
import { sortSpofTeams } from './SpofTeamsTable';

describe('sortSpofTeams', () => {
  const mockRows = [
    { teamName: 'A', avgSpofScore: 80, memberCount: 10 },
    { teamName: 'B', avgSpofScore: 40, memberCount: 5 },
  ];

  it('should sort by highest risk (descending avgSpofScore)', () => {
    const result = sortSpofTeams(mockRows, 'highestRisk');
    expect(result[0].teamName).toBe('A');
  });

  it('should sort by most members (descending memberCount)', () => {
    const result = sortSpofTeams(mockRows, 'mostMembers');
    expect(result[0].memberCount).toBe(10);
  });
});
```

## Mocking

**Framework:** Jest (recommended for Next.js projects)

**Mock Data Files:**
- Use existing mock data files as test fixtures
- Example: `lib/orgDashboard/spofMockData.ts` exports `SPOF_TEAM_ROWS`, `SpofTeamConfig`, `SpofDataPoint`
- Mock data files already contain realistic test data that can be reused

**What to Mock:**
- External API calls (not present in current codebase)
- D3 library functions in chart rendering tests
- Navigation/routing (usePathname, useRouter from next/navigation)
- Browser APIs (matchMedia for responsive tests)

**Example D3 Mock:**
```typescript
jest.mock('d3', () => ({
  voronoiTreemap: jest.fn(() => ({
    clip: jest.fn().mockReturnThis(),
    convergenceRatio: jest.fn().mockReturnThis(),
    maxIterationCount: jest.fn().mockReturnThis(),
    minWeightRatio: jest.fn().mockReturnThis(),
  })),
  color: jest.fn((c) => ({ ...c, opacity: 1, formatRgb: () => 'rgb(0,0,0)' })),
}));
```

**What NOT to Mock:**
- Utility functions (test them directly)
- Component rendering logic
- Tailwind CSS classNames
- Type definitions

## Fixtures and Factories

**Test Data Location:**
- Primary source: `lib/orgDashboard/` mock data files
- `SPOF_TEAM_ROWS`: Array of team rows for SPOF table tests
- `DESIGN_TEAM_ROWS`: Array of team rows for design table tests
- `SKILLGRAPH_TEAM_ROWS`: Skillgraph table data

**Factory Pattern (For Dynamic Test Data):**
```typescript
// __mocks__/factories.ts
export function createSpofTeamRow(overrides: Partial<SpofTeamRow> = {}): SpofTeamRow {
  return {
    teamName: 'Default Team',
    avgSpofScore: 50,
    memberCount: 10,
    lowRiskCount: 5,
    highRiskCount: 2,
    repoHealthHealthyCount: 8,
    repoHealthNeedsAttentionCount: 2,
    repoHealthCriticalCount: 0,
    ...overrides,
  };
}

export function createTeamPerformanceRow(overrides: Partial<TeamPerformanceRow> = {}): TeamPerformanceRow {
  return {
    rank: 1,
    teamName: 'Engineering',
    teamColor: '#3B82F6',
    performanceLabel: 'Excellent',
    performanceValue: 85,
    trend: 'up',
    performanceBarColor: '#55B685',
    typeDistribution: {
      star: 5,
      timeBomb: 1,
      keyRole: 2,
      bottleneck: 0,
      risky: 1,
      legacy: 0,
    },
    ...overrides,
  };
}
```

## Coverage

**Requirements:** Not enforced (no test configuration present)

**Recommendation for Implementation:**
- Aim for 80%+ coverage on utilities
- 60%+ on components (focus on behavior, not implementation details)
- 100% on critical paths (sorting, filtering, calculations)

**View Coverage (When Implemented):**
```bash
npm test -- --coverage
# or with Jest:
jest --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, hooks, utilities
- Approach: Pure function testing without React rendering
- Examples: sorting functions, color getters, calculations in `lib/orgDashboard/utils.ts`
- Should be ~70% of test suite

**Integration Tests:**
- Scope: Component + utility combinations, component state management
- Approach: Test user interactions, state changes, prop changes
- Examples: `SpofTeamsTable` filtering behavior, table sorting with mock data
- Should be ~25% of test suite

**E2E Tests:**
- Framework: Not currently used (could use Playwright or Cypress)
- Recommendation: Add for critical user journeys (org switching, filter application)
- Should be ~5% of test suite

## Common Patterns (To Implement)

**Async Testing:**
```typescript
it('should handle async data loading', async () => {
  render(<Component />);

  const result = await screen.findByText('Loaded Data');
  expect(result).toBeInTheDocument();
});

// For hooks with async operations:
it('should update on async state change', async () => {
  const { result } = renderHook(() => useAsyncHook());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

**Error Testing:**
```typescript
it('should throw error when context not provided', () => {
  // Component expects context
  expect(() => render(<ComponentRequiringContext />)).toThrow(
    'ComponentRequiringContext must be used within a Provider'
  );
});

it('should handle sorting errors gracefully', () => {
  const mockSort = jest.fn().mockImplementation(() => {
    throw new Error('Sort failed');
  });

  expect(() => mockSort()).toThrow('Sort failed');
});
```

**User Interaction Testing:**
```typescript
import userEvent from '@testing-library/user-event';

it('should filter teams on button click', async () => {
  const user = userEvent.setup();
  render(<SpofTeamsTable rows={mockRows} onVisibilityChange={jest.fn()} />);

  const filterButton = screen.getByRole('button', { name: /Highest Risk/ });
  await user.click(filterButton);

  expect(screen.getByText('First Team')).toBeInTheDocument();
});
```

## Setup (To Implement)

**Configuration Files Needed:**
- `jest.config.js` or `jest.config.ts`
- `setupTests.ts` for test environment setup
- `@testing-library/react` and `@testing-library/jest-dom` in devDependencies

**Example jest.config.ts:**
```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

export default config;
```

**package.json Scripts (To Add):**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

---

*Testing analysis: 2026-02-06*

**Note:** This codebase currently has no test infrastructure. The patterns above represent best practices for Next.js 16 with React 19, based on the existing code structure and should guide implementation when testing is added.
