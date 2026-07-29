# Adversarial Review: RSModel

## Scope

Hostile review of RS models / value binding / evaluation across:

- Frontend: `rsconcept/frontend/src/features/rsmodel/**`
- Backend: `rsconcept/backend/apps/rsmodel/**` (plus library create/clone touchpoints that attach schemas)
- Domain: `rsconcept/domain/src/library/rsengine.ts`, `rsmodel-api.ts`, `rslang/eval/**`

Threats considered: hostile value/JSON editors, binding to wrong schemas, evaluation DoS, permission bypass, corrupt model state, race on saves, type confusion, injection via model data, silent wrong evaluation results.

## Executive summary

RSModel mutations correctly gate **editors** for write paths and **ItemAnyone** for `/details`, and constituent-to-schema checks exist for normal models. The larger risks are elsewhere: **unfiltered list/retrieve** can leak private model metadata; **`read_only` is not enforced** on value APIs (and the UI keys off schema `read_only`, not the model); **bindings accept arbitrary JSON/`type`** with no server-side structure check; **null schema** disables membership checks; and **invalid values are still injected into the calculator**, so dependents can look “successfully” evaluated while being wrong. Evaluation is client-side with high materialization ceilings (cartesian product up to 10M), so DoS is browser freeze rather than server crash.

## Findings

### 1. Unauthenticated list/retrieve leaks private RSModel metadata

- **Severity:** High
- **Location:** `rsconcept/backend/apps/rsmodel/views/rsmodels.py` (`get_permissions` → `Anyone` for non-`details` actions; `queryset` unfiltered); DRF `ListAPIView` / `RetrieveAPIView` mixins
- **Description:** `GET /api/models/` and `GET /api/models/{id}/` use `permissions.Anyone` with `LibraryItem.objects.filter(item_type=RSMODEL)` and no access-policy filter. Object permissions are not applied for `AllowAny`, so private/protected items are enumerable and readable as library metadata (title, alias, description, owner, location, `access_policy`, timestamps). Full bindings remain behind `/details` (`ItemAnyone`).
- **Attack/Failure scenario:** Attacker scrapes `/api/models/` (or probes IDs) and maps private models, owners, and folder paths without auth. Same pattern exists on RSForm viewsets (out of scope but shared).
- **Recommendation:** Filter list/retrieve like `LibraryActiveView` / `can_read_library_item`, or remove unused list/retrieve routes; require `ItemAnyone` (or stricter) for any object GET.

### 2. `read_only` is not enforced on value mutations; UI checks the wrong flag

- **Severity:** High
- **Location:** Backend: `views/rsmodels.py` (`set_value`, `load_json`, `clear_values`, `reset_all`) — only `ItemEditor`. Frontend: `pages/rsmodel-page/model-edit-state.tsx` (`isMutable = role > READER && !schema.read_only`)
- **Description:** Library `read_only` is never checked on RSModel value endpoints. The UI gates mutability on the **bound schema’s** `read_only`, not `model.read_only`. An editor can still PATCH/POST values when the model card shows read-only, and API clients ignore the flag entirely.
- **Attack/Failure scenario:** Collaborator or automation clears/overwrites values on a “locked” model; operators believe `read_only` freezes interpretations.
- **Recommendation:** Reject mutations when `item.read_only` (and decide whether schema lock should also block model values). Align `isMutable` with `!model.read_only && !schema.read_only` (and role).

### 3. No server-side validation of value shape or `type` vs constituent

- **Severity:** High
- **Location:** `serializers/data_access.py` (`CstDataUpdateSerializer`, `RSModelImportJsonSerializer`, sandbox import); `models/ConstituentData.py` (`type` TextField, `data` JSONField); domain load path `rsengine.ts` `prepareValues`
- **Description:** Backend only checks that a constituent belongs to the model’s schema (when schema is set). `type` is an arbitrary string; `data`/`value` is unchecked JSON. Frontend Zod is narrower but only client-side. Engine marks invalid structured values in `invalidData` **after** `calculator.setValue`, so bad data remains in the evaluation context.
- **Attack/Failure scenario:** Editor (or compromised client) uploads `type: "basic"` for a term, or a huge nested array / wrong arity tuple. Dependents recalculate to `HAS_DATA` using garbage inputs → silent wrong results; or `prepareValues` throws on `type === "basic"` for non-base/constant and crashes the model page.
- **Recommendation:** Persist only after validating binding vs `CstType` / effective type (reuse domain `validateBasicBindingData` / `validateValue` / `calculator.validate`). Reject or strip invalid rows on import. Do not put invalid values into the calculator context (or hard-fail dependents).

