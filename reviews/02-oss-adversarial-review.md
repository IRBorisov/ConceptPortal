# Adversarial Review: OSS

## Scope

- Frontend: `rsconcept/frontend/src/features/oss/**` (graph UI, dialogs, API hooks, side panel)
- Backend: `rsconcept/backend/apps/oss/**` (models, serializers, views, propagation)
- Related: library item permissions (`shared/permissions.py`), linked RSForms (`Operation.result`), library delete/clone paths that touch OSS propagation

Out of scope for deep testing: full propagation algebra correctness under every formula edit, admin UI, Docker/ops.

## Executive summary

OSS mutation endpoints correctly gate on **OSS ItemEditor** and generally bind operation/block PKs to the target OSS. Several critical gaps remain around **linked RSForm access control**: `import-schema` / `set-input` do not require read permission on the source schema (unlike `inline_synthesis`), so an OSS editor can attach or clone private schemas and exfiltrate content via synthesis execution. Shared schema linking across OSS graphs plus a weak `is_import` / `delete_schema` heuristic creates **cascade-delete surprises**. Graph cycle prevention and “do not delete intermediate synthesis” exist **only on the frontend**. Layout is a client-authoritative last-write-wins blob with no concurrency token. Propagation of argument/substitution edits on executed graphs is powerful and intentional for editors, but unsafe when arguments include unauthorized content.

## Findings

### 1. Critical — Import / link RSForm without read permission (private schema exfiltration)

**Location:** `rsconcept/backend/apps/oss/views/oss.py` (`import_schema`, `set_input`); `rsconcept/backend/apps/oss/serializers/data_access.py` (`ImportSchemaSerializer`, `SetOperationInputSerializer`)

**Description:** `ImportSchemaSerializer.source` accepts any RSForm PK. Neither `import_schema` nor `set_input` calls `can_read_library_item`. Contrast with `inline_synthesis` in `rsconcept/backend/apps/rsform/views/rsforms.py`, which explicitly denies unread sources. `clone_source=True` copies constituents via `insert_from` into a new schema owned by the OSS owner. Linking (`clone_source=False` / `set-input`) then `execute-operation` / `create-synthesis` also copies private content into an OSS-owned result.

**Attack / failure scenario:** Attacker creates an OSS they own, enumerates or guesses a private RSForm id, `POST /api/oss/{id}/import-schema` with `clone_source: true` (or link + synthesis execute). Private constituenta content becomes attacker-owned.

**Recommendation:** Require `can_read_library_item(request.user, source)` on import and set-input (and before synthesis `insert_from` of any linked operand). Reject clone/link of inaccessible items with 403. Add regression tests mirroring `inline_synthesis` and library clone forbidden cases.

---

### 2. Critical — Cross-OSS shared INPUT schemas + `delete_schema` cascade

**Location:** `views/oss.py` (`set_input`, `import_schema`, `delete_operation`); `serializers/data_access.py` (`DeleteOperationSerializer`, `OperationSchemaSerializer.is_import`); `frontend/.../dlg-delete-operation.tsx`

**Description:** `set_input` only forbids (a) attaching a non-INPUT producer result and (b) duplicate attach **within the same OSS**. The same RSForm may be an INPUT result in multiple OSS graphs. `is_import` is true only when `owner`/`location` differ from the OSS — same-owner/same-location shared schemas look “owned”. UI defaults `delete_schema=True` for non-import INPUT without additions. Backend deletes the LibraryItem after `before_delete_schema`, which walks **all** OSS hosts via `PropagationFacade._get_oss_hosts`.

**Attack / failure scenario:** User links schema S into OSS_A and OSS_B (same owner/location). Deleting the operation in OSS_A with `delete_schema=true` destroys S and rewrites/clears inherited content in OSS_B’s synthesis chain. No warning that other OSS still reference S.

**Recommendation:** Track exclusive ownership of a result (or refuse linking a schema already used as `Operation.result` elsewhere unless explicitly shared). Block `delete_schema` when other operations still reference the schema. Align UI `is_import` / defaults with multi-host references.

