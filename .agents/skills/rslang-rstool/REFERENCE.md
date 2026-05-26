# RS language and rstool — reference

## rstool contract

- Package: `rsconcept/rstool` (`@rsconcept/rstool`, private)
- Contract version: `1.2.0` (`CONTRACT_VERSION`)
- Core class: `RSToolAgent`
- Types: `src/models/` (entity-split; `src/models/tool-contract.ts` holds `CONTRACT_VERSION` and `RSToolAgentContract`)

### Methods

| Method                                                      | Purpose                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `createSession(initial?)`                                   | New in-memory session → `{ sessionId, contractVersion }`           |
| `addOrUpdateConstituenta(sessionId, { draft })`             | Merge draft; analyze in session context → `{ state, diagnostics }` |
| `analyzeExpression(sessionId, { expression, cstType })`     | Parse/typecheck snippet without persisting a constituent           |
| `getFormState(sessionId)`                                   | Clone of full session state                                        |
| `listDiagnostics(sessionId, filters?)`                      | Accumulated diagnostics; optional `constituentId` filter           |
| `commitStep(sessionId, message?)`                           | Record revision checkpoint                                         |
| `exportSession(sessionId)`                                  | JSON string `{ contractVersion, state, diagnostics }`              |
| `importSession(payload)`                                    | New session from export                                            |
| `setConstituentaValue(sessionId, { target, type?, value })` | Set one base binding or structured value → `SessionModelState`     |
| `setConstituentaValues(sessionId, { items })`               | Batch set values → `SessionModelState`                             |
| `clearConstituentaValues(sessionId, { items })`             | Clear values by constituent id → `SessionModelState`               |
| `getModelState(sessionId)`                                  | Clone of session interpretation state                              |
| `evaluateExpression(sessionId, { expression, cstType })`    | Evaluate snippet in session context → `EvaluationResult`           |
| `evaluateConstituenta(sessionId, { constituentId })`        | Evaluate stored definition → `EvaluationResult`                    |
| `recalculateModel(sessionId)`                               | Recalculate all inferrable constituents → `{ items[] }`            |

### `ConstituentaDraft`

```ts
{
  id: number;           // stable id within session
  alias: string;        // e.g. "D1", "X1"
  cstType: CstType;     // see SKILL.md table
  definitionFormal: string;
  term?: string;
  definitionText?: string;
  convention?: string;
}
```

Omitted text fields default to `''` in stored state.

### Model and evaluation types

```ts
type RSToolValue = number | RSToolValue[]; // runtime value (sets, tuples, logic 0/1)
type BasicBinding = Record<number, string>; // base-set element labels

interface SessionModelState {
  items: { id: number; type: string; value: RSToolValue | BasicBinding }[];
}

interface EvaluationResult {
  success: boolean;
  value: RSToolValue | BasicBinding | null;
  status: EvalStatus; // 1=NO_EVAL … 7=HAS_DATA
  iterations: number;
  cacheHits: number;
  diagnostics: { code: number; from: number; to: number; params?: string[] }[];
}
```

Base/constant bindings use `type: "basic"` and `value: { "0": "label", … }`. Structured values use normalized typification as `type` and nested arrays for sets/tuples.

### Stdio protocol

Process: `npm run wrapper` → `tsx src/wrapper/stdio-wrapper.ts`

1. **Ready** (no request): `{"id":null,"ok":true,"result":{"ready":true,"wrapper":"rstool-stdio","contractVersion":"1.2.0"}}`
2. **Request**: `{"id":"<unique>","method":"<name>","params":{...}}`
3. **Response**: `{"id":"<same>","ok":true,"result":...}` or `{"id":"...","ok":false,"error":{"code":"...","message":"..."}}`

Extra methods: `ping`, `methods`.

Example chain:

```json
{"id":"1","method":"createSession","params":{}}
{"id":"2","method":"addOrUpdateConstituenta","params":{"sessionId":"…","input":{"draft":{"id":3,"alias":"D1","cstType":"term","definitionFormal":"X1×X1"}}}}
{"id":"3","method":"analyzeExpression","params":{"sessionId":"…","input":{"expression":"1+2","cstType":"term"}}}
{"id":"4","method":"listDiagnostics","params":{"sessionId":"…"}}
{"id":"5","method":"commitStep","params":{"sessionId":"…","message":"checkpoint"}}
{"id":"6","method":"exportSession","params":{"sessionId":"…"}}
{"id":"7","method":"setConstituentaValue","params":{"sessionId":"…","input":{"target":1,"value":{"0":"a","1":"b"}}}}
{"id":"8","method":"evaluateExpression","params":{"sessionId":"…","input":{"expression":"1+2","cstType":"term"}}}
{"id":"9","method":"evaluateConstituenta","params":{"sessionId":"…","input":{"constituentId":3}}}
```

`RSToolWrapperClient`: spawns `npm run wrapper`, implements `waitUntilReady()`, `call(method, params)`, `close()`.

### Analysis result

