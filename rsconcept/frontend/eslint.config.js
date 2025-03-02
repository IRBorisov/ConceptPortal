import globals from 'globals';
import typescriptPlugin from 'typescript-eslint';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  ...typescriptPlugin.configs.recommendedTypeChecked,
  ...typescriptPlugin.configs.stylisticTypeChecked,
  {
    ignores: ['**/parser.ts', '**/node_modules/**', '**/public/**', '**/dist/**', 'eslint.config.js']
  },
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: { ...globals.browser, ...globals.es2020, ...globals.jest },
        project: ['./tsconfig.json', './tsconfig.node.json'],
        projectService: true
      }
    }
  },
  {
    plugins: {
      'react': reactPlugin,
      'react-compiler': reactCompilerPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSort,
      'import': importPlugin
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-compiler/react-compiler': 'error',
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

      'react-refresh/only-export-components': ['off', { allowConstantExport: true }],

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
      'simple-import-sort/exports': 'error',
      'import/no-duplicates': 'warn',

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
