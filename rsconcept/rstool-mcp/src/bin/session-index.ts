#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { join } from 'node:path';

import { SessionPolicy } from '../session-policy';

/** Offline administrative ownership indexing. No session payload or credential is read or printed. */
function main(): void {
  const args = process.argv.slice(2);
  const allowed = new Set(['--persistence-dir', '--subject', '--workspace', '--namespace']);
  const values = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    if (!allowed.has(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || values.has(args[i])) throw new Error('Invalid index arguments');
    values.set(args[i], args[i + 1]);
  }
  const root = values.get('--persistence-dir');
  const subject = values.get('--subject');
  const workspace = values.get('--workspace');
  const namespace = values.get('--namespace');
  if (!root || !subject || Boolean(workspace) === Boolean(namespace)) {
    throw new Error('Require --persistence-dir, --subject, and exactly one of --workspace or --namespace');
  }
  const key = namespace ?? createHash('sha256').update(JSON.stringify([subject, workspace])).digest('hex');
  if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('Invalid namespace');
  const target = fs.lstatSync(join(root, key));
  if (!target.isDirectory() || target.isSymbolicLink()) throw new Error('Workspace does not exist');
  const count = new SessionPolicy(root).register(subject, key, workspace);
  process.stdout.write(`Workspace ownership indexed; ${count} session file(s) preserved. ${count ? 'Retention clocks are initialized only when missing.' : 'No session retention clocks were created.'}\n`);
}

try { main(); } catch {
  process.stderr.write('Session ownership indexing failed. Check arguments, ownership, permissions and storage metadata.\n');
  process.exitCode = 1;
}
