import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import turboPlugin from "eslint-plugin-turbo";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * Shared flat ESLint config for non-Next packages (`ui`, `api-client`, `types`).
 *
 * Project rule: strict TypeScript, no unjustified `any`. `no-explicit-any` is
 * an error here; silence a genuine unavoidable case with an inline
 * `// eslint-disable-next-line` + a reason, never by loosening the rule.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { turbo: turboPlugin },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },
  // Keep `only-warn` last so it can downgrade everything to a warning in dev;
  // CI still fails via `eslint --max-warnings 0`.
  { plugins: { onlyWarn } },
  eslintConfigPrettier,
  { ignores: ["dist/**", "node_modules/**", ".next/**"] },
];

export default config;
