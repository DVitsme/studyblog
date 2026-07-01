"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Facet } from "@/lib/db/queries";

// Library §1.3 FacetBar — the client filter island for /posts. Toggles section/type/tag + a text
// filter, reflecting all state into the URL (shareable, back-button friendly). Server re-queries.
export function FacetBar({
  sections,
  types,
  tags,
}: {
  sections: Facet[];
  types: Facet[];
  tags: Facet[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    next.delete("page"); // any filter change resets pagination
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function submitQ(e: FormEvent) {
    e.preventDefault();
    setParam("q", q.trim() || null);
  }

  const activeSection = params.get("section");
  const activeType = params.get("type");
  const activeTag = params.get("tag");

  return (
    <div className="mb-[18px] rounded-lg border border-border bg-card px-4 py-3.5">
      <form onSubmit={submitQ} className="mb-3.5 flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3">
        <Search size={15} className="shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter posts by title or excerpt…"
          aria-label="Filter posts"
          className="min-w-0 flex-1 border-0 bg-transparent font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </form>

      <div className="flex flex-col gap-2.5">
        <Group label="Section">
          <Chip active={!activeSection} onClick={() => setParam("section", null)}>
            All
          </Chip>
          {sections.map((s) => (
            <Chip key={s.value} active={activeSection === s.value} onClick={() => setParam("section", s.value)}>
              {s.label}
            </Chip>
          ))}
        </Group>
        <Group label="Type">
          {types.map((t) => (
            <Chip key={t.value} active={activeType === t.value} onClick={() => setParam("type", t.value)}>
              {t.value}
            </Chip>
          ))}
        </Group>
        {tags.length > 0 && (
          <Group label="Tag">
            {tags.map((t) => (
              <Chip key={t.value} active={activeTag === t.value} onClick={() => setParam("tag", t.value)}>
                {t.label}
              </Chip>
            ))}
          </Group>
        )}
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-3">
      <span className="flex-[0_0_56px] font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-full border px-2.5 py-[3px] font-mono text-[11px] font-medium transition-colors",
        active
          ? "border-brand-border bg-brand-subtle text-brand"
          : "border-border bg-background text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}
