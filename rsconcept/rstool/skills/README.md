# Agent skills (rstool)

Versioned copy of agent skills for this package.

## `rslang-rstool`

Teaches agents RS language and the rstool session API. Files:

- `rslang-rstool/SKILL.md` — entry and workflow
- `rslang-rstool/REFERENCE.md` — contract, stdio, grammar pointers
- `rslang-rstool/EXAMPLES.md` — runnable patterns

**Source of truth in git:** edit here, then sync to Cursor (see below).

## Cursor install

Repo root `.agents/` is gitignored. After changing skill files, copy into your local skills folder:

```powershell
$src = "rsconcept/rstool/skills/rslang-rstool"
$dst = ".agents/skills/rslang-rstool"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Path "$src/*" -Destination $dst -Recurse -Force
```

Or symlink (requires elevated rights on some Windows setups):

```powershell
New-Item -ItemType Directory -Force -Path .agents/skills | Out-Null
cmd /c mklink /J .agents\skills\rslang-rstool rsconcept\rstool\skills\rslang-rstool
```

Contract changes: see `rsconcept/rstool/AGENTS.md` (sync checklist).
