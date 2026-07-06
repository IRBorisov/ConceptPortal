# Scripts

Helper scripts for local development, load testing, and production operations. Run PowerShell scripts from the repository root unless noted otherwise.

## `dev/` — local development

| Script                                                 | Purpose                                                                                                                                                                                                                                      |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`LocalDevSetup.ps1`](dev/LocalDevSetup.ps1)           | First-time setup: `pnpm install`, build `@rsconcept/domain`, recreate the backend `.venv` with `uv sync --frozen`.                                                                                                                           |
| [`RunServer.ps1`](dev/RunServer.ps1)                   | Start Django (`runserver`) and the Vite frontend in separate windows; opens `http://localhost:8000` and `http://localhost:3000`. Use `-freshStart` to flush SQLite, migrate, collect static, and load fixtures (or create `admin` / `1234`). |
| [`PopulateDevData.ps1`](dev/PopulateDevData.ps1)       | Load `fixtures/InitialData.json` into a running **Docker** backend container. Prompts for the container name (e.g. `local-portal-backend`). Development builds only.                                                                         |
| [`UpdateDependencies.ps1`](dev/UpdateDependencies.ps1) | Upgrade Node (`pnpm update -r`) and Python (`uv sync --upgrade`) dependencies across the workspace.                                                                                                                                          |
| [`RunTests.ps1`](dev/RunTests.ps1)                     | Run the full test suite: domain, rstool, rstool-mcp, Django (`check` + `test`), and frontend (typecheck + Vitest).                                                                                                                           |
| [`RunLint.ps1`](dev/RunLint.ps1)                       | Run linters: Pylint + MyPy (backend), ESLint (domain, frontend), typecheck (rstool, rstool-mcp).                                                                                                                                             |
| [`RunCoverage.ps1`](dev/RunCoverage.ps1)               | Backend test coverage with `coverage`; opens `rsconcept/backend/htmlcov/index.html`.                                                                                                                                                         |
| [`RunE2ETests.ps1`](dev/RunE2ETests.ps1)               | Build domain and run Playwright E2E tests (`frontend test:e2e`).                                                                                                                                                                             |
| [`DebugVitestFile.mjs`](dev/DebugVitestFile.mjs)       | Run a single Vitest file from the correct package (frontend, domain, rstool, or rstool-mcp). Used by VS Code launch configs.                                                                                                                 |
| [`GraphDB.ps1`](dev/GraphDB.ps1)                       | Export Django models to Graphviz DOT (`visualizeDB.dot`) and open an online viewer.                                                                                                                                                          |

### `dev/load-test/` — k6 backend load tests

Requires [k6](https://k6.io/docs/get-started/installation/) (`winget install k6`).

**Local stack** — [`RunLoadTest.ps1`](dev/load-test/RunLoadTest.ps1)

Runs k6 scenarios against a local Docker backend. Probes reachability and logs in as `admin` / `1234` before the run.

| Flag                 | Default            | Description                                                              |
| -------------------- | ------------------ | ------------------------------------------------------------------------ |
| `-Stack`             | `prod-local`       | `prod-local` → `https://localhost:8001`; `dev` → `http://localhost:8002` |
| `-Scenario`          | `library-list`     | See scenarios below                                                      |
| `-Vus` / `-Duration` | (stages in script) | Override ramp with fixed virtual users and duration                      |
| `-SkipProbe`         | off                | Skip reachability and login checks                                       |

**Production** — [`RunProdLoadTest.ps1`](dev/load-test/RunProdLoadTest.ps1)

Anonymous read load tests against `https://api.portal.acconcept.ru` (no login). Use with care on live production.

| Flag                            | Default             | Description                          |
| ------------------------------- | ------------------- | ------------------------------------ |
| `-Scenario`                     | `library-random`    | See scenarios below                  |
| `-BaseUrl`                      | production API host | Override API base URL                |
| `-SchemaIdMin` / `-SchemaIdMax` | `1` / `800`         | ID range for `library-random` only   |
| `-Vus` / `-Duration`            | (stages in script)  | Fixed load profile                   |
| `-SkipProbe`                    | off                 | Skip `GET /api/library/active` probe |

**Scenarios** (`dev/load-test/scenarios/`)

| File                          | Used by         | What it does                                                                                                                       |
| ----------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `library-list.js`             | RunLoadTest     | Authenticated `GET /api/library`                                                                                                   |
| `rsform-details.js`           | RunLoadTest     | Authenticated `GET /api/rsforms/{id}/details`                                                                                      |
| `mixed-read.js`               | RunLoadTest     | Library list + rsform details + auth endpoint                                                                                      |
| `library-random.js`           | RunProdLoadTest | Anonymous random `GET /api/library/{id}` and `GET /api/library/active`                                                             |
| `library-details-bombard.js`  | RunProdLoadTest | Fetch `/api/library/active` once in setup, then hammer `/api/rsforms/{id}/details` for public rsform ids from that list            |
| `library-metadata-bombard.js` | RunProdLoadTest | Fetch `/api/library/active` once in setup, then hammer `GET /api/library/{id}` metadata (~500 B) — lightweight baseline vs details |
| `auth-bombard.js`             | RunProdLoadTest | Hammer `GET /users/api/auth` (~130 B) — fastest baseline, no setup                                                                 |

Shared k6 helpers live in `dev/load-test/lib/` (`config.js`, `auth.js`).

**Typical local workflow**

```powershell
docker compose -f docker-compose-prod-local.yml up --build -d
.\scripts\dev\PopulateDevData.ps1   # container: local-portal-backend
.\scripts\dev\load-test\RunLoadTest.ps1 -Scenario mixed-read
```

## `prod/` — production server

These scripts target the production Docker host. Paths, container names, and credentials are environment-specific — review and adjust before running.

| Script                                                | Purpose                                                                                                                                                                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`UpdateProd.sh`](prod/UpdateProd.sh)                 | On the server: `git pull` to `origin/main`, run `CreateBackup.sh`, rebuild and recreate `docker-compose-prod.yml` services, restart nginx.                                                                              |
| [`CreateBackup.sh`](prod/CreateBackup.sh)             | Production backup: PostgreSQL custom dump + gzipped Django `dumpdata` into monthly and weekday slots under `/home/prod/backup`.                                                                                         |
| [`CreateBackup.ps1`](prod/CreateBackup.ps1)           | **Local prod-like stack** backup to a Windows path (`D:\DEV\backup\portal\…`). Copies PostgreSQL dump and Django JSON from Docker containers. Do not run blindly from the repo copy — adjust paths and container names. |
| [`LoadPostgreBackup.ps1`](prod/LoadPostgreBackup.ps1) | Restore a PostgreSQL custom dump into a local Docker DB container (`pg_restore --clean`). Edit `$dataDump` and container variables first.                                                                               |
| [`LoadDjangoBackup.ps1`](prod/LoadDjangoBackup.ps1)   | Restore a gzipped Django `dumpdata` JSON into a local backend container via `loaddata`. Edit `$dataArchive` and container name first.                                                                                   |
