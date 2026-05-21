<div align="center">
  <a href="https://portal.acconcept.ru/" target="_blank">
    <img width="650" src="rsconcept/frontend/public/logo_full.svg" />
  </a>
</div>

<br />
<br />

[![Backend CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/backend.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/frontend.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/frontend.yml)
[![RSTool CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/rstool.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/rstool.yml)
[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m797659312-8ab26c72de49d8d92eccc06e?label=Live%20Server)](https://portal.acconcept.ru)

**Concept Portal** is a web application for editing RSForm schemas. The UI is built with React (Vite); the API runs on Django.

## Contributing

We welcome issues, discussions, and direct feedback to the maintainer.

Before you open a pull request:

- Run tests from the **Test** configurations in [`.vscode/launch.json`](.vscode/launch.json).
- Rely on GitHub Actions for linting and CI builds on push.
- Use the [commit conventions](#commit-conventions) below in commit messages.

## Frontend (Vite + React + TypeScript)

After you change grammar files, regenerate parsers from `rsconcept/frontend`:

```bash
npm run generate
```

<details>
  <summary>Recommended VS Code extensions</summary>
  <pre>
  - ESLint
  - Oklch Color Preview
  - Tailwind CSS IntelliSense
  - Code Spell Checker (eng + rus + fr)
  - Backticks
  - Svg Preview
  - TODO Highlight v2
  - Prettier
  - PowerShell (for Windows dev env)
  </pre>
</details>
<details>
  <summary>Google fonts used in the UI</summary>
  <pre>
  - Fira Code
  - Rubik
  - Alegreya Sans SC
  - Noto Sans Math
  - Noto Sans Symbol
  - Noto Color Emoji
  </pre>
</details>

## Backend (Django + PostgreSQL)

Python dependencies are managed with [uv](https://docs.astral.sh/uv/) via `rsconcept/backend/pyproject.toml` and `rsconcept/backend/uv.lock`.

<details>
  <summary>Recommended VS Code extensions</summary>
  <pre>
  - Pylance
  - Pylint
  - autopep8
  - isort
  - Django
  - SQLite
  - Playwright
  </pre>
</details>

## DevOps tooling

Typical stack for running and deploying the portal:

- Docker Compose
- PowerShell (Windows scripts under `scripts/`)
- Certbot (TLS in production)
- Docker extension for VS Code

# Developer guide

## Commit conventions

Prefix commits with a short type marker:

- 🚀 **F** — new feature
- 🔥 **B** — bug fix
- 🚑 **M** — small fix
- 🔧 **R** — refactor or code cleanup
- 📝 **D** — documentation only

## Local setup (Windows 10+)

**Prerequisites:** Docker Desktop, Python 3.12, [uv](https://docs.astral.sh/uv/), Node.js, and VS Code (or another IDE that can use `.vscode/launch.json`).

1. Run the setup script (installs frontend, rstool, and backend dependencies):

   ```powershell
   .\scripts\dev\LocalDevSetup.ps1
   ```

2. Use [`.vscode/launch.json`](.vscode/launch.json) to start the app, run tests, and attach debuggers.

3. If you edit grammars, run `npm run generate` in `rsconcept/frontend` (see **Frontend** above).

## Local debug build

Best for day-to-day development: no HTTPS or nginx in front of the services.

- Full-stack debugging (backend + frontend).
- Frontend hot module replacement (HMR).
- Start containers:

  ```bash
  docker compose -f docker-compose-dev.yml up --build -d
  ```

- Load sample data:

  ```powershell
  .\scripts\dev\PopulateDevData.ps1
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

**Update an existing deployment:**

```bash
bash scripts/prod/UpdateProd.sh
```
