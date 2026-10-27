# Agent skills (`@rsconcept/rstool`)

One registered entry (`rstool`, the router) and stage / tool skills read by path. Skill text is Russian. Plan — [`../plans/skills-rework.html`](../plans/skills-rework.html).

## Layout

| Skill                                        | Role                                                                |
| :------------------------------------------- | :------------------------------------------------------------------ |
| [`rstool/`](rstool/SKILL.md)                 | Router: scenario → stages, brief, anti-greening rules, report       |
| [`rs-scope/`](rs-scope/SKILL.md)             | Stage 1: scope, source markup, expressiveness requirements, round 1 |
| [`rs-core/`](rs-core/SKILL.md)               | Stage 2: core hypotheses, properties as decisions, round 2          |
| [`rs-explicate/`](rs-explicate/SKILL.md)     | Stage 3: RSLang formulas, diagnostics without losing meaning        |
| [`rs-interpret/`](rs-interpret/SKILL.md)     | Stage 4: brief scenarios on small models                            |
| [`rs-review/`](rs-review/SKILL.md)           | Stage 5: review against the brief, then form; report template       |
| [`rs-synthesis/`](rs-synthesis/SKILL.md)     | Operation: synthesis of microtheories, OSS                          |
| [`rs-explain/`](rs-explain/SKILL.md)         | Explaining a formula or construction                                |
| [`rs-portal/`](rs-portal/SKILL.md)           | Tool: Portal REST, publish protocol                                 |
| [`rstool-runtime/`](rstool-runtime/SKILL.md) | Tool: calling rstool; `REFERENCE.md` (contract), `EXAMPLES.md`      |
| [`scripts/`](scripts/)                       | `check-brief.ts` (brief readiness), `rstool-skills.mjs` (install)   |
| `rstool-helper/`                             | Deprecated stub → `rstool`; removed in the next minor release       |

Only `rstool` is an entry point: a routing line in the project `AGENTS.md` and, where the host loads a project skills folder, a stub (name, description and the path; in the Portal workspace — `.agents/skills/rstool/` and `.claude/skills/rstool/`). Stage skills are not registered: the router and `check-brief` name the stage, the agent reads `skills/<name>/SKILL.md`. Paths inside skills are written from the package root `<rstool>` — `rsconcept/rstool/` in the Portal workspace, `node_modules/@rsconcept/rstool/` in an npm project.

Language reference and method — [`../docs/`](../docs/README.md).

## npm workflow

1. `npm install @rsconcept/rstool`
2. Ask the agent to follow [`INSTALL.md`](INSTALL.md): an agent-neutral procedure that each agent maps to its own host.
3. The agent reads the router and stage skills from `node_modules/@rsconcept/rstool/skills/`.

## Editing

The stub description must match `rstool/SKILL.md`; `scripts/skill-stubs.test.ts` checks the workspace stubs. After changing the router description, re-run from the repo root: `node rsconcept/rstool/skills/scripts/rstool-skills.mjs install --dir .agents/skills --dir .claude/skills`.

Contract changes: see `AGENTS.md` in this package (sync checklist).
