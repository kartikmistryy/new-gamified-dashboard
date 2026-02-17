"use client";

import { isValidElement, type ReactNode } from "react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function extractTextContent(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractTextContent).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return extractTextContent(props.children);
  }
  return "";
}

type DashboardSectionProps = {
  title: React.ReactNode;
  /** Optional subtitle shown below the title in muted text */
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  actionLayout?: "row" | "column";
  /** Title size variant: "default" (2xl) or "small" (lg) for subsections */
  titleSize?: "default" | "small";
};

export function DashboardSection({
  title,
  subtitle,
  children,
  action,
  className = "",
  actionLayout = "column",
  titleSize = "default",
}: DashboardSectionProps) {
  const headingId = slugify(extractTextContent(title));
  const headerLayout = actionLayout === "row"
    ? "flex flex-row flex-wrap items-center justify-between gap-4"
    : "flex flex-col flex-wrap items-start justify-start gap-4";
  const titleClass = titleSize === "small"
    ? "text-lg font-semibold text-foreground"
    : "text-2xl font-semibold text-foreground";

  return (
    <section className={className} aria-labelledby={headingId}>
      <div className={`mb-4 ${headerLayout}`}>
        <div>
          <h2 id={headingId} className={titleClass}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {action != null && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
      {children}
    </section>
  );
}
