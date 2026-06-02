# rstool Examples

Short examples for agents. For full scripts, see `../../examples/`.

## Minimal Session

`S1` carries typification `ℬ(X1×X1)` for relation pairs. `D1` computes `Pr1(S1)`. Do not put bare `X1×X1` on a `term` when you mean a relation structure.

```ts
import { CstType, RSToolAgent } from '@rsconcept/rstool';

const tool = new RSToolAgent();
const { sessionId } = tool.createSession();

tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
});

tool.addOrUpdateConstituenta(sessionId, {
  draft: {
    id: 2,
    alias: 'S1',
    cstType: CstType.STRUCTURED,
    definitionFormal: 'ℬ(X1×X1)',
    convention: 'Elements are (parent, child) pairs with parent, child ∈ X1.'
  }
});

const { state, diagnostics } = tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 3, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'Pr1(S1)' }
});

console.log(state.analysis.success, diagnostics.length);
```

## Analyze Before Upsert

Use scratch analysis when syntax or `cstType` is uncertain.

```ts
const analysis = tool.analyzeExpression(sessionId, {
  expression: 'Pr1(S1)',
  cstType: CstType.TERM
});

if (!analysis.success) {
  console.log(analysis.diagnostics.map(({ code, from, to }) => ({ code, from, to })));
}
```

Fix the reported `from` / `to` range, then re-run analysis. Do not retry unchanged input.

## Wrapper Client

Use the wrapper when the agent talks to a separate `rstool-wrapper` process.

```ts
import { CstType } from '@rsconcept/rstool';
import { RSToolWrapperClient } from '@rsconcept/rstool/wrapper';

const client = new RSToolWrapperClient();
await client.waitUntilReady();

const { sessionId } = await client.call<{ sessionId: string }>('createSession');

await client.call('addOrUpdateConstituenta', {
  sessionId,
  input: {
    draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
  }
});

const diagnostics = await client.call('listDiagnostics', { sessionId });
console.log(diagnostics);

await client.close();
```

Manual stdio is one JSON request per line:

```jsonl
{ "id": "1", "method": "createSession", "params": {} }
{ "id": "2", "method": "addOrUpdateConstituenta", "params": { "sessionId": "...", "input": { "draft": { "id": 1, "alias": "X1", "cstType": "basic", "definitionFormal": "" } } } }
```

## Export / Import

```ts
const payload = tool.exportSession(sessionId);
const restored = tool.importSession(payload);
```

Export includes session state and model values.

To create files the user can upload to an existing Portal object:

```ts
const schemaJson = tool.exportPortalSchema(sessionId);
const modelJson = tool.exportPortalModel(sessionId);
```

Use `schemaJson` on a schema page and `modelJson` on a model page via **Load from JSON**.

## Evaluation

```ts
tool.setConstituentaValue(sessionId, {
  target: 1,
  value: { 0: 'zero', 1: 'one' }
});

const scratch = tool.evaluateExpression(sessionId, {
  expression: '1+2',
  cstType: CstType.TERM
});

console.log(scratch.success, scratch.value); // true, 3
```

For stored definitions, set values for `basic`, `constant`, and `structure`, then call `evaluateConstituenta` or `recalculateModel`.

## Semantic Smoke Test

When syntax is valid but meaning is uncertain, build a tiny model and assert the value.

```ts
import { CstType, EvalStatus, RSToolAgent } from '@rsconcept/rstool';

const TUPLE_ID = -111;
const tool = new RSToolAgent();
const { sessionId } = tool.createSession();

tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
});
tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 2, alias: 'S1', cstType: CstType.STRUCTURED, definitionFormal: 'ℬ(X1×X1)' }
});
tool.addOrUpdateConstituenta(sessionId, {
  draft: { id: 3, alias: 'D1', cstType: CstType.TERM, definitionFormal: 'Pr1(S1)' }
});

tool.setConstituentaValues(sessionId, {
  items: [
    { target: 1, value: { 0: 'ann', 1: 'bob', 2: 'cat' } },
    {
      target: 2,
      value: [
        [TUPLE_ID, 0, 1],
        [TUPLE_ID, 0, 2]
      ]
    }
  ]
});

const result = tool.evaluateConstituenta(sessionId, { constituentId: 3 });

if (!result.success || result.status !== EvalStatus.HAS_DATA || JSON.stringify(result.value) !== '[0]') {
  throw new Error(`Expected Pr1(S1) to select the first coordinate; got ${JSON.stringify(result)}`);
}
```

