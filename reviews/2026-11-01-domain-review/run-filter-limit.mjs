import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const source = readFileSync('rsconcept/domain/src/rslang/semantic/type-auditor.ts', 'utf8');
const map = JSON.parse(readFileSync('rsconcept/domain/dist/rslang/semantic/type-auditor.js.map', 'utf8'));
const matches = source.replaceAll('\r\n', '\n') === map.sourcesContent[0].replaceAll('\r\n', '\n');
if (!matches) throw new Error('Built type auditor differs from source');
const result = spawnSync(process.execPath, ['--max-old-space-size=64', 'reviews/2026-11-01-domain-review/filter-limit.mjs'],
  { timeout: 5000, maxBuffer: 65536, encoding: 'utf8' });
const evidence = { sourceMatchesBuild: matches, status: result.status, signal: result.signal,
  error: result.error?.message, stdout: result.stdout, stderr: result.stderr.slice(-1600) };
writeFileSync('reviews/2026-11-01-domain-review/filter-result.json', JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
