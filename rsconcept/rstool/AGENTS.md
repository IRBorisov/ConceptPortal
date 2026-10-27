# AGENTS.md

Rules for agents in `rsconcept/rstool`.

## Scope

Applies to all files under `rsconcept/rstool`. Published as `@rsconcept/rstool` with stdio bin `rstool-wrapper`.

## See also

- Portable guides: [`docs/architecture.md`](../../docs/architecture.md), [`docs/coding-style.md`](../../docs/coding-style.md) (package rules win on conflict)
- Terminology: [`docs/DOMAIN.md`](docs/DOMAIN.md) §«Термины: не путать»

## Agent docs (read before RS work)

Start at `skills/rstool/SKILL.md` (router: scenario → stage skills `skills/rs-*/SKILL.md`), then only what the stage names — not all of `docs/`. Method — `docs/METHOD.md`; brief format and `check-brief` — `docs/BRIEF.md`. `skills/rstool-runtime/REFERENCE.md` is the contract (library / stdio / MCP); `skills/rstool-runtime/EXAMPLES.md` has snippets and anti-patterns. Workspace entry: the routing line in the root `AGENTS.md` and the stub `.agents/skills/rstool/`.

## Agents using rstool (task work, not package maintenance)

When the goal is a conceptual schema, Portal export, or analysis — **do not create or edit files under `rsconcept/rstool/`** unless the user explicitly asks to change the package, add a canonical example, or update rstool docs.

- Use in-memory API / stdio; write outputs (`portal-schema.json`, session JSON, ad-hoc `build-*.ts`) **outside** the package (user folder, workspace `.tmp/`, path the user named).
- Do not add task-specific folders under `examples/` (that directory is for maintained package demos only).
- See «Границы правок» in `skills/rstool/SKILL.md`.

## Structure

- `src/models/` — contract types (`tool-contract.ts`, `CONTRACT_VERSION`), entity files, `RSToolAgent` in `rstool-agent.ts`, explicit barrel `index.ts`
- `src/session/` — in-memory session store
- `src/mappers/` — bridge to `@rsconcept/domain`: `schema-adapter.ts` (analysis), `model-adapter.ts` (evaluation/modeling)
- `src/wrapper/` — stdio JSON-RPC (`stdio-handler.ts` holds `STDIO_METHODS`, must match contract; `stdio-wrapper.ts` is `RSToolWrapperClient`)
- `src/index.ts` — package barrel
- `examples/` — runnable workflows + sample session JSON; teaching examples with `brief.json` and anti-examples (`subordination/`, `kinship-subordination/`)
- `docs/` — language reference, method (`METHOD.md`), brief (`BRIEF.md`, `brief.schema.json`)
- `skills/` — agent skills in Russian: router `rstool/`, stage skills `rs-*/`, `rstool-runtime/` (`REFERENCE.md`, `EXAMPLES.md`), `scripts/` (`check-brief.ts`, `rstool-skills.mjs`); `rstool-helper/` is a deprecated stub
- `evals/` — skill eval tasks, hidden references and results (not published)
- `README.md` — setup, stdio protocol

Transports: library API (`RSToolAgent`) and stdio wrapper.

## Commands

Scripts: `package.json` / `examples/README.md`. Non-obvious: build `@rsconcept/domain` before rstool work; contract-visible changes update skill docs in the same change set (see below).

## Edit rules

- **Contract surface**: entity file in `src/models/` → `tool-contract.ts` → `rstool-agent.ts` → `stdio-handler.ts` (`STDIO_METHODS`) → re-export from `src/models/index.ts`. New top-level module: `tsdown.config.ts` `entryFiles`.
- **ЯРЭ / analysis**: change `rsconcept/domain/src/rslang/`, adapt in `schema-adapter.ts` — do not fork language rules here.
- **Evaluation / modeling**: reuse domain `RSEngine`, `RSCalculator`, `rsmodel-api` via `model-adapter.ts`; in-memory only unless persistence is explicitly added.
- **Tests**: colocate `*.test.ts` beside the module; no top-level `tests/` folder.
- **Barrels**: named re-exports only in `src/index.ts` and `src/models/index.ts` — no `export *`.
- **Method add/rename**: also `README.md` and skill docs.

## Contract changes

Update code and docs in the **same change set**. Internal refactors do not count.

**Triggers:** `CONTRACT_VERSION` bump; method add/remove/rename (library or stdio); request/response shape changes; new `CstType` or agent-facing validation rules; new exported `RSErrorCode` agents must handle; stdio protocol changes.

**Sync:** `src/models/` + `stdio-handler.ts` + `model-adapter.ts` (if modeling) + colocated tests; `README.md`; `skills/rstool-runtime/{SKILL,REFERENCE,EXAMPLES}.md` and the stage skills that call the method (+ `skills/INSTALL.md` if install flow changes); `examples/` when the happy path changes. Schema-design: `docs/CONCEPTUAL-SCHEMA.md` + `skills/rs-explicate`, `skills/rs-review` + EXAMPLES; method or brief changes: `docs/METHOD.md`, `docs/BRIEF.md`, `docs/brief.schema.json`, `skills/scripts/brief-check.ts`; keep `docs/README.md` index in sync. Router description change: regenerate the workspace stubs (`skills/README.md` «Editing»).

**Language-only** (grammar, domain errors, help text): update skill only when agents need new guidance; point to `REFERENCE.md` «Help map» and `rsconcept/domain/src/rslang/error.ts` — do not duplicate grammar in the skill. Keep the router scenario table and EXAMPLES anti-patterns in sync when agent workflows change.

## Versioning

- Agent-visible breaks: bump `CONTRACT_VERSION` in `src/models/tool-contract.ts`; mention in `REFERENCE.md`.
- npm `package.json` `version`: per release (`PUBLISHING.md`; `prepublishOnly` runs build).
- `@rsconcept/domain` `^` pin: re-test on bump; may require a contract bump.
