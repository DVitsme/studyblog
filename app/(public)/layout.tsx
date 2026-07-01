import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

// Public route group: every reading/discovery page renders inside the sticky header + footer shell.
// Admin, login, and API routes live outside this group and keep their own chrome. The flex column
// pins the footer to the bottom on short pages.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
