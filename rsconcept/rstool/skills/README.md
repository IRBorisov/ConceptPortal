# Agent skills (`@rsconcept/rstool`)

Each skill lives in its own subdirectory: `skills/<skill-name>/SKILL.md` (plus reference files). Shared install steps: `INSTALL.md`.

## Layout

- `INSTALL.md`: agent procedure after `npm install`
- `rstool-helper/SKILL.md`: thin entry skill — copy into the project’s agent skills folder (see `INSTALL.md`)
- `rstool-helper/GUIDE.md`: entry point — task→read matrix, workflows (incl. review), checklists (Russian)
- `rstool-helper/REFERENCE.md`: API, stdio, MCP names, response shapes, help map (Russian)
- `rstool-helper/EXAMPLES.md`: snippets, anti-patterns, diagnostics, `examples/` index (Russian)
- `../docs/*.md`: language reference (DOMAIN, SYNTAX, DIAGNOSTICS, …)

## npm workflow

1. `npm install @rsconcept/rstool`
2. User asks the agent to install the skill (no manual copy).
3. Agent follows `node_modules/@rsconcept/rstool/skills/INSTALL.md`.
4. Agent reads `GUIDE.md` and `docs/` from `node_modules/@rsconcept/rstool/` when working.

Contract changes: see `AGENTS.md` in this package (sync checklist).
