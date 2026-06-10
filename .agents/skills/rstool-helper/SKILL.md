---
name: rstool-helper
description: >-
  RS language, formal definitions and conceptual schema design for agents. Read GUIDE and docs from rsconcept/rstool in the repo.
---

# rstool-helper (Concept Portal workspace)

Thin entry skill for this repository. **Do not** `npm install @rsconcept/rstool` for in-tree work — the library and docs are at `rsconcept/rstool/`.

## Canonical files (read before rstool work)

Paths are from the **workspace root**.

| What                                         | Path                                                 |
| :------------------------------------------- | :--------------------------------------------------- |
| **Start here** — воркфлоу, чеклисты, cstType, S# vs D# | `rsconcept/rstool/skills/rstool-helper/GUIDE.md`     |
| API, stdio, контракт                         | `rsconcept/rstool/skills/rstool-helper/REFERENCE.md` |
| Примеры, типичные ошибки                     | `rsconcept/rstool/skills/rstool-helper/EXAMPLES.md`  |
| Language / domain docs                       | `rsconcept/rstool/docs/*.md`                         |
| Package agent rules                          | `rsconcept/rstool/AGENTS.md`                         |

Always open **GUIDE.md** first when starting a rstool task, then **REFERENCE.md** / **EXAMPLES.md** / relevant `docs/*.md` as needed.

## Quick facts

- Run typecheck/tests from `rsconcept/rstool` (`npm test`, `npm run wrapper`)
- `@rsconcept/domain` is at `rsconcept/domain` in this workspace
