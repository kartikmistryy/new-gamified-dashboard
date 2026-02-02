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
};

export function DashboardSection({ title, children, action, className = "" }: DashboardSectionProps) {
  const headingId = slugify(title);

  return (
    <section className={className} aria-labelledby={headingId}>
      <div className="mb-4 flex flex-col flex-wrap items-start justify-between gap-4">
        <h2 id={headingId} className="text-2xl font-semibold text-foreground">
          {title}
        </h2>
        {action != null && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
      {children}
    </section>
  );
}
