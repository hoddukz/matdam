// Tag: config
// Path: /Users/hodduk/Documents/git/mat_dam/eslint.config.mjs

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      ".turbo/**",
      "**/next-env.d.ts",
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // React + Next.js specific config for apps/web
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React hooks (ESLint v10 호환)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Next.js
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-html-link-for-pages": ["error", "apps/web/src/app"],
    },
  },

  // TypeScript strict rules
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Prettier must be last
  prettierConfig
);
