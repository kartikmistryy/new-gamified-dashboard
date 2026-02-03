"use client";

export type RepoHealthSegment = {
  label: string;
  count: number;
  color: string;
};

type RepoHealthBarProps = {
  segments?: RepoHealthSegment[];
};

const DEFAULT_SEGMENTS: RepoHealthSegment[] = [
  { label: "Healthy", count: 6, color: "#22c55e" },
  { label: "Needs Attention", count: 4, color: "#f59e0b" },
  { label: "Critical", count: 2, color: "#ef4444" },
];

export function RepoHealthBar({ segments = DEFAULT_SEGMENTS }: RepoHealthBarProps) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="w-full">
      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {segments.map((segment, index) => {
          const widthPercent = (segment.count / total) * 100;
          return (
            <div
              key={segment.label}
              className="h-full"
              style={{
                width: `${widthPercent}%`,
                backgroundColor: segment.color,
                borderTopLeftRadius: index === 0 ? "9999px" : 0,
                borderBottomLeftRadius: index === 0 ? "9999px" : 0,
                borderTopRightRadius: index === segments.length - 1 ? "9999px" : 0,
                borderBottomRightRadius: index === segments.length - 1 ? "9999px" : 0,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-6">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-gray-700">
              {segment.label}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {segment.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
