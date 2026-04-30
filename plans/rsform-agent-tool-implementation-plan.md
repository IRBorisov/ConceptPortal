# RSForm Agent Tool Implementation Plan

## Phase 1: Library Core

- Create package at `rsconcept/rstool`.
- Implement transport-neutral contract in `src/contracts/tool-contract.ts`.
- Implement in-memory session lifecycle in `src/session/session-store.ts`.
- Implement domain adapter in `src/mappers/frontend-domain-adapter.ts`.
- Implement public orchestration API in `src/index.ts`.

## Phase 2: Reliability

- Add baseline tests in `tests/rsform-agent-tool.test.ts`.
- Validate success and syntax-error flows with representative expressions.
- Ensure deterministic export format for session snapshots.

## Phase 3: Transport Adapters

- Add MCP stub adapter in `src/mcp/adapter.ts`.
- Add HTTP stub adapter in `src/http/adapter.ts`.
- Keep adapter layer thin and avoid leaking transport concerns into core.

## Acceptance Checklist

- Session operations support incremental RSForm editing.
- Analysis uses existing frontend parser/semantic/type behavior.
- Diagnostics are structured and machine-readable.
- Export/import are available for reproducible agent execution.
