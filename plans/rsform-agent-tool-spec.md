# RSForm Agent Tool Spec

## Goal

Provide a library-first tool that lets an LLM agent incrementally construct an RSForm and validate formal expressions with parser, syntax, semantics, and typification checks.

## Chosen Form and Stack

- Form: transport-neutral TypeScript library.
- Runtime: Node + TypeScript.
- Reuse source of truth from frontend domain:
  - `rsconcept/frontend/src/domain/rslang`
  - `rsconcept/frontend/src/domain/library`

## Functional Requirements

- Create isolated sessions for incremental RSForm build workflows.
- Add or update constituents and return deterministic analysis data.
- Analyze ad-hoc expressions in the current session context.
- Expose diagnostics with stable machine-readable shape (`code`, `from`, `to`, `params`).
- Support session commit checkpoints and import/export snapshots.

## Non-Functional Requirements

- Contract-first and transport-agnostic API.
- No UI dependencies in the core package.
- Stable contract versioning via `contractVersion`.
- Adapter boundary to isolate frontend-domain coupling.

## Core API

- `createSession(initialForm?) -> sessionId`
- `addOrUpdateConstituenta(sessionId, draftCst) -> validationResult`
- `analyzeExpression(sessionId, expression, cstType) -> analysisResult`
- `getFormState(sessionId) -> rsformState`
- `listDiagnostics(sessionId, filters?) -> diagnostics[]`
- `commitStep(sessionId, message?) -> revisionId`
- `exportSession(sessionId) -> json`
- `importSession(json) -> sessionId`

## Future Extensions

- Add MCP transport adapter in `src/mcp`.
- Add HTTP transport adapter in `src/http`.
- Keep core unchanged while exposing additional transports.
