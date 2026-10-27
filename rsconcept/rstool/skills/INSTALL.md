# Install the `rstool` skill (agent procedure)

Use when the user has run `npm install @rsconcept/rstool` and asks to **install** or **enable** the rstool agent skill. The user should not copy files manually.

The steps are agent-neutral. Map each one to the conventions of your own host (which instructions file it always loads, whether and where it loads project skills); if unsure, ask the user.

The skill content stays in the package: the router `node_modules/@rsconcept/rstool/skills/rstool/SKILL.md`, the stage skills `skills/rs-*/`, `docs/`, `examples/`. Installing only adds pointers to the router, so nothing needs re-installing after a package update.

## Steps

1. Confirm the package exists: `node_modules/@rsconcept/rstool/package.json`.
2. **Routing line** — the required part. Add it to the project instructions file that your host always keeps in context: `AGENTS.md` if the project has one (create it if the project uses none), otherwise your host's own file. If your host reads `AGENTS.md` through another file (for example, `CLAUDE.md` with `@AGENTS.md`), the line in `AGENTS.md` is enough.

   ```md
   - Conceptual schemas (КС), RSLang (ЯРЭ), rstool or Portal → read `node_modules/@rsconcept/rstool/skills/rstool/SKILL.md` and follow it.
   ```

   If the file lists the project skills, put the line in that list.

3. **Stub for auto-triggering** — optional, only if your host loads skills from a project folder. Use one folder: if the project already keeps its skills in a shared one (for example, `.agents/skills/`) and your host reads it, use that instead of adding a host-specific copy.

   ```bash
   npx rstool-skills install --dir <skills-dir>
   ```

   It writes `<skills-dir>/rstool/SKILL.md`: `name: rstool`, the router's `description` verbatim and one line «Прочитай `node_modules/@rsconcept/rstool/skills/rstool/SKILL.md` и следуй ему.» Without the bin: `npx rstool-skills stub` prints the same text, or write it by hand.

4. If the project has an old copied `rstool-helper/SKILL.md`, delete that folder — `rstool` replaces it.
5. Tell the user what was added and where.

## Do not

- Copy the stage skills (`rs-*`), `docs/` or `examples/` into the project: the router reads them from the package by path when a stage needs them.
- Write stubs into several folders that one host reads: it shows the skill twice.
