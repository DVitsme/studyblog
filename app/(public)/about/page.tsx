import type { Metadata } from "next";
import { AboutIdentity } from "@/components/site/about-identity";

// No D1 reads → genuinely static (prerenders at build). Identity links come from IDENTITY_LINKS.
export const metadata: Metadata = { title: "About" };

const FACTS = [
  { k: "Currently", v: "Studying CompTIA A+ Core 1" },
  { k: "Goal", v: "A+ → Security+ → Network+, then cleared IT work" },
  { k: "Tools", v: "OpenVAS, Splunk, VirtualBox, and the command line" },
  { k: "Certs", v: "All in progress — first exam next month" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-14 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 font-mono text-xs text-muted-foreground">
        Home / About
      </nav>
      <div className="flex flex-wrap items-start gap-10">
        <article className="min-w-0 flex-[1_1_440px]">
          <h1 className="mb-[18px] text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] text-balance">
            Learning IT in the open, from the very bottom.
          </h1>
          <p className="mb-6 text-lg leading-[1.7] text-muted-foreground">
            I did not come from tech. This site is the paper trail of teaching myself three CompTIA
            certs — and proving I can do the work while I am at it.
          </p>

          <h2 className="mb-3 mt-8 text-[21px] font-semibold tracking-[-0.01em]">
            Why a public study log
          </h2>
          <p className="mb-[18px] text-[17px] leading-[1.75]">
            Writing something down is the fastest way to find out whether I actually understand it.
            Doing it in public raises the bar: it has to be correct, and it has to be clear enough
            that a stranger can follow it. That pressure is the point. Every post here is a small
            promise that I did the reading, ran the lab, and can explain the result.
          </p>
          <p className="mb-[18px] text-[17px] leading-[1.75]">
            It doubles as proof of work. Instead of a résumé line that says &ldquo;studying for
            Security+,&rdquo; there is a trail a hiring manager can actually read — the concepts, the
            labs, and the project write-ups behind them.
          </p>

          <h2 className="mb-3 mt-8 text-[21px] font-semibold tracking-[-0.01em]">The plan</h2>
          <p className="mb-[18px] text-[17px] leading-[1.75]">
            A+ first, because it is the broad foundation. Then Security+, because that is the work I
            want to do. Network+ runs alongside both. Each cert gets mapped to its official domains,
            and a domain only counts as covered once it has a real post behind it — no gamified
            progress bars, just an honest record.
          </p>
          <p className="mb-2 text-[17px] leading-[1.75]">
            I built this site myself, which is its own small proof that the learning is sticking.
            Thanks for reading along.
          </p>
        </article>

        <AboutIdentity facts={FACTS} />
      </div>
    </div>
  );
}
