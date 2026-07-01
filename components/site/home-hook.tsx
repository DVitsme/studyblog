import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Library §1.3 HomeHook — the editorial opener (no hero illustration, per the brief). Copy is a
// singleton the owner edits here; the post count is the one dynamic value.
export function HomeHook({ postCount }: { postCount: number }) {
  return (
    <section className="mb-14 max-w-[72ch]">
      <div className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-brand">
        Public study log · 2026
      </div>
      <h1 className="mb-[18px] text-[38px] font-semibold leading-[1.08] tracking-[-0.03em] text-balance">
        From limited IT training to CompTIA A+, Network+, and Security+ — documented in the open.
      </h1>
      <p className="mb-6 text-lg leading-[1.65] text-muted-foreground">
        I&apos;m teaching myself three CompTIA certs and writing down everything: the concepts that
        clicked, the labs I broke, and the projects I can hand a hiring manager.
      </p>
      <div className="mb-[18px] flex flex-wrap items-center gap-3">
        <Link
          href="/posts"
          className="inline-flex h-[38px] items-center rounded-md bg-primary px-[18px] text-sm font-medium text-primary-foreground no-underline hover:opacity-90"
        >
          Read the latest
        </Link>
        <Link
          href="/about"
          className="inline-flex h-[38px] items-center gap-1.5 rounded-md px-3.5 text-sm font-medium text-foreground no-underline hover:bg-accent"
        >
          Read the story
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
      <div className="font-mono text-[13px] text-muted-foreground">
        Started Apr 2026 · {postCount} {postCount === 1 ? "post" : "posts"} · Currently studying: A+ Core 1
      </div>
    </section>
  );
}
