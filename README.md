<div align="center">
  <a href="https://portal.acconcept.ru/" target="_blank">
    <img width="650" src="rsconcept/frontend/public/logo_full.svg" />
  </a>
</div>

<br />
<br />

[![Backend CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/backend.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/frontend.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/frontend.yml)
[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m797659312-8ab26c72de49d8d92eccc06e?label=Live%20Server)](https://portal.acconcept.ru)

React + Django based web portal for editing RSForm schemas.
This readme file is used mostly to document project dependencies and conventions.

## ❤️ Contributing notes

- feel free to open issues, discussion topics, contact maintainer directly
- use Test config in VSCode to run tests before pushing commits / requests
- use github actions to setup linter checks and test builds
- use conventional commits to describe changes

## ✨ Frontend [Vite + React + Typescript]

- to regenerate parsers use 'npm run generate' script

<details>
  <summary>npm install</summary>
  <pre>
  - axios
  - clsx
  - react-icons
  - react-router
  - react-toastify
  - react-tabs
  - react-intl
  - react-select
  - react-error-boundary
  - react-tooltip
  - react-zoom-pan-pinch
  - react-hook-form
  - react-scan
  - reactflow
  - js-file-download
  - use-debounce
  - qrcode.react
  - zustand
  - zod
  - @hookform/resolvers
  - @tanstack/react-table
  - @tanstack/react-query
  - @tanstack/react-query-devtools
  - @uiw/react-codemirror
  - @uiw/codemirror-themes
  - @lezer/lr
  - @dagrejs/dagre
  </pre>
</details>
<details>
  <summary>npm install -D</summary>
  <pre>
  - tailwindcss
  - eslint-plugin-import
  - eslint-plugin-react-compiler
  - eslint-plugin-simple-import-sort
  - eslint-plugin-react-hooks
  - eslint-plugin-tsdoc
  - eslint-plugin-playwright
  - babel-plugin-react-compiler
  - vite
  - jest
  - ts-jest
  - stylelint
  - stylelint-config-recommended
  - stylelint-config-standard
  - stylelint-config-tailwindcss
  - @vitejs/plugin-react
  - @types/jest
  - @lezer/generator
  - @playwright/test
  </pre>
</details>
<details>
  <summary>VS Code plugins</summary>
  <pre>
  - ESLint
  - Colorize
  - Tailwind CSS IntelliSense
  - Code Spell Checker (eng + rus)
  - Backticks
  - Svg Preview
  - TODO Highlight v2
  - Prettier
  - PowerShell (for Windows dev env)
  </pre>
</details>
<details>
  <summary>Google fonts</summary>
  <pre>
  - Fira Code
  - Rubik
  - Alegreya Sans SC
  - Noto Sans Math
  - Noto Sans Symbol
  - Noto Color Emoji
  </pre>
</details>

## 🗃️ Backend [Django + PostgreSQL/SQLite]

- [ConceptCore](https://github.com/IRBorisov/ConceptCore)
<details>
  <summary>requirements</summary>
  <pre>
  - django
  - djangorestframework
  - django-cors-headers
  - django-filter
  - drf-spectacular
  - tzdata
  - gunicorn
  - coreapi
  - psycopg2-binary
  - cctext
  - pyconcept
  </pre>
</details>
<details>
  <summary>requirements-dev</summary>
  <pre>
  - coverage
  - pylint
  - mypy
  - djangorestframework-stubs[compatible-mypy]
  </pre>
</details>
<details>
  <summary>VS Code plugins</summary>
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

## ⚙️ DevOps

- Docker compose
- PowerShell
- Certbot
- Docker VSCode extension

# Developer Notes

## 📝 Commit conventions

- 🚀 F: major feature implementation
- 🔥 B: bug fix
- 🚑 M: Minor fixes
- 🔧 R: refactoring and code improvement
- 📝 D: documentation

## 🖥️ Local build (Windows 10+)

This is the build for local Development

- Install Python 3.12, NodeJS, VSCode, Docker Desktop
- copy import wheels from ConceptCore to rsconcept/backend/import
- run scripts/dev/LocalEnvSetup.ps1
- use VSCode configs in root folder to start development
- use 'npm run prepare' to regenerate frontend parsers (if you change grammar files)

## 🔭 Local docker build

This build does not use HTTPS and nginx for networking

- backend and frontend debugging is supported
- hmr (hot updates) for frontend
- run via 'docker compose -f "docker-compose-dev.yml" up --build -d'
- populate initial data: 'scripts/dev/PopulateDevData.ps1'

## 📦 Local production build

This build is same as production except not using production secrets and working on localhost

- provide TLS certificate (can be self-signed) 'nginx/cert/local-cert.pem' and 'nginx/cert/local-key.pem'
- run via 'docker compose -f "docker-compose-prod-local.yml" up --build -d'

## 🔥 Production build

This build is deployed on server.

- provide secrets: 'secrets/db_password.txt', 'django_key.txt', 'email_host.txt', 'email_password.txt', 'email_user.txt'
- check if you need to change SSL/TLS and PORT in 'rsconcept\backend\.env.prod'
- setup domain names for application and API in configs: 'frontend\env\.env.production', 'rsconcept\backend\.env.dev', 'nginx\production.conf'
- provide privacy policy document in PDF: 'frontend/public/privacy.pdf'
- use certbot to obtain certificates via 'docker compose -f "docker-compose-prod.yml" run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ -d portal.acconcept.ru api.portal.acconcept.ru'
- run via 'docker compose -f "docker-compose-prod.yml" up --build -d'
- update via 'bash scripts/prod/UpdateProd.sh'
