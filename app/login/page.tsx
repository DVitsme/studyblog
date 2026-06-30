"use client";

import { useActionState } from "react";
import { login } from "./actions";

// Minimal functional login for Phase 1. The designed LoginCard (show/hide, error banner)
// lands in Phase 2 per plan/design/handoff/design/Stage4-Handoff.md.
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Owner access only — no public sign-up.</p>
      <form action={formAction} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        {state?.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="h-9 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
