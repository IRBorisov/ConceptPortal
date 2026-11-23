import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { runtimeEntries } from './runtime-entries.mjs';

const [worktree, output, esbuildModule] = process.argv.slice(2);
if (!worktree || !output) throw new Error('Usage: node bundle.mjs <built worktree> <output.mjs> [esbuild module]');
const { build } = esbuildModule ? await import(pathToFileURL(resolve(esbuildModule))) : await import('esbuild');
const domain = resolve(worktree, 'rsconcept/domain');
const { exports: packageExports } = JSON.parse(await readFile(resolve(domain, 'package.json'), 'utf8'));
const adapter = fileURLToPath(new URL('./portal-adapter.mjs', import.meta.url));
const entries = runtimeEntries.map(
  ([file, names]) => `export { ${names.join(', ')} } from ${JSON.stringify(resolve(domain, 'dist', file))};`
);
entries.push(`export { prepare } from ${JSON.stringify(adapter)};`);
await build({
  stdin: { contents: entries.join('\n'), resolveDir: domain },
  outfile: resolve(output),
  bundle: true,
  format: 'esm',
  target: 'es2022',
  plugins: [
    {
      name: 'correctness-domain-variant',
      setup(build) {
        build.onResolve({ filter: /^@rsconcept\/domain(\/|$)/ }, args => {
          const key = `.${args.path.slice('@rsconcept/domain'.length)}`;
          const target = packageExports[key]?.import;
          if (!target) throw new Error(`Missing domain export ${key}`);
          return { path: resolve(domain, target) };
        });
      }
    }
  ]
});
