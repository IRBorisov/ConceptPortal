# Publishing `@rsconcept/domain`

This package is published **manually** from a local checkout. [Domain CI](../../.github/workflows/domain.yml) typechecks, tests, and builds on push; it does **not** publish to npm.

## One-time setup (all `@rsconcept` packages)

1. Be a member of the `@rsconcept` npm scope with publish rights.
2. Log in on the machine you publish from:

   ```bash
   npm login
   ```

   (or set `NPM_TOKEN` and `npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN` in CI-like environments).

3. Verify access:

   ```bash
   npm whoami
   npm access list packages @rsconcept
   ```

## Release checklist

Run from a clean `main` with a clean working tree.

1. **Sync** and confirm: `git status`.
2. **Install**: `cd rsconcept/domain && npm ci`
3. **Verify**:

   ```bash
   npm run typecheck && npm test && npm run build
   ```

   Run `npm run generate` first if you changed `src/rslang/parser/rslang.grammar`.

4. **Bump version** in `package.json` (semver):
   - **patch** — bug fixes / internal refactors
   - **minor** — additive, backwards-compatible API
   - **major** — breaking changes for frontend, rstool, or other consumers

   ```bash
   npm version patch   # or minor / major
   ```

   This creates a commit and git tag `v<version>`. Rename the tag if you use per-package names (e.g. `git tag domain-v1.0.0 && git tag -d v1.0.0`).

5. **Dry-run**:

   ```bash
   npm publish --dry-run --access public
   ```

   Confirm the tarball only includes `dist/`, `src/`, `README.md`, `LICENSE`, etc. (see `files` in `package.json`).

6. **Publish**:

   ```bash
   npm publish --access public
   ```

   First publication of a scoped public package needs `--access public`; later releases inherit it. `prepublishOnly` runs `npm run build`.

7. **Push** the version-bump commit and tag(s):

   ```bash
   git push && git push --tags
   ```

8. **Smoke-test** in a throwaway folder:

   ```bash
   mkdir /tmp/domain-smoke && cd /tmp/domain-smoke
   npm init -y && npm install @rsconcept/domain
   node -e "import('@rsconcept/domain/rslang').then(m => console.log('ok', typeof m.RSLangAnalyzer))"
   ```

## Downstream packages

After a domain release that consumers need:

1. Bump `dependencies."@rsconcept/domain"` in `rsconcept/rstool/package.json` (and in `rsconcept/frontend/package.json` for the Portal SPA).
2. `npm ci` + test in each consumer, then publish those packages per their publishing guides:
   - [RSTool](../rstool/PUBLISHING.md)
   - [RSTool MCP](../rstool-mcp/PUBLISHING.md)

You can stop if higher-level packages do not need the change.