---

### 3. High — No backend cycle checks on synthesis arguments

**Location:** `serializers/data_access.py` (`CreateSynthesisSerializer`, `UpdateOperationSerializer`); frontend `oss-flow.tsx` / `tab-arguments.tsx` (client-only guards)

**Description:** Frontend prevents self-edges and cycles when connecting or picking arguments. Serializers only verify arguments belong to the same OSS and substitution schema membership. API clients can create cycles (A→B→A), self-arguments, or edges that make `topologicalOrder` / propagation unsafe.

**Attack / failure scenario:** `PATCH .../update-operation` with `arguments` forming a cycle. Subsequent layout/propagation/UI loads may error, hang on topo sort, or corrupt inherited constituents.

**Recommendation:** Server-side DAG validation (reject self, reject path from target into new argument). Mirror frontend `expandAllOutputs` / replica rules. Add adversarial API tests.

---

### 4. High — Delete synthesis with downstream dependents (frontend-only guard)

**Location:** `frontend/.../oss-edit-state.tsx` (`canDeleteOperation`); `serializers/data_access.py` (`DeleteOperationSerializer`); `OperationSchemaCached.delete_operation`

**Description:** UI blocks deleting a SYNTHESIS that still has graph outputs. Backend `DeleteOperationSerializer` only rejects REPLICA targets — not “has descendants” / “used as argument”. Deleting an intermediate synthesis removes Argument rows (CASCADE) and inheritance cleanup, leaving child synthesis operations with broken inputs.

**Attack / failure scenario:** Editor or script deletes intermediate synthesis via API while children remain → orphaned synthesis nodes, missing arguments, inconsistent inheritance.

**Recommendation:** Enforce the same policy on the server (403/400 if outputs exist, or require explicit cascade flags). Document intended behavior if cascade delete of dependents is desired.

---

### 5. High — Layout last-write-wins / concurrent overwrite

**Location:** `models/Layout.py` (`update_data`); nearly all mutating OSS actions accept client `layout`; frontend `use-get-layout.ts`

**Description:** Layout is a full JSON blob replaced atomically with no `time_update` / version precondition. Every create/delete/move/execute ships the caller’s full layout. Concurrent editors (or two tabs) race: stale layout restores deleted nodes’ positions, drops newly created nodes, or wipes coordinates.

**Attack / failure scenario:** User A creates an operation; User B’s delayed `update-layout` or mutation with stale layout overwrites and loses A’s node (or restores tombstoned positions). Malicious client sends `data: []` and blanks the graph layout.

**Recommendation:** Optimistic concurrency (If-Match / `time_update` / layout revision). Prefer server-side merge of single-node patches. Reject layouts missing known nodeIDs or containing unknown IDs when mutating structure.

---

### 6. High — Relocate constituents: global Argument check, weak OSS binding

**Location:** `serializers/data_access.py` (`RelocateConstituentsSerializer`); `views/oss.py` (`relocate_constituents`)

**Description:** Connectivity is validated via `Argument.objects.filter(...)` **without** scoping to the OSS in the URL. Source/destination are not required to be results of operations in that OSS at serializer time. Runtime uses `OssCache.get_operation`, which raises `ValueError` (likely 500) if the schema is absent from this OSS. If the same schemas are linked into the caller’s OSS while Argument edges exist in another OSS, relocate can mutate inheritance using a mismatched graph context.

**Attack / failure scenario:** Shared INPUT schemas across OSS_A (real synthesis edge) and OSS_B (linked copies). Editor of OSS_B calls `relocate-constituents` using IDs that pass the global Argument check → inheritance/substitution mutations driven by OSS_B’s cache.

**Recommendation:** Require source and destination to be non-replica results in **this** OSS, and require the connecting Argument to belong to an operation in this OSS. Map missing operations to 400, not 500.

---

### 7. Medium — `update-operation` forces metadata onto SYNTHESIS results without edit check

**Location:** `views/oss.py` (`update_operation`, lines syncing `operation.result`)

