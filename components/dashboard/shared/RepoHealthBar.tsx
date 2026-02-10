"use client";

export type RepoHealthSegment = {
  label: string;
  count: number;
  color: string;
};

export const REPO_HEALTH_SEGMENTS = [
  { key: "healthy", label: "Healthy", color: "#22c55e" },
  { key: "needsAttention", label: "Needs Attention", color: "#f59e0b" },
  { key: "critical", label: "Critical", color: "#ef4444" },
] as const;

type RepoHealthBarProps = {
  segments?: RepoHealthSegment[];
};

const DEFAULT_SEGMENTS: RepoHealthSegment[] = [
  { label: REPO_HEALTH_SEGMENTS[0].label, count: 6, color: REPO_HEALTH_SEGMENTS[0].color },
  { label: REPO_HEALTH_SEGMENTS[1].label, count: 4, color: REPO_HEALTH_SEGMENTS[1].color },
  { label: REPO_HEALTH_SEGMENTS[2].label, count: 2, color: REPO_HEALTH_SEGMENTS[2].color },
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
              {segment.label} {segment.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
