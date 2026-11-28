# Publishing `@rsconcept/rstool`

This package is published **manually** from a local checkout. [RSTool CI](../../.github/workflows/rstool.yml) typechecks, tests, and builds on push; it does **not** publish to npm.

**Prerequisite:** Publish the checked-out version of [`@rsconcept/domain`](../domain/PUBLISHING.md) to npm before releasing RSTool. When building the tarball, pnpm replaces the `workspace:*` dependency with that exact version.

## One-time setup

See [domain publishing — one-time setup](../domain/PUBLISHING.md#one-time-setup-all-rsconcept-packages).

## Release checklist

Run from a clean `main` with a clean working tree.

1. **Sync** and confirm: `git status`.
2. **Install**: `pnpm install --frozen-lockfile` (repo root)
3. **Verify**:

   ```bash
   pnpm --filter @rsconcept/domain run build && pnpm --filter @rsconcept/rstool run typecheck && pnpm --filter @rsconcept/rstool test && pnpm --filter @rsconcept/rstool run build
   ```

   If you changed the agent contract, bump `CONTRACT_VERSION` in `src/models/tool-contract.ts` and update the [skill sync checklist](AGENTS.md#contract-changes).

4. **Bump version** in `package.json` (semver):
   - **patch** — bug fixes / internal refactors
   - **minor** — additive, backwards-compatible contract changes
   - **major** — breaking agent-visible contract (usually paired with a `CONTRACT_VERSION` bump)

   ```bash
   npm version patch   # or minor / major
   ```

5. **Dry-run**:

   ```bash
   pnpm publish --dry-run --access public
   ```

   Confirm the tarball includes both bins, `rstool-wrapper` and `rstool-http`, the `@rsconcept/rstool/http` and `@rsconcept/rstool/portal` exports, and the relevant skills, docs and examples.

6. **Publish**:

   ```bash
   pnpm publish --access public
   ```

7. **Push** the version-bump commit and tag(s):

   ```bash
   git push && git push --tags
   ```

8. **Smoke-test**:

   ```bash
   mkdir /tmp/rstool-smoke && cd /tmp/rstool-smoke
   npm init -y && npm install @rsconcept/rstool
   node -e "import('@rsconcept/rstool').then(m => console.log(Object.keys(m)))"
   ```

## When `@rsconcept/domain` changed

1. Publish domain per [domain/PUBLISHING.md](../domain/PUBLISHING.md).
2. Run the release checklist above from a checkout containing the published domain version.

## Downstream packages

After an rstool release that consumers need:

Publish MCP from a checkout containing the published RSTool version. Follow the [RSTool MCP publishing guide](../rstool-mcp/PUBLISHING.md).
