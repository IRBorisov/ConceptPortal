# Concept Portal — UX & Feature Completeness Review

**Date:** 2026-08-04  
**Scope:** Frontend product surfaces (`rsconcept/frontend/src/features/*`, app shell)  
**Method:** 10 parallel feature reviews (Library, RSForm, OSS, RSModel, Help, Onboarding, AI, Sandbox, Auth/Users, Home/Graphs)

---

## Cross-cutting themes

1. **Dead-end information** — Stats, filters, and statuses are visible but often do not navigate (passport stats, OSS counts, eval pills).
2. **Silent / half-wired workflows** — Layout save, synthesis submit, structure planner abort, filter state, AI context.
3. **Discoverability silos** — Power features live in menus/shortcuts; tours historically auto-started only in Sandbox.
4. **Mobile parity gaps** — Library search, graph toolbars, sandbox handoff, help sidebar.
5. **Handoff friction** — Sandbox→library, schema↔OSS↔model, BadgeHelp full-page reload (pre-fix).

---

## Portfolio priorities

| Priority    | Vector                                                                                                                                 | Features                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **P0 bugs** | Digit2 shortcut mismatch; sandbox stale bundle after library transfer; password-change keeps session; ASSISTANT missing from help tree | OSS, Sandbox, Auth, Help          |
| **P0 UX**   | Actionable passport/stats; unsaved layout / dirty-state; Escape-to-pause tours; gate sandbox “save to library” for guests              | RSModel, OSS, Onboarding, Sandbox |
| **P1**      | In-library row actions; List-tab filter parity; synthesis submit guardrails; contextual AI entry; home tiles → editors                 | Library, RSForm, OSS, AI, Home    |
| **P1**      | Empty-state CTAs; inherited-CST banners; AI result quality warnings                                                                    | Multiple                          |
| **P2**      | Graph search/minimap; shareable graph URL state; live RSLang validation; guided synthesis wizard; starter-bundle gallery               | Graphs, RSForm, OSS, Sandbox      |

---

## By feature

### Library

**Strengths:** Browse/open, folder tree, desktop search, persisted filters, tour.

**Top vectors:**

1. In-library item actions (move/clone/delete) — currently editor-only
2. Mobile search parity (context search / owner / export hidden)
3. Smarter empty & filter reset (reset cleared folder; generic empty copy)
4. Type discoverability beyond row color
5. Dead paths: `path` filter, `library_filter` URL unused

### RSForm

**Strengths:** Rich editor (tabs, graph, templates, AST, structure planner, synthesis).

**Top vectors:**

1. Unsaved-changes / dirty flag on tab switch
2. List tab filter UI missing while filters still apply
3. Expression validation is analyze-on-demand
4. Structure planner silent failure
5. Inherited CST under-explained; mobile toolbars trimmed

### OSS

**Strengths:** Blocks, synthesis, import/clone, side panel, export, tours.

**Top vectors:**

1. Layout persistence without dirty indicator
2. Synthesis guardrails (empty args, invalid substitutions)
3. Multi-select half-implemented
4. Digit2 keyboard bug (synthesis vs create schema)
5. Empty canvas / first-time guidance; graph search/minimap

### RSModel

**Strengths:** Engine sync, eval taxonomy, bindings, shortcuts, tours, schema↔model links.

**Top vectors:**

1. Passport stats not actionable
2. Data tab overload (concept fields + values)
3. Evaluation feedback loop (toast-only recalculate; cache UX evaluator-only)
4. `describeEvalStatus` unused in live UI
5. Limited E2E beyond passport

### Help

**Strengths:** 61 topics, en/ru/fr parity, search overrides, strong editor wiring.

**Top vectors:**

1. Uneven BadgeHelp placement (sandbox tabs, schema/model menus)
2. ASSISTANT hierarchy bug
3. Search: no body indexing, 12-result cap
4. BadgeHelp full reload (SPA break)
5. Thin API/assistant/video surfaces

### Onboarding

**Strengths:** Mature engine, 17 tours, locale validation, interact cutouts.

**Top vectors:**

