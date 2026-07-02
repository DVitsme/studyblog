"use client";

import { useEffect, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Facet } from "@/lib/db/queries";

// Library §1.3 Search — controlled input + facet rail (client island reflecting to URL params). The
// results are server-rendered and passed in as `children`, so the FTS query runs on the server.
export function SearchForm({
  sections,
  types,
  tags,
  children,
}: {
  sections: Facet[];
  types: Facet[];
  tags: Facet[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  // Re-sync the field with the URL (e.g. Back/Forward navigation).
  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  function push(next: URLSearchParams) {
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }
  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    push(next);
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    push(next);
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setQ("");
      const next = new URLSearchParams(params.toString());
      next.delete("q");
      push(next);
    }
  }

  const activeSection = params.get("section");
  const activeType = params.get("type");
  const activeTag = params.get("tag");

  return (
    <>
      <form
        onSubmit={submit}
        className="mb-5 flex h-[46px] items-center gap-2.5 rounded-lg border border-input bg-background px-4 focus-within:ring-2 focus-within:ring-brand/35 focus-within:ring-offset-2 focus-within:ring-offset-background"
      >
        <Search size={18} className="shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search posts, tags, domains…"
          aria-label="Search"
          className="min-w-0 flex-1 border-0 bg-transparent font-sans text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
        <span className="shrink-0 rounded-sm border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          esc
        </span>
      </form>

      <div className="flex flex-wrap items-start gap-6">
        <aside className="flex flex-[0_0_224px] flex-col gap-5">
          <FacetGroup label="Section">
            {sections.map((s) => (
              <Chip key={s.value} active={activeSection === s.value} onClick={() => setParam("section", s.value)}>
                {s.label}
              </Chip>
            ))}
          </FacetGroup>
          <FacetGroup label="Type">
            {types.map((t) => (
              <Chip key={t.value} active={activeType === t.value} onClick={() => setParam("type", t.value)}>
                {t.value}
              </Chip>
            ))}
          </FacetGroup>
          {tags.length > 0 && (
            <FacetGroup label="Tag">
              {tags.map((t) => (
                <Chip key={t.value} active={activeTag === t.value} onClick={() => setParam("tag", t.value)}>
                  {t.label}
                </Chip>
              ))}
            </FacetGroup>
          )}
        </aside>
        <div className="min-w-0 flex-[1_1_440px]">{children}</div>
      </div>
    </>
  );
}

function FacetGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
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