Use this pattern for tests that protect important definitions. Full kinship model: `../../examples/build-kinship-rsmodel.ts`. More notes: `../../docs/MODEL-TESTING.md`.

## Relation-first synthesis (layered KS)

Pattern for merging sub-schemas (transformation + transition + choice → stimulation). Reference: Portal `D01B03` / rsform `843`.

1. **Structures** — one `S#` per mechanism, typification only:

```text
S1: ℬ(X1×X2×X1)   // transformation
S2: ℬ(X2×X3×X2)   // transition
S4: ℬ(X2×X1×X3)   // allowance (flat triple, not ℬ(X2×X1×ℬ(X3)))
S5: ℬ(X1×ℬ(X3)×X3) // choice
```

2. **Axioms** — short invariants:

```text
A1: Pr1,2(S1) = X1×X2
A2: card(S1) = card(Pr1,2(S1))
A4: card(S5) = card(Pr1,2(S5))
A5: ∀d∈S5 pr3(d)∈pr2(d)
```

3. **Functions** — parameterized access (reuse everywhere):

```text
F5[α,β] := Pr3(Fi1,2[{(β,α)}](S4))   // possible actions
F7[α,ξ] := F6[α, F5[α,ξ]]            // chosen action in situation
```

4. **Central term** — one tuple relation, then projections:

```text
D13 ::= I{(α,ξ1,τ,ξ2,β1,β2,ρ,ξ3) | α∈S6; ξ1∈X2; τ∈F7[α,ξ1]; …; ξ3∈S3}
D14 := Pr3(D13)   // stimuli
D18 := Pr2(D13)   // initial situations
```

5. **Classifiers** — filter via `F#`, not a new `∃` chain:

```text
F8[α] := Pr2(Fi3[{α}](D13))
D22 := D{ξ∈D14 | F8[ξ] = X2}   // stimulus valid in any situation
```

Upsert in dependency order; run `analyzeExpression` on `I{…}` before committing the central `D#`.

## Common mistakes

- `definitionFormal: 'Z'` on `basic` / `constant` → `definitionNotAllowed`.
- `D1` uses `D2` before `D2` exists → global not typed / undeclared.
- Wrong `cstType` in `analyzeExpression` → role-specific errors.
- `term` with `X1×X1` for a relation → full Cartesian product, not relation typification.
- `structure` with `Pr1(S1)` → wrong role; projections belong on `term` / `function`.
- Same long `∃d1…∃dn` chain in many `D#` → define one central `D#` and use `Pr*` / `F#`.
- `S4: ℬ(X2×X1×ℬ(X3))` when you only need «individual allows actions» → prefer `ℬ(X2×X1×X3)` + `F5`.
- `∀x∈A, ∀y∈B` → invalid; nest: `∀x∈A (∀y∈B (…))`.
- Functional relation axiom as huge `∀⇒` → prefer `card(S)=card(Pr1,2(S))` when equivalent.
- `setConstituentaValue` on `term`, `axiom`, or `statement` → cannot set computed constituents directly.
- Evaluation before base bindings → missing value, empty result, or evaluation failure.

## Fix Syntax

1. `analyzeExpression` with the broken fragment and correct `cstType`.
2. Read `{ code, from, to, params }`.
3. Edit the substring of `definitionFormal` at those offsets.
4. Re-run analysis.
5. Upsert with the same `id` / `alias`.
