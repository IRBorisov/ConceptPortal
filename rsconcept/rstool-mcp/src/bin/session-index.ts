#!/usr/bin/env node
import fs from 'node:fs';
import { join } from 'node:path';

import { isProjectId } from '../http-auth';
import { SessionPolicy, workspaceNamespace } from '../session-policy';

/** Offline administrative ownership indexing. No session payload or credential is read or printed. */
function main(): void {
  const args = process.argv.slice(2);
  const allowed = new Set(['--persistence-dir', '--subject', '--workspace', '--namespace', '--project-id']);
  const values = new Map<string, string>();
  for (let i = 0; i < args.length; i++) {
    const separator = args[i].indexOf('=');
    const key = separator < 0 ? args[i] : args[i].slice(0, separator);
    const value = separator < 0 ? args[++i] : args[i].slice(separator + 1);
    if (!allowed.has(key) || !value || (separator < 0 && value.startsWith('--')) || values.has(key)) {
      throw new Error('Invalid index arguments');
    }
    values.set(key, value);
  }
  const root = values.get('--persistence-dir');
  const subject = values.get('--subject');
  const workspace = values.get('--workspace');
  const namespace = values.get('--namespace');
  const projectId = values.get('--project-id');
  if (!root || !subject || Boolean(workspace) === Boolean(namespace) ||
      (projectId !== undefined && (!workspace || !isProjectId(projectId)))) {
    throw new Error('Require --persistence-dir, --subject, and exactly one of --workspace or --namespace');
  }
  const key = namespace ?? workspaceNamespace(subject, workspace!, projectId);
  if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('Invalid namespace');
  const target = fs.lstatSync(join(root, key));
  if (!target.isDirectory() || target.isSymbolicLink()) throw new Error('Workspace does not exist');
  const count = new SessionPolicy(root).register(subject, key, workspace, projectId);
  process.stdout.write(`Workspace ownership indexed; ${count} session file(s) preserved. ${count ? 'Retention clocks are initialized only when missing.' : 'No session retention clocks were created.'}\n`);
}

try { main(); } catch {
  process.stderr.write('Session ownership indexing failed. Check arguments, ownership, permissions and storage metadata.\n');
  process.exitCode = 1;
}
