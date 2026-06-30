"use server";

import { signOut } from "@/auth";
import { requireOwner } from "@/lib/auth/dal";

export async function logout() {
  await requireOwner(); // every admin Server Action re-verifies (establishes the Phase 2 pattern)
  await signOut({ redirectTo: "/login" });
}
