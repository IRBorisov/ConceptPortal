# Adversarial Review: RSForm

## Scope

| Area | Paths |
|------|--------|
| Frontend | `rsconcept/frontend/src/features/rsform/**` |
| Backend RSForm | `rsconcept/backend/apps/rsform/**` |
| Backend Library (sharing, clone, versions, access) | `rsconcept/backend/apps/library/**` |
| Shared permissions / zip helpers | `rsconcept/backend/shared/permissions.py`, `shared/utility.py` |
| Domain (formula/alias rules) | `rsconcept/domain` (via backend `api_RSLanguage`) |
| API notes | `rsconcept/rstool/docs/PORTAL-API.md` |

Review stance: hostile or careless user, concurrent editors, malformed import payloads, privilege escalation between owner / editor / viewer / anonymous, IDOR, silent formula/term corruption, export/import abuse. Application code was not modified.

## Executive summary (top risks)

1. **Private schema metadata is enumerable** via `GET /api/rsforms` (and similarly `GET /api/library`): unfiltered querysets plus `Anyone` / list-without-object-filter expose title, alias, description, owner, location, and `access_policy` for private items to anonymous callers.
2. **`GET /api/rsforms/{id}` retrieve uses `Anyone`**, so object-level read checks that protect `/details` are skipped for the base retrieve action.
3. **`read_only` is UI-only**: backend never refuses content mutations when `LibraryItem.read_only` is true; editors can also clear the flag via library `PATCH`.
4. **Shared-library placement (`/L`) is enforceable on create/set-location but bypassable** via RSForm clone and sandbox import.
5. **Destructive replace paths** (`load-json`, `load-trs`, version restore) are available to any `ItemEditor` with no optimistic concurrency token—concurrent editors can silently clobber each other.

## Findings

### 1. Unauthenticated enumeration of all RSForm metadata (including private)

- **Severity:** Critical
- **Location:** `rsconcept/backend/apps/rsform/views/rsforms.py` (`RSFormViewSet.queryset`, `get_permissions` else → `Anyone`); serializer `LibraryItemSerializer`
- **Description:** List action uses `LibraryItem.objects.filter(item_type=RSFORM)` with no access filter. Default permissions for `list`/`retrieve` are `permissions.Anyone` (`AllowAny`), which does not implement object-level denial. Tests for `GET /api/rsforms` assert owned/unowned appear and never assert private exclusion (`t_rsforms.py` `test_list_rsforms`).
- **Attack/Failure scenario:** Anonymous caller hits `GET /api/rsforms` and scrapes every schema’s title, alias, description, owner id, location, visibility, and access policy—including `access_policy: private` personal/project work. Complements the documented model that anonymous may only see public `/S`/`/L` items via `/api/library/active`.
- **Recommendation:** Filter list queryset with the same rules as `get_accessible_items_queryset` / `LibraryActiveView`; use `ItemAnyone` (or equivalent) for list/retrieve; add regression tests that private items are absent for anonymous and non-owner/non-editor users. Prefer deprecating this list in favor of `/api/library/active`.

### 2. Base retrieve IDOR on `GET /api/rsforms/{id}`

- **Severity:** Critical
- **Location:** `rsconcept/backend/apps/rsform/views/rsforms.py` `get_permissions` — `contents`/`details` use `ItemAnyone`, but default `retrieve` falls into `Anyone`
- **Description:** `/details` correctly returns 403 for private schemas (`test_details`). Base `RetrieveAPIView` retrieve does not use `ItemAnyone`, so `AllowAny.has_object_permission` defaults to allow. Private metadata is readable by id without being an owner/editor.
- **Attack/Failure scenario:** Attacker guesses or obtains an id (from finding 1, OSS references, or sequential ids) and `GET /api/rsforms/{id}` for private schemas. Constituents are not in this serializer, but passport fields still leak.
- **Recommendation:** Put `retrieve` (and any remaining read actions) under `ItemAnyone`; add an explicit forbidden test for private retrieve. Consider removing the thin retrieve if clients only need `/details`.

