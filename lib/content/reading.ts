// Reading-time estimate. Kept separate from render.ts so importers (Server Actions) don't pull the
// Shiki module graph just to count words.
const WORDS_PER_MINUTE = 220;

export function readingMinutes(md: string): number {
  const words = md.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
