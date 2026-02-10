"use client";

type ComparativePerformanceChartLegendProps = {
  userColor: string;
  teamColor: string;
  orgColor: string;
};

export function ComparativePerformanceChartLegend({
  userColor,
  teamColor,
  orgColor,
}: ComparativePerformanceChartLegendProps) {
  const legendItems = [
    { label: "User Performance", color: userColor, style: "solid" as const },
    { label: "Team Median", color: teamColor, style: "dashed" as const },
    { label: "Org Median", color: orgColor, style: "dotted" as const },
  ];

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <svg width="24" height="12" className="shrink-0">
            <line
              x1="0"
              y1="6"
              x2="24"
              y2="6"
              stroke={item.color}
              strokeWidth="2"
              strokeDasharray={
                item.style === "dashed"
                  ? "4 4"
                  : item.style === "dotted"
                  ? "2 2"
                  : undefined
              }
            />
          </svg>
          <span className="text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
