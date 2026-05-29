# Agent skills (`@rsconcept/rstool`)

Each skill lives in its own subdirectory: `skills/<skill-name>/SKILL.md` (plus reference files). Shared install steps: `INSTALL.md`.

## Layout

- `INSTALL.md`: agent procedure after `npm install`
- `rstool-helper/SKILL.md`: thin entry skill — copy into the project’s agent skills folder (see `INSTALL.md`)
- `rstool-helper/GUIDE.md`: canonical workflow and language primer
- `rstool-helper/REFERENCE.md`: API, stdio, contract
- `rstool-helper/EXAMPLES.md`: worked examples and pitfalls
- `../docs/*.md`: language reference (DOMAIN, SYNTAX, DIAGNOSTICS, …)

## npm workflow

1. `npm install @rsconcept/rstool`
2. User asks the agent to install the skill (no manual copy).
3. Agent follows `node_modules/@rsconcept/rstool/skills/INSTALL.md`.
4. Agent reads `GUIDE.md` and `docs/` from `node_modules/@rsconcept/rstool/` when working.

Contract changes: see `AGENTS.md` in this package (sync checklist).
