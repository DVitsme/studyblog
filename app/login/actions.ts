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
      return {
        error:
          error.type === "CredentialsSignin"
            ? "Invalid email or password."
            : "Something went wrong. Please try again.",
      };
    }
    throw error;
  }
}
