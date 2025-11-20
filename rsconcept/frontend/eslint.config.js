import globals from 'globals';
import typescriptPlugin from 'typescript-eslint';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import playwright from 'eslint-plugin-playwright';

const basicRules = {
  'no-console': 'off',
  'require-jsdoc': 'off',

  '@typescript-eslint/consistent-type-imports': [
    'warn',
    {
      fixStyle: 'inline-type-imports'
    }
  ],
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

  'simple-import-sort/exports': 'error',
  'import/no-duplicates': 'warn'
};

export default [
  reactHooksPlugin.configs.flat.recommended,
  ...typescriptPlugin.configs.recommendedTypeChecked,
  ...typescriptPlugin.configs.stylisticTypeChecked,
  {
    ignores: [
      '**/parser.ts',
      '**/node_modules/**',
      '**/public/**',
      '**/dist/**',
      'vite.config.ts',
      'vitest.config.ts',
      'eslint.config.js',
      'playwright.config.ts'
    ]
  },
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: { ...globals.browser, ...globals.es2020, ...globals.jest },
        project: ['./tsconfig.json', './tsconfig.vite.json', './tsconfig.playwright.json']
      }
    }
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],

    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSort,
      'import': importPlugin
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...basicRules,
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            // Node.js builtins.
            [
              '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)'
            ],
            // Packages. `react` related packages come first.
            ['^react', '^@?\\w'],
            // Global app and features
            ['^(@/app|@/features)(/.*|$)'],
            // Internal packages.
            ['^(@)(/.*|$)'],
            // Side effect imports.
            ['^\\u0000'],
            // Parent imports. Put `..` last.
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports. Put same-folder imports and `.` last.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports.
            ['^.+\\.s?css$']
          ]
        }
      ],

      ...reactHooksPlugin.configs.recommended.rules
    }
  },
  {
    ...playwright.configs['flat/recommended'],

    files: ['tests/**/*.ts'],

    plugins: {
      'playwright': playwright,
      'simple-import-sort': simpleImportSort,
      'import': importPlugin
    },

    rules: {
      ...basicRules,
      ...playwright.configs['flat/recommended'].rules,
      'simple-import-sort/imports': 'warn'
    }
  }
];
