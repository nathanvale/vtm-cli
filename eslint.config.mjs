import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    name: 'eslint/base',
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: { ...js.configs.recommended.rules },
  },

  ...tseslint.configs.recommended,

  {
    name: 'project/custom',
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
      'no-implicit-coercion': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-throw-literal': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // Relax rules for test files
  {
    name: 'project/tests',
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts', '__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },

  {
    name: 'project/ignores',
    ignores: ['dist/**', 'coverage/**', '.claude/**'],
  },
)
