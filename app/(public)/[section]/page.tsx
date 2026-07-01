import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, File } from "lucide-react";
import { certCards, listPublishedPosts, sectionCoverage } from "@/lib/db/queries";
import { DOMAIN_SUB, SECTION_COPY } from "@/lib/content/copy";
import { SectionHub } from "@/components/site/section-hub";
import { CoverageChecklist } from "@/components/site/coverage-checklist";
import { CrossCertCard } from "@/components/site/cross-cert";
import { PostCard } from "@/components/site/post-card";
import { EmptyState } from "@/components/site/empty-state";

export const dynamic = "force-dynamic";

const CERT_SLUGS = ["a-plus", "security-plus", "network-plus"];
const FILTER_TYPES = ["concept", "lab", "project", "study-guide", "practice-exam", "cram"];

type Params = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { section } = await params;
  if (!CERT_SLUGS.includes(section)) return {};
  const cert = (await certCards()).find((c) => c.slug === section);
  return cert ? { title: cert.name, description: SECTION_COPY[section]?.description } : {};
}

export default async function SectionHubPage({ params }: Params) {
  const { section } = await params;
  if (!CERT_SLUGS.includes(section)) notFound();

  const [certs, coverage, latest] = await Promise.all([
    certCards(),
    sectionCoverage(section),
    listPublishedPosts({ section, limit: 5 }),
  ]);
  const cert = certs.find((c) => c.slug === section);
  if (!cert) notFound();

  const copy = SECTION_COPY[section] ?? { description: "" };
  const firstEmpty = coverage.domains.find((d) => !d.done);
  const checklistDomains = coverage.domains.map((d) => ({
    name: d.name,
    sub: d.done ? (DOMAIN_SUB[d.domainRef] ?? null) : "Not started yet",
    count: d.postCount,
    done: d.done,
  }));

  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-14 pt-8">
      <SectionHub
        name={cert.name}
        exam={cert.examCodes}
        covered={coverage.covered}
        total={coverage.total}
        description={copy.description}
        note={copy.note}
      />

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex flex-[1_1_460px] flex-col gap-9">
          <section>
            <div className="mb-3.5 flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">Domain coverage</h2>
              <span className="font-mono text-xs text-muted-foreground">
                {cert.examCodes} · {coverage.total} domains
              </span>
            </div>
            <CoverageChecklist domains={checklistDomains} writeNext={firstEmpty?.name} />
          </section>

          <section>
            <div className="mb-3.5 flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">Latest in {cert.name}</h2>
              {cert.postCount > 0 && (
                <Link
                  href={`/posts?section=${section}`}
                  className="inline-flex items-center gap-[5px] text-sm font-medium text-brand no-underline"
                >
                  All {cert.postCount} posts
                  <ArrowRight size={13} aria-hidden />
                </Link>
              )}
            </div>
            {latest.length > 0 ? (
              <div className="flex flex-col gap-3">
                {latest.map((p) => (
                  <PostCard key={p.slug} post={p} variant="stacked" />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<File size={20} aria-hidden />}
                title="No posts yet"
                message={`${cert.name} is documented from the very first post — the first ones are landing soon.`}
                action={{ href: "/posts", label: "Browse all posts" }}
              />
            )}
          </section>
        </div>

        <aside className="flex flex-[1_1_280px] flex-col gap-4">
          <CrossCertCard certs={certs} currentSlug={section} />
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-2.5 text-base font-semibold">Filter this cert</h2>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_TYPES.map((t) => (
                <Link
                  key={t}
                  href={`/posts?section=${section}&type=${t}`}
                  className="rounded-full border border-border bg-background px-[9px] py-[3px] font-mono text-[11px] font-medium text-muted-foreground no-underline hover:bg-accent hover:text-brand"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
