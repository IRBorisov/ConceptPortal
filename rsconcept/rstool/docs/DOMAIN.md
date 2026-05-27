# Domain reference

Compact English distillation of the canonical Russian domain glossary (`CONTEXT.md`). Read this first if you are an agent unfamiliar with the Concept Portal vocabulary.

## Core concepts

- **Subject domain** — a sphere of human activity that requires coordination and communication.
- **Conceptual schema (`КС`)** — a formal system of definitions for a subject domain, made of constituents.
- **Conceptual model (`РСМодель`)** — a pairing of a conceptual schema with an interpretation in concrete data.
- **Operations Synthesis Schema (`ОСС`)** — a graph of load and synthesis operations that drives schema construction and evolution.
- **RS language (`родоструктурная экспликация`)** — the formal genus-structure language used to define concepts, relations and operations inside a schema.
- **Typification** — the computable structural type of a constituent's formal definition; the formal constraint on admissible interpretations.
- **Term graph** — a directed dependency graph over constituents; an edge means "constituent A appears in constituent B's definition".

## Constituents

A **constituent** is the atomic building block of a conceptual schema. Each constituent may carry a term, a convention, a typification, a formal definition, a textual interpretation, and a comment. By role, a constituent is either undefined, derived, or a statement.

Constituent aliases follow a strict prefix scheme:

| Alias prefix | Role                                     | Notes                                                                                           |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `N#`         | Nominoid                                 | Free vocabulary item, no formal definition                                                      |
| `X#`         | Base set                                 | Undefined concept, set of elements                                                              |
| `C#`         | Constant set                             | Undefined concept, set of elements, allows arithmetic predicates and operations                 |
| `S#`         | Structured concept (**genus structure**) | Undefined concept; `definitionFormal` gives **typification**; meaning via `convention` / axioms |
| `D#`         | Term                                     | Derived concept; `definitionFormal` is the **definition**; value computed in a model            |
| `F#`         | Term-function                            | Parameterised derived concept yielding an STE                                                   |
| `P#`         | Predicate-function                       | Parameterised derived concept yielding a logical expression                                     |
| `A#`         | Axiom                                    | Logical statement asserting requirements                                                        |
| `T#`         | Statement                                | Logical assertion about the model                                                               |
| `R#`         | Radical                                  | Template placeholder for arbitrary typification                                                 |

**Undefined concepts** (`X#`, `C#`, `S#`) are introduced by conventions (and optional axioms). For `S#`, the formal field states **typification** (the grade of elements), not a defining construction. **Derived concepts** (`D#`, `F#`, `P#`, `A#`, `T#`) carry a formal **definition** and must follow declaration order — every referenced constituent must already exist; their model values are obtained by evaluation.

**Structure vs term:** `S#` with `ℬ(X1×X1)` declares “elements are pairs over `X1`”; the actual pairs come from interpretation. `D#` with `X1×X1` as the whole expression denotes the **full Cartesian product** (all pairs), which is a computed set — use `S#` + projections when modeling a relation.

A **crucial constituent** is marked as content-bearing for filtering / focus; it has no semantic effect on the formal calculus.

## Statuses

Each constituent has one of the following correctness statuses:

| Status       | Meaning                                                            |
| ------------ | ------------------------------------------------------------------ |
| Unknown      | Not yet validated                                                  |
| OK           | Validated as correct                                               |
| Error        | Validation failed                                                  |
| Property     | Defines a non-computable set; only membership tests are admissible |
| Incalculable | Cannot be evaluated directly (e.g. expected exponential blow-up)   |

## RSModel evaluation states

In a conceptual model each item has one of the following evaluation statuses:

| Status              | Meaning                                         |
| ------------------- | ----------------------------------------------- |
| `NO_EVAL` (1)       | Not evaluated (definition is not interpretable) |
| `NOT_PROCESSED` (2) | Interpretation has not been computed yet        |
| `INVALID_DATA` (3)  | Provided data is invalid                        |
| `EVAL_FAIL` (4)     | Evaluation raised an error                      |
| `AXIOM_FALSE` (5)   | Axiom evaluated to FALSE                        |
| `EMPTY` (6)         | Result is the empty set                         |
| `HAS_DATA` (7)      | Interpretation computed and non-empty           |

## Synthesis and OSS

- **Load operation** attaches an existing schema to the OSS graph.
- **Synthesis operation** combines operand schemas via an **identification table** (pairs of constituents to be treated as equivalent) and produces a result schema with **inherited constituents**.
- **Cross-cutting changes** propagate edits from a **source constituent** to its **inherited constituents** through the OSS. Inherited constituents are not edited directly.
- **Diamond synthesis** uses operand schemas with shared ancestors.
- **Concept block** is a nominal grouping of schemas inside the OSS.

## Relationships

- A conceptual schema **contains** many constituents.
- A conceptual model **interprets** exactly one schema at a given state.
- An OSS **contains** load and synthesis operations.
- A synthesis operation **consumes** one or more input schemas plus an identification table and **produces** a result schema with inherited constituents.
- Cross-cutting changes **propagate** from a source constituent to its inherited descendants.
- The term graph is **derived** from the formal definitions of constituents.

## Dependency vocabulary

- **Consumers** — constituents that mention this one in their definitions.
- **Suppliers** — constituents this one mentions in its definition.
- **Dependents** — direct and transitive consumers.
- **Influencers** — direct and transitive suppliers.
- **Generating expression** — a definition referencing a single external constituent with no added content.
- **Base concept (for generation)** — the constituent on which a generating expression is built.
- **Generated concept** — a constituent produced from a generating expression.
