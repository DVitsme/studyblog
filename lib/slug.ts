// URL-safe slug from a title/tag. Lowercase, hyphenated, ASCII. Shared by the editor + tag sync.
// `+` and `#` are spelled out so tech tags stay distinct (C++ → c-plus-plus, C# → c-sharp, C → c)
// instead of all collapsing to "c" — and A+ → a-plus, matching the cert section slugs.
export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/\+/g, " plus ")
    .replace(/#/g, " sharp ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return s || "post";
}