```ts
interface AnalysisResult {
  success: boolean;
  type: Record<string, unknown> | null; // typification tree from frontend
  valueClass: 'value' | 'property' | null;
  diagnostics: { code: number; from: number; to: number; params?: string[] }[];
}
```

## RS language — conceptual model

From product domain (`CONTEXT.md`):

- **Typification**: computed structure type from a formal definition; grades include elements (`Xi`, `Ci`), `Z`, tuples `(H1×…×Hn)`, sets `ℬ(H)`, logic `Logic`, parameterized `Hr 🠔 [H1,…,Hi]`.
- **Term graph**: directed dependencies between constituenta via alias references in definitions.

Intro (help): language is FOL-based; set vs logic expression split; parameterized templates for term/predicate functions; structural expressions reshape stages.

## Grammar tokens (selected)

From `rslang.grammar`:

| Category               | Tokens / forms                                             |
| ---------------------- | ---------------------------------------------------------- |
| Globals                | `X`, `C`, `S`, `D`, `A`, `T`, `N` + digits (`Global` rule) |
| Functions / predicates | `F<n>`, `P<n>`                                             |
| Radicals               | `R<n>`                                                     |
| Locals                 | `_a-zα-ω` + optional digits                                |
| Logic                  | `¬` `∀` `∃` `⇔` `⇒` `∨` `&`                                |
| Sets                   | `ℬ` `∪` `\` `∆` `∩` `×` `∈` `∉` `⊆` `⊂` …                  |
| Ops                    | `Pr`, `pr`, `Fi`, `card`, `bool`, `debool`, `red`          |
| Literals               | digits, `Z`, `∅`                                           |

Full grammar: `@rsconcept/domain/src/rslang/parser/rslang.grammar` (when installed from npm: `node_modules/@rsconcept/domain/src/rslang/parser/rslang.grammar`).

## Help topic map (companion docs)

Standalone agents should consult the bundled distilled docs (`docs/*.md` inside `@rsconcept/rstool`):

| Topic                                | Bundled doc                                |
| ------------------------------------ | ------------------------------------------ |
| Identifiers, literals                | `docs/SYNTAX.md` § *Identifier rules*      |
| Grades, `Logic`, parameterized types | `docs/TYPIFICATION.md`                     |
| Logical expressions                  | `docs/SYNTAX.md` § *Logical expressions*   |
| Set operators                        | `docs/SYNTAX.md` § *Set-theoretic*         |
| Integer arithmetic                   | `docs/SYNTAX.md` § *Arithmetic*            |
| Structural / typification reshaping  | `docs/TYPIFICATION.md` § *Forming/derived* |
| Quantifiers                          | `docs/SYNTAX.md` § *Quantifiers*           |
| Parameterized functions, templates   | `docs/SYNTAX.md` § *Parameterised*         |
| Correctness / validation mindset     | `docs/SYNTAX.md` § *Correctness model*     |
| Domain vocabulary                    | `docs/DOMAIN.md`                           |
| Constituent fields and ordering      | `docs/CONSTITUENTA.md`                     |
| Portal REST API                      | `docs/PORTAL-API.md`                       |
| Grammar tokens / precedence          | `docs/GRAMMAR-REF.md`                      |

For Portal contributors, the original in-app HTML help lives under `rsconcept/frontend/src/features/help/items/rslang/help-rslang-*` and is the source from which `docs/*.md` is distilled.

## Error codes (rstool-relevant)

rstool re-exports `RSErrorCode.definitionNotAllowed` (`0x8862`) for base/constant violations.

Full enum: `@rsconcept/domain/src/rslang/error.ts` (`RSErrorCode`). Categories and per-code fix guidance: `docs/DIAGNOSTICS.md`.

Categories:

- `0x84xx` — syntax / parse
- `0x28xx` — local declaration warnings
- `0x88xx` — semantic / type
- `0x886x` — constituent-level (empty derived, definition not allowed)
- `0x81xx` — evaluation (runtime; returned by `evaluateExpression` / `evaluateConstituenta`)

## Source map for code changes

| Area                      | Path                                                            |
| ------------------------- | --------------------------------------------------------------- |
| Analyzer                  | `rsconcept/domain/src/rslang/semantic/analyzer.ts`              |
| RSForm analysis entry     | `rsconcept/domain/src/library/rsform-api.ts` (`getAnalysisFor`) |
| rstool analysis adapter   | `rsconcept/rstool/src/mappers/schema-adapter.ts`                |
| rstool evaluation adapter | `rsconcept/rstool/src/mappers/model-adapter.ts`                 |
| Domain evaluator          | `rsconcept/domain/src/library/rsengine.ts`                      |
| Tests                     | `rsconcept/rstool/src/models/rstool-agent.test.ts` (colocated)  |
| Sample export             | `rsconcept/rstool/examples/sample-rsform-session.json`          |
| Sample model export       | `rsconcept/rstool/examples/sample-rsmodel-session.json`         |

## Sample session shape

After `npm run example:build-schema`, export contains `state.items[]` each with `alias`, `cstType`, `definitionFormal`, and nested `analysis`, plus `state.model.items[]` when values are set — use as a golden pattern for agent-generated JSON.
