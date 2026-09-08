/**
 * ESLint flat configuration.
 *
 * ESLint 10 removed support for `.eslintrc`, so flat config is the only format. The previous
 * `.eslintrc.cjs` was already inert under ESLint 9, which ignores eslintrc by default, and there
 * was no `lint` script or CI step, so nothing in this repository was ever linted.
 *
 * Type-aware rules are deliberately not enabled: `tsc --noEmit` already runs in `prebuild` and in
 * CI, and typed linting would roughly double lint time for overlapping coverage.
 */

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    // Generated, vendored, or non-source paths.
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.devenv/**', 'tests/fixtures/**'],
  },

  // Baseline for every linted file.
  js.configs.recommended,

  // TypeScript sources.
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
    rules: {
      // Scripts are CLIs; their output is the user interface.
      'no-console': 'off',
      // `caughtErrors: 'none'`: deliberately ignoring a caught error is idiomatic here
      // (missing optional file, best-effort probe). The meaningful failure - discarding
      // context while rethrowing - is caught by `preserve-caught-error` instead.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      // This codebase reads untyped JSON reports from sibling tools. Tightening this is
      // worthwhile but is a behavioral refactor, not a lint-config change.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // CommonJS scripts and wrappers.
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        AbortController: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },

  // Tests use the Node test runner, so assertions and hooks come from imports, not globals.
  {
    files: ['tests/**/*.js'],
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  }
);
