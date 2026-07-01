"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = { error: string } | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return null;
  } catch (error) {
    // signIn throws NEXT_REDIRECT on success — NOT an AuthError — so it falls through to
    // `throw error` and the redirect propagates. Only credential errors are surfaced.
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        const code = (error as { code?: string }).code;
        return {
          error:
            code === "rate_limited"
              ? "Too many attempts. Please wait a minute and try again."
              : "Invalid email or password.",
        };
      }
      return { error: "Something went wrong. Please try again." };
    }
    throw error;
  }
}
