# Project guidelines

Portable style guides. Use them to keep new projects and feature demos stylistically consistent without copying product-specific details.

| Document                          | Purpose                                                                   |
| --------------------------------- | ------------------------------------------------------------------------- |
| [Architecture](./architecture.md) | Layers, package boundaries, feature shape, state ownership, API contracts |
| [Coding style](./coding-style.md) | Naming, module organization, UI composition, i18n, testing posture        |

These guides deliberately omit tooling flags, lint rule lists, and stack version pins. Prefer principles over recipes.

In this repo, package-local [`AGENTS.md`](../AGENTS.md) files win over portable docs when they conflict. Package rules: [`frontend`](../rsconcept/frontend/AGENTS.md), [`backend`](../rsconcept/backend/AGENTS.md), [`domain`](../rsconcept/domain/AGENTS.md), [`rstool`](../rsconcept/rstool/AGENTS.md), [`rstool-mcp`](../rsconcept/rstool-mcp/AGENTS.md). Domain terminology for agents: [`rstool/docs/DOMAIN.md`](../rsconcept/rstool/docs/DOMAIN.md).
