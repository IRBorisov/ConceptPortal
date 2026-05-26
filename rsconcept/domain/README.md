# @rsconcept/domain

Shared TypeScript domain layer for the [Concept Portal](https://portal.acconcept.ru) stack.

This package implements the formal language **RSLang**, the schema model **RSForm**, the evaluation engine **RSEngine**, the operation-of-schemas model **OSS**, and supporting helpers (graphs, parsing utilities, concept-text grammemes). It is consumed both by the Portal frontend and by [`@rsconcept/rstool`](https://www.npmjs.com/package/@rsconcept/rstool).

## Install

```bash
npm install @rsconcept/domain
```

## Subpath exports

```ts
import { RSLangAnalyzer, RSErrorCode } from '@rsconcept/domain/rslang';
import { CstType, type RSForm } from '@rsconcept/domain/library/rsform';
import { Graph } from '@rsconcept/domain/graph';
import { buildTree, type AstNode } from '@rsconcept/domain/parsing';
```

The root entry (`@rsconcept/domain`) re-exports the most common names. Subpath imports are recommended for tree-shaking and to make dependency graphs explicit.

## Contents

| Subpath   | Surface                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------- |
| `rslang`  | Lezer parser, semantic analyzer, evaluator, calculator, type system, value system, error codes |
| `library` | `RSForm`, `RSModel`, `RSEngine`, OSS, library item metadata, structure planner                 |
| `graph`   | Generic directed-graph utilities used for dependency tracking                                  |
| `parsing` | Lezer AST helpers shared by all parsers                                                        |
| `cctext`  | Russian/multilingual grammemes for concept-text references                                     |
| `shared`  | `Branded<T>` types, FNV-1a hash, stub id generation                                            |

## Build

```bash
npm run generate    # regenerates Lezer parser from rslang.grammar
npm run build       # produces ./dist via tsdown
npm test            # vitest run
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint (TypeScript; same core rules as frontend, no React)
npm run lintFix     # ESLint --fix
npm run format:check
```

After editing `src/rslang/parser/rslang.grammar`, always run `npm run generate` before committing.

## Publishing

Maintainers: see [PUBLISHING.md](./PUBLISHING.md) for npm release steps.

## License

MIT