### 3. Library list also dumps all items without access filter

- **Severity:** High
- **Location:** `rsconcept/backend/apps/library/views/library.py` (`LibraryViewSet.queryset = LibraryItem.objects.all()`, list uses `ItemAnyone.has_permission` only); `t_library.py` `test_library_get`
- **Description:** List endpoints do not call `has_object_permission` per row. `/api/library/active` is correctly scoped; `/api/library` is not. Affects RSForm rows in the same table.
- **Attack/Failure scenario:** Same enumeration as finding 1 across RSForm / OSS / RSModel metadata.
- **Recommendation:** Override `get_queryset` for list to accessible items only, or disable unauthenticated/unscoped list; keep admin-only full list on `/api/library/all`.

### 4. `read_only` not enforced on RSForm mutation APIs

- **Severity:** High
- **Location:** Frontend enforces in `schema-edit-state.tsx` (`isMutable = role > READER && !schema.read_only`); backend `ItemEditor` / `can_edit_item` in `shared/permissions.py` never check `read_only`; no matches in `apps/rsform/views`
- **Description:** Flag is documented as «Запретить редактирование» on `LibraryItem`, but create/update/delete constituent, substitute, load-json/trs, reset-aliases, etc. succeed while `read_only=True`.
- **Attack/Failure scenario:** Owner freezes a reviewed schema. Editor (or owner’s own scripted client) calls `PATCH .../update-cst` or `load-json` and mutates content. UI checkbox is security theater.
- **Recommendation:** Centralize in `ItemEditor.has_object_permission` / `can_edit_item`: deny writes when `read_only` unless staff (or explicit unlock endpoint). Add API tests.

### 5. Editors can clear `read_only` via library update

- **Severity:** High
- **Location:** `LibraryItemSerializer` `read_only_fields` omits `read_only` (`library/serializers/data_access.py`); `LibraryViewSet` update/partial_update → `ItemEditor`
- **Description:** Editors may `PATCH /api/library/{id}` with `read_only: false`, then edit. Combined with finding 4, the freeze flag is fully optional for collaborators.
- **Attack/Failure scenario:** Malicious or careless editor unlocks a frozen schema and rewrites formulas; owner believes the freeze held.
- **Recommendation:** Restrict `read_only` (and possibly `visible`) changes to `ItemOwner` (dedicated action), same pattern as `set_access_policy` / `set_location`.

### 6. Non-staff can place RSForms into shared library `/L` via clone or sandbox import

- **Severity:** High
- **Location:**
  - Clone: `LibraryItemCloneSerializer.validate` returns early for non-OSS, skipping `/L` staff check (`library/serializers/data_access.py`); `clone_library_item_shell` assigns `location` from payload (`library/services/clone.py`)
  - Sandbox: `RSFormSandboxImportSerializer.ItemDataSerializer.location` is a free `CharField`; `create_rsform_from_sandbox_data` writes it with no staff check (`rsform/serializers/io_files.py`)
  - Contrast: `LibraryViewSet.perform_create`, `set_location`, and OSS clone correctly forbid `/L` for non-staff
- **Description:** Frontend hides `/L` in the location picker for non-staff (`pick-location.tsx`), but API does not.
- **Attack/Failure scenario:** Authenticated user clones a public schema or posts sandbox import with `"location": "/L"` (or `/L/Spam`) and publishes into the shared library catalog without staff approval.
- **Recommendation:** Reuse one helper `assert_can_write_location(user, location)` in create, clone, sandbox import, rename-location, and set-location; validate location format via `validate_location` on sandbox `item_data`.

### 7. No server-side optimistic concurrency — last write wins / silent clobber

