<div align="center">
  <a href="https://portal.acconcept.ru/" target="_blank">
    <img width="650" src="rsconcept/frontend/public/logo_full.svg" />
  </a>
</div>

<br />
<br />

[![Backend CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/backend.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/IRBorisov/ConceptPortal/actions/workflows/frontend.yml/badge.svg?branch=main)](https://github.com/IRBorisov/ConceptPortal/actions/workflows/frontend.yml)

React + Django based web portal for editing RSForm schemas.
This readme file is used mostly to document project dependencies

## ❤️ Contributing notes

- feel free to open issues, discussion topics, contact maintainer directly
- use Test config in VSCode to run tests before pushing commits / requests
- use github actions to setup linter checks and test builds

## ✨ Frontend [Vite + React + Typescript]

<details>
  <summary>npm install</summary>
  <pre>
  - axios
  - clsx
  - react-icons
  - react-router-dom 
  - react-toastify
  - react-loader-spinner
  - react-tabs
  - react-intl
  - react-select
  - react-error-boundary
  - react-pdf
  - react-tooltip
  - js-file-download
  - use-debounce
  - framer-motion
  - reagraph
  - @tanstack/react-table
  - @uiw/react-codemirror
  - @uiw/codemirror-themes
  - @lezer/lr
  </pre>
</details>
<details>
  <summary>npm install -D</summary>
  <pre>
  - tailwindcss
  - postcss
  - autoprefixer
  - eslint-plugin-simple-import-sort
  - eslint-plugin-tsdoc
  - jest
  - ts-jest
  - @types/jest
  - @lezer/generator
  </pre>
</details>
<details>
  <summary>VS Code plugins</summary>
  <pre>
  - ESLint
  - Colorize
  - Code Spell Checker (eng + rus)
  - Backticks
  - Svg Preview
  - TODO Highlight v2
  </pre>
</details>
<details>
  <summary>Google fonts</summary>
  <pre>
  - Fira Code
  - Rubik
  - Alegreya Sans SC
  - Noto Sans Math
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
  - Django
  - autopep8
  - SQLite
  </pre>
</details>

## ⚙️ DevOps

- Docker compose
- PowerShell
- Certbot
- Docker VSCode extension

# Developer Notes

## 🖥️ Local build (Windows 10+)

This is the build for local Development

- Install Python 3.12, NodeJS, VSCode, Docker Desktop
- copy import wheels from ConceptCore to rsconcept/backend/import
- run rsconcept/backend/LocalEnvSetup.ps1
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
