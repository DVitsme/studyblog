import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { countPublishedPosts, listPublishedPosts } from "@/lib/db/queries";
import { NowBlock } from "@/components/site/now-block";
import { JourneyTimeline, type Milestone } from "@/components/site/journey-timeline";
import { PostCard } from "@/components/site/post-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The journey" };

// Milestones are editorial — the owner edits them here (newest first).
const MILESTONES: Milestone[] = [
  {
    date: "In ~4 weeks",
    tag: "Target",
    tagKind: "target",
    title: "Sit A+ Core 1 (220-1201)",
    note: "First exam booked once practice scores hold above 85%.",
    filled: false,
    future: true,
  },
  {
    date: "Jun 27, 2026",
    tag: "Start",
    tagKind: "start",
    title: "Started the Network+ track",
    note: "Documenting it from the very first post onward.",
    filled: true,
  },
  {
    date: "Jun 25, 2026",
    tag: "Ship",
    tagKind: "ship",
    title: "Shipped the vulnerability-management write-up",
    note: "47 hosts scanned, criticals driven from 12 down to 3.",
    filled: true,
  },
  {
    date: "Jun 22, 2026",
    tag: "Start",
    tagKind: "start",
    title: "First Core 1 practice test at 81%",
    note: "Fourteen hours of study in — encouraging, and humbling.",
    filled: true,
  },
  {
    date: "Jun 14, 2026",
    tag: "Ship",
    tagKind: "ship",
    title: "Stood up Splunk Free as my first SIEM",
    note: "Real logs flowing, first genuinely useful search.",
    filled: true,
  },
  {
    date: "Apr 2026",
    tag: "Start",
    tagKind: "start",
    title: "Started StudyBlog",
    note: "Decided to learn in the open and build the site itself.",
    filled: true,
  },
];

export default async function JourneyPage() {
  const [journal, count] = await Promise.all([
    listPublishedPosts({ type: "journal", limit: 6 }),
    countPublishedPosts(),
  ]);
  const stats = [
    { value: "12h", label: "this week" },
    { value: "81%", label: "last practice test" },
    { value: String(count), label: "posts published" },
  ];

  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-14 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 font-mono text-xs text-muted-foreground">
        Home / Journey
      </nav>
      <div className="mb-7">
        <h1 className="mb-2.5 text-[34px] font-semibold tracking-[-0.02em]">The journey</h1>
        <p className="max-w-[70ch] text-[17px] leading-[1.6] text-muted-foreground">
          From limited IT training to three CompTIA certs — the honest week-by-week record,
          milestones and all.
        </p>
      </div>

      <section className="mb-9">
        <NowBlock
          headline="Studying A+ Core 1, targeting the exam next month."
          note="Two focused sessions a day on the domains I have been avoiding — printing and virtualization — then a full practice test on the weekend."
          stats={stats}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-[18px] text-xl font-semibold tracking-[-0.02em]">Milestones</h2>
        <JourneyTimeline milestones={MILESTONES} />
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">Weekly journal</h2>
          <Link
            href="/types/journal"
            className="inline-flex items-center gap-[5px] text-sm font-medium text-brand no-underline"
          >
            All entries
            <ArrowRight size={13} aria-hidden />
          </Link>
        </div>
        {journal.length > 0 ? (
          <div className="flex flex-col gap-3">
            {journal.map((p) => (
              <PostCard key={p.slug} post={p} variant="stacked" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No journal entries yet.</p>
        )}
      </section>
    </div>
  );
}
