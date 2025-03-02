import globals from 'globals';
import typescriptParser from '@typescript-eslint/parser';
import playwright from 'eslint-plugin-playwright';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  {
    ...playwright.configs['flat/recommended'],

    languageOptions: {
      parser: typescriptParser,

      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: {
          ...globals.browser,
          ...globals.es2020
        }
      }
    },

    plugins: {
      'playwright': playwright,
      'simple-import-sort': simpleImportSort,
      'import': importPlugin
    },

    rules: {
      ...playwright.configs['flat/recommended'].rules,

      'simple-import-sort/exports': 'error',
      'import/no-duplicates': 'warn',
      'simple-import-sort/imports': 'warn'
    },

    files: ['tests/**/*.ts']
  }
];
