---
name: rstool-helper
description: >-
  RS language, formal definitions and conceptual schema design for agents. Read GUIDE and docs from node_modules.
---

# rstool-helper

Thin **entry** skill. Full guide and docs stay in the package — use the Read tool on the paths below (from the project root).

## If the entry skill is not installed yet

The user ran `npm install @rsconcept/rstool` but has not registered the agent skill in the project. **Run the install procedure** in:

`node_modules/@rsconcept/rstool/skills/INSTALL.md`

Then continue with the canonical files below.

## Canonical files (read before rstool work)

- **Start here** — воркфлоу и чеклисты: `node_modules/@rsconcept/rstool/skills/rstool-helper/GUIDE.md`
- API, stdio, контракт: `node_modules/@rsconcept/rstool/skills/rstool-helper/REFERENCE.md`
- Примеры, типичные ошибки: `node_modules/@rsconcept/rstool/skills/rstool-helper/EXAMPLES.md`
- Language / domain docs: `node_modules/@rsconcept/rstool/docs/*.md`
- Install procedure: `node_modules/@rsconcept/rstool/skills/INSTALL.md`

Always open **GUIDE.md** first when starting a rstool task, then **REFERENCE.md** / **EXAMPLES.md** / relevant `docs/*.md` as needed.

## Portal (приложение)

Репозиторий: [github.com/IRBorisov/ConceptPortal](https://github.com/IRBorisov/ConceptPortal). REST и curl — `node_modules/@rsconcept/rstool/docs/PORTAL-API.md`; карта путей в исходниках — раздел «Репозиторий Portal» в том же файле.

## Quick facts

- Package: `@rsconcept/rstool`; wrapper: `npx rstool-wrapper`
- `@rsconcept/domain` is installed as a dependency (analyzer, errors in `src/rslang/error.ts`)
