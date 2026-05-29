# RS language and rstool — reference

## rstool contract

- Package: `@rsconcept/rstool`
- Contract version: `1.2.0` (`CONTRACT_VERSION`)
- Core class: `RSToolAgent`
- Public imports: `@rsconcept/rstool` and `@rsconcept/rstool/wrapper`

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
  cstType: CstType;     // see GUIDE.md table
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

Process: `npx rstool-wrapper`

1. **Ready** (no request): `{"id":null,"ok":true,"result":{"ready":true,"wrapper":"rstool-stdio","contractVersion":"1.2.0"}}`
2. **Request**: `{"id":"<unique>","method":"<name>","params":{...}}`
3. **Response**: `{"id":"<same>","ok":true,"result":...}` or `{"id":"...","ok":false,"error":{"code":"...","message":"..."}}`

Extra methods: `ping`, `methods`.

Example chain:

```json
{"id":"1","method":"createSession","params":{}}
{"id":"2","method":"addOrUpdateConstituenta","params":{"sessionId":"…","input":{"draft":{"id":2,"alias":"S1","cstType":"structure","definitionFormal":"ℬ(X1×X1)"}}}}
{"id":"2b","method":"addOrUpdateConstituenta","params":{"sessionId":"…","input":{"draft":{"id":3,"alias":"D1","cstType":"term","definitionFormal":"Pr1(S1)"}}}}
{"id":"3","method":"analyzeExpression","params":{"sessionId":"…","input":{"expression":"1+2","cstType":"term"}}}
{"id":"4","method":"listDiagnostics","params":{"sessionId":"…"}}
{"id":"5","method":"commitStep","params":{"sessionId":"…","message":"checkpoint"}}
{"id":"6","method":"exportSession","params":{"sessionId":"…"}}
{"id":"7","method":"setConstituentaValue","params":{"sessionId":"…","input":{"target":1,"value":{"0":"a","1":"b"}}}}
{"id":"8","method":"evaluateExpression","params":{"sessionId":"…","input":{"expression":"1+2","cstType":"term"}}}
{"id":"9","method":"evaluateConstituenta","params":{"sessionId":"…","input":{"constituentId":3}}}
```

`RSToolWrapperClient`: spawns `rstool-wrapper` by default and implements `waitUntilReady()`, `call(method, params)`, `close()`.

### Analysis result

```ts
interface AnalysisResult {
  success: boolean;
  type: Record<string, unknown> | null; // typification tree
  valueClass: 'value' | 'property' | null;
  diagnostics: { code: number; from: number; to: number; params?: string[] }[];
}
```

## RS language — conceptual model

- **Typification**: structure type of an expression; grades include elements (`Xi`, `Ci`), `Z`, tuples `(H1×…×Hn)`, sets `ℬ(H)`, logic `Logic`, parameterized `Hr 🠔 [H1,…,Hi]`. On `structure` (`S#`), `definitionFormal` **is** the typification. On `term` (`D#`), typification is **inferred from** the definition.
- **Term graph**: directed dependencies between constituenta via alias references in definitions.
- **`S#` vs `D#`**: same `×` token — in `ℬ(X1×X1)` on `S#` it forms a **grade** (pair type); in `X1×X1` on `D#` it is the **Cartesian product** (all pairs). Relations: `S#` + `convention`, then derived `D#` (`Pr1(S1)`, …).

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

Full grammar pointers and precedence notes: `docs/GRAMMAR-REF.md`.

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
| Definition semantic tests            | `docs/MODEL-TESTING.md`                    |
| Domain vocabulary                    | `docs/DOMAIN.md`                           |
| Constituent fields and ordering      | `docs/CONSTITUENTA.md`                     |
| Portal REST API                      | `docs/PORTAL-API.md`                       |
| Grammar tokens / precedence          | `docs/GRAMMAR-REF.md`                      |

## Error codes (rstool-relevant)

rstool re-exports `RSErrorCode.definitionNotAllowed` (`0x8862`) for base/constant violations.

Categories and per-code fix guidance: `docs/DIAGNOSTICS.md`.

Categories:

- `0x84xx` — syntax / parse
- `0x28xx` — local declaration warnings
- `0x88xx` — semantic / type
- `0x886x` — constituent-level (empty derived, definition not allowed)
- `0x81xx` — evaluation (runtime; returned by `evaluateExpression` / `evaluateConstituenta`)

## Exported session shape

`exportSession(sessionId)` returns a JSON string with `{ contractVersion, state, diagnostics }`.

- `state.items[]` contains each constituent with `id`, `alias`, `cstType`, `definitionFormal`, optional text fields, and nested analysis output.
- `state.model.items[]` is present when interpretation values have been set.
- `diagnostics[]` contains accumulated diagnostics with offsets and codes.
