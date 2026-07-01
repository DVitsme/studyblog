"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POST_TYPES, POST_TYPE_LABELS } from "@/lib/taxonomy";

// Client filter island — reflects status/section/type/search to URL params (server-filtered, shareable).
function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[150px] text-xs" aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, label]) => (
          <SelectItem key={v} value={v}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PostsFilterBar({
  sections,
  count,
}: {
  sections: { slug: string; name: string }[];
  count: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  function setParam(key: string, value: string) {
    // Read the freshest URL (not a captured `params` snapshot) so a debounced search write
    // can't clobber a filter changed within the debounce window.
    const next = new URLSearchParams(window.location.search);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  // Debounce the search box into the `q` param.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => setParam("q", q), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search posts…"
          className="h-8 pl-8"
          aria-label="Search posts"
        />
      </div>
      <FilterSelect
        value={params.get("status") ?? "all"}
        onChange={(v) => setParam("status", v)}
        placeholder="Status"
        options={[
          ["all", "All statuses"],
          ["draft", "Draft"],
          ["published", "Published"],
        ]}
      />
      <FilterSelect
        value={params.get("section") ?? "all"}
        onChange={(v) => setParam("section", v)}
        placeholder="Section"
        options={[["all", "All sections"], ...sections.map((s) => [s.slug, s.name] as [string, string])]}
      />
      <FilterSelect
        value={params.get("type") ?? "all"}
        onChange={(v) => setParam("type", v)}
        placeholder="Type"
        options={[
          ["all", "All types"],
          ...POST_TYPES.map((t) => [t, POST_TYPE_LABELS[t]] as [string, string]),
        ]}
      />
      <span className="ml-auto font-mono text-xs text-muted-foreground">
        {count} {count === 1 ? "post" : "posts"}
      </span>
    </div>
  );
}
