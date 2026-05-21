---
name: frontend-i18n-extract
description: Replaces hardcoded user-visible strings on Portal frontend pages and modules with stable tx.* message ids, updates en/ru/fr catalogs, and wires useTx or globalTx. Use when localizing a page, feature, helper, or data file that still contains literal copy instead of i18n ids, or when fixing locale parity after adding strings.
---

# Frontend i18n extraction (Portal)

## Scope

`rsconcept/frontend`: any `.ts` / `.tsx` under `src/` that shows locale-specific text. Catalogs: `src/i18n/app/*.{en,ru,fr}.ts`, `src/i18n/domain/*.{en,ru,fr}.ts`, merged via `src/i18n/map/message-map.*.ts`.

Authoritative rules: `rsconcept/frontend/AGENTS.md` → **Internationalization**.

## Choose API

| Context | API |
|--------|-----|
| React component | `useTx()` from `@/i18n` → `tx('tx....', values?)` |
| Non-React (stores, toasts, helpers, parsers) | `globalTx('tx....', values?)` from `@/i18n` |

Use ICU placeholders `{name}` in strings; **same placeholder names** in en, ru, fr.

## Where to put new keys

- **`app/`** — shell, nav, generic actions, errors, auth chrome, pagination, reusable UI.
- **`domain/`** — library, schema, model, OSS, rslang, lang/grammar, AI prompts, business concepts.

Pick namespace **by meaning**, not by file path: reuse `tx.general.*`, `tx.shell.*`, `tx.lib.*`, `tx.lang.*`, `tx.rslang.*`, `tx.ai.*`, etc. Add a **new id** only when no existing string fits; use suffixes from AGENTS (`.hint`, `.short`, `.validate.*`, `.success`, `.fail`, `.confirm`, …).

## Non-text in code

Keep **out of catalogs** anything that must stay literal: emoji, brand marks, pure icons, or formatting the UI derives in TS. Concat at the call site after `tx` / `globalTx` (e.g. `` `${emoji} ${tx('tx.foo')}` ``).

## Casing and layout

Prefer **sentence case** in catalogs. If the design needs **all-lowercase** in one widget only, apply `.toLowerCase()` (or CSS) **at that call site**, not in the shared message string.

HTML in messages (e.g. `<br/>`) is allowed where the consumer already treats the string as HTML/tooltip; keep tags minimal and consistent across locales.

## Parity test

After edits, run:

`npm test -- src/i18n/map/locale-keys-parity.test.ts`

Watch for:

- **en / ru / fr** same key set for touched slices.
- **Used ids**: literals passed to `tx` / `globalTx` and values in typed `Record<SomeEnum, string>` maps (see test scanner) must exist in **en**.
- **Unused ids**: none left orphaned in **en** (unless explicitly ignored by the test).
- **Duplicate values** in **ru** (and the test that forbids **en === ru === fr** for the same key across all three) — rephrase one locale slightly if needed.

## Workflow

1. Inventory user-visible literals (labels, buttons, errors, empty states, aria, tooltips).
2. For each, **match or add** a `tx.*` id; prefer reuse.
3. Patch **en**, **ru**, **fr** in the same relative order in the slice file.
4. Replace literals in components/helpers with `tx` / `globalTx`.
5. Run the parity test; fix dupes / missing keys.

## Checklist

- [ ] No remaining hardcoded locale text for the scope you touched
- [ ] en / ru / fr aligned for every new or changed id
- [ ] `useTx` vs `globalTx` chosen correctly
- [ ] Emoji / non-translatable fragments concatenated in code if needed
- [ ] `locale-keys-parity.test.ts` passes
