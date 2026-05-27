# Install `rstool-helper` (agent procedure)

Use when the user has run `npm install @rsconcept/rstool` and asks to **install** or **enable** the rstool agent skill. The user should not copy files manually.

## Steps

1. Confirm the package exists: `node_modules/@rsconcept/rstool/package.json`.
2. Determine the host’s **project skills directory** (where that host loads `SKILL.md` files). Common layouts:
   - `.agents/skills/<skill-name>/SKILL.md`
   - `.cursor/skills/<skill-name>/SKILL.md`
   - Other paths — use the host’s documentation if unsure.
3. Create `<skills-dir>/rstool-helper/` if needed.
4. Copy **one file** — the package entry skill:
   - **From:** `node_modules/@rsconcept/rstool/skills/rstool-helper/SKILL.md`
   - **To:** `<skills-dir>/rstool-helper/SKILL.md`
5. Do **not** copy `GUIDE.md`, `REFERENCE.md`, `EXAMPLES.md`, or `docs/` into the project. The entry skill points at those files under `node_modules/@rsconcept/rstool/`.
6. Confirm the destination `SKILL.md` exists and tell the user the skill is ready.

### Example (`.agents/skills` layout)

Bash:

```bash
mkdir -p .agents/skills/rstool-helper
cp node_modules/@rsconcept/rstool/skills/rstool-helper/SKILL.md .agents/skills/rstool-helper/SKILL.md
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path .agents/skills/rstool-helper | Out-Null
Copy-Item -Force node_modules/@rsconcept/rstool/skills/rstool-helper/SKILL.md .agents/skills/rstool-helper/SKILL.md
```

Use the equivalent path for your agent host if it does not use `.agents/skills`.
