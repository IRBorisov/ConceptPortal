---
name: rstool-helper
description: >-
  RS language and @rsconcept/rstool for agents. After npm install, read GUIDE and
  docs from node_modules. If the entry skill is not installed in the project yet,
  follow skills/INSTALL.md in this package.
---

# rstool-helper (npm install)

Thin **entry** skill. Full guide and docs stay in the package — use the Read tool on the paths below (from the project root).

## If the entry skill is not installed yet

The user ran `npm install @rsconcept/rstool` but has not registered the agent skill in the project. **Run the install procedure** in:

`node_modules/@rsconcept/rstool/skills/INSTALL.md`

Then continue with the canonical files below.

## Canonical files (read before rstool work)

- **Start here** — workflow: `node_modules/@rsconcept/rstool/skills/rstool-helper/GUIDE.md`
- API, stdio, contract: `node_modules/@rsconcept/rstool/skills/rstool-helper/REFERENCE.md`
- Examples, pitfalls: `node_modules/@rsconcept/rstool/skills/rstool-helper/EXAMPLES.md`
- Language / domain docs: `node_modules/@rsconcept/rstool/docs/*.md`
- Install procedure: `node_modules/@rsconcept/rstool/skills/INSTALL.md`

Always open **GUIDE.md** first when starting a rstool task, then **REFERENCE.md** / **EXAMPLES.md** / relevant `docs/*.md` as needed.

## Quick facts

- Package: `@rsconcept/rstool`; wrapper: `npx rstool-wrapper`
- `@rsconcept/domain` is installed as a dependency (analyzer, errors in `src/rslang/error.ts`)
