# Publishing `@rsconcept/rstool-mcp`

This package is published **manually** from a local checkout. [RSTool MCP CI](../../.github/workflows/rstool-mcp.yml) typechecks, tests, and builds on push; it does **not** publish to npm.

**Prerequisite:** Publish the checked-out version of [`@rsconcept/rstool`](../rstool/PUBLISHING.md) to npm before releasing RSTool MCP. When building the tarball, pnpm replaces the `workspace:*` dependency with that exact version.

## One-time setup

See [domain publishing — one-time setup](../domain/PUBLISHING.md#one-time-setup-all-rsconcept-packages).

## Release checklist

Run from a clean `main` with a clean working tree.

1. **Sync** and confirm: `git status`.
2. **Install**: `pnpm install --frozen-lockfile` (repo root)
3. **Verify**:

   ```bash
   pnpm --filter @rsconcept/domain run build && pnpm --filter @rsconcept/rstool run build && pnpm --filter @rsconcept/rstool-mcp run typecheck && pnpm --filter @rsconcept/rstool-mcp test && pnpm --filter @rsconcept/rstool-mcp run build
   ```

   If the rstool tool catalog changed, update `src/tools.ts`, `src/server.test.ts`, and the tool table in `README.md`.

4. **Bump version** in `package.json` (semver):
   - **patch** — bug fixes / internal refactors
   - **minor** — additive tools or backwards-compatible adapter changes
   - **major** — breaking MCP tool names or transport behavior

   ```bash
   npm version patch   # or minor / major
   ```

5. **Dry-run**:

   ```bash
   pnpm publish --dry-run --access public
   ```

   Confirm the tarball only includes `dist/`, `src/`, `README.md`, `LICENSE`, etc.

6. **Publish**:

   ```bash
   pnpm publish --access public
   ```

7. **Push** the version-bump commit and tag(s):

   ```bash
   git push && git push --tags
   ```

8. **Smoke-test** (optional):

   ```bash
   npx -y @rsconcept/rstool-mcp@<version>
   ```

   Confirm stderr shows the ready line; interrupt after startup.

## When `@rsconcept/rstool` changed

1. Publish rstool per [rstool/PUBLISHING.md](../rstool/PUBLISHING.md) (and domain first if the chain changed).
2. Run the release checklist above from a checkout containing the published RSTool version.

## Release order (full chain)

When low-level packages change, publish bottom-up:

1. [`@rsconcept/domain`](../domain/PUBLISHING.md)
2. [`@rsconcept/rstool`](../rstool/PUBLISHING.md)
3. **`@rsconcept/rstool-mcp`** (this package)

You can stop at any step if higher-level packages do not need the change.
