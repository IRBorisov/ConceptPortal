# Adversarial Review: Library

## Scope

- Frontend: `rsconcept/frontend/src/features/library/**` (list/filter/search UI, create/clone dialogs, access/editors tooling, API hooks).
- Backend: `rsconcept/backend/apps/library/**`, shared permissions in `rsconcept/backend/shared/permissions.py`, and closely coupled item surfaces (`rsforms` / `oss` / `models` list+details, sandbox create, OSS `import-schema`).
- Auth interaction for public vs protected vs private items, editors, ownership, locations (`/S`, `/L`, `/U`, `/P`).

Method: adversarial walkthrough of list/filter/search, create, clone, set editors, visibility/access policy, delete, and related copy paths. No application code was modified.

## Executive summary

Library **item-level** checks (`ItemOwner` / `ItemEditor` / `ItemAnyone`, `can_read_library_item`) are mostly coherent for retrieve/mutate of a single known object, and the intentional list endpoints (`/api/library/active`, `/api/library/all`, `/api/library/by-ids`, context search) generally respect accessibility. The largest failures are **unscoped ModelViewSet/ListAPIView list routes** that dump every library item’s metadata, and **copy/link paths** (OSS `import-schema` clone, RSModel `schema=` on create, non-OSS clone into `/L`) that skip or incompletely apply the same read/staff rules. Frontend filtering is client-side only and cannot compensate for those API gaps.

## Findings

### 1. Unscoped `GET /api/library` lists every item (including private)

- **Severity:** Critical
- **Location:** `rsconcept/backend/apps/library/views/library.py` (`LibraryViewSet`, `queryset = LibraryItem.objects.all()`, `get_permissions` → `ItemAnyone` for non-mutating default actions); confirmed by `rsconcept/backend/apps/library/tests/s_views/t_library.py` `test_library_get`
- **Description:** `ItemAnyone.has_permission` always returns `True`. DRF list actions do not run `has_object_permission` per row. The ViewSet therefore serializes the full table via `LibraryItemSerializer` (title, alias, description, owner, location, `access_policy`, etc.). The UI correctly uses `/api/library/active` and `/api/library/all`, but the router still exposes the ModelViewSet collection route.
- **Attack/Failure scenario:** Any caller (anonymous in DEBUG; any session in production where this action is allowed) hits `GET /api/library` and inventories private schemas: owners, folder paths, titles, policies. That enables targeted follow-up against other bugs and defeats “private / unlisted” intent.
- **Recommendation:** Remove list from `LibraryViewSet`, or override `get_queryset` / `list` to reuse `get_accessible_items_queryset` (and require staff for “all”). Add a regression test that private foreign items are absent from `GET /api/library`.

### 2. Sibling type list endpoints also dump all RSForms / OSS / RSModels

- **Severity:** Critical
- **Location:** `rsconcept/backend/apps/rsform/views/rsforms.py` (`RSFormViewSet` + `ListAPIView`, default permission `Anyone`); `rsconcept/backend/apps/oss/views/oss.py` (`OssViewSet`); `rsconcept/backend/apps/rsmodel/views/rsmodels.py` (`RSModelViewSet`)
- **Description:** Same pattern as Finding 1: unfiltered querysets with list permission that never applies per-object ACL. These are the natural companions of library metadata and amplify the leak (type-scoped full inventories).
- **Attack/Failure scenario:** Attacker enumerates all `rsform` / `oss` / `rsmodel` IDs and metadata without using `/library/active`.
- **Recommendation:** Disable list, or filter with the same accessibility queryset used by `/library/active` / context search. Keep retrieve/details behind `ItemAnyone`.

### 3. OSS `import-schema` can clone or attach any RSForm without read ACL

- **Severity:** Critical
- **Location:** `rsconcept/backend/apps/oss/views/oss.py` (`import_schema`); `rsconcept/backend/apps/oss/serializers/data_access.py` (`ImportSchemaSerializer.source` queryset = all RSForms, no `can_read_library_item`)
- **Description:** Editor of an OSS may pass any RSForm PK as `source`. With `clone_source: true`, full constituent content is copied into a new schema owned under the OSS (`insert_from`). Without clone, the private schema is linked as the operation result. Library clone correctly checks `can_read_library_item`; this path does not.
- **Attack/Failure scenario:** User A is editor on their own OSS. User B has a `private` RSForm. A imports B’s schema with `clone_source=true` and obtains a durable copy of the private content under A’s ownership.
- **Recommendation:** Before import/clone, require `can_read_library_item(request.user, source)`. Prefer refusing non-clone attach of items the OSS owner cannot read. Mirror library clone tests for private/protected denial.

