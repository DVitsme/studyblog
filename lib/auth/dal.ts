import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Authoritative owner gate. Single-owner blog: any valid session IS the owner.
// Use in the /admin layout AND at the top of every admin Server Action / Route Handler.
// NOTE: there is intentionally no proxy.ts — @opennextjs/cloudflare doesn't support Next 16
// Node middleware yet, so the layout/DAL is the security boundary. See plan/04-auth.md.
export const requireOwner = cache(async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
});
