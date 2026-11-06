import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

import { RSToolAgent } from '@rsconcept/rstool';
import { afterEach, describe, expect, it, vi } from 'vitest';

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) {
    const child = relative(resolve(tmpdir()), resolve(directory));
    if (child.startsWith('..') || !child.startsWith('rstool-index-test-')) throw new Error('Unsafe cleanup');
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function root() {
  const directory = fs.mkdtempSync(join(tmpdir(), 'rstool-index-test-'));
  directories.push(directory);
  return directory;
}

/** Execute the actual CLI entry under Vitest's module loader without spawning a built package. */
async function run(args: string[]) {
  const previous = process.argv;
  const exitCode = process.exitCode;
  let output = '';
  const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(chunk => { output += String(chunk); return true; });
  const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  try {
    process.argv = [process.execPath, 'session-index', ...args];
    process.exitCode = 0;
    vi.resetModules();
    await import('./bin/session-index');
    return { code: process.exitCode, output };
  } finally {
    process.argv = previous;
    process.exitCode = exitCode;
    stdout.mockRestore();
    stderr.mockRestore();
  }
}

describe('offline session ownership indexing', () => {
  it('rejects option names in place of values before creating any directory', async () => {
    const access = vi.spyOn(fs, 'lstatSync').mockImplementation(() => { throw new Error('Unexpected filesystem access'); });
    try {
      expect((await run(['--persistence-dir', '--subject', '--subject', 'account-a', '--workspace', 'task'])).code).toBe(1);
      expect(access).not.toHaveBeenCalled();
    } finally { access.mockRestore(); }
  });

  it('rejects a missing target rather than creating an empty replacement namespace', async () => {
    const directory = root();
    const namespace = 'c'.repeat(64);
    expect((await run(['--persistence-dir', directory, '--subject', 'account-a', '--namespace', namespace])).code).toBe(1);
    expect(fs.readdirSync(directory)).toEqual([]);
    const missing = join(directory, 'missing-root');
    expect((await run(['--persistence-dir', missing, '--subject', 'account-a', '--workspace', 'task'])).code).toBe(1);
    expect(fs.existsSync(missing)).toBe(false);
  });

  it('reports empty existing targets without claiming session clocks were created', async () => {
    const directory = root();
    const namespace = 'd'.repeat(64);
    fs.mkdirSync(join(directory, namespace));
    const result = await run(['--persistence-dir', directory, '--subject', 'account-a', '--namespace', namespace]);
    expect(result.code).toBe(0);
    expect(result.output).toContain('0 session file(s)');
    expect(result.output).toContain('No session retention clocks were created');
  });

  it('preserves payloads and established clocks and refuses reassignment', async () => {
    const directory = root();
    const namespace = createHash('sha256').update(JSON.stringify(['account-a', 'task'])).digest('hex');
    const agent = new RSToolAgent({ persistenceDir: join(directory, namespace) });
    const session = agent.createSession({ title: 'Preserved' });
    const path = join(directory, namespace, `${session.sessionId}.json`);
    const before = fs.readFileSync(path, 'utf8');
    const args = ['--persistence-dir', directory, '--subject', 'account-a', '--workspace', 'task'];
    expect((await run(args)).code).toBe(0);
    const clock = join(directory, namespace, '.lifecycle', 'sessions',
      `${createHash('sha256').update(session.sessionId).digest('hex')}.json`);
    const stamp = fs.readFileSync(clock, 'utf8');
    expect((await run(args)).code).toBe(0);
    expect(fs.readFileSync(clock, 'utf8')).toBe(stamp);
    expect((await run(['--persistence-dir', directory, '--subject', 'account-b', '--namespace', namespace])).code).toBe(1);
    expect(fs.readFileSync(path, 'utf8')).toBe(before);
  }, 15_000);
});


it('indexes dash-prefixed subjects through equals syntax and rejects ambiguous or duplicate options', async () => {
  const directory = root();
  const namespace = createHash('sha256').update(JSON.stringify(['--account-a', 'task'])).digest('hex');
  fs.mkdirSync(join(directory, namespace));
  const args = ['--persistence-dir', directory, '--subject=--account-a', '--workspace', 'task'];
  expect((await run(args)).code).toBe(0);
  expect((await run([...args, '--subject', 'other'])).code).toBe(1);
  expect((await run([...args, '--unknown=value'])).code).toBe(1);
  expect((await run(['--persistence-dir', directory, '--subject', '--account-a', '--workspace', 'task'])).code).toBe(1);
});
