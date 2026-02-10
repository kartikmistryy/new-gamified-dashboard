/** SPOF Chart Tooltip Formatters */

export function formatStackedBarTooltip(
  team: string,
  x0: number,
  x1: number,
  count: number
): string {
  const range = `${x0.toFixed(1)}–${x1.toFixed(1)}`;
  return (
    `<div style="font-weight:600; color:#0f172a;">${team}</div>` +
    `<div style="color:#6b7280;">Score: ${range}</div>` +
    `<div style="margin-top:4px; color:#2563eb;">Count: ${count}</div>`
  );
}
