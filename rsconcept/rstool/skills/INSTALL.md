# Install the `rstool` skill (agent procedure)

Use when the user has run `npm install @rsconcept/rstool` and asks to **install** or **enable** the rstool agent skill. The user should not copy files manually.

## Steps

1. Confirm the package exists: `node_modules/@rsconcept/rstool/package.json`.
2. Run from the project root:

   ```bash
   npx rstool-skills install
   ```

   It writes a **stub** `rstool/SKILL.md` into `.claude/skills/` (Claude Code) and `.agents/skills/` (Cursor, Codex). The stub holds only the name, the description and the path `node_modules/@rsconcept/rstool/skills/rstool/SKILL.md`; the real router skill and the stage skills stay in the package, so nothing needs re-installing after a package update.

   Other skills directory: `npx rstool-skills install --dir <skills-dir>` (repeatable).

3. If the project has an old copied `rstool-helper/SKILL.md`, delete that folder — `rstool` replaces it.
4. Optional: add one routing line to the project `AGENTS.md` (always in context for Codex and Cursor):

   ```md
   - Conceptual schemas, RSLang, rstool or Portal → read `node_modules/@rsconcept/rstool/skills/rstool/SKILL.md`.
   ```

5. Tell the user the skill is ready.

Do **not** copy stage skills (`rs-*`), `docs/` or `examples/` into the project: the router reads them from the package by path when a stage needs them.

## Without the bin

Create `<skills-dir>/rstool/SKILL.md` with the same front matter (`name: rstool`, `description` copied verbatim from `node_modules/@rsconcept/rstool/skills/rstool/SKILL.md`) and one line: «Прочитай `node_modules/@rsconcept/rstool/skills/rstool/SKILL.md` и следуй ему.»
