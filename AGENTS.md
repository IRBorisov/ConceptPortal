# AGENTS.md

Workspace rules for agents.

## Scope

- Applies repo-wide unless nearer `AGENTS.md` exists.

## Structure

- `README.md`: setup/conventions/run docs
- `docs/`: portable architecture and coding-style guides for reuse across projects
- `rsconcept/domain`: published TypeScript domain package (`@rsconcept/domain`)
- `rsconcept/frontend`: Vite React TS app
- `rsconcept/backend`: Django backend (`apps.agents` — API keys + `/api/agents` routes)
- `rsconcept/rstool`: published agent library (`@rsconcept/rstool`) and stdio wrapper
- `rsconcept/rstool-mcp`: published MCP adapter (`@rsconcept/rstool-mcp`) wrapping `rstool`
- `scripts/dev`, `scripts/prod`, `nginx`, `docker-compose-*.yml`: ops/deploy
- `pnpm-workspace.yaml` + root `pnpm-lock.yaml`: JS/TS packages linked via `workspace:*`
- `.agents/skills/`: project agent skills (see below)

## Style guides

Portable, principle-level docs (no tool flags or version pins): [`docs/architecture.md`](docs/architecture.md), [`docs/coding-style.md`](docs/coding-style.md). Package-local `AGENTS.md` files still win for in-repo edit rules.

## Edit Rules

- Frontend code/routes/state/API hooks → `rsconcept/frontend`.
- Backend API/models/serializers/permissions/settings → `rsconcept/backend`.
- Frontend UI text: follow frontend i18n rules; keep `useTx`/`globalTx` ids and `en`/`ru`/`fr` slices synced.
- API contract changes: sync frontend/backend.

## Agent skills

Repo skills live in `.agents/skills/<name>/SKILL.md` (one copy for every agent). This list is the entry point: read the linked file when the task matches, whether or not your host loads that folder.

- Conceptual schemas (КС), RSLang (ЯРЭ), rstool or Portal → [`rsconcept/rstool/skills/rstool/SKILL.md`](rsconcept/rstool/skills/rstool/SKILL.md) (router to stage skills; stubs pointing there: `.agents/skills/rstool/`, `.claude/skills/rstool/`).
- Frontend i18n: replace literal UI strings with `tx.*` ids → [`.agents/skills/i18n-extract/SKILL.md`](.agents/skills/i18n-extract/SKILL.md).
- Stress-test a plan or design («grill me») → [`.agents/skills/grill-me/SKILL.md`](.agents/skills/grill-me/SKILL.md).
- Terminology (agents): `rsconcept/rstool/docs/DOMAIN.md` §«Термины: не путать» — never «базис»/«базисы»; use **базисное множество** for `X#`, **неопределяемые понятия** for the `X#`/`C#`/`S#` layer.
- Portal REST (UI links → API): `rsconcept/rstool/docs/PORTAL-API.md` (index → PORTAL-READ / PUBLISH / MODELS / OSS).

## Cursor Cloud / Claude Code cloud

Bare-metal ports, SQLite bootstrap, and Cloud timing notes: [`.agents/CURSOR-CLOUD.md`](.agents/CURSOR-CLOUD.md). Prefer Docker/`README.md` when available. Claude Code cloud: [`scripts/cloud/README.md`](scripts/cloud/README.md) (dev stack, video recording).
