import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Our overrides go after nextTs because the last matching rule wins.
  {
    rules: {
      // tsconfig already allows implicit any (noImplicitAny: false), so complaining about an explicit one makes no sense.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma client — not our code, no point linting it.
    "prisma/generated/**",
  ]),
]);

export default eslintConfig;
