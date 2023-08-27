# ConceptPortal
React + Django based web portal for editing RSForm schemas.
This readme file is used mostly to document project dependencies


# Developer Setup Notes
- Install Python 3.9, NodeJS, VSCode, Docker Desktop
- copy import wheels from ConceptCore to rsconcept\backend\import
- run rsconcept\backend\LocalEnvSetup.ps1
- run 'npm install' in rsconcept\frontend
- use VSCode configs in root folder to start developement
- production: create secrets secrets\db_password.txt and django_key.txt
- production: provide TLS certificate nginx\cert\portal-cert.pem and nginx\cert\portal-key.pem

# Contributing notes
- use Test config in VSCode to run tests before pushing commits / requests
- !BEFORE PUSHING INTO MAIN! in rsconcept\frontend run in terminal 'npm run build' and fix all errors
- when making major changes make sure that Docker production is building correctly. run 'docker compose -f docker-compose-prod.yml up'

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
  - react-data-table-component
  - react-dropdown-select
  - react-error-boundary
  - reagraph
  - react-tooltip
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
  - tzdata
  - django
  - djangorestframework
  - django-cors-headers
  - django-filter
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
