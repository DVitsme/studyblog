import { getCloudflareContext } from "@opennextjs/cloudflare";

// Phase 0 smoke test: read Cloudflare bindings at request time to prove they're wired.
// `force-dynamic` is TEMPORARY — the real home page (Phase 3) is cached/static.
export const dynamic = "force-dynamic";

function readBindings() {
  try {
    const { env } = getCloudflareContext();
    return { db: Boolean(env.DB), images: Boolean(env.IMAGES) };
  } catch {
    return { db: false, images: false };
  }
}

export default function Home() {
  const b = readBindings();
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-24">
      <span className="inline-flex w-fit items-center rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground">
        Phase 0 · Foundation
      </span>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">StudyBlog</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Documenting the road from limited IT training to CompTIA A+, Network+, and Security+.
      </p>

      <div className="mt-10 rounded-lg border bg-card p-5 font-mono text-sm">
        <p className="text-foreground">Next.js 16 · OpenNext · Cloudflare Workers · D1</p>
        <ul className="mt-3 space-y-1 text-muted-foreground">
          <li>
            D1 (DB) binding:{" "}
            <span className={b.db ? "text-brand" : ""}>{b.db ? "✓ bound" : "— not bound"}</span>
          </li>
          <li>
            Images binding:{" "}
            <span className={b.images ? "text-brand" : ""}>
              {b.images ? "✓ bound" : "— not bound"}
            </span>
          </li>
        </ul>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Foundation deployed. The full build plan lives in{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">/plan</code>.
      </p>
    </div>
  );
}
