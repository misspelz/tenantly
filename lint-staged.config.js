// Runs on staged files only, so commits stay fast. Full lint and type checks run in CI.
export default {
  "*.{ts,tsx,js,mjs,cjs,json,md,css,yaml,yml}": "prettier --write",
  "apps/admin/**/*.{ts,tsx,js,mjs}":
    "eslint --fix --max-warnings=0 --config apps/admin/eslint.config.js",
  "apps/api/**/*.{ts,tsx,js,mjs}":
    "eslint --fix --max-warnings=0 --config apps/api/eslint.config.js",
  "apps/web/**/*.{ts,tsx,js,mjs}":
    "eslint --fix --max-warnings=0 --config apps/web/eslint.config.js",
  "packages/eslint-config/**/*.{ts,tsx,js,mjs}":
    "eslint --fix --max-warnings=0 --config packages/eslint-config/base.js",
};
