import Link from "next/link";
import { ArrowUpRight, Rss } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/site/icons";
import { IDENTITY_LINKS } from "@/lib/site";

const BRAND_ICONS = { github: GithubIcon, linkedin: LinkedinIcon } as const;

// Library §1.3 AboutIdentity — the identity aside on /about. Links come from IDENTITY_LINKS, the same
// source the footer uses (design Q5), so they cannot drift.
export function AboutIdentity({ facts }: { facts: { k: string; v: string }[] }) {
  return (
    <aside className="sticky top-20 flex flex-[1_1_280px] flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-[22px]">
        <div className="mb-[18px] flex items-center gap-3.5">
          <span className="inline-flex size-13 items-center justify-center rounded-full bg-secondary font-mono text-[17px] font-semibold text-muted-foreground">
            SB
          </span>
          <div>
            <div className="text-base font-semibold">The Author</div>
            <div className="font-mono text-xs text-muted-foreground">studying · building · writing</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {IDENTITY_LINKS.map((link) => {
            const Icon = BRAND_ICONS[link.icon as keyof typeof BRAND_ICONS];
            return (
              <Link
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="flex items-center gap-2.5 rounded-md border border-border bg-background px-3 py-[9px] text-sm font-medium text-foreground no-underline hover:border-brand hover:text-brand"
              >
                {Icon ? <Icon size={16} /> : <Rss size={16} aria-hidden />}
                <span>{link.label}</span>
                <ArrowUpRight size={14} className="ml-auto text-muted-foreground" aria-hidden />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          Quick facts
        </div>
        <div className="flex flex-col gap-3">
          {facts.map((f) => (
            <div key={f.k} className="flex items-baseline gap-3">
              <span className="flex-[0_0_84px] font-mono text-[11px] uppercase tracking-[0.03em] text-muted-foreground">
                {f.k}
              </span>
              <span className="text-[13px] leading-[1.5]">{f.v}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
