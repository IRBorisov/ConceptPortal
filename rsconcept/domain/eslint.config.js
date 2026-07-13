import globals from 'globals';
import typescriptPlugin from 'typescript-eslint';
import typescriptParser from '@typescript-eslint/parser';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const basicRules = {
  'no-console': 'off',
  'require-jsdoc': 'off',
  'linebreak-style': ['error', 'unix'],

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

  'simple-import-sort/exports': 'error'
};

export default typescriptPlugin.config(
  {
    ignores: [
      '**/parser.ts',
      '**/parser.terms.ts',
      '**/node_modules/**',
      '**/dist/**',
      '**/*.json',
      'vitest.config.ts',
      'tsdown.config.ts',
      'eslint.config.js'
    ]
  },
  {
    files: ['src/**/*.ts'],
    extends: [...typescriptPlugin.configs.recommendedTypeChecked, ...typescriptPlugin.configs.stylisticTypeChecked],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname
      },
      globals: { ...globals.node, ...globals.es2020 }
    },
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    rules: {
      ...basicRules,
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            [
              '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)'
            ],
            ['^@?\\w'],
            ['^\\u0000'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$']
          ]
        }
      ]
    }
  }
);
