"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { PUBLIC_NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

// Library §1.3 SiteHeader — sticky translucent bar (always bg-background/85 backdrop-blur, no scroll
// listener). Active nav is derived from the pathname (client), matching AdminShell's pattern, so pages
// don't have to thread an `active` prop. Full nav at md+; wordmark + search + sheet drawer below.
function navActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="rounded-sm font-mono text-[15px] font-semibold tracking-tight"
    >
      study<span className="text-brand">blog</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-5 py-3">
        <Wordmark />

        <nav className="hidden items-center gap-0.5 md:flex">
          {PUBLIC_NAV.map((item) => {
            const active = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-sm px-2.5 py-1.5 text-sm no-underline transition-colors",
                  active
                    ? "bg-brand/10 font-medium text-brand"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex size-[34px] items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Search className="size-4" />
          </Link>

          <div className="hidden md:block">
            <ModeToggle />
          </div>

          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <SheetTitle className="sr-only">Site navigation</SheetTitle>
                <SheetDescription className="sr-only">Cert hubs and pages</SheetDescription>
                <div className="flex items-center justify-between px-5 pt-4">
                  <Wordmark onClick={() => setOpen(false)} />
                  <ModeToggle />
                </div>
                <nav className="mt-4 flex flex-col gap-1 px-3">
                  {PUBLIC_NAV.map((item) => {
                    const active = navActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm no-underline transition-colors",
                          active
                            ? "bg-brand/10 font-medium text-brand"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
