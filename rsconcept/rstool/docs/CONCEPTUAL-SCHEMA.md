# Conceptual schema (КС) — agent recommendations

This note complements the mechanistic references:

- `CONSTITUENTA.md` — how to upsert constituents correctly (fields, order, validation)
- `SYNTAX.md` / `TYPIFICATION.md` — how to construct correct RS expressions

Here we focus on **how to design and analyse a conceptual schema as a system of constituents**.

## What makes a schema valuable

The value of a conceptual schema is the **diversity of concepts expressed in it**.

- A good schema forms a **domain thesaurus**: a stable set of terms and distinctions that people can use for communication and decision-making.
- “Diversity” is not the same as “many aliases”. Prefer concepts that introduce **new distinctions** (new criteria, roles, constraints, invariants) instead of synonyms.

Practical agent heuristic:

- If you can remove a derived concept `D#` and lose no important language for reasoning, it is probably redundant.
- If stakeholders keep rephrasing the same thing in different words, the schema likely misses one or more constituents that capture the missing distinction.

## Rule for text fields (term / definitionText / convention)

When you write natural-language text in a schema, follow this strict rule:

- **Use only terms that are introduced in the schema itself.**

Rationale:

- Text definitions that rely on “external vocabulary” quietly import unstated assumptions and weaken the schema as a shared thesaurus.

Agent checklist:

- When you add a new `definitionText`, scan it for nouns/terms. If a term is essential, introduce it explicitly (typically as `N#`, `X#`, `S#`, or a derived `D#`).
- Prefer short “closed-world” definitions: explain a concept using already-introduced schema terms plus logical connectives (“and”, “or”, “not”), quantifiers (“for all”, “exists”), and references to RS expressions.

## Modeling genus structures (родовые структуры) as `S#`

`S#` constituents represent **base structured concepts**: their `definitionFormal` is a **typification** (grade), and their meaning is set by `convention` plus axioms.

### Define structure components explicitly

For a genus structure `S#`, it is often useful to define **all components** as named derived terms.

Why:

- It gives names to projections / reduced parts of a structure, making the thesaurus usable.
- It shortens later formulas and prevents agents from repeating long projection chains differently in different places.

Typical pattern for a binary relation over a base set:

- `X1` — base set (undefined)
- `S1 : ℬ(X1×X1)` — relation as a structure (undefined, meaning via convention)
- Component terms:
  - `D_dom := Pr1(S1)` — “domain” / “left elements”
  - `D_cod := Pr2(S1)` — “codomain” / “right elements”
  - `D_pairs := red(bool(S1))` is usually nonsense; instead name the parts you truly use
  - For higher-arity structures, define `Pr1`, `Pr2`, … and relevant multi-projections (`Pr1,3`, etc.)

More generally:

- **Projections** (`Pr*`, `pr*`) are the main tool for naming components.
- **Reduce** (`red`) is useful when a component is a set-of-sets and you need a flattened union; introduce a named `D#` when you use `red` in more than one place.

### Avoid “anonymous structure usage”

If later definitions repeatedly use expressions like `Pr2(Fi1[D](S7))`, it is usually a sign that:

- the schema is missing a named constituent for that concept, or
- the structure `S7` is underspecified (needs conventions/axioms).

Prefer to introduce:

- an intermediate derived term `D#` for the filtered relation/set, and
- separate terms for the projections you interpret in text.

## Axioms as semantic direction

An axiom `A#` is a **true statement** that:

- defines the intended semantics of genus structures, and
- enables safe derivations (“in a certain direction”) by providing guarantees needed for operations.

Think of axioms as giving you _permission to use certain operators_ without risking typification/runtime failures or semantic ambiguity.

### Example: singleton guarantee for `debool`

`debool(S)` is only meaningful when `S` is guaranteed to be a **singleton**.

In practice, when you build `S` as a projection/filter result, you often need an axiom that guarantees uniqueness.

For example, for a binary relation `S1 : ℬ(X1×X1)` you may want to define a function-like choice:

