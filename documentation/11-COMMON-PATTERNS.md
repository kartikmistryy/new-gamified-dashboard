# Common Patterns

Reusable code patterns and solutions to common problems in the dashboard.

## 🎯 Data Fetching Patterns

### Pattern: Hook with Mock Data

**Use case**: Fetch entity data with processing

```typescript
// lib/dashboard/entities/member/hooks/useTeamPerformanceData.ts

import { useMemo } from "react";
import { useTimeRange } from "@/lib/dashboard/shared/contexts/TimeRangeContext";
import { getMemberPerformanceRowsForTeam } from "../mocks/overviewMockData";
import { generateMemberPerformanceTimeSeries } from "../mocks/performanceMockData";
import { filterByTimeRange, smartSample } from "@/lib/dashboard/shared/utils/dataProcessing";

export function useTeamPerformanceData(teamId: string) {
  const { timeRange } = useTimeRange();

  // Step 1: Generate base data (memoized)
  const members = useMemo(
    () => getMemberPerformanceRowsForTeam(52, teamId, 10),
    [teamId]
  );

  // Step 2: Generate time series
  const rawData = useMemo(
    () => generateMemberPerformanceTimeSeries(members),
    [members]
  );

  // Step 3: Filter by time range
  const timeFilteredData = useMemo(
    () => filterByTimeRange(rawData, timeRange),
    [rawData, timeRange]
  );

  // Step 4: Sample for performance
  const sampledData = useMemo(
    () => smartSample(timeFilteredData),
    [timeFilteredData]
  );

  return {
    members,           // Table data
    rawData,           // Full dataset
    sampledData,       // Chart data
    loading: false     // For future API integration
  };
}
```

**Benefits**:
- Memoization prevents unnecessary recalculations
- Clear data transformation pipeline
- Easy to replace with real API calls later

---

### Pattern: Conditional Data Loading

**Use case**: Load data only when needed

```typescript
export function useConditionalTeamData(
  shouldFetch: boolean,
  teamId: string
) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!shouldFetch) return;

    // Fetch data only when needed
    const result = fetchTeamData(teamId);
    setData(result);
  }, [shouldFetch, teamId]);

  return data;
}

// Usage
export function TeamSection({ teamId, isExpanded }) {
  const data = useConditionalTeamData(isExpanded, teamId);

  if (!isExpanded) return null;
  if (!data) return <Loading />;

  return <TeamDetails data={data} />;
}
```

---

## 🎨 Component Patterns

### Pattern: Compound Components

**Use case**: Related components that work together

```typescript
// Card component family
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b px-6 py-4">
      {children}
    </div>
  );
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4">
      {children}
    </div>
  );
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t px-6 py-4 bg-gray-50">
      {children}
    </div>
  );
}

// Usage
<Card>
  <CardHeader>
    <h2>Team Performance</h2>
  </CardHeader>
  <CardContent>
    <PerformanceChart />
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

---

### Pattern: Render Props

**Use case**: Flexible rendering with custom logic

```typescript
export function DataTable<T>({
  data,
  renderRow,
  renderEmpty
}: {
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}) {
  if (!data.length) {
    return renderEmpty ? renderEmpty() : <p>No data</p>;
  }

  return (
    <div className="space-y-2">
      {data.map((item, index) => renderRow(item, index))}
    </div>
  );
}

// Usage
<DataTable
  data={members}
  renderRow={(member, index) => (
    <div key={index} className="p-4 border rounded">
      <h3>{member.name}</h3>
      <p>Performance: {member.performanceValue}</p>
    </div>
  )}
  renderEmpty={() => (
    <EmptyState message="No team members found" />
  )}
/>
```

---

### Pattern: Higher-Order Component (Wrapper)

**Use case**: Add common functionality to components

```typescript
// withLoading.tsx
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  loadingComponent?: React.ReactNode
) {
  return function WithLoadingComponent({
    isLoading,
    ...props
  }: P & { isLoading: boolean }) {
    if (isLoading) {
      return loadingComponent || <LoadingSkeleton />;
    }

    return <Component {...(props as P)} />;
  };
}

// Usage
const TeamTableWithLoading = withLoading(TeamTable);

<TeamTableWithLoading
  data={teams}
  isLoading={loading}
/>
```

---

## 🔄 State Management Patterns

### Pattern: Reducer for Complex State

**Use case**: Multiple related state updates

```typescript
type FilterState = {
  search: string;
  category: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
};

type FilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_SORT"; payload: { by: string; direction: "asc" | "desc" } }
  | { type: "RESET" };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_CATEGORY":
      return { ...state, category: action.payload };
    case "SET_SORT":
      return {
        ...state,
        sortBy: action.payload.by,
        sortDirection: action.payload.direction
      };
    case "RESET":
      return {
        search: "",
        category: "all",
        sortBy: "name",
        sortDirection: "asc"
      };
    default:
      return state;
  }
}

// Usage
export function FilterableTable({ data }) {
  const [filters, dispatch] = useReducer(filterReducer, {
    search: "",
    category: "all",
    sortBy: "name",
    sortDirection: "asc"
  });

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (filters.search) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== "all") {
      result = result.filter(item => item.category === filters.category);
    }

    // Apply sort
    result.sort((a, b) => {
      const direction = filters.sortDirection === "asc" ? 1 : -1;
      return direction * (a[filters.sortBy] - b[filters.sortBy]);
    });

    return result;
  }, [data, filters]);

  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) =>
          dispatch({ type: "SET_SEARCH", payload: e.target.value })
        }
      />
      <select
        value={filters.category}
        onChange={(e) =>
          dispatch({ type: "SET_CATEGORY", payload: e.target.value })
        }
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button onClick={() => dispatch({ type: "RESET" })}>
        Reset Filters
      </button>
      <Table data={filteredData} />
    </div>
  );
}
```

---

### Pattern: Custom Context Hook

**Use case**: Provide shared state with validation

```typescript
// lib/dashboard/shared/contexts/FilterContext.tsx

import { createContext, useContext, useState } from "react";

type FilterContextType = {
  activeFilters: string[];
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
  clearFilters: () => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const addFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev : [...prev, filter]
    );
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  return (
    <FilterContext.Provider
      value={{ activeFilters, addFilter, removeFilter, clearFilters }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
}

// Usage
<FilterProvider>
  <FilterableContent />
</FilterProvider>

function FilterableContent() {
  const { activeFilters, addFilter } = useFilters();
  // Use filters
}
```

---

## 🎯 Table Patterns

### Pattern: Sortable Table

**Use case**: Add sorting to any table

```typescript
export function useSortableData<T>(
  data: T[],
  defaultSortKey: keyof T
) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  }>({
    key: defaultSortKey,
    direction: "asc"
  });

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  const requestSort = (key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  return { sortedData, sortConfig, requestSort };
}

// Usage
export function SortableTable({ data }: { data: Member[] }) {
  const { sortedData, sortConfig, requestSort } = useSortableData(
    data,
    "name"
  );

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => requestSort("name")}>
            Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
          </th>
          <th onClick={() => requestSort("performanceValue")}>
            Performance {sortConfig.key === "performanceValue" && (sortConfig.direction === "asc" ? "↑" : "↓")}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.performanceValue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### Pattern: Paginated Table

**Use case**: Handle large datasets

```typescript
export function usePagination<T>(data: T[], itemsPerPage: number) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    currentData,
    currentPage,
    totalPages,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1)
  };
}

// Usage
export function PaginatedTable({ data }: { data: Member[] }) {
  const {
    currentData,
    currentPage,
    totalPages,
    nextPage,
    prevPage
  } = usePagination(data, 10);

  return (
    <div>
      <Table data={currentData} />
      <div className="flex items-center justify-between mt-4">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## 📊 Chart Patterns

### Pattern: Responsive D3 Chart

**Use case**: D3 chart that resizes with container

```typescript
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export function ResponsiveChart({ data }: { data: DataPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render chart when dimensions change
  useEffect(() => {
    if (!svgRef.current || !dimensions.width) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    // Clear previous render
    svg.selectAll("*").remove();

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([50, width - 50]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 100])
      .range([height - 50, 50]);

    // Render chart
    svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d, i) => xScale(i))
      .attr("cy", d => yScale(d.value))
      .attr("r", 4)
      .attr("fill", "#3D81FF");
  }, [data, dimensions]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "400px" }}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
}
```

---

### Pattern: Chart with Tooltip

**Use case**: Interactive chart with hover tooltips

```typescript
export function ChartWithTooltip({ data }: { data: DataPoint[] }) {
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    show: false,
    x: 0,
    y: 0,
    content: ""
  });

  const handleMouseEnter = (event: React.MouseEvent, point: DataPoint) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${point.label}: ${point.value}`
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="relative">
      <svg width={800} height={400}>
        {data.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={6}
            fill="#3D81FF"
            onMouseEnter={(e) => handleMouseEnter(e, point)}
            onMouseLeave={handleMouseLeave}
            className="cursor-pointer hover:fill-blue-600"
          />
        ))}
      </svg>

      {tooltip.show && (
        <div
          className="absolute bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-sm"
          style={{
            left: tooltip.x,
            top: tooltip.y - 40,
            transform: "translateX(-50%)"
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 Search & Filter Patterns

### Pattern: Debounced Search

**Use case**: Search with delay to reduce operations

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
export function SearchableList({ items }: { items: string[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [items, debouncedSearchTerm]);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <p className="text-sm text-gray-500">
        Found {filteredItems.length} results
      </p>
      <ul>
        {filteredItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Pattern: Multi-Filter

**Use case**: Combine multiple filter criteria

```typescript
type FilterCriteria = {
  search: string;
  category: string;
  minValue: number;
  maxValue: number;
};

