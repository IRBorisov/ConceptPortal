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

**Concept Portal** is a web application for editing RSForm schemas. The UI is built with React (Vite); the API runs on Django.

The repository is an **npm workspaces monorepo** for the Portal app and agent packages, plus a standalone domain package in `rsconcept/domain`:

| Path / workspace       | npm package                                     | What it is                                                                                                   |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `rsconcept/domain`     | [`@rsconcept/domain`](https://www.npmjs.com/package/@rsconcept/domain) | Shared TypeScript domain. Developed in-repo; **frontend and rstool install it from npm** (`^1.0.0`). |
| `rsconcept/frontend`   | (internal workspace)                            | The Portal Vite/React SPA. Depends on `@rsconcept/domain` from the registry.                                 |
| `rsconcept/rstool`     | [`@rsconcept/rstool`](rsconcept/rstool)         | Agent-facing library and stdio wrapper. Published to npm, depends on `@rsconcept/domain` from the registry. |
| `rsconcept/rstool-mcp` | [`@rsconcept/rstool-mcp`](rsconcept/rstool-mcp) | Model Context Protocol (MCP) adapter over `@rsconcept/rstool` for Cursor / Claude Desktop. Published to npm. |

External agents can use rstool standalone: `npm install @rsconcept/rstool`. For MCP-capable hosts, use `npm install -g @rsconcept/rstool-mcp` and point your client at the `rstool-mcp` bin. See [`rsconcept/rstool/README.md`](rsconcept/rstool/README.md) and [`rsconcept/rstool-mcp/README.md`](rsconcept/rstool-mcp/README.md).

## Contributing

We welcome issues, discussions, and direct feedback to the maintainer.

Before you open a pull request:

- Run tests from the **Test** configurations in [`.vscode/launch.json`](.vscode/launch.json).
- Rely on GitHub Actions for linting and CI builds on push.
- Use the [commit conventions](#commit-conventions) below in commit messages.

## Monorepo basics

From the repo root:

```bash
npm install                                    # install workspaces + @rsconcept/domain from npm
npm run typecheck                              # typecheck workspace packages
npm test                                       # test workspace packages
npm run build                                  # build workspace packages
npm test -w @rsconcept/rstool                  # test only the rstool package
```

Domain package (separate install in `rsconcept/domain`):

```bash
cd rsconcept/domain && npm install
npm run generate                               # after editing rslang.grammar
npm run build && npm test
```

To try unpublished domain changes with frontend or rstool before a release: `npm run build` in `rsconcept/domain`, then `npm link` there and `npm link @rsconcept/domain` in the consumer workspace.

## Frontend (Vite + React + TypeScript)

After you change RSLang grammar files, publish a new `@rsconcept/domain` (or use `npm link` locally), bump the `^` pin in `rsconcept/frontend/package.json` if needed, then regenerate any frontend-local grammars if applicable. Grammar source lives in `rsconcept/domain`:

```bash
cd rsconcept/domain && npm run generate
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

## Publishing to npm (manual)

`@rsconcept/domain`, `@rsconcept/rstool`, and `@rsconcept/rstool-mcp` are published manually from a local checkout. CI does **not** publish; it only typechecks, tests, and builds. Run releases from a clean `main` with a clean working tree.

### One-time setup

1. Be a member of the `@rsconcept` npm scope with publish rights.
2. Log in once on the machine you publish from:

   ```bash
   npm login
   ```

   (or set `NPM_TOKEN` and use `npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN` in CI-like environments).

3. Verify access:

   ```bash
   npm whoami
   npm access list packages @rsconcept
   ```

### Release checklist

From the repo root, for the package you are releasing:

1. **Sync `main`** and make sure the tree is clean: `git status`.
2. **Install** the monorepo: `npm install` (refreshes the root lockfile).
3. **Test + typecheck + build** the target workspace:

   ```bash
   npm run typecheck -w @rsconcept/domain && npm test -w @rsconcept/domain && npm run build -w @rsconcept/domain
   # or
   npm run typecheck -w @rsconcept/rstool && npm test -w @rsconcept/rstool && npm run build -w @rsconcept/rstool
   # or
   npm run typecheck -w @rsconcept/rstool-mcp && npm test -w @rsconcept/rstool-mcp && npm run build -w @rsconcept/rstool-mcp
   ```

   When publishing `@rsconcept/rstool`, build `@rsconcept/domain` first so the consumed `dist/` is fresh. When publishing `@rsconcept/rstool-mcp`, build both `@rsconcept/domain` and `@rsconcept/rstool` first.

4. **Bump the version** in the target `package.json`. Use semver:
   - patch: bug fixes / internal refactors
   - minor: additive, backwards-compatible changes
   - major: breaking changes (also bump `CONTRACT_VERSION` for rstool)

   ```bash
   npm version patch -w @rsconcept/domain
   # or: npm version 1.2.0 -w @rsconcept/rstool
   ```

   This creates a commit and a git tag `v<version>` inside the workspace; rename the tag if you maintain per-package tags (e.g. `git tag domain-v1.0.0 && git tag -d v1.0.0`).

5. **Dry-run** the publish to inspect the tarball contents:

   ```bash
   npm publish --dry-run -w @rsconcept/domain --access public
   ```

   Verify that only `dist/`, `src/`, `README.md`, `LICENSE`, etc. are included (per the workspace's `files` array). Bail out and fix `.npmignore` / `files` if anything sensitive leaks.

6. **Publish**:

   ```bash
   npm publish -w @rsconcept/domain --access public
   # or
   npm publish -w @rsconcept/rstool --access public
   ```

   First-time publication of a scoped public package requires `--access public`; subsequent releases inherit it.

7. **Push** the version-bump commit + tag(s):

   ```bash
   git push && git push --tags
   ```

8. **Smoke-test** the published artifact in a throwaway folder:

   ```bash
   mkdir /tmp/rstool-smoke && cd /tmp/rstool-smoke
   npm init -y && npm install @rsconcept/rstool
   node -e "import('@rsconcept/rstool').then(m => console.log(Object.keys(m)))"
   ```

### Order of releases

Dependencies form a chain: `@rsconcept/domain` → `@rsconcept/rstool` → `@rsconcept/rstool-mcp` (each pinned with a `^` range on the previous). When you change something low in the chain, publish from the bottom up:

1. Publish `@rsconcept/domain`.
2. Bump the `^` pin in `rsconcept/rstool/package.json` `dependencies."@rsconcept/domain"`, run install + tests, publish `@rsconcept/rstool`.
3. Bump the `^` pin in `rsconcept/rstool-mcp/package.json` `dependencies."@rsconcept/rstool"`, run install + tests, publish `@rsconcept/rstool-mcp`.

You can stop at any step if the higher-level packages don't need the change.