### 4. Create RSModel may bind `schema` to an inaccessible / private RSForm

- **Severity:** High
- **Location:** `rsconcept/backend/apps/library/serializers/data_access.py` (`LibraryItemCreateSerializer.schema` → `LibraryItem.objects.all()`); `rsconcept/backend/apps/library/views/library.py` `perform_create` (creates `RSModel` with that schema, no ACL check); frontend `form-create-item.tsx` / `schemaCreateLibraryItem` only constrain to items already in the client library cache
- **Description:** API accepts any library item PK as base schema. Model `details` then returns `schema` id and any value bindings. Combined with Finding 1/2, private schema IDs are easy to obtain; binding creates a durable cross-user reference and a foothold for further tooling that assumes “my model ⇒ readable schema”.
- **Attack/Failure scenario:** Attacker creates `item_type=rsmodel` with `schema=<victim_private_rsform_id>`, learns the linkage, and may drive other flows that trust the binding.
- **Recommendation:** On create, require `can_read_library_item` on `schema`, and restrict queryset to RSForms the requester can read. Reject non-RSForm targets.

### 5. Non-OSS clone can place copies into shared `/L` without staff

- **Severity:** High
- **Location:** `rsconcept/backend/apps/library/serializers/data_access.py` (`LibraryItemCloneSerializer.validate` only staff-checks `/L` for OSS); `rsconcept/backend/apps/library/services/clone.py` (`clone_library_item_shell` applies `item_data.location`); contrast `perform_create` / `set_location` which forbid `/L` for non-staff
- **Description:** Create and `set-location` block `LocationHead.LIBRARY` for non-staff. RSForm/RSModel clone does not. OSS clone correctly rejects `/L` for non-staff.
- **Attack/Failure scenario:** Authenticated user clones a readable (e.g. public) schema with `item_data.location: "/L/..."` and publishes into the shared library tree without staff privilege.
- **Recommendation:** Apply the same `/L` staff rule in clone validation for all item types (and ideally validate location format there too).

### 6. Templates list ignores access policy

- **Severity:** High
- **Location:** `rsconcept/backend/apps/library/views/library.py` (`LibraryTemplatesView`); `Anyone` permission; queryset = all `LibraryTemplate.lib_source` rows; test `test_retrieve_templates` uses an otherwise non-active `unowned` item
- **Description:** Any item referenced as a template is returned with full `LibraryItemSerializer` metadata to anonymous/authenticated callers, with no `access_policy` / location filter.
- **Attack/Failure scenario:** If a private or user-folder item is (mistakenly or maliciously via admin) marked as template, its metadata is globally exposed. Content still needs details ACL, but confidentiality of titles/owners/locations is broken.
- **Recommendation:** Restrict templates to public+common/library locations, or require staff to register templates and filter with `get_accessible_items_queryset` for non-staff.

### 7. Public read vs list location rules disagree (unlisted public + IDOR-by-guess)

- **Severity:** Medium
- **Location:** `shared/permissions.py` (`can_read_library_item`, `ItemAnyone`); `LibraryActiveView` / `get_accessible_items_queryset` (public ∧ (`/S`∨`/L`) for non-owners); default `access_policy=public`, `location=/U`
- **Description:** `/library/active` hides public items outside common/library locations from other users, but retrieve/details/clone treat any `public` item as world-readable regardless of folder. IDs are sequential integers.
- **Attack/Failure scenario:** Owner keeps a “quiet” public schema under `/U/...` (absent from others’ library UI). Another user who learns or guesses the ID opens `/api/rsforms/{id}/details` or clones it. Enumeration is trivial if Finding 1/2 remain open.
- **Recommendation:** Align read ACL with list policy (e.g. anonymous/other users only read public items in `/S`∪`/L`, unless owner/editor/staff), or document intentional link-sharing and add non-enumerable IDs / explicit share tokens.

### 8. Editors still see PRIVATE items in `/library/active`

- **Severity:** Medium
- **Location:** `rsconcept/backend/apps/library/views/library.py` (`LibraryActiveView`: `Q(editor__editor=user)` with no `access_policy` filter); contrast `ItemEditor` / `can_read_library_item` (editors denied when `PRIVATE`)
- **Description:** Metadata for private items still appears in the editor’s library list even though open/edit is forbidden. Context search uses the same accessibility pattern via `get_accessible_items_queryset`.
- **Attack/Failure scenario:** After an item is switched to `private`, former or still-listed editors retain title/alias/location/owner metadata via `/library/active` and context search hits.
- **Recommendation:** Exclude `PRIVATE` from editor branch of accessibility querysets (owner/staff only), or clear editors when switching to private.

