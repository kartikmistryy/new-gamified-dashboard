"use client";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

type DashboardSectionProps = {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  actionLayout?: "row" | "column";
  /** Title size variant: "default" (2xl) or "small" (lg) for subsections */
  titleSize?: "default" | "small";
};

export function DashboardSection({
  title,
  children,
  action,
  className = "",
  actionLayout = "column",
  titleSize = "default",
}: DashboardSectionProps) {
  const headingId = slugify(title);
  const headerLayout = actionLayout === "row"
    ? "flex flex-row flex-wrap items-center justify-start gap-4"
    : "flex flex-col flex-wrap items-start justify-start gap-4";
  const titleClass = titleSize === "small"
    ? "text-lg font-semibold text-foreground"
    : "text-2xl font-semibold text-foreground";

  return (
    <section className={className} aria-labelledby={headingId}>
      <div className={`mb-4 ${headerLayout}`}>
        <h2 id={headingId} className={titleClass}>
          {title}
        </h2>
        {action != null && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
      {children}
    </section>
  );
}
