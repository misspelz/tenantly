// Next.js apps (web, admin): base + Next.js and React Hooks rules, browser globals.
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

import base from "./base.js";

export default defineConfig(
  base,
  nextPlugin.configs["core-web-vitals"],
  reactHooks.configs.flat.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
);
