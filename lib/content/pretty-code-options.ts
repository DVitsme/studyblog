import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import { getCodeHighlighter } from "./highlighter";

export const prettyCodeOptions: PrettyCodeOptions = {
  // Dual theme — both emitted, switched by the `.dark` class in CSS (see globals.css).
  theme: { light: "github-light", dark: "github-dark" },
  // Return our fine-grained singleton instead of rehype-pretty-code's full-bundle default.
  getHighlighter: (() => getCodeHighlighter()) as unknown as PrettyCodeOptions["getHighlighter"],
  keepBackground: false, // we own the code background in CSS so it flips with `.dark`
  defaultLang: "plaintext",
};
