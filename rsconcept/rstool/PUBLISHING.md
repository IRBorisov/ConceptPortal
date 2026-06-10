# Publishing `@rsconcept/rstool`

This package is published **manually** from a local checkout. [RSTool CI](../../.github/workflows/rstool.yml) typechecks, tests, and builds on push; it does **not** publish to npm.

**Prerequisite:** [`@rsconcept/domain`](../domain/PUBLISHING.md) is published at the version pinned in `package.json` (or use `npm link` while testing unpublished domain builds).

## One-time setup

See [domain publishing — one-time setup](../domain/PUBLISHING.md#one-time-setup-all-rsconcept-packages).

## Release checklist

Run from a clean `main` with a clean working tree.

1. **Sync** and confirm: `git status`.
2. **Install**: `cd rsconcept/rstool && npm ci`
3. **Verify**:

   ```bash
   npm run typecheck && npm test && npm run build
   ```

   If you changed the agent contract, bump `CONTRACT_VERSION` in `src/models/tool-contract.ts` and update the [skill sync checklist](AGENTS.md#contract-changes--update-the-skill).

4. **Bump version** in `package.json` (semver):
   - **patch** — bug fixes / internal refactors
   - **minor** — additive, backwards-compatible contract changes
   - **major** — breaking agent-visible contract (usually paired with a `CONTRACT_VERSION` bump)

   ```bash
   npm version patch   # or minor / major
   ```

5. **Dry-run**:

   ```bash
   npm publish --dry-run --access public
   ```

   Confirm the tarball only includes intended paths (`dist/`, `src/`, `skills/`, `docs/`, `examples/`, `README.md`, `LICENSE`, etc.).

6. **Publish**:

   ```bash
   npm publish --access public
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
2. Bump the `^` pin on `dependencies."@rsconcept/domain"` in this `package.json`.
3. `npm ci`, then run the release checklist above.

## Downstream packages

After an rstool release that consumers need:

1. Bump `dependencies."@rsconcept/rstool"` in `rsconcept/rstool-mcp/package.json`.
2. Publish MCP per [rstool-mcp/PUBLISHING.md](../rstool-mcp/PUBLISHING.md).
