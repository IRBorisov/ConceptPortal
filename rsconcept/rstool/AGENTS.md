# AGENTS.md

Rules for agents in `rsconcept/rstool`.

## Scope

Applies to all files under `rsconcept/rstool`.

## Structure

- `src/models/` — public surface split by entity (`common.ts`, `diagnostic.ts`, `analysis.ts`, `evaluation.ts`, `constituenta.ts`, `model-value.ts`, `session.ts`); `tool-contract.ts` holds `CONTRACT_VERSION` + `RSToolAgentContract`; `rstool-agent.ts` holds the `RSToolAgent` implementation class; `index.ts` is the barrel re-exporting everything
- `src/index.ts` — top-level package barrel
- `src/wrapper/stdio-wrapper.ts` — stdio JSON-RPC-style transport (`METHODS` must match contract)
- `src/wrapper/client.ts` — `RSToolWrapperClient` for spawned wrapper
- `src/mappers/` — bridge to frontend `rslang` / RSForm analysis and evaluation (`schema-adapter.ts`, `model-adapter.ts`)
- `examples/` — runnable agent workflows and sample session JSON; colocate `*.test.ts` with the example they cover (e.g. `examples/kinship/x1-actions.test.ts`)
- `README.md` — setup, stdio protocol, scripts
- `skills/rslang-rstool/` — **versioned** agent skill (source of truth in git)

Agent-facing docs (keep in sync with contract changes):

- `skills/rslang-rstool/SKILL.md` — primary skill entry
- `skills/rslang-rstool/REFERENCE.md` — API, stdio, error codes
- `skills/rslang-rstool/EXAMPLES.md` — worked examples and pitfalls

After editing the skill, update the duplicate under `.agents/skills/rslang-rstool/` in the same change set (see `skills/README.md`).

## Commands

Run from `rsconcept/rstool` (install frontend deps first — typecheck resolves `@/*` into `rsconcept/frontend/src`):

- `npm ci` in `rsconcept/frontend`, then `npm ci` in `rsconcept/rstool`
- Typecheck: `npm run typecheck`
- Tests: `npm test`
- All packages (backend, frontend, rstool): `powershell -File scripts/dev/RunTests.ps1` from repo root
- Stdio wrapper: `npm run wrapper`
- Examples: `npm run example:client`, `npm run example:build-schema`, `npm run example:build-rsmodel`; other scripts under `examples/` as added to `package.json`

## Edit rules

- Contract surface changes live in `src/models/` first (put request/response shapes in the matching entity file; add the method to `models/tool-contract.ts`); implement in `models/rstool-agent.ts` and wire stdio in `wrapper/stdio-wrapper.ts`. Re-export new types from `src/models/index.ts`.
- Analyzer / RSLang behavior: prefer changes in `rsconcept/frontend/src/domain/rslang` and adapt via `src/mappers/schema-adapter.ts` — do not fork language rules in rstool.
- Evaluation / modeling: reuse frontend `RSEngine`, `RSCalculator`, `rsmodel-api` via `src/mappers/model-adapter.ts`; keep interpretation in-memory unless backend persistence is explicitly added.
- New or renamed public methods: update `METHODS` in `stdio-wrapper.ts`, tests, `README.md`, and the skill (see checklist below).
- Function arg order changes: update all callsites (wrapper, client, examples, tests).
- **Colocate** module tests with the module they cover (e.g. `src/models/rstool-agent.test.ts` next to `src/models/rstool-agent.ts`; `examples/kinship/x1-actions.test.ts` next to its example). Do **not** introduce a separate top-level `tests/` folder — vitest discovers `src/**/*.test.ts` and `examples/**/*.test.ts` directly. If you need to move or rename a test, keep it beside the file it covers.
- Barrel files (`src/index.ts`, `src/models/index.ts`): list **concrete** named re-exports. Do **not** use `export * from '...'` — keeping the public surface explicit makes additions reviewable and prevents accidental leakage from internal modules.

## Transports

- Supported transports: library API (`RSToolAgent`) and stdio JSON wrapper (`src/wrapper/stdio-wrapper.ts`).

## Contract changes — update the skill

Whenever you change the **agent contract** (not internal refactors), update documentation in the same PR / change set. Do not leave the skill stale.

**Counts as a contract change:**

- `CONTRACT_VERSION` bump
- New/removed/renamed methods on `RSToolAgent` or stdio `method` names
- Changes to request/response shapes (`ConstituentaDraft`, `SessionState`, `SessionModelState`, `AnalysisResult`, `EvaluationResult`, filters, export JSON)
- New `CstType` values or validation rules agents must follow (e.g. empty formal on `basic` / `constant`)
- New exported error codes in `RSErrorCode` that agents should handle
- Stdio protocol (ready handshake, error `code` strings, param field names)

**Sync checklist** (tick all that apply):

- [ ] `src/models/` (entity files + `tool-contract.ts` + `rstool-agent.ts` + `index.ts` barrel)
- [ ] `src/wrapper/stdio-wrapper.ts` (`METHODS` + handlers)
- [ ] `src/mappers/model-adapter.ts` (when evaluation/modeling behavior changes)
- [ ] `src/models/rstool-agent.test.ts` (and any new colocated `*.test.ts`)
- [ ] `README.md` (methods list, examples, contract version if documented)
- [ ] `skills/rslang-rstool/SKILL.md` — workflow, `cstType` table, triggers if behavior changed
- [ ] `skills/rslang-rstool/REFERENCE.md` — method table, types, stdio examples, version string
- [ ] `skills/rslang-rstool/EXAMPLES.md` — if examples or common mistakes changed
- [ ] `.agents/skills/rslang-rstool/` — same edits as `skills/rslang-rstool/` (keep copies identical)
- [ ] `examples/*.ts` and sample JSON under `examples/` when the happy path changes

**Language-only changes** (grammar, new `RSErrorCode` in frontend, help text): update skill only if agents need new guidance (operators, declaration order, diagnostic handling). Reference `REFERENCE.md` help map and `rsconcept/frontend/src/domain/rslang/error.ts`; do not duplicate full grammar in the skill.

## Versioning

- Bump `CONTRACT_VERSION` in `src/models/tool-contract.ts` for breaking agent-visible changes.
- Mention the new version in `REFERENCE.md` and anywhere the skill quotes `1.0.0` explicitly.
