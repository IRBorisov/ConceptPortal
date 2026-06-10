# AGENTS.md

Rules for agents in `rsconcept/rstool`.

## Scope

Applies to all files under `rsconcept/rstool`. Published as `@rsconcept/rstool` with stdio bin `rstool-wrapper`.

## Agent docs (read before RS work)

Start at `skills/rstool-helper/GUIDE.md`, then `REFERENCE.md`, `EXAMPLES.md`, and `docs/*.md` as needed. Workspace skill entry: `.agents/skills/rstool-helper/SKILL.md`. Keep these in sync when the agent contract changes (see below).

## Structure

- `src/models/` — contract types (`tool-contract.ts`, `CONTRACT_VERSION`), entity files, `RSToolAgent` in `rstool-agent.ts`, explicit barrel `index.ts`
- `src/session/` — in-memory session store
- `src/mappers/` — bridge to `@rsconcept/domain`: `schema-adapter.ts` (analysis), `model-adapter.ts` (evaluation/modeling)
- `src/wrapper/` — stdio JSON-RPC (`stdio-wrapper.ts`; `METHODS` must match contract) + `RSToolWrapperClient`
- `src/index.ts` — package barrel
- `examples/` — runnable workflows + sample session JSON
- `docs/` — language reference index
- `skills/rstool-helper/` — canonical guide (`GUIDE.md`, `REFERENCE.md`, `EXAMPLES.md`, `SKILL.md`)
- `README.md` — setup, stdio protocol

Transports: library API (`RSToolAgent`) and stdio wrapper.

## Commands

From `rsconcept/rstool` (`@rsconcept/domain` from npm unless `npm link` to `rsconcept/domain`):

- Install: `npm install`
- Typecheck: `npm run typecheck`
- Tests: `npm test` (discovers `src/**/*.test.ts`, `examples/**/*.test.ts`)
- Build: `npm run build`
- Stdio (dev): `npm run wrapper`
- Stdio (built): `npx rstool-wrapper`
- Examples: `npm run example:client`, `example:build-schema`, `example:build-rsmodel` (+ kinship scripts in `package.json`)

## Edit rules

- **Contract surface**: entity file in `src/models/` → `tool-contract.ts` → `rstool-agent.ts` → `stdio-wrapper.ts` → re-export from `src/models/index.ts`. New top-level module: `tsdown.config.ts` `entryFiles`.
- **RSLang / analysis**: change `rsconcept/domain/src/rslang/`, adapt in `schema-adapter.ts` — do not fork language rules here.
- **Evaluation / modeling**: reuse domain `RSEngine`, `RSCalculator`, `rsmodel-api` via `model-adapter.ts`; in-memory only unless persistence is explicitly added.
- **Tests**: colocate `*.test.ts` beside the module; no top-level `tests/` folder.
- **Barrels**: named re-exports only in `src/index.ts` and `src/models/index.ts` — no `export *`.
- **Method add/rename**: also `README.md` and skill docs.

## Contract changes

Update code and docs in the **same change set**. Internal refactors do not count.

**Triggers:** `CONTRACT_VERSION` bump; method add/remove/rename (library or stdio); request/response shape changes; new `CstType` or agent-facing validation rules; new exported `RSErrorCode` agents must handle; stdio protocol changes.

**Sync:** `src/models/` + `stdio-wrapper.ts` + `model-adapter.ts` (if modeling) + colocated tests; `README.md`; `skills/rstool-helper/{GUIDE,REFERENCE,EXAMPLES}.md` (+ `SKILL.md` / `skills/INSTALL.md` if install flow changes); `examples/` when the happy path changes. Schema-design: `docs/CONCEPTUAL-SCHEMA.md` + GUIDE + EXAMPLES; keep `docs/README.md` index in sync.

**Language-only** (grammar, domain errors, help text): update skill only when agents need new guidance; point to `REFERENCE.md` help map and `rsconcept/domain/src/rslang/error.ts` — do not duplicate grammar in the skill.

## Versioning

- Agent-visible breaks: bump `CONTRACT_VERSION` in `src/models/tool-contract.ts`; mention in `REFERENCE.md`.
- npm `package.json` `version`: per release (`PUBLISHING.md`; `prepublishOnly` runs build).
- `@rsconcept/domain` `^` pin: re-test on bump; may require a contract bump.
