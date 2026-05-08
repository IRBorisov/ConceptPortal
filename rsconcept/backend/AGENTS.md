# AGENTS.md

Rules for agents in `rsconcept/backend`.

## Scope

Applies to backend files.

## Stack

Django, Django REST Framework, PostgreSQL/SQLite local, MyPy, Pylint, Coverage.

## Structure

- `manage.py`: Django commands
- `project`: settings, root URLs, WSGI
- `apps`: domain apps (`users`, `library`, `rsform`, `oss`, `rsmodel`, `prompt`)
- `shared`: serializers, permissions, throttling, utils, test helpers
- `fixtures`: initial data
- `templates`: backend-served robots/mail views

## Commands

Run from `rsconcept/backend`:

- Sync deps: `uv sync --frozen`
- Upgrade deps: `uv lock --upgrade && uv sync`
- Check: `uv run python manage.py check`
- Test: `uv run python manage.py test`
- Server: `uv run python manage.py runserver`
- Pylint: `uv run pylint project apps`
- MyPy: `uv run mypy project apps --show-traceback`

Repo root scripts: `powershell -File scripts/dev/RunTests.ps1`, `powershell -File scripts/dev/RunLint.ps1`.

## File Hints

- Settings/env behavior: `project/settings.py`
- Root URLs: `project/urls.py`
- App URLs/views: `apps/*/urls.py`, `apps/*/views`
- Models: `apps/*/models`
- Serializers: `apps/*/serializers`, `shared/serializers.py`
- Shared helpers: `shared`
- Tests: `apps/*/tests`

## Edit Rules

- Keep logic in owning app; move to `shared` only when clearly cross-app.
- Reuse `shared` before duplicating serializers, permissions, tests, utils.
- Treat API contract changes as cross-cutting; verify frontend impact.
- Check `project/settings.py` for auth/CORS/debug/env-dependent behavior.
- Prefer additive migrations; edit old migrations only when explicitly required.
- Update tests for serializers, permissions, model behavior, endpoints.
