# Project agent skills

Skills in this folder are versioned in git. Each host loads `SKILL.md` from its configured project skills path (here: `.agents/skills/<name>/SKILL.md`).

## `rstool-helper`

Entry skill only (`.agents/skills/rstool-helper/SKILL.md`). Canonical content:

- `rsconcept/rstool/skills/rstool-helper/GUIDE.md` — start here
- `rsconcept/rstool/skills/rstool-helper/REFERENCE.md`, `EXAMPLES.md`
- `rsconcept/rstool/docs/*.md`

npm consumers install a different entry stub from `@rsconcept/rstool` — see `rsconcept/rstool/skills/INSTALL.md`.

## Other skills

Edit in place under `.agents/skills/<name>/`. Commit with your change.

User-global skills (`~/.cursor/skills-cursor/`) stay outside the repo.