1. Discoverability outside Sandbox (auto-offer)
2. Escape only dismissed nested subtours
3. BadgeHelp always restarts (no Resume)
4. No tours for create / AI / profile
5. Thin practice (`interact`) coverage

### AI

**Strengths:** Variable system, CRUD, sharing, generator dialog.

**Top vectors:**

1. Global-menu silo (no schema/OSS/model toolbar entry)
2. Incomplete context (`model`/`operation` unused; sandbox unwired)
3. Empty states / create dialog without body
4. Result tab silent `!var!` failures
5. Russian-hardcoded prompt serialization

### Sandbox

**Strengths:** Guest-friendly learning shell, shared editors, IndexedDB, tours, starter bundle.

**Top vectors:**

1. Stale module cache after library → sandbox transfer
2. Guest create-to-library without auth gate
3. Persistent “local only” signaling
4. Passport schema/model title divergence
5. Create-new-only handoff (no update-existing)

### Auth / Users

**Strengths:** Login/signup/restore/reset, profile, BroadcastChannel sync, i18n.

**Top vectors:**

1. Password change without logout/session end
2. Reset-token page polish
3. Cross-tab navigation + role-store hygiene
4. Role mode poorly explained
5. No sessions / 2FA / email verify (backend too)

### Home / Graphs / Navigation

**Strengths:** Tab/`active` deep links; schema↔model query preservation; feature-rich term graph.

**Top vectors:**

1. Home tiles → manuals instead of product
2. No editor breadcrumbs / clickable title
3. Graph filters localStorage-only (not shareable)
4. Focus mode discoverability
5. Graph toolbar inconsistency (term vs OSS vs readonly)

---

## Quick wins implemented (2026-08-04)

| Area       | Change                                                                              |
| ---------- | ----------------------------------------------------------------------------------- |
| OSS        | `Digit2` → create schema; synthesis requires ≥1 argument + valid substitutions      |
| Sandbox    | Bundle cache cleared on `saveBundle`; guests see Login instead of create-to-library |
| Auth       | Password change logs out before redirect                                            |
| Help       | `ASSISTANT` under INFO; BadgeHelp SPA navigation                                    |
| RSForm     | List filter/reset UI; structure-planner toast; dirty flag cleared after tab change  |
| RSModel    | Passport model-issue stats → filtered Data tab                                      |
| Onboarding | Library intro auto-offers; Escape session-dismisses any active tour                 |
| Home       | RSForm/RSModel/OSS tiles → create flows                                             |
| AI         | Empty states; “Generate prompt” label; unresolved-variable warning                  |
| Library    | Reset keeps folder; clear-folder control; type icon column                          |

---

## Larger bets (not started)

1. Row action menu + bulk ops on Library
2. Live / debounced RSLang validation + unified constituent editor
3. Guided synthesis workflow + graph search/focus
4. Evaluation dashboard + interpretation wizard
5. Full-text help search + video catalog
6. Tour catalog UI + create/AI/profile tours
7. Contextual AI entry points + locale-aware serialization
8. Sandbox workspace manager + auth-aware handoff wizard
9. Session management / email verification
10. URL-encoded graph view state + editor breadcrumb bar

---

## Suggested verification

- [x] Lint: `pnpm --filter frontend run lint` — pass (after lintFix for CRLF/import sort)
- [x] E2E Chrome: `pnpm --filter frontend run test:e2e` (35 tests) — pass against preview
- [ ] Manual: OSS shortcuts `1`–`4`, create synthesis without arguments blocked
- [ ] Manual: Library reset vs clear folder; type icons visible
- [ ] Manual: Library intro invitation on first `/library` visit; Escape dismisses tour
- [ ] Manual: Profile password change lands on login form (session ended)
- [ ] Manual: Help badge opens manuals without full reload
- [ ] Manual: Model passport issue stats navigate to Data tab

**Note:** Library intro auto-start matches exact `/library` only (not `/library/create`). E2E suppresses auto-start tours via `tests/setup.ts` unless `portal.onboarding.e2e-allow-auto` is set.
