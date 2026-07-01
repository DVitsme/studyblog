import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// Fine-grained Shiki highlighter for Cloudflare Workers.
// - JavaScript regex engine (NOT WASM): Workers block runtime WASM compilation
//   ("Wasm code generation disallowed by embedder"). The JS engine uses native RegExp.
// - Import ONLY the themes/langs we use (never `shiki` or `shiki/bundle/*`, which pull ~200 grammars).
// - Module-level singleton: a highlighter is compiled grammars/themes in memory (pure CPU, no I/O),
//   so it's safe to hoist on Workers and is encouraged for expensive immutable init.
let highlighterPromise: Promise<HighlighterCore> | undefined;

export function getCodeHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    themes: [import("@shikijs/themes/github-light"), import("@shikijs/themes/github-dark")],
    langs: [
      import("@shikijs/langs/bash"),
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/python"),
      import("@shikijs/langs/powershell"),
      import("@shikijs/langs/sql"),
      import("@shikijs/langs/yaml"),
      import("@shikijs/langs/html"),
      import("@shikijs/langs/css"),
      import("@shikijs/langs/markdown"),
      import("@shikijs/langs/diff"),
      // `plaintext` / `text` / `ansi` are built-in specials — no import needed.
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}
