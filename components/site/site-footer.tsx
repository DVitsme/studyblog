import Link from "next/link";
import { IDENTITY_LINKS } from "@/lib/site";

// Library §1.3 SiteFooter — identity band. Links come from the single IDENTITY_LINKS source shared
// with the About page (design Q5), so the two can't drift. Fully static (server).
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-4 px-5 py-6">
        <div className="max-w-[48ch]">
          <span className="font-mono text-sm font-semibold">
            study<span className="text-brand">blog</span>
          </span>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            One person, documenting the road to A+, Network+ and Security+ in the open. Built and
            designed by the author.
          </p>
        </div>
        <div className="flex gap-4">
          {IDENTITY_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="font-mono text-[13px] text-muted-foreground no-underline hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