- **Severity:** High
- **Location:** All RSForm mutating actions update `time_update` but never require client-supplied expected timestamp / ETag; frontend resets forms on `schema.time_update` (`form-constituenta.tsx`) and syncs tabs via BroadcastChannel (`schema-sync.ts`) but **other users/browsers** have no conflict API
- **Description:** Two editors (or one user with two sessions) can interleave `update-cst`, `substitute`, `delete-multiple-cst`, or `load-json`. Transactions serialize DB writes but do not detect stale bases.
- **Attack/Failure scenario:** Editor A loads schema at T0; Editor B substitutes/deletes constituents; A saves an old formula or runs `load-json` from an outdated export and wipes B’s work. No 409 Conflict.
- **Recommendation:** Accept `If-Match` / `expected_time_update` on mutations; reject stale writes with 409; surface conflicts in the UI. Treat `load-json` / `load-trs` / version restore as especially dangerous (require fresh match + confirm).

### 8. Destructive full-schema replace available to any editor

- **Severity:** Medium
- **Location:** `load_json`, `load_trs` → `ItemEditor` (`rsforms.py`); version `restore` → `EditorMixin` → `ItemEditor` (`library/views/versions.py`)
- **Description:** Incremental edits and full wipe share the same privilege. `load_json` / TRS / restore call `PropagationFacade().before_delete_schema` then rebuild constituents. Owners alone can create versions (`create_version`), but editors can restore/wipe.
- **Attack/Failure scenario:** Compromised editor account (or malicious collaborator) uploads hostile JSON/TRS and replaces the entire conceptual schema and related OSS propagation state in one request.
- **Recommendation:** Gate replace/restore to `ItemOwner` (or require a capability flag); keep editors on granular cst APIs; require version snapshot before replace.

### 9. TRS/zip import lacks size and structural hard limits (DoS / crash)

- **Severity:** Medium
- **Location:** `shared/utility.py` `read_zipped_json` (`ZipFile.read` entire member); `RSFormTRSSerializer` accepts `items` without max length or per-field validation (`io_files.py`); `load_trs` in `rsforms.py`
- **Description:** No application-level cap on zip member size, item count, or `term_forms` payload. Malformed items raise uncaught `KeyError`/`ValueError` (e.g. missing `entityUID`) → 500. Batch create caps at 100 (`CST_BATCH_CREATE_MAX_ITEMS`); import paths do not.
- **Attack/Failure scenario:** Editor uploads a zip bomb or multi‑MB `document.json` / tens of thousands of constituents, exhausting memory/CPU during parse + `resolve_all_text`, or crashing workers.
- **Recommendation:** Enforce `DATA_UPLOAD_MAX_MEMORY_SIZE` / per-view max upload; limit decompressed JSON size and `len(items)`; validate TRS items with a strict serializer (same alias rules as JSON import); return 400 on schema errors.

### 10. Unauthenticated natural-language endpoints without throttle

- **Severity:** Medium
- **Location:** `rsconcept/backend/apps/rsform/views/cctext.py` — `inflect`, `generate_lexeme`, `parse_text` all `@permission_classes([Anyone])`; throttles exist only for login/signup/password_reset/oss_clone (`settings.py` / `shared/throttling.py`)
- **Description:** Each call invokes native `cctext` work. Frontend uses these for term tooling; APIs are public.
- **Attack/Failure scenario:** Unauthenticated flood of `/api/cctext/generate-lexeme` causes CPU DoS on the API host.
- **Recommendation:** Authenticate, or add strict anon rate limits; consider payload length caps.

### 11. `Content-Disposition` filename built from unsanitized alias

- **Severity:** Medium
- **Location:** `rsform/utils.py` `filename_for_schema`; `library/views/versions.py` `export_file` (`filename={filename}` unquoted)
- **Description:** Non-ASCII aliases become `Schema.trs`, but ASCII aliases are concatenated raw. Characters such as `"`, `\r`, `\n` can break or inject response headers if present in `alias`.
- **Attack/Failure scenario:** Owner sets alias to a header-injection string; victim downloads a version export and the response carries injected headers (browser/proxy dependent).
- **Recommendation:** Allowlist `[A-Za-z0-9._-]`, always quote `filename="..."`, or use RFC 5987 `filename*`.

