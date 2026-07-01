// Import from the UNDERLYING packages, NOT `shiki/core`/`shiki/engine/javascript`: importing any
// `shiki/*` subpath makes OpenNext's esbuild pull the `shiki` package barrel's `bundledLanguages`
// (all ~250 grammars) into the worker. @shikijs/core + @shikijs/engine-javascript avoid that.
import {
  createHighlighterCore,
  type HighlighterCore,
  type LanguageInput,
  type ThemeInput,
} from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
// VENDORED grammars/themes (copied from @shikijs/langs & @shikijs/themes into ./vendor-shiki).
// Why vendored: OpenNext's esbuild re-bundle pulls the ENTIRE @shikijs/langs package (~250 grammars)
// when it resolves ANY `@shikijs/langs/*` subpath import — Turbopack tree-shakes to 10, but the
// OpenNext pass inflated the worker to 15MB/2.9MB-gzip (risking the 1s Workers startup limit).
// Local self-contained files sidestep package resolution → only these 10 grammars bundle.
// (JS regex engine, NOT WASM — Workers block runtime WASM compilation. Singleton = pure CPU, no I/O.)
import githubLight from "./vendor-shiki/github-light.mjs";
import githubDark from "./vendor-shiki/github-dark.mjs";
import shellscript from "./vendor-shiki/shellscript.mjs"; // registers bash/sh/shell
import typescript from "./vendor-shiki/typescript.mjs";
import tsx from "./vendor-shiki/tsx.mjs";
import javascript from "./vendor-shiki/javascript.mjs";
import json from "./vendor-shiki/json.mjs";
import python from "./vendor-shiki/python.mjs";
import powershell from "./vendor-shiki/powershell.mjs";
import sql from "./vendor-shiki/sql.mjs";
import yaml from "./vendor-shiki/yaml.mjs";
import diff from "./vendor-shiki/diff.mjs";

let highlighterPromise: Promise<HighlighterCore> | undefined;

export function getCodeHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    themes: [githubLight, githubDark] as unknown as ThemeInput[],
    langs: [shellscript, typescript, tsx, javascript, json, python, powershell, sql, yaml, diff] as unknown as LanguageInput[],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}
