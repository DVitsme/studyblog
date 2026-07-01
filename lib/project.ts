// Project write-up helpers shared by ProjectCard + AtAGlanceCard.

export type Metric = { value: string; label: string };

// Metrics live in project_meta.metrics as "value|label" strings (e.g. "12 → 3|criticals remediated"),
// so the big brand value and its caption stay separable. No pipe → the whole string is the value.
export function parseMetric(s: string): Metric {
  const i = s.indexOf("|");
  return i === -1
    ? { value: s.trim(), label: "" }
    : { value: s.slice(0, i).trim(), label: s.slice(i + 1).trim() };
}

// "Shipped" status drives the chart-2 (success) dot; anything else reads as in-progress (muted).
export function isShipped(status?: string | null): boolean {
  return !!status && /ship/i.test(status);
}
