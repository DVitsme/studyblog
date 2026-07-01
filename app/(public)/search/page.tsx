import type { Metadata } from "next";
import { Search } from "lucide-react";
import { searchPosts, sectionFacets, tagFacets, typeFacets } from "@/lib/db/queries";
import { POST_TYPES, type PostType } from "@/lib/taxonomy";
import { SearchForm } from "@/components/site/search-form";
import { PostRow } from "@/components/site/post-list";
import { TagPill } from "@/components/site/tag-pill";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

type SP = { q?: string; section?: string; type?: string; tag?: string };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const type =
    sp.type && (POST_TYPES as readonly string[]).includes(sp.type) ? (sp.type as PostType) : undefined;

  const [sections, types, tags] = await Promise.all([sectionFacets(), typeFacets(), tagFacets()]);
  const results = q ? await searchPosts(q, { section: sp.section, type, tagSlug: sp.tag }) : [];
  const activeFilters = [sp.section, sp.type, sp.tag].filter(Boolean).length;
  const popular = tags.slice(0, 6);

  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-14 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 font-mono text-xs text-muted-foreground">
        Home / Search
      </nav>
      <h1 className="mb-[18px] text-3xl font-semibold tracking-[-0.02em]">Search</h1>

      <SearchForm sections={sections} types={types} tags={tags}>
        <div aria-live="polite">
          {!q ? (
            <div className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Start typing to search every published post by title, excerpt, and body.
              </p>
              {popular.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-muted-foreground">Popular:</span>
                  {popular.map((t) => (
                    <TagPill key={t.value} slug={t.value} />
                  ))}
                </div>
              )}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-[52px] text-center">
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Search size={20} aria-hidden />
              </span>
              <div className="text-base font-semibold">No results for &ldquo;{q}&rdquo;</div>
              <p className="max-w-[46ch] text-sm text-muted-foreground">
                Nothing matches that yet. Try a different term
                {activeFilters > 0 ? " or clearing your filters" : ""}.
              </p>
              {popular.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-muted-foreground">Popular:</span>
                  {popular.map((t) => (
                    <TagPill key={t.value} slug={t.value} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-3.5 flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {results.length} {results.length === 1 ? "result" : "results"} · sorted by relevance
                </span>
                {activeFilters > 0 && (
                  <span className="text-[13px] text-muted-foreground">
                    {activeFilters} {activeFilters === 1 ? "filter" : "filters"} active
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                {results.map((r) => (
                  <PostRow key={r.slug} post={r} />
                ))}
              </div>
            </>
          )}
        </div>
      </SearchForm>
    </div>
  );
}
