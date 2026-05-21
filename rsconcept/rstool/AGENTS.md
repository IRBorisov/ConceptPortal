# AGENTS.md

Rules for agents in `rsconcept/rstool`.

## Scope

Applies to all files under `rsconcept/rstool`.

## Structure

- `src/contracts/tool-contract.ts` — public contract (`CONTRACT_VERSION`, types, `RSFormAgentToolContract`)
- `src/index.ts` — `RSFormAgentTool` implementation
- `src/wrapper/stdio-wrapper.ts` — stdio JSON-RPC-style transport (`METHODS` must match contract)
- `src/wrapper/client.ts` — `RSToolWrapperClient` for spawned wrapper
- `src/mappers/` — bridge to frontend `rslang` / RSForm analysis and evaluation (`schema-adapter.ts`, `model-adapter.ts`)
- `tests/` — package-level contract and core behavior tests (e.g. `rsform-agent-tool.test.ts`)
- `examples/` — runnable agent workflows and sample session JSON; **colocate** `*.test.ts` with the example they cover (e.g. `examples/kinship/x1-actions.test.ts`, not under `tests/`)
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

- Contract surface changes live in `tool-contract.ts` first; implement in `index.ts` and wire stdio in `stdio-wrapper.ts`.
- Analyzer / RSLang behavior: prefer changes in `rsconcept/frontend/src/domain/rslang` and adapt via `src/mappers/schema-adapter.ts` — do not fork language rules in rstool.
- Evaluation / modeling: reuse frontend `RSEngine`, `RSCalculator`, `rsmodel-api` via `src/mappers/model-adapter.ts`; keep interpretation in-memory unless backend persistence is explicitly added.
- New or renamed public methods: update `METHODS` in `stdio-wrapper.ts`, tests, `README.md`, and the skill (see checklist below).
- Function arg order changes: update all callsites (wrapper, client, examples, tests).
- Tests for code under `examples/<name>/`: add or update `*.test.ts` in that same folder; do not put example-specific tests in `tests/`. Package-wide rstool tests stay in `tests/`.

## Contract changes — update the skill

Whenever you change the **agent contract** (not internal refactors), update documentation in the same PR / change set. Do not leave the skill stale.

**Counts as a contract change:**

- `CONTRACT_VERSION` bump
- New/removed/renamed methods on `RSFormAgentTool` or stdio `method` names
- Changes to request/response shapes (`ConstituentaDraft`, `SessionState`, `SessionModelState`, `AnalysisResult`, `EvaluationResult`, filters, export JSON)
- New `CstType` values or validation rules agents must follow (e.g. empty formal on `basic` / `constant`)
- New exported error codes in `RSErrorCode` that agents should handle
- Stdio protocol (ready handshake, error `code` strings, param field names)

**Sync checklist** (tick all that apply):

- [ ] `src/contracts/tool-contract.ts`
- [ ] `src/index.ts` + `src/wrapper/stdio-wrapper.ts` (`METHODS` + handlers)
- [ ] `src/mappers/model-adapter.ts` (when evaluation/modeling behavior changes)
- [ ] `tests/rsform-agent-tool.test.ts` (and any new tests)
- [ ] `README.md` (methods list, examples, contract version if documented)
- [ ] `skills/rslang-rstool/SKILL.md` — workflow, `cstType` table, triggers if behavior changed
- [ ] `skills/rslang-rstool/REFERENCE.md` — method table, types, stdio examples, version string
- [ ] `skills/rslang-rstool/EXAMPLES.md` — if examples or common mistakes changed
- [ ] `.agents/skills/rslang-rstool/` — same edits as `skills/rslang-rstool/` (keep copies identical)
- [ ] `examples/*.ts` and sample JSON under `examples/` when the happy path changes

**Language-only changes** (grammar, new `RSErrorCode` in frontend, help text): update skill only if agents need new guidance (operators, declaration order, diagnostic handling). Reference `REFERENCE.md` help map and `rsconcept/frontend/src/domain/rslang/error.ts`; do not duplicate full grammar in the skill.

## Versioning

- Bump `CONTRACT_VERSION` in `tool-contract.ts` for breaking agent-visible changes.
- Mention the new version in `REFERENCE.md` and anywhere the skill quotes `1.0.0` explicitly.
