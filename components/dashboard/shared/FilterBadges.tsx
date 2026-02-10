import { Badge } from "@/components/shared/Badge";

type FilterBadgesProps<F extends string> = {
  filterTabs: { key: F; label: string }[];
  currentFilter: F;
  onFilterChange: (filter: F) => void;
};

/**
 * Reusable filter badges component for dashboard tables.
 * Renders a row of clickable badges for filtering table data.
 */
export function FilterBadges<F extends string>({
  filterTabs,
  currentFilter,
  onFilterChange,
}: FilterBadgesProps<F>) {
  return (
    <div className="flex flex-row flex-wrap gap-2 mb-4">
      {filterTabs.map((tab) => (
        <Badge
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={`px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
            currentFilter === tab.key
              ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
              : "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          {tab.label}
        </Badge>
      ))}
    </div>
  );
}
