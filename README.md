<div align="center">
  <a href="https://portal.acconcept.ru/" target="_blank">
    <img width="650" src="rsconcept/frontend/public/logo_full.svg" />
  </a>
</div>

<br />
<br />

[![Backend CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/backend.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/backend.yml)
[![Domain CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/domain.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/domain.yml)
[![Frontend CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/frontend.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/frontend.yml)
[![RSTool CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/rstool.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/rstool.yml)
[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m797659312-8ab26c72de49d8d92eccc06e?label=Live%20Server)](https://portal.acconcept.ru)

**Concept Portal** is a web application for editing RSForm schemas. The UI is a Vite React app; the API is a Django service backed by PostgreSQL.

## Repository Layout

| Path                   | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `rsconcept/frontend`   | Portal UI. Installs `@rsconcept/domain` from npm.    |
| `rsconcept/backend`    | Django API. Python dependencies are managed by `uv`. |
| `rsconcept/domain`     | Shared TypeScript domain package.                    |
| `rsconcept/rstool`     | Agent-facing library and stdio wrapper.              |
| `rsconcept/rstool-mcp` | MCP adapter over `rstool`.                           |
| `scripts/dev`          | Local setup, sample data, and development helpers.   |
| `scripts/prod`         | Production update helpers.                           |
| `nginx`                | Local and production reverse proxy configuration.    |

The npm packages in `domain`, `rstool`, and `rstool-mcp` are independently installable and have their own `package.json` and lockfile.

## Local Development

**Prerequisites:** Docker Desktop, Python 3.12, [uv](https://docs.astral.sh/uv/), Node.js, PowerShell, and VS Code or another IDE that can use [`.vscode/launch.json`](.vscode/launch.json).

1. Install dependencies:

   ```powershell
   .\scripts\dev\LocalDevSetup.ps1
   ```

2. Start the local debug stack:

   ```bash
   docker compose -f docker-compose-dev.yml up --build -d
   ```

3. Load sample data when needed:

   ```powershell
   .\scripts\dev\PopulateDevData.ps1
   ```

Use [`.vscode/launch.json`](.vscode/launch.json) to start app configurations, run tests, and attach debuggers. GitHub Actions run linting and CI builds on push.

To update dependencies across all `rsconcept` projects in one shot:

```powershell
.\scripts\dev\UpdateDependencies.ps1
```

## Local production-like build

Mirrors production layout on `localhost`, without production secrets.

1. Place a TLS certificate (self-signed is fine) at:
   - `nginx/cert/local-cert.pem`
   - `nginx/cert/local-key.pem`
2. Start:

   ```bash
   docker compose -f docker-compose-prod-local.yml up --build -d
   ```

## Grammar and npm Packages

RSLang grammar source lives in `rsconcept/domain`. After changing grammar files, regenerate the domain package output:

```bash
cd rsconcept/domain && npm run generate
```

Then publish a new `@rsconcept/domain` version or use `npm link` locally. If the frontend or `rstool` depends on the changed contract, update its package pin and local generated artifacts as needed.

The npm packages are published manually from this repo:

| Package                 | Guide                                                 |
| ----------------------- | ----------------------------------------------------- |
| `@rsconcept/domain`     | [`PUBLISHING.md`](rsconcept/domain/PUBLISHING.md)     |
| `@rsconcept/rstool`     | [`PUBLISHING.md`](rsconcept/rstool/PUBLISHING.md)     |
| `@rsconcept/rstool-mcp` | [`PUBLISHING.md`](rsconcept/rstool-mcp/PUBLISHING.md) |

When dependencies change, release in order: **domain -> rstool -> rstool-mcp**.

External agents can install `@rsconcept/rstool` and follow [`skills/INSTALL.md`](rsconcept/rstool/skills/INSTALL.md). MCP-capable hosts can install `@rsconcept/rstool-mcp` globally and point the client at the `rstool-mcp` binary.

## Production deployment

Runs on the live server with real secrets and public hostnames.

**Secrets** (under `secrets/`):

- `db_password.txt`
- `django_key.txt`
- `email_host.txt`, `email_user.txt`, `email_password.txt`

**Configuration to review:**

- SSL/TLS and ports: `rsconcept/backend/.env.prod`
- Portal and API hostnames: `rsconcept/frontend/env/.env.production`, `nginx/production.conf`
- Privacy policy PDF: `rsconcept/frontend/public/privacy.pdf`

**TLS (Certbot):**

```bash
docker compose -f docker-compose-prod.yml run --rm certbot certonly \
  --webroot --webroot-path /var/www/certbot/ \
  -d portal.acconcept.ru -d api.portal.acconcept.ru
```

**Start:**

```bash
docker compose -f docker-compose-prod.yml up --build -d
```

**Update:**

```bash
bash scripts/prod/UpdateProd.sh
```

## Contributing

We welcome issues, discussions, and direct feedback to the maintainer.

Before opening a pull request, run the relevant **Test** configurations from [`.vscode/launch.json`](.vscode/launch.json) and use a short commit type marker:

- 🚀 **F** — new feature
- 🔥 **B** — bug fix
- 🚑 **M** — small fix
- 🔧 **R** — refactor or code cleanup
- 📝 **D** — documentation only
- 💬 **I** — infrastructure changes