- `D_childOf(x) := debool(Pr2(Fi1[bool(x)](S1)))`

This is only valid if for every `x` the filtered projection yields exactly one element.
That guarantee is provided by an axiom of **right-uniqueness** (functional dependency) for the relation (written in RS logic for your specific structure).

Agent rule:

- If you see `debool(...)` in a definition, ensure there is an axiom that makes the inner set a singleton on the intended domain.
- If the axiom is absent, either (a) add the axiom, (b) replace `debool` by keeping the set-valued result, or (c) restrict the domain explicitly so the singleton property holds.

## Expression hygiene: avoid tautological membership checks

In well-typed/correct RS expressions, you should avoid adding membership predicates that only restate what is already guaranteed by typification and by the correctness model.

Specifically, avoid “sanity checks” like:

- `x ∈ X1`
- `x ∈ ℬ(X1)` (and other plain grade constructions such as `X1×X2`, `B(X1)`, etc.)

when `x` is already bound/typed as an element compatible with `X1` (or with the intended element structure induced by `ℬ(X1)`, `X1×X2`, …).

Why this is usually meaningless:

- `AnalysisResult` checks expressions in a **global context** where identifiers must have known typifications and must satisfy **bijective portability**.
- Under these guarantees, values of an element grade “already belong” to the corresponding set/grade in the semantic sense; so the predicate becomes (effectively) TRUE and adds no discriminating information.

Agent rule:

- Use membership (`∈` / `Fi*`) to express *nontrivial* schema semantics (e.g. defining/characterising derived sets), not to re-check that a value matches its own typification.

## Bijective portability (биективная переносимость)

**Bijective portability** means that a formal meaning/definition of a constituent depends only on the *structure* that the schema intends, and not on arbitrary “names” of undefined-concept interpretations.

Concretely, if you replace interpretations of undefined concepts by a bijective renaming (structure-preserving renaming), then:

- the evaluation result of every bijectively portable definition is unchanged up to the same renaming,
- therefore definitions are stable and reusable across equivalent models.

In rstool’s correctness model this property is not optional for the formal part:

- all formal definitions are required to be **bijectively portable**,
- expression checking assumes bijective portability for every referenced identifier.

Because of this, membership checks against base sets/grades become redundant in correct expressions: the type discipline plus portability already guarantee the relevant “belonging” constraints.

## Analysis: how to review a schema as a system

### Thesaurus health

- **Coverage**: do core domain nouns/roles appear as constituents (`N#`, `X#`, `S#`, `D#`)?
- **Non-synonymy**: if two terms are interchangeable in all axioms/definitions, collapse or differentiate them.
- **Naming stability**: avoid renaming “public” terms frequently; prefer adding refined terms and marking old ones as deprecated in text (if your workflow supports that).

### Term graph health (dependencies)

- Prefer a **layered graph**: bases/constants → core structures → derived projections/components → higher-level derived concepts → axioms/statements.

### Axiom health

- Every axiom should have a clear intent: uniqueness, totality, disjointness, ordering, invariance, domain/range constraints, etc.
- Prefer a small set of high-leverage axioms that unlock safe derivations, rather than many weak axioms with overlapping meaning.
- If axioms regularly fail in model evaluation, either the interpretation data violates the intended semantics or the semantics are wrong — in both cases the schema needs revision.

## Practical workflow for agents (recommended)

1. **Start with a vocabulary list** (domain nouns, roles, relations) → introduce `N#` for stable names when formalisation is not ready yet.
2. **Introduce bases/constants** (`X#`, `C#`) early with conventions.
3. **Introduce core structures** (`S#`) with typifications + conventions; immediately add the most important component terms (`Pr*`, `red`-based terms).
4. **Add derived concepts** (`D#`, `F#`, `P#`) incrementally; keep definitions short by using named components.
5. **Add axioms** (`A#`) that:
   - encode intended semantics of structures,
   - justify `debool`/functional choices, and
   - restrict domains/ranges so derived concepts remain meaningful.
6. Run analysis on scratch expressions before committing, and keep text definitions closed-world (schema terms only).
