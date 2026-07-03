# AGENTS.md

Rules for agents in `rsconcept/domain`.

## Scope

Applies to all files under `rsconcept/domain`. This package is the shared TypeScript domain consumed by `rsconcept/frontend` and `rsconcept/rstool`.

## Structure

- `src/rslang/` — RSLang parser, semantic analyzer, evaluator, calculator, type and value systems, error codes
- `src/rslang/parser/README.md` — parse → normalize → hybrid AST pipeline
- `src/library/` — `RSForm`, `RSModel`, `RSEngine`, OSS, library metadata, structure planner
- `src/graph/` — generic directed-graph utilities
- `src/parsing/` — shared Lezer AST helpers
- `src/cctext/` — grammemes for concept text
- `src/shared/` — `Branded<T>`, FNV-1a hash, stub id helpers
- `src/index.ts` — root barrel re-exporting commonly used names
- Each subfolder ships its own `index.ts` barrel — subpath imports (`@rsconcept/domain/rslang`) are preferred over the root entry

## Commands

Run from repo root (pnpm workspace):

- `pnpm --filter @rsconcept/domain run generate` — regenerate the Lezer parser from `src/rslang/parser/rslang.grammar`
- `pnpm --filter @rsconcept/domain run build` — produce `dist/` via [tsdown](https://tsdown.dev) (ESM + `.d.ts` + sourcemaps)
- `pnpm --filter @rsconcept/domain run dev` — rebuild `dist/` on change (`tsdown --watch`)
- `pnpm --filter @rsconcept/domain run typecheck` — `tsc --noEmit`
- `pnpm --filter @rsconcept/domain test` — `vitest run`
- `pnpm --filter @rsconcept/domain run lint` — ESLint (TypeScript rules aligned with frontend, no React)
- `pnpm --filter @rsconcept/domain run lintFix` — ESLint with `--fix`
- `pnpm --filter @rsconcept/domain run format` / `format:check` — Prettier on `src/**/*.ts`

Always run `generate` after editing `rslang.grammar`. The build is reproduced as part of `build`.

## Edit rules

- Domain code is pure TypeScript. Do **not** import React, Vite-specific APIs, Node-only globals at module top level, browser-only APIs, or anything from `@/features`, `@/i18n`, `@/components`.
- Allowed runtime dependencies: `@lezer/common`, `@lezer/lr`. New runtime deps require a deliberate decision because every Portal consumer ships them. Validation libraries (zod, etc.) belong in consumers — domain types stay framework-free.
- Keep all language rules (grammar, parser, semantic analyzer, evaluator) in this package. Consumers must not fork them.
- Function arg order changes: update all callsites (frontend, rstool, examples).
- Barrel files (`src/index.ts`, sub-barrels): list **concrete** named re-exports. Do **not** use `export * from '...'`.
- New subpath: also add an `"exports"` entry in `package.json` and an `entry` in `tsdown.config.ts`.
- Tests live colocated as `*.test.ts` next to the module they cover.

## Publishing

- Public package `@rsconcept/domain` on npm; release steps in `PUBLISHING.md`.
- Bump `version` in `package.json` per semver. Breaking changes for **any** consumer (frontend or rstool) require a major bump.
- `prepublishOnly` runs `pnpm run build`; only `dist/`, `src/`, `README.md`, and `LICENSE` are shipped.
