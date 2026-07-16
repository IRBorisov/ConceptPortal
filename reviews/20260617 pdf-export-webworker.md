# Adversarial review: PDF export → web worker

- **Commit:** `31287271` — _R: Rework pdf into webworker_
- **Date:** 2026-07-16
- **Scope:** `rsconcept/frontend` PDF stack move from `features/rsform/utils` + `components/pdf` into `services/pdf` with a dedicated RSForm worker

## Verdict

Moving PDF generation off the UI thread is the right direction. The barrel / `worker-client` split correctly keeps `@react-pdf` out of the main lazy chunk on the happy path.

The weak spots are **layering**, an **untested production worker path**, and **worker lifecycle / concurrency** that can hang or race under real use.

---

## Agentic / AGENTS.md issues

1. **“Domain-neutral `services`” is violated in the same commit that reasserts it.**  
   `rsconcept/frontend/AGENTS.md` still describes `src/services` as domain-neutral, while the public API is entirely RSForm (`services/pdf/rsform/*`) and is also consumed from `rsmodel`. Feature domain logic sits under a “neutral” layer.

2. **Layer inversion: `services` → `app`.**  
   `services/pdf/rsform/document.tsx` imports `@/app/urls`, which pulls `buildConstants` / Vite env into the worker graph. Services depending on app routing breaks the usual `app → features → services` direction and is especially costly because it ships into a worker.

3. **`services` → UI store.**  
   `export.ts` reads `usePreferencesStore`. Passing locale into the document is correct for worker safety; binding the service entry to a Zustand preferences store is not. Call sites already know UI context — locale should be an argument (or a thin adapter in the feature).

4. **“Colocate feature helpers” vs this move.**  
   Pulling PDF out of `features/rsform/utils` is justified for bundling, but AGENTS was not updated with a clear rule for “heavy export engines live in `services/<domain>`.” Agents will keep oscillating between “neutral services” and “feature utils.”

5. **Tests miss the new critical path.**  
   Frontend AGENTS asks for tests on critical behavior. `canUsePdfWorker()` forces `MODE !== 'test'`, so Vitest only exercises the main-thread fallback. The production path (postMessage, transferables, DOM shim, font URLs in a worker) is untested.

---

## High severity

### Concurrent jobs in one worker

`worker.ts` uses an `async` `onmessage` handler. That returns immediately, so overlapping exports can run concurrently inside one worker sharing `@react-pdf` / Yoga / `Font.register` state. There is no queue. Double-click or parallel schema + list export can corrupt layout or hang.

### No timeout / cancel

`worker-client.ts` pending map has no deadline and no abort. One stuck `toBlob()` (already a known react-pdf risk for tall rows) never resolves; later jobs sit behind the same singleton with no recovery except hard worker `onerror`.

### Payload “stripping” is incomplete

`toSchemaPdfInput` drops non-cloneable RSForm fields (`graph`, analyzer, …) but still posts full `Constituenta[]` (diagnostics, analysis, term_forms, spawn, …). The PDF only needs a handful of fields plus `labelType(effectiveType)`. Cost: large structured clones and a false sense of a minimal protocol.

### DOM shim is a landmine

`worker-shim.ts` stubs canvas / `measureText` → width `0`, and only installs if `document` is missing. Brittle across `@react-pdf` upgrades: failures may be silent layout bugs rather than loud crashes. No version pin or smoke test that the shim still matches what Yoga/fontkit touch at import time.

---

## Medium severity

| Issue                              | Why it matters                                                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Worker bundle will be heavy        | Worker pulls document → `PdfIntlRoot` → full message maps, `@/app/urls`, domain `labelType`, react-pdf. First export pays a large cold start. |
| Font URL change untested in worker | `location.origin + /fonts/...` is reasonable; still no worker test if `location` is odd or fonts 404.                                         |
| Vitest alias widened               | `/(^                                                                                                                                          | \/)font-path$/`is broader than`pdf-font-path`; any future `font-path` module gets remapped. |
| Hardcoded prod portal link         | `external_urls.portal` still forces `https://portal.acconcept.ru` in PDFs from localhost/staging (pre-existing, unchanged).                   |
| PDF metadata `language: 'ru'`      | Ignores passed `locale` (pre-existing).                                                                                                       |
| Singleton worker never released    | Fine for frequent export; permanent memory resident after first use.                                                                          |
| Protocol is TypeScript-only        | No runtime validation of `kind` / `id`; bad messages can hang pending jobs (`if (!job) return`).                                              |

---

## What works well

- Static `new URL('./worker.ts', import.meta.url)` for Vite worker emission.
- Locale passed into the document (worker-safe); preferences not imported in `document.tsx`.
- Barrel re-exports only `createSchemaFile` / `cstListToFile` so lazy import stays free of `@react-pdf` on the happy path.
- Transferable `ArrayBuffer` on success.
- Layout heuristics and page-number sanitization preserved with unit tests on the main-thread path.

---

## Recommended fix order

1. Serialize a **minimal DTO** per row (not full `Constituenta`); **queue** worker jobs (one-at-a-time).
2. Add **timeout + terminate/recreate** worker; optionally cancel on navigation.
3. Break **app/store** deps: pass locale from UI; inline or duplicate a tiny `urls.schema` path helper in the PDF package.
4. Align **AGENTS.md**: either document that `services/pdf` may own feature-specific exporters, or move `rsform/` under the feature and keep only shared chrome in `services/pdf`.
5. Add at least one **worker smoke test** (Playwright or a Vitest worker harness) — font load + one-page PDF — so shim/font path is not production-only.

---

## Key files

| Path                                       | Role                                     |
| ------------------------------------------ | ---------------------------------------- |
| `src/services/pdf/index.ts`                | Public barrel (export entry points only) |
| `src/services/pdf/rsform/export.ts`        | Feature entry + preferences locale       |
| `src/services/pdf/rsform/worker-client.ts` | Singleton worker + main-thread fallback  |
| `src/services/pdf/rsform/worker.ts`        | Dedicated worker entry                   |
| `src/services/pdf/worker-shim.ts`          | DOM stubs for `@react-pdf` in workers    |
| `src/services/pdf/rsform/document.tsx`     | Document trees + `@/app/urls`            |
| `src/services/pdf/rsform/protocol.ts`      | Message types / `SchemaPdfInput`         |
