# ConceptPortal
React + Django based web portal for editing RSForm schemas.
This readme file is used mostly to document project dependencies

# Contributing notes
!BEFORE PUSHING INTO MAIN!
- use Test config in VSCode to run tests before pushing commits / requests
- cd rsconcept/frontend & npm run build
- docker compose -f docker-compose-prod.yml up

# Frontend stack & Tooling [Vite + React + Typescript]
<details>
<summary>npm install</summary>
  <pre>
  - axios
  - react-router-dom 
  - react-toastify
  - react-loader-spinner
  - js-file-download
  - react-tabs
  - react-intl
  - react-select
  - react-error-boundary
  - reagraph
  - react-tooltip
  - @tanstack/react-table
  - @uiw/react-codemirror
  - @uiw/codemirror-themes
  - @lezer/lr
  </pre>
</details>
<details>
<summary>npm install -D</summary>
  <pre>
  - tailwindcss postcss autoprefixer
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
  </pre>
</details>

# Backend stack & Tooling [Django + PostgreSQL/SQLite]
- [ConceptCore](https://github.com/IRBorisov/ConceptCore)
<details>
<summary>requirements</summary>
  <pre>
  - django
  - djangorestframework
  - django-cors-headers
  - django-filter
  - tzdata
  - gunicorn
  - coreapi
  - psycopg2-binary
  - pymorphy2
  - razdel
  </pre>
</details>
<details>
<summary>requirements_dev</summary>
  <pre>
  - coverage
  - pylint
  - mypy
  - django-stubs[compatible-mypy]
  - djangorestframework-stubs[compatible-mypy]
  </pre>
</details>
<details>
<summary>VS Code plugins</summary>
  <pre>
  - Pylance
  - Pylint
  - Django
  </pre>
</details>

# DevOps
- Docker compose
- PowerShell
- Certbot
- Docker VSCode extension

# Developer Notes
## Local build (Windows 10+)
- this is main developers build
- Install Python 3.9, NodeJS, VSCode, Docker Desktop
- copy import wheels from ConceptCore to rsconcept/backend/import
- run rsconcept/backend/LocalEnvSetup.ps1
- use VSCode configs in root folder to start developement

## Developement build
- this build does not use HTTPS and nginx for networking
- backend and frontend debugging is supported
- hmr (hot updates) for frontend
- run via 'docker compose -f "docker-compose-dev.yml" up --build -d'
- populate initial data: rsconcept/PopulateDevData.ps1 dev-portal-backend

## Local production build
- this build is same as production except not using production secrets and working on localhost
- provide TLS certificate (can be self-signed) 'nginx/cert/local-cert.pem' and 'nginx/cert/local-key.pem'
- run via 'docker compose -f "docker-compose-prod-local.yml" up --build -d'
- populate initial data: rsconcept/PopulateDevData.ps1 local-portal-backend

## Production build
- create secrets secrets/db_password.txt and django_key.txt
- provide TLS certificate 'nginx/cert/front-cert.pem' and 'nginx/cert/front-key.pem'
- run via 'docker compose -f "docker-compose-prod.yml" up --build -d'
