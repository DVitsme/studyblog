"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { httpUrl } from "@/lib/project";
import type { TocItem } from "@/lib/content/render";

// Library §1.3 TOC. Desktop = sticky aside with scroll-spy (IntersectionObserver tracks the topmost
// heading in view). Mobile = a native <details> disclosure (no JS). h2 + h3, one indent level.
export function Toc({ items, repoUrl }: { items: TocItem[]; repoUrl?: string | null }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el != null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Activate a heading once it clears the sticky header; ignore the bottom 65% so the last
      // section can become active without needing to be scrolled to the very top.
      { rootMargin: "-84px 0px -65% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;
  const repo = httpUrl(repoUrl);

  return (
    <aside className="sticky top-[84px] hidden basis-[200px] shrink-0 lg:block">
      <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        On this page
      </div>
      <nav aria-label="On this page" className="flex flex-col gap-0.5 border-l border-border">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "-ml-px border-l-2 py-[5px] text-[13px] leading-[1.4] no-underline",
                item.depth === 3 ? "pl-6" : "pl-3.5",
                isActive
                  ? "border-brand font-medium text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.text}
            </a>
          );
        })}
      </nav>
      {repo && (
        <a
          href={repo}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand no-underline"
        >
          <ExternalLink size={14} aria-hidden />
          View the repo
        </a>
      )}
    </aside>
  );
}

// Mobile disclosure — native <details>, rendered inside the article above the prose.
export function TocMobile({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <details className="mb-2 mt-4 rounded-lg border border-border px-4 py-3 lg:hidden">
      <summary className="cursor-pointer font-mono text-xs font-medium text-muted-foreground">
        On this page
      </summary>
      <div className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "text-sm text-muted-foreground no-underline",
              item.depth === 3 && "pl-3",
            )}
          >
            {item.text}
          </a>
        ))}
      </div>
    </details>
  );
}
