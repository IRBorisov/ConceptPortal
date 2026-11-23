import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import { runtimeEntries } from './runtime-entries.mjs';
import { runSuites } from './suites.mjs';

const { values: args } = parseArgs({
  options: {
    'candidate': { type: 'string' },
    'reference': { type: 'string' },
    'snapshot': { type: 'string' },
    'experiments': { type: 'string' },
    'suite': { type: 'string', multiple: true },
    'extended': { type: 'boolean' },
    'portal-mode': { type: 'string', default: 'incremental' }
  }
});

async function importRuntime(source) {
  const target = resolve(source);
  if (!(await stat(target)).isDirectory()) return import(pathToFileURL(target));

  const parts = await Promise.all(
    runtimeEntries.map(async ([file, names]) => {
      const exports = await import(pathToFileURL(resolve(target, 'rsconcept/domain/dist', file)));
      return names.map(name => {
        if (!Object.hasOwn(exports, name)) throw new Error(`Missing runtime export ${name} in ${target}`);
        return [name, exports[name]];
      });
    })
  );
  return Object.fromEntries(parts.flat());
}

if (!['incremental', 'full'].includes(args['portal-mode']))
  throw new Error('--portal-mode must be incremental or full');
const worktree = fileURLToPath(new URL('../../../../', import.meta.url));
const candidate = await importRuntime(args.candidate ?? worktree);
const reference = args.reference ? await importRuntime(args.reference) : candidate;
const experiments = args.experiments && (await import(pathToFileURL(resolve(args.experiments))));
const readSnapshot = args.snapshot && (async name => JSON.parse(await readFile(resolve(args.snapshot, name), 'utf8')));
const report = await runSuites({
  candidate,
  reference,
  experiments,
  readSnapshot,
  suites: args.suite,
  extended: args.extended,
  portalMode: args['portal-mode'] === 'full' ? 'recalculateAll' : 'recalculateChanged'
});
console.log(JSON.stringify({ runtime: `Node ${process.version}`, ...report }, null, 2));
if (report.failures.length) process.exitCode = 1;
