import type { Root, Element, RootContent } from "hast";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import { getCodeHighlighter } from "./highlighter";

// Common fence aliases our vendored grammars don't register natively.
const LANG_ALIASES: Record<string, string> = { pwsh: "powershell" };

// Minimal rehype→Shiki transformer using our vendored HighlighterCore.codeToHast directly.
// We deliberately do NOT use @shikijs/rehype: it imports `shiki/core`, which makes OpenNext's
// esbuild pull the `shiki` package barrel (~250 grammars) into the worker (verified 15MB→4.9MB raw).
// Output markup matches @shikijs/rehype (dual-theme `.shiki` + --shiki-* vars), so globals.css
// `.shiki` styling is unchanged. Runs AFTER rehype-sanitize (Shiki output is trusted).
export function rehypeShikiVendored() {
  return async (tree: Root): Promise<void> => {
    const highlighter = await getCodeHighlighter();
    const loaded = new Set(highlighter.getLoadedLanguages());

    // `visit` is synchronous; collect targets, then replace 1:1 by stored index (never splice).
    const targets: Array<{ parent: Root | Element; index: number; code: string; lang: string }> = [];
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || parent == null || index == null) return;
      const code = node.children.find(
        (c): c is Element => c.type === "element" && c.tagName === "code",
      );
      if (!code) return;
      const classes = (code.properties?.className as (string | number)[] | undefined) ?? [];
      const langClass = classes.find(
        (c): c is string => typeof c === "string" && c.startsWith("language-"),
      );
      let lang = langClass ? langClass.slice("language-".length).toLowerCase() : "plaintext";
      lang = LANG_ALIASES[lang] ?? lang;
      if (lang !== "plaintext" && !loaded.has(lang)) lang = "plaintext"; // unknown → plaintext
      targets.push({ parent: parent as Root | Element, index, code: toString(code), lang });
    });

    for (const t of targets) {
      try {
        const hast = highlighter.codeToHast(t.code, {
          lang: t.lang,
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
        });
        const pre = hast.children[0];
        if (pre) t.parent.children[t.index] = pre as RootContent;
      } catch {
        // Fail soft: leave the original (already-sanitized) <pre> in place. A single highlight
        // failure must NOT 500 the page (this backs the public post page AND the editor preview).
      }
    }
  };
}
