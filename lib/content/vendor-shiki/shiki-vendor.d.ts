// Resolution shim so TS accepts the vendored Shiki grammar/theme `.mjs` imports (they export the
// grammar/theme as default; we cast to Shiki's input types at the call site in ../highlighter.ts).
declare module "*.mjs" {
  const value: unknown;
  export default value;
}
