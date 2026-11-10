// Shared rules for every TypeScript package. Apps extend `next` or `node`, which build on this.
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "**/dist/**",
    "**/.next/**",
    "**/coverage/**",
    "**/storybook-static/**",
    "**/next-env.d.ts",
  ]),

  js.configs.recommended,

  // Type-aware rules: they read the types, so they catch unhandled promises,
  // unsafe `any` and pointless conditions that syntax-only rules can't see.
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      // Each package's own tsconfig is found automatically. The package's
      // eslint.config.js sets `tsconfigRootDir` so the lookup starts there.
      parserOptions: { projectService: true },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
    },
  },

  // Plain JS files (configs) aren't in any tsconfig, so they skip type-aware rules.
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Last, so formatting rules that would fight Prettier are switched off.
  prettier,
);
