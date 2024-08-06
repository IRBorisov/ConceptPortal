import globals from 'globals';
import typescriptPlugin from 'typescript-eslint';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
// import { fixupPluginRules } from '@eslint/compat';
// import reactHooksPlugin from 'eslint-plugin-react-hooks';

import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  ...typescriptPlugin.configs.recommendedTypeChecked,
  ...typescriptPlugin.configs.stylisticTypeChecked,
  {
    ignores: ['**/parser.ts', '**/node_modules/**', '**/public/**', 'eslint.config.js']
  },
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: { ...globals.browser, ...globals.es2020, ...globals.jest },
        project: ['./tsconfig.json', './tsconfig.node.json']
      }
    }
  },
  {
    plugins: {
      'react': reactPlugin,
      // 'react-hooks': fixupPluginRules(reactHooksPlugin),
      'simple-import-sort': simpleImportSort
    },
    settings: { react: { version: 'detect' } },
    rules: {
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],

      'react-refresh/only-export-components': ['off', { allowConstantExport: true }],

      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'error'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-console': 'off',
      'require-jsdoc': 'off'
    }
  }
];