### 9. `RenameLocationSerializer` never validates `new_location`

- **Severity:** Medium
- **Location:** `rsconcept/backend/apps/library/serializers/basics.py` (`RenameLocationSerializer.validate` checks `attrs['target']` twice); `library.py` `rename_location` uses `str.replace(target, new_location)`
- **Description:** Invalid `new_location` values bypass `validate_location`. Combined with non-anchored `replace`, a short `target` can rewrite unintended path segments.
- **Attack/Failure scenario:** Owner renames with a malformed `new_location`, producing locations that break folder UI assumptions and possibly ACL filters that key off `/S`/`/L`/`/U` prefixes.
- **Recommendation:** Validate `new_location`; rename with prefix-aware logic (`location == target or location.startswith(target + '/')`) instead of raw `str.replace`.

### 10. Create/clone accept unvalidated `location` strings

- **Severity:** Medium
- **Location:** `LibraryItemCreateSerializer` / clone `ItemCloneData` (`fields = '__all__'` / model fields) — no `validate_location`; only `LocationSerializer` / context-search / set-location validate format
- **Description:** Clients can persist locations that fail the documented regex (`LibraryItem.validate_location`), diverging from frontend `validateLocation` checks.
- **Attack/Failure scenario:** API client creates items with odd locations that evade folder filters or confuse shared-library guards that use `startswith(LocationHead.LIBRARY)`.
- **Recommendation:** Centralize location validation on the model or all write serializers (create, clone, rename).

### 11. Fragile owner assignment on create (`request.POST` vs JSON body)

- **Severity:** Medium
- **Location:** `rsconcept/backend/apps/library/views/library.py` `perform_create` (`'owner' not in self.request.POST`); `LibraryItemCreateSerializer` includes `owner` as writable (`read_only_fields` omit `owner`)
- **Description:** JSON API path usually forces `owner=request.user` because `POST` is empty. Form-encoded / multipart requests that include `owner` skip the override and persist client-supplied owner (or null), enabling ownership spoofing / orphaned items.
- **Attack/Failure scenario:** Attacker POSTs `application/x-www-form-urlencoded` with `owner=<victim>` or omits forcing and sets null, creating items attributed to others or without owner.
- **Recommendation:** Always `serializer.save(owner=request.user)`; mark `owner` read-only on create; ignore client `owner`.

### 12. `set_editors` propagation bug on OSS-owned schemas

- **Severity:** Medium
- **Location:** `rsconcept/backend/apps/library/views/library.py` `set_editors` (`if (item.id, user) not in existing_editor_set` should use `schema.id`); also reads `request.data['users']` instead of `serializer.validated_data`
- **Description:** Wrong tuple key can attempt duplicate `Editor` rows on child schemas → unique constraint failure / 500. Using raw `request.data` bypasses serializer normalization edge cases.
- **Attack/Failure scenario:** Owner updates editors on an OSS after some child schemas already have those editors; operation fails mid-transaction or inconsistently updates children.
- **Recommendation:** Use `(schema.pk, user)`; apply `validated_data['users']`; add OSS multi-schema editor tests.

### 13. `read_only` is UI-only; editors can flip it and still mutate via API

- **Severity:** Medium
- **Location:** Frontend `schema-edit-state.tsx` / toolbars gate on `read_only`; backend `ItemEditor` update paths and RSForm/OSS mutating actions do not check `LibraryItem.read_only`
- **Description:** Flag is stored and propagated on OSS owned schemas, but not enforced as a server authorization condition.
- **Attack/Failure scenario:** Collaborator sets `read_only=true` via `PATCH /api/library/{id}` then continues editing through RSForm endpoints; or ignores UI and mutates a “locked” schema.
- **Recommendation:** Enforce `read_only` in `ItemEditor` (allow owner/staff override) or in mutating viewsets; restrict who may change the flag to owners.

### 14. Ownership transfer has no consent and retains editors

- **Severity:** Medium
- **Location:** `library.py` `set_owner` (any target user PK; cascades owner on OSS owned schemas; editors unchanged)
- **Description:** Current owner (or staff) can assign ownership to any account. Editors remain, so the previous collaboration graph follows the item to the new owner without their acknowledgment.
- **Attack/Failure scenario:** Malicious/compromised owner transfers a large OSS (+ owned schemas) onto a victim account (quota/abuse/blame); victim suddenly owns content still editable by prior editors.
- **Recommendation:** Require accept-transfer flow or limit targets; optionally clear editors or notify on transfer.

### 15. OSS deep clone copies source editors onto the new owner’s clone