**Description:** For linked results, alias/title/description are written if `can_edit_item` **or** `operation_type == SYNTHESIS`. The SYNTHESIS bypass updates LibraryItem metadata even when the caller cannot edit that RSForm (e.g. ownership/editor drift).

**Attack / failure scenario:** OSS editor renames a synthesis operation; result schema metadata is overwritten despite the user lacking RSForm edit rights.

**Recommendation:** Always require `can_edit_item` for result metadata sync, or ensure synthesis results always share editors with the OSS and drop the bypass.

---

### 8. Medium — `get-predecessor` is unauthenticated and unbound to OSS read rights

**Location:** `views/oss.py` (`get_predecessor`); permissions `Anyone`

**Description:** Any caller can POST a constituenta id and walk `Inheritance` to the root, receiving `{id, schema}`. No `can_read_library_item` on intermediate or root schemas. Enables probing private inheritance chains and schema ids given sequential/leaked constituenta ids.

**Attack / failure scenario:** Anonymous client enumerates constituenta ids; discovers private schema ids and inheritance topology.

**Recommendation:** Require authentication and read access to the constituenta’s schema (and optionally to the predecessor schema). Prefer ItemAnyone on the owning schema.

---

### 9. Medium — `clone-schema` incomplete copy and fragile `pk = None` mutation

**Location:** `views/oss.py` (`clone_schema`)

**Description:** Clones by setting `pk = None` on the source LibraryItem/Constituenta/Operation objects in memory and saving. Unlike `import_schema` clone (`insert_from`), attributions (and other related rows) are not copied. In-memory source instances are left pointing at the new PK until GC — fragile under future refactors.

**Attack / failure scenario:** User clones a schema expecting a faithful duplicate; attributions/links silently missing → wrong formal semantics downstream in synthesis.

**Recommendation:** Reuse `insert_from` / library clone helpers; do not mutate serializer-loaded instances in place.

---

### 10. Medium — Client-authoritative layout can desync from graph structure

**Location:** `LayoutSerializer` / `NodeSerializer`; all endpoints that `Layout.update_data(pk, layout)` after structural changes

**Description:** NodeID format is unconstrained beyond being a string. Server appends new nodes to the client-supplied list but does not reconcile orphans, duplicates, or missing entries for surviving operations/blocks (except filtering the deleted node on delete). Stale or malicious layouts persist indefinitely.

**Attack / failure scenario:** Mutation sends layout omitting existing nodes or inventing `nodeID`s; graph UI positions corrupt; later deletes filter only exact ids.

**Recommendation:** After every structural mutation, rebuild layout from DB operations/blocks + submitted positions for known ids only.

---

### 11. Medium — Side-panel mutability tied to OSS role, not RSForm ACL (partially mitigated)

**Location:** `side-panel.tsx` (`isMutable && !(INPUT && is_import)`); RSForm mutation hooks

**Description:** Side panel enables edits when the user can edit the OSS and the operation is not an imported INPUT. Backend RSForm endpoints still enforce ItemEditor on the schema. SYNTHESIS / owned INPUT results usually share editors via `create_input`, but edge cases (editor list drift, staff/admin mode) can show editable chrome that fails — or, with finding #7, OSS updates can still touch synthesis metadata.

**Attack / failure scenario:** Confused deputy UX; user believes sidebar edits apply when schema ACL differs.

**Recommendation:** Derive `isMutable` from actual `can_edit` for the loaded RSForm (or a dedicated capability flag from details).

---

### 12. Low — Empty / invalid synthesis execute paths

**Location:** `OperationSchema.execute_operation` / `OperationSchemaCached.execute_operation`

**Description:** If no argument has a `result`, execute returns without creating a result (non-cached path returns `None`/early). `create-synthesis` still creates the operation and may leave a synthesis node with no result and no clear error.

**Attack / failure scenario:** Crafted create-synthesis with empty-result arguments → confusing graph state; later execute may succeed after set-input races.

**Recommendation:** Reject synthesis create/execute when fewer than two resolvable schemas (or product rule) are present.