### 4. Null schema disables constituent membership checks

- **Severity:** High
- **Location:** `models/RSModel.py` (`schema` null=True); library create `LibraryItemCreateSerializer.schema` optional; `CstDataUpdateSerializer.validate` (`if schema and cst.schema_id != schema.pk`); `views/rsmodels.py` `_get_schema`
- **Description:** Models can be created with `schema=null`. For `set-value`, when context schema is `None`, the membership check is skipped, so **any** constituenta PK can be bound into the model. Frontend `schemaRSModel` expects `schema: z.number()`, so the page may fail to load while the API still accepts writes.
- **Attack/Failure scenario:** Create RSMODEL without schema, then `set-value` referencing foreign constituents → orphaned / cross-schema bindings and corrupt `items` payloads.
- **Recommendation:** Require non-null RSFORM schema on create; reject mutations when `schema_id` is null; validate `item_type == RSFORM` and preferably `can_read`/`can_edit` on the schema.

### 5. Create RSModel accepts any LibraryItem as `schema`

- **Severity:** Medium
- **Location:** `apps/library/serializers/data_access.py` (`LibraryItemCreateSerializer.schema` queryset = all items); `library/views/library.py` `perform_create`
- **Description:** No check that `schema` is an RSForm the caller may use. Binding to OSS/RSModel IDs or private schemas (by guessing IDs) creates inconsistent models; private schema IDs become attached to attacker-owned models.
- **Attack/Failure scenario:** Authenticated user POSTs `/api/library` with `item_type=rsmodel` and `schema=<private_rsform_id>`. Model card stores that ID; further behavior depends on schema detail permissions, but integrity of the library graph is broken.
- **Recommendation:** Restrict queryset to accessible RSFORMs; reject non-RSFORM PKs.

### 6. No uniqueness on `(model, constituent)` → duplicate bindings under race

- **Severity:** Medium
- **Location:** `models/ConstituentData.py` (no `UniqueConstraint`); `set_value` uses `update_or_create`; `RSModelSerializer.to_representation` returns all rows
- **Description:** Concurrent `update_or_create` without a DB unique constraint can insert duplicates. Details then emit multiple items for one constituent; engine load behavior becomes undefined (last write / duplicate processing).
- **Attack/Failure scenario:** Two tabs save the same constituent simultaneously → duplicate rows, flaky UI, ambiguous export/import.
- **Recommendation:** Add `UniqueConstraint(fields=['model', 'constituent'])`; handle IntegrityError; optionally collapse duplicates in a data migration.

### 7. Concurrent save races: full replace import + parallel set/clear

- **Severity:** Medium
- **Location:** `load_json` deletes all bindings then bulk_creates (no etag/`time_update` check); `rsengine.ts` `setBasicValue` runs `Promise.all([setCstValue, clearValues])`; `use-set-value.ts` updates local timestamp without returning server payload
- **Description:** Last writer wins with no conflict detection. Parallel set+clear for dependent structured values can interleave with another client’s `set-value`/`load-json` and leave survivors that should have been cleared (or vice versa). Cross-tab sync refetches on notify without payload after set-value, which helps but does not serialize writes.
- **Attack/Failure scenario:** Two editors: A imports JSON while B edits a binding → silent loss. Or base-set shrink triggers clear of S1 while another tab writes S1 → inconsistent model.
- **Recommendation:** Optimistic concurrency (`If-Unmodified-Since` / `time_update` version); single transactional API for “update bindings + clear list”; return full DTO from `set-value`.

### 8. Client evaluation DoS / tab freeze via large sets

- **Severity:** Medium
- **Location:** `domain/src/rslang/eval/value.ts` (`SET_INFINITY = 10_000_000`); `value-api.ts` `cartesianProduct` (materializes up to limit); `evaluator.ts` (`MAX_ITERATIONS = 1_000_000`); UI `recalculateAll` / expression evaluate
- **Description:** Evaluation runs in the browser. Cartesian product allocates up to ~10M tuples before failing; iteration budget is 1e6. Hostile schemas + large base bindings (or crafted expressions) can freeze/OOM the tab. Not a server DoS (no eval API), but a reliability/availability issue for anyone who opens the model.
- **Attack/Failure scenario:** Public model with large X# and expressions using × / ℬ-heavy terms; visitor opens model and hits “calculate all” → browser hang.
- **Recommendation:** Lower materialization caps; preflight cardinality estimates; yield/abort with UI timeout; cap stored binding sizes on the server.

