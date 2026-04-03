# AGENTS.md

Backend guidance for AI coding agents working in `rsconcept/backend`.

## Scope

This file applies to the Django backend in this directory tree.

## Stack

- Django
- Django REST Framework
- PostgreSQL or SQLite for local contexts
- MyPy
- Pylint
- Coverage

## Backend map

- `manage.py` is the entry point for Django management commands.
- `project` contains settings, root URLs, and WSGI configuration.
- `apps` contains domain apps:
  - `users`
  - `library`
  - `rsform`
  - `oss`
  - `rsmodel`
  - `prompt`
- `shared` contains common serializers, permissions, throttling, utilities, and test helpers.
- `fixtures` contains initial data.
- `templates` contains backend-served templates such as robots or mail views.

## Working style

- Keep changes inside the owning Django app unless logic is clearly shared.
- Reuse `shared` helpers before duplicating serializer, permission, or testing utilities.
- Check `project/settings.py` when behavior depends on auth, CORS, debug, or environment flags.
- Treat API contract changes as cross-cutting and verify frontend impact.

## Common commands

Run from `rsconcept/backend`:

- Django checks: `venv\Scripts\python.exe manage.py check`
- Run tests: `venv\Scripts\python.exe manage.py test`
- Run server: `venv\Scripts\python.exe manage.py runserver`
- Pylint: `venv\Scripts\pylint.exe project apps`
- MyPy: `venv\Scripts\mypy.exe project apps --show-traceback`

From repository root you can also use:

- `powershell -File scripts/dev/RunTests.ps1`
- `powershell -File scripts/dev/RunLint.ps1`

## File hints

- Global settings and environment behavior: `project/settings.py`
- Root URL wiring: `project/urls.py`
- App URLs and views: `apps/*/urls.py`, `apps/*/views`
- Models: `apps/*/models`
- Serializers: `apps/*/serializers` and `shared/serializers.py`
- Cross-app helpers: `shared`
- Tests: `apps/*/tests`

## Edit rules

- Keep business logic close to the app that owns the data model.
- Prefer additive migrations and avoid editing old migrations unless explicitly required.
- Update tests when serializers, permissions, model behavior, or endpoints change.
- Be careful with auth, throttling, and settings defaults because they affect multiple endpoints.
- When introducing environment-sensitive behavior, make the local-safe path explicit.

## Backend-specific rules to extend

Add your own instructions here, for example:

- Apps that require extra review
- Migration approval rules
- Serializer or viewset conventions
- Test coverage expectations
- Restrictions around auth, mail, or production settings