---

### 13. Low — OssViewSet list/retrieve defaults to `Anyone` without queryset ACL filter

**Location:** `views/oss.py` (`get_permissions` else branch); `queryset = LibraryItem.objects.filter(item_type=OPERATION_SCHEMA)`

**Description:** Unscoped list of all OSS LibraryItems may be exposed via `/api/oss` if the router list action is reachable. Library list filtering is stricter. Details correctly use `ItemAnyone` (private forbidden).

**Attack / failure scenario:** Anonymous `GET /api/oss` enumerates private OSS titles/ids/owners if list is enabled.

**Recommendation:** Filter queryset like `LibraryViewSet.get_queryset`, or disable list; use ItemAnyone consistently.

---

### 14. Info — Powerful live rewiring of executed synthesis

**Location:** `OperationSchemaCached.set_arguments` / `set_substitutions`; tests in `t_operations.py` (`test_change_arguments`, `test_change_substitutions`)

**Description:** Updating arguments/substitutions on an **already executed** synthesis intentionally rewrites descendant constituents (inherit/delete/substitute). This is a product feature for editors but amplifies any permission gap on linked sources and concurrent edit races.

**Attack / failure scenario:** Hostile co-editor rapidly rewires arguments to strip or reshape large synthesis trees; other users lose work without per-schema locks.

**Recommendation:** Consider explicit “rebuild” vs “edit wiring” modes, confirmations for destructive rewires, and concurrency controls on result schemas.

---

### 15. Info — Frontend multi-select delete limited; API is single-target

**Location:** `oss-edit-state.tsx` (`canDeleteSelected`); delete endpoints

**Description:** UI only allows deleting a single selected node/edge. Not a vulnerability; reduces bulk accidents. API remains single-operation deletes.

**Attack / failure scenario:** N/A (hardening observation).

**Recommendation:** Keep server single-target; if bulk delete is added later, require explicit cascade policy.

## Positive observations

- Mutating actions consistently require `ItemEditor` on the OSS LibraryItem; anonymous/unowned edits are covered by tests (`t_oss.py`, `t_operations.py`).
- Most serializers bind `target` / children / parents to `oss_id` (operationNotInOSS / blockNotInOSS), blocking trivial cross-OSS IDOR on operation PKs.
- Block parent cycle checks exist server-side (`_collect_ancestors` / `_collect_descendants`).
- Substitution validation enforces argument-schema membership, no double-delete, no same-schema trivial pairs.
- `delete_schema` refuses schemas whose owner/location are not synced with the OSS (partial protection for true imports).
- Side panel treats `is_import` INPUT as read-only at UI level.
- Propagation facade correctly fans out CST changes to all OSS hosts of a schema; delete-schema path attempts host cleanup before delete.
- Frontend connect/argument pickers implement cycle prevention (must be mirrored server-side).
- Cross-tab OSS sync (`oss-sync`) and mutating locks (`useMutatingOss`) reduce some accidental double-submit races in the UI.

## Residual risks / untested areas

- Full adversarial fuzz of `PropagationEngine` under cyclic graphs, missing inheritance rows, and concurrent CST edits on shared linked schemas.
- Whether `Graph.topologicalOrder` throws or infinite-loops on cycles (frontend assumes DAG).
- Permission matrix for staff + `adminMode` editing private linked schemas through the side panel.
- Throttling / payload size limits on layout JSON and large substitution lists (DoS).
- Clone OSS library path vs in-graph `clone-schema` parity (attributions, versions, editors).
- Race between `set-input` swapping a schema that is mid-propagation in another OSS host.
- E2E confirmation that `/api/oss` list is unused/blocked in production gateway configs.
- Formal verification that `keep_constituents=true` never leaves dangling Inheritance/Substitution FKs under replica delete variants.

---

## Finding counts by severity

| Severity | Count |
|----------|------:|
| Critical | 2 |
| High     | 4 |
| Medium   | 5 |
| Low      | 2 |
| Info     | 2 |
| **Total** | **15** |
