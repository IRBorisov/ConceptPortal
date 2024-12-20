import globals from 'globals';
import typescriptPlugin from 'typescript-eslint';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  ...typescriptPlugin.configs.recommendedTypeChecked,
  ...typescriptPlugin.configs.stylisticTypeChecked,
  {
    ignores: [
      '**/parser.ts',
      '**/node_modules/**',
      '**/public/**',
      '**/dist/**',
      'eslint.config.js',
      'tailwind.config.js',
      'postcss.config.js'
    ]
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
      'react-compiler': reactCompilerPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSort
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-compiler/react-compiler': 'error',
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
      'simple-import-sort/exports': 'error',

      ...reactHooksPlugin.configs.recommended.rules
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
