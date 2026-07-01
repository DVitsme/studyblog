"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { login } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Stage4 Login — single-owner credential card. Show/hide password, error banner (role=alert),
// submitting state. Auth wiring in @/app/login/actions (Auth.js credentials).
export function LoginCard() {
  const [state, formAction, pending] = useActionState(login, null);
  const [showPw, setShowPw] = useState(false);
  const hasError = Boolean(state?.error);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2">
          <span className="font-mono text-lg font-semibold tracking-tight">
            study<span className="text-brand">blog</span>
          </span>
          <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            admin
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your study notes.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        {hasError ? (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/[0.09] px-3 py-2.5 text-sm text-destructive"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{state?.error}</span>
          </div>
        ) : null}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              autoFocus
              aria-invalid={hasError || undefined}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                aria-invalid={hasError || undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={pending} className={cn("w-full", pending && "opacity-90")}>
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Single-owner · no public sign-up
      </p>
    </div>
  );
}