export function useMultiFilter<T extends Record<string, any>>(
  data: T[],
  criteria: FilterCriteria,
  searchKeys: (keyof T)[]
) {
  return useMemo(() => {
    let result = [...data];

    // Search filter
    if (criteria.search) {
      result = result.filter(item =>
        searchKeys.some(key =>
          String(item[key])
            .toLowerCase()
            .includes(criteria.search.toLowerCase())
        )
      );
    }

    // Category filter
    if (criteria.category && criteria.category !== "all") {
      result = result.filter(item => item.category === criteria.category);
    }

    // Range filter
    result = result.filter(
      item =>
        item.value >= criteria.minValue && item.value <= criteria.maxValue
    );

    return result;
  }, [data, criteria, searchKeys]);
}

// Usage
export function FilteredTable({ data }: { data: Member[] }) {
  const [criteria, setCriteria] = useState<FilterCriteria>({
    search: "",
    category: "all",
    minValue: 0,
    maxValue: 100
  });

  const filteredData = useMultiFilter(data, criteria, ["name", "email"]);

  return (
    <div>
      <input
        value={criteria.search}
        onChange={(e) =>
          setCriteria(prev => ({ ...prev, search: e.target.value }))
        }
      />
      <select
        value={criteria.category}
        onChange={(e) =>
          setCriteria(prev => ({ ...prev, category: e.target.value }))
        }
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <Table data={filteredData} />
    </div>
  );
}
```

---

## 🎨 UI Patterns

### Pattern: Modal Dialog

**Use case**: Reusable modal component

```typescript
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return { isOpen, open, close, toggle };
}

export function Modal({
  isOpen,
  onClose,
  title,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </>
  );
}

// Usage
export function MyComponent() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <button onClick={open}>Open Modal</button>
      <Modal isOpen={isOpen} onClose={close} title="Details">
        <p>Modal content here</p>
      </Modal>
    </>
  );
}
```

---

### Pattern: Toast Notifications

**Use case**: Show temporary messages

```typescript
type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  const getToastStyles = (type: Toast["type"]) => {
    switch (type) {
      case "success": return "bg-green-500";
      case "error": return "bg-red-500";
      case "info": return "bg-blue-500";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} text-white px-4 py-3 rounded shadow-lg`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
```

---

## 📝 Best Practices Summary

### When to Use Each Pattern

| Pattern | Use Case |
|---------|----------|
| **Hook with Mock Data** | Fetching and processing entity data |
| **Compound Components** | Related UI components (Card, Tabs) |
| **Render Props** | Flexible, customizable rendering |
| **Reducer** | Complex state with multiple updates |
| **Custom Context** | Share state across component tree |
| **Sortable Data** | Tables that need sorting |
| **Pagination** | Large datasets (>50 items) |
| **Responsive Chart** | Charts that adapt to container size |
| **Debounced Search** | Search with performance optimization |
| **Modal** | Show detailed views or forms |
| **Toast** | Temporary notifications |

---

**Congratulations!** You've completed the documentation guide. You now have a comprehensive understanding of the gamified dashboard codebase.

For questions or to dive deeper:
- Review [Quick Start](./01-QUICK-START.md) for getting started
- Check [Architecture Overview](./02-ARCHITECTURE-OVERVIEW.md) for system design
- Explore [Adding New Features](./09-ADDING-NEW-FEATURES.md) for development guides
