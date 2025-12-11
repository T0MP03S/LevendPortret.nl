/* Root ESLint config shared by all apps */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
  extends: [
    "next/core-web-vitals",
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  ignorePatterns: [
    "**/.next/**",
    "**/dist/**",
    "**/build/**",
    "**/node_modules/**",
    "scripts/**",
  ],
  rules: {
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'warn',
  },
};