### 9. Unbounded binding payload size on API

- **Severity:** Medium
- **Location:** JSONField on `ConstituentData`; no serializer max length/depth; frontend display limit `limits.len_data_str` (50k) only truncates UI; `RecursiveArraySchema` unbounded
- **Description:** Editors can persist enormous JSON trees. That stresses DB, `/details` responses, Zod parse, and `prepareValueString` / engine load.
- **Attack/Failure scenario:** `load-json` / `set-value` with multi‑MB nested arrays → slow details, memory pressure, possible client parse failure.
- **Recommendation:** Enforce max JSON size/depth/element count server-side; mirror limits in Zod; reject oversize imports early.

### 10. Invalid / hostile binding text and type confusion (integrity)

- **Severity:** Medium
- **Location:** Binding editor (`binding-editor.tsx`) — free text labels; `TYPE_BASIC` vs normalized type strings; export `json-file.ts` trusts stored `item.type`
- **Description:** Element labels are unconstrained strings (XSS risk is low under React text nodes). Type confusion is worse: wrong `type` changes how `prepareValues` interprets `value` (basic map vs Value). Export can re-ship confused types.
- **Attack/Failure scenario:** Crafted import sets `type: "basic"` with a Value array or vice versa → crash or mis-evaluation; round-trip JSON preserves the lie.
- **Recommendation:** Canonicalize `type` from schema on write; ignore client `type` or validate equality; sanitize/limit binding label length.

### 11. `reset-all` exposed without frontend counterpart / audit trail

- **Severity:** Low
- **Location:** `views/rsmodels.py` `reset_all`; no frontend `rsmodelApi` wrapper
- **Description:** Destructive wipe of all bindings is available to any editor via API with no confirmation UX and no returned body. Fine if intentional, but easy to script accidentally.
- **Attack/Failure scenario:** Compromised editor session or buggy client calls `POST .../reset-all`.
- **Recommendation:** Keep endpoint but require confirmation token / soft-delete / audit log; or restrict to owner.

### 12. Public model details expose all interpretation values

- **Severity:** Info
- **Location:** `details` + `ItemAnyone`; `RSModelSerializer` embeds full `items[].value`
- **Description:** By design, public models leak all bindings to anonymous users. Sensitive labels in base sets are world-readable.
- **Attack/Failure scenario:** User marks model PUBLIC with confidential element names → scraped via `/details`.
- **Recommendation:** Document clearly; optional “values visibility” separate from metadata policy.

### 13. Context search indexes binding `type`, not value text

- **Severity:** Info
- **Location:** `library/services/context_search.py` (ConstituentData `type` field only)
- **Description:** Binding payload text is not searchable — privacy-friendly residual, but operators may assume values are indexed.
- **Attack/Failure scenario:** N/A (observation).
- **Recommendation:** Document; if search is added later, scope to accessible models only and consider sensitivity.

## Positive observations

- Write actions (`set-value`, `load-json`, `clear-values`, `reset-all`) require `ItemEditor`; anonymous/forbidden cases are covered in `apps/rsmodel/tests/t_views.py`.
- `/details` uses `ItemAnyone` (public / owner / editor), not open listing of values for private items.
- When schema is present, `set-value` / `clear-values` / `load-json` reject constituents outside the bound schema.
- Sandbox create remaps constituent IDs and rejects bindings not in imported schema items.
- Domain evaluator has iteration and set-overflow guards; UI value rendering has depth/node limits to avoid stack overflows.
- Cross-tab model sync validates Zod DTOs and compares `time_update` before applying remote payloads.
- Frontend import path validates JSON with Zod + `validateBasicBindingData` / `validateValueData` before sending (defense in depth for honest clients).

## Residual risks / untested areas

- Live concurrency stress (two browsers racing `set-value` / `load-json`) not executed in this review.
- Production DB engine behavior under missing unique constraint (SQLite vs PostgreSQL) not measured.
- Whether nginx/Django request body limits are configured in deploy (repo settings show no app-level caps).
- Full OSS-linked schema + model permission matrix (editors on model vs schema) beyond `isMutable` / `SchemaEditState`.
- Whether calculator operators tick iterations during large cartesian builds (CPU before abort).
- Agent/rstool paths that write models outside the frontend feature folder.
- Malicious schema definitions (as opposed to model values) as the primary DoS vector when opening a public model.

## Finding counts by severity

| Severity | Count |
|----------|------:|
| Critical | 0 |
| High     | 4 |
| Medium   | 6 |
| Low      | 1 |
| Info     | 2 |
| **Total**| **13** |
