import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { RSToolAgent } from '../src';
import { formatDiagnostics } from './diagnostics-utils';

const sessions = [
  'examples/sample/rsform-session.json',
  'examples/sample/rsmodel-session.json',
  'examples/kinship/rsform-session.json',
  'examples/kinship/rsmodel-session.json',
  'examples/chocolate-nim/rsform-session.json',
  'examples/chocolate-nim/rsmodel-session.json',
  'examples/movd/rsform-session.json',
  'examples/movd/rsmodel-session.json',
  'examples/expression-bank/rsform-session.json',
  'examples/template-apply/rsform-session.json'
];

let total = 0;
for (const rel of sessions) {
  const path = resolve(process.cwd(), rel);
  const tool = new RSToolAgent();
  const payload = JSON.parse(readFileSync(path, 'utf8')) as {
    state: { items: Array<{ id: number; alias: string }> };
  };
  const aliasById = new Map(payload.state.items.map(item => [item.id, item.alias]));
  tool.importData(payload, 'session');
  const diags = tool.listDiagnostics();
  total += diags.length;
  console.log(`\n=== ${rel} (${diags.length}) ===`);
  const formatted = formatDiagnostics(diags, aliasById);
  if (formatted) {
    for (const line of formatted.split('\n')) {
      console.log(`  ${line}`);
    }
  }
}
console.log(`\nTotal: ${total}`);
process.exit(total > 0 ? 1 : 0);
