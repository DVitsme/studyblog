import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Guard the Shiki bundle: importing shiki/* or @shikijs/rehype/langs/themes makes OpenNext's
      // esbuild pull the FULL ~250-grammar barrel into the worker (verified: 15MB/2.9MB-gzip).
      // Use @shikijs/core + @shikijs/engine-javascript + the vendored grammars in lib/content/vendor-shiki.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "shiki",
                "shiki/*",
                "@shikijs/rehype",
                "@shikijs/rehype/*",
                "rehype-pretty-code",
                "@shikijs/langs",
                "@shikijs/langs/*",
                "@shikijs/themes",
                "@shikijs/themes/*",
              ],
              message:
                "Pulls the full Shiki grammar barrel into the Workers bundle. Use @shikijs/core + @shikijs/engine-javascript + the vendored grammars in lib/content/vendor-shiki.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "lib/content/vendor-shiki/**", // vendored third-party grammar/theme data — don't lint
  ]),
]);

export default eslintConfig;
