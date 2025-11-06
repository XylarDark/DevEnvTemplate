module.exports = {
  env: {
    node: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Add any custom rules for scripts here
    'no-console': 'off', // Allow console.log in scripts
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: [
    'node_modules/',
    'website/',
    'examples/',
    '**/*.test.js',
    '**/*.spec.js',
  ],
};