- **Severity:** Low
- **Location:** `rsconcept/backend/apps/library/services/clone.py` (`_copy_oss_editors`, `_clone_oss_attached_schemas` + `Editor.set`)
- **Description:** Cloning a readable OSS attaches the source editor list to the clone and attached schemas under the cloner’s ownership.
- **Attack/Failure scenario:** User clones a public OSS that lists many editors; those users suddenly gain editor ACL on the clone and see it in `/library/active`.
- **Recommendation:** Default clone editors to empty (or only the new owner); make copying editors explicit/opt-in.

### 16. Shared `/U` location namespace allows cross-user folder pollution

- **Severity:** Low
- **Location:** `LocationHead.USER = '/U'`; `set_location` / create allow any valid `/U/...` path for the owner’s items
- **Description:** Locations are global strings, not per-user sandboxes. Any owner can place items into paths others browse.
- **Attack/Failure scenario:** Attacker sets location to a well-known folder path used by another user and injects misleading items into their folder view (namespaced only by whatever UI conventions users follow).
- **Recommendation:** Namespace user folders (`/U/{user_id}/...`) or restrict rename/set-location under `/U` to paths owned/created by that user.

### 17. CSRF posture is generally sound (residual session risks are environmental)

- **Severity:** Info
- **Location:** `project/settings.py` (`SessionAuthentication`, `CsrfViewMiddleware`, cookie flags); frontend `api-transport.ts` / `csrf-token.ts` (`x-csrftoken`, credentialed CORS)
- **Description:** Mutating library calls from the SPA attach CSRF headers; Django middleware enforces tokens for session auth. Not a library-specific CSRF bypass found in this pass.
- **Attack/Failure scenario:** Classic cross-site form CSRF against session cookies would need missing CSRF validation; current stack appears to block that for the SPA’s cookie auth.
- **Recommendation:** Keep CSRF required for session auth; ensure any future token auth does not accidentally disable CSRF checks on cookie sessions. Continue locking down `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` in production.

### 18. Client-side library filters are not a security boundary

- **Severity:** Info
- **Location:** `use-apply-library-filter.ts`, `library-filter.ts`, `toolbar-search.tsx` (metadata filter local; context search hits `/api/library/context-search`)
- **Description:** Folder/type/owner/visible filters run in the browser on the already-fetched accessible list. Context search uses ORM `icontains` / casefold helpers with allowlisted field names — no injection sink found in query construction.
- **Attack/Failure scenario:** Manipulating frontend filter state cannot reveal items omitted by a correct `/library/active` response; it also cannot hide server leaks from Findings 1–3.
- **Recommendation:** Treat server accessibility querysets as the only trust boundary; keep search field allowlists as they are.

## Positive observations

- Dedicated list APIs are thoughtfully split: `/library/active` (role-aware), `/library/all` (staff), `/library/by-ids` and context search reuse accessibility filtering and have focused tests (including “do not leak linked private schema” in context search).
- Mutating ACL hierarchy is clear: editors for content updates; owners for destroy, `set-owner`, `set-access-policy`, `set-location`, `set-editors`.
- `LibraryItemSerializer` update path marks `owner` / `location` / `access_policy` read-only (mass assignment of those via generic PATCH is blocked; tests assert this).
- Library `clone` checks `can_read_library_item` and rejects private sources; OSS clone has location-diff and `/L` staff rules plus rate limiting (`OssCloneRateThrottle`).
- Frontend CSRF handling for credentialed cross-origin API use is deliberate and aligned with Django session auth.
- Version export/retrieve recently gate on the same item read permission helper as library retrieve.

## Residual risks / untested areas

- Live exploitation against a running deployment (only static/code+test review).
- Full OSS operation graph after non-clone `import-schema` attach of a private schema (how much nested content `OperationSchemaSerializer` exposes in `details`).
- Admin/Django admin paths for `LibraryTemplate` / `LibraryItem` and fixture seeding of templates.
- Agents API / future automation clients that might call library routes without the SPA CSRF flow.
- Performance/DoS of context search over large accessible sets (SQLite casefold full scans).
- Whether `visible=false` is meant to be confidentiality-related (currently UI filter only; owners still see items; not treated as ACL).
- Race conditions on concurrent `set_editors` / ownership transfer / OSS cascade updates.
- Exact production `DEBUG=False` exposure matrix for anonymous vs authenticated on each list route (permissions are action-overridden, so default `IsAuthenticated` does not save Finding 1 for logged-in users).

## Finding counts by severity

| Severity | Count |
| -------- | ----- |
| Critical | 3 |
| High     | 3 |
| Medium   | 8 |
| Low      | 2 |
| Info     | 2 |
| **Total** | **18** |
