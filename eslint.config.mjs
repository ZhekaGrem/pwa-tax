import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'

// Note: eslint-config-next already registers the `jsx-a11y` plugin. To add the
// `recommended` a11y rule set without redefining the plugin (which throws in
// flat config), spread its rules into our own config entry.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
  // shadcn-generated UI primitives are thin wrappers; a11y is enforced at
  // the consumption site (the wrapper forwards props like htmlFor).
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'jsx-a11y/label-has-associated-control': 'off',
    },
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    // Serwist-generated service worker artifacts.
    'public/sw.js',
    'public/swe-worker-*.js',
    'public/workbox-*.js',
    'public/fallback-*',
  ]),
])

export default eslintConfig
