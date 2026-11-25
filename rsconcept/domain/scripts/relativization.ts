import { readFileSync } from 'node:fs';

import { projectRelativization } from '../src/library/relativization';

const { source, options } = JSON.parse(readFileSync(0, 'utf8')) as {
  source: Parameters<typeof projectRelativization>[0];
  options: Parameters<typeof projectRelativization>[1];
};
const started = performance.now();
const projection = projectRelativization(source, options);
if (process.argv.includes('--profile')) {
  process.stderr.write(JSON.stringify({ nodeMs: performance.now() - started, peakRSSKiB: process.resourceUsage().maxRSS }));
}
process.stdout.write(JSON.stringify(projection));