### 12. Formal definitions accepted without server-side language validation

- **Severity:** Medium
- **Location:** `CstUpdateSerializer` / create serializers store `definition_formal` as free text; tests explicitly accept `'invalid'` (`t_constituenta.py`); parse/analysis is produced for clients on read, not as a write gate
- **Description:** By design the backend stores invalid ЯРЭ. Adversarial or careless import/`update-cst` can leave schemas that look populated but fail analysis/evaluation downstream (OSS propagation, models, agents).
- **Attack/Failure scenario:** Bulk import or hostile editor injects nonsense formulas; UI may show errors locally while persisted state remains corrupt; clones and versions propagate the damage.
- **Recommendation:** Optional strict mode (reject or quarantine invalid expressions); always re-run analysis after import and persist status; document that “save succeeded” ≠ “schema consistent”.

### 13. Long-lived session and CSRF cookies

- **Severity:** Medium
- **Location:** `project/settings.py` — `SESSION_COOKIE_AGE = 2 years`, `CSRF_COOKIE_AGE = 1 year`; auth is session-only
- **Description:** Stolen session cookie remains useful for a long window. CSRF middleware is present and SessionAuthentication enforces CSRF on unsafe methods (good), but cookie lifetime amplifies XSS/session theft impact on RSForm writes.
- **Attack/Failure scenario:** XSS elsewhere or malware reads cookies; attacker edits/deletes schemas for months without re-auth.
- **Recommendation:** Shorten session lifetime, idle timeout, rotate on privilege change; `SameSite=Lax/Strict` review; step-up auth for destroy / load-json / set-owner.

### 14. Inline synthesis owner-only while editors can otherwise mutate

- **Severity:** Low
- **Location:** `InlineSynthesisSerializer.validate` — `schema_out.owner != user and not user.is_staff` → `PermissionDenied` (`data_access.py`); other mutations use `ItemEditor`
- **Description:** Editors cannot merge schemas via `/api/rsforms/inline-synthesis` but can still substitute/delete/import. Inconsistent capability model.
- **Attack/Failure scenario:** Mostly a product/authorization inconsistency; editors may work around via clone+manual copy, or owners alone become a bottleneck.
- **Recommendation:** Align with `can_edit_item(receiver)` (and keep `can_read_library_item(source)`).

### 15. Public schema responses expose editor user ids to anonymous readers

- **Severity:** Low
- **Location:** `LibraryItemDetailsSerializer.get_editors` / RSForm details payload
- **Description:** `/details` for public schemas returns `editors: [userId, ...]`. PORTAL-API documents public read of public objects; user id enumeration aids correlation.
- **Attack/Failure scenario:** Scrape public schemas to map which accounts collaborate on which topics.
- **Recommendation:** Omit editors from anonymous responses, or return non-sensitive display names only when intentional.

### 16. Context search / active list include private items for listed editors who cannot read them

- **Severity:** Low
- **Location:** `get_accessible_items_queryset` includes `Q(editor__editor=user)` without excluding `PRIVATE`; `can_read_library_item` / `ItemEditor` deny private for editors
- **Description:** Owner can add editors then switch policy to private. Editors still see the item in `/active` and may match content in context-search field scans, but `/details` returns 403.
- **Attack/Failure scenario:** Confused deputy / residual access: search hits leak that private terms exist; UX dead-ends.
- **Recommendation:** Apply the same `access_policy != PRIVATE` rule to editor branches in list/search as in `can_read_library_item`.

### 17. Weak TRS item validation vs JSON import

- **Severity:** Low
- **Location:** `RSFormTRSSerializer` vs `RSFormImportJsonSerializer` + `find_import_alias_error`
- **Description:** JSON import validates aliases; TRS path largely trusts file structure. Invalid `cstType`/aliases can persist or 500.
- **Attack/Failure scenario:** Crafted `.trs` corrupts a schema an editor is allowed to upload into.
- **Recommendation:** Share validation with sandbox/JSON import after TRS normalization.

