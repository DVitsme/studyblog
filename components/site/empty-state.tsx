import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

// Shared empty state (§ archive/search/hub) — dashed card, icon circle, message, optional CTA link.
export function EmptyState({
  icon,
  title,
  message,
  action,
  showArrow = true,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: { href: string; label: string };
  showArrow?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="text-base font-semibold">{title}</div>
      <p className="max-w-[44ch] text-sm text-muted-foreground">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-brand no-underline"
        >
          {action.label}
          {showArrow && <ArrowRight size={13} aria-hidden />}
        </Link>
      )}
    </div>
  );
}
