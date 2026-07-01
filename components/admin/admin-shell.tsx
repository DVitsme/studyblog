"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Image as ImageIcon, LogOut, ExternalLink, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

// Library §25 — AdminShell. Sidebar on desktop (flex-[0_0_224px]); topbar + sheet on mobile.
// Brand reserved for the active nav item only (admin register).
const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: FileText, badge: true },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
] as const;

function navActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark() {
  return (
    <Link href="/admin" className="flex items-center gap-2 rounded-sm focus-visible:outline-none">
      <span className="font-mono text-[15px] font-semibold tracking-tight">
        study<span className="text-brand">blog</span>
      </span>
      <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        admin
      </span>
    </Link>
  );
}

function SidebarContent({
  pathname,
  userEmail,
  postCount,
  onNavigate,
}: {
  pathname: string;
  userEmail: string;
  postCount: number;
  onNavigate?: () => void;
}) {
  const initials = userEmail.slice(0, 2).toUpperCase();
  return (
    <div className="flex h-full flex-col">
      <div className="hidden items-center justify-between p-4 md:flex">
        <Wordmark />
        <ModeToggle />
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3 pt-2">
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = navActive(pathname, item.href, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
                {"badge" in item && item.badge ? (
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{postCount}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-2 border-t border-border pt-2">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            <span>View live site</span>
          </Link>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-secondary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Owner</div>
            <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-4" />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  userEmail,
  postCount,
  children,
}: {
  userEmail: string;
  postCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="hidden h-full shrink-0 basis-56 overflow-y-auto border-r border-border bg-card md:block">
        <SidebarContent pathname={pathname} userEmail={userEmail} postCount={postCount} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <Wordmark />
          <div className="flex items-center gap-1">
            <ModeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                <SheetDescription className="sr-only">Site sections and account</SheetDescription>
                <div className="px-4 pt-4">
                  <Wordmark />
                </div>
                <SidebarContent
                  pathname={pathname}
                  userEmail={userEmail}
                  postCount={postCount}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