### 18. Version create uses raw `request.data['items']` after serializer validation

- **Severity:** Low
- **Location:** `library/views/versions.py` `create_version`
- **Description:** `VersionCreateSerializer` validates `items`, but filtering uses `request.data['items']` instead of `validated_data`. Drift risk if validation rules change.
- **Attack/Failure scenario:** Subtle bypass if serializer coercion and raw data diverge; incomplete archives if clients send odd types that still pass.
- **Recommendation:** Use only `version_input.validated_data`.

### 19. Missing `export_trs` action still listed in permissions

- **Severity:** Info
- **Location:** `RSFormViewSet.get_permissions` includes `'export_trs'`; no `def export_trs` in views (export lives under versions `export_file`)
- **Description:** Dead permission branch; suggests incomplete API surface or stale config.
- **Attack/Failure scenario:** None directly; maintenance hazard if a future action is mis-wired under `Anyone`.
- **Recommendation:** Remove stale action name or restore the endpoint with `ItemAnyone`.

### 20. Frontend role / XSS posture (positive with residual note)

- **Severity:** Info
- **Location:** Tooltips use `textContent` / `innerText` / `appendBoldTextRow` (`refs-input/tooltip.ts`, `rs-input/tooltip.ts`, `utils/format.ts`); `adminMode` only elevates UI when `user.is_staff` (`users/stores/role.ts`)
- **Description:** No `dangerouslySetInnerHTML` in the rsform feature. Staff escalation is not client-spoofable without backend `is_staff`. Cross-tab sync validates DTOs with Zod (`schema-sync.ts`).
- **Attack/Failure scenario:** Residual: any future HTML rendering of `term_resolved` / conventions without escaping would become stored XSS via public schemas—keep text-node discipline.
- **Recommendation:** Codify a lint/rule: no HTML from schema text fields; continue resolving imported `*_resolved` server-side (already done in `restore_from_version` / sandbox create).

## Positive observations

- **Object scoping on mutations:** Constituenta PK fields are checked against `context['schema']` (update/delete/move/substitute/attribution)—classic cross-schema IDOR is largely blocked.
- **Inherited formal definitions:** Changing `definition_formal` when `Inheritance` exists is rejected; import into inherited schemas blocked.
- **Import hygiene:** Version/JSON restore and sandbox create recompute `term_resolved` / `definition_resolved` instead of trusting client (`data_access.py` comment + tests).
- **Anonymous private content:** `/details`, `/resolve`, and clone of others’ private schemas are tested forbidden.
- **CSRF:** Session auth + `CsrfViewMiddleware` + trusted origins; not cookie-auth CSRF-blind.
- **Frontend mutability model:** Clear `isContentEditable` / archive separation; form reset on remote `time_update` reduces same-tab surprise.
- **Alias format validation** on create/rename/JSON import (`validate_new_cst_alias` / `find_import_alias_error`).
- **Batch create size cap** (100) exists as a pattern to extend to imports.

## Residual risks / untested areas

- Live penetration of production CORS/`CSRF_TRUSTED_ORIGINS` misconfiguration.
- Full OSS propagation side effects after hostile substitute/delete/load (correctness under adversarial graphs).
- Zip slip / path tricks beyond the fixed inner name `document.json`.
- Staff `adminMode` workflows and `/api/library/all` / context-search `admin=1`.
- Domain package parser DoS (pathological ЯРЭ) when analysis runs on `/details`.
- Agent/MCP paths consuming Portal JSON (out of UI scope).
- Whether `GET /api/library/{id}` retrieve (ItemAnyone) is consistently used by all clients vs unscoped lists.
- Multi-region race conditions under non-SERIALIZABLE isolation for order/alias uniqueness.
- Email/HTML templates and non-rsform XSS that could steal the long-lived session (amplifies finding 13).

---

**Finding counts:** Critical 2 · High 5 · Medium 7 · Low 4 · Info 2
