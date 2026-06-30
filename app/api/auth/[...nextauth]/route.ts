import { handlers } from "@/auth";

// Do NOT add `export const runtime = "edge"` — OpenNext runs the Node runtime only.
export const { GET, POST } = handlers;
