import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { RSToolAgent } from '@rsconcept/rstool';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionPolicy } from './session-policy';
import { sessionPolicyConfiguration } from './session-policy-config';

const directories: string[] = [];
afterEach(() => { for (const directory of directories.splice(0)) fs.rmSync(directory, { recursive: true, force: true }); });

/** Exercise the real persisted library with a controlled storage-policy clock. */
function setup(limit = 2, retention = 1000) {
  const root = fs.mkdtempSync(join(tmpdir(), 'rstool-retention-'));
  directories.push(root);
  let time = 10_000;
  const policy = new SessionPolicy(root, limit, retention, () => time);
  function connect(subject = 'account-a', workspace = 'task', selectedPolicy = policy) {
    const namespace = createHash('sha256').update(JSON.stringify([subject, workspace])).digest('hex');
    selectedPolicy.register(subject, namespace);
    const directory = join(root, namespace);
    const agent = new RSToolAgent({ persistenceDir: directory, sessionLifecycle: selectedPolicy.hooks(subject, namespace) });
    // Match the HTTP host's logical invocation boundary, including async completion.
    const tool = new Proxy(agent, { get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      if (typeof value !== 'function') return value;
      return (...args: unknown[]) => {
        const release = selectedPolicy.begin(namespace);
        try {
          const result: unknown = Reflect.apply(value, target, args);
          if (result instanceof Promise) return result.finally(release);
          release();
          return result;
        } catch (error) { release(); throw error; }
      };
    } });
    return { namespace, directory, tool };
  }
  return { root, policy, connect, now: () => time, advance: (ms: number) => { time += ms; } };
}

describe('durable account session policy', () => {
  it('bounds inline writes atomically and allows deleting oversized legacy sessions without reading them', () => {
    const app = setup();
    const limited = new SessionPolicy(app.root, 2, 1000, app.now, () => {}, 1000);
    const client = app.connect('account-a', 'limited', limited);
    const handle = client.tool.createSession();
    const file = join(client.directory, `${handle.sessionId}.json`);
    const before = fs.readFileSync(file, 'utf8');
    expect(() => client.tool.applySchemaPatch({ items: [{ alias: 'X1', term: 'x'.repeat(2000) }] }))
      .toThrow(expect.objectContaining({ code: 'SESSION_TOO_LARGE' }));
    expect(fs.readFileSync(file, 'utf8')).toBe(before);
    expect(client.tool.getSessionState().items).toEqual([]);
    fs.writeFileSync(file, 'x'.repeat(2000));
    const read = fs.readFileSync.bind(fs);
    const spy = vi.spyOn(fs, 'readFileSync').mockImplementation(((path: Parameters<typeof fs.readFileSync>[0], ...args: unknown[]) => {
      if (path === file) throw new Error('Oversized payload must not be read');
      return Reflect.apply(read, fs, [path, ...args]);
    }) as typeof fs.readFileSync);
    try {
      const row = limited.list('account-a', client.namespace).items[0];
      expect(row).toMatchObject({ overSizeLimit: true, readable: false });
      expect(() => client.tool.getSessionState()).toThrow(expect.objectContaining({ code: 'SESSION_TOO_LARGE' }));
      expect(limited.delete('account-a', row.sessionRef, row.revision, true, true).deleted).toBe(true);
      expect(fs.existsSync(file)).toBe(false);
    } finally { spy.mockRestore(); }
  });

  it('registers oversized legacy metadata without reading or expiring its unverified payload', () => {
    const app = setup();
    const client = app.connect();
    const file = join(client.directory, 'legacy-large.json');
    fs.writeFileSync(file, 'UNVERIFIED'.repeat(200));
    const limited = new SessionPolicy(app.root, 2, 1000, app.now, () => {}, 1000);
    const read = fs.readFileSync.bind(fs);
    const spy = vi.spyOn(fs, 'readFileSync').mockImplementation(((path: Parameters<typeof fs.readFileSync>[0], ...args: unknown[]) => {
      if (path === file) throw new Error('Legacy payload must stay unread');
      return Reflect.apply(read, fs, [path, ...args]);
    }) as typeof fs.readFileSync);
    try {
      limited.register('account-a', client.namespace);
      app.advance(2000);
      expect(limited.sweep().size).toBe(0);
      const row = limited.list('account-a', client.namespace).items[0];
      expect(row).toMatchObject({ overSizeLimit: true, readable: false, expiresAt: null });
      expect(limited.configuration('account-a').usage.expiredAwaitingCleanup).toBe(0);
      expect(limited.delete('account-a', row.sessionRef, row.revision, true).deleted).toBe(true);
    } finally { spy.mockRestore(); }
  });

  it('shares quota across workspaces while isolating accounts and allowing replacement at capacity', () => {
    const app = setup();
    const a = app.connect();
    const b = app.connect('account-a', 'another-task');
    const other = app.connect('account-b');
    const first = a.tool.createSession();
    b.tool.createSession();
    expect(() => a.tool.createSession()).toThrow(expect.objectContaining({ code: 'SESSION_LIMIT_REACHED', details:
      expect.objectContaining({ limit: 2, count: 2 }) }));
    expect(() => other.tool.createSession()).not.toThrow();
    expect(a.tool.importData(a.tool.exportSession(first.sessionId)).sessionId).toBe(first.sessionId);
  }, 15_000); // Several durable fsync writes can exceed 5 seconds on Windows security-scanned temp volumes.

  it('renews on reads, deletes at expiry, frees quota and cannot revive a cached state', () => {
    const app = setup(1);
    const client = app.connect();
    const session = client.tool.createSession();
    app.advance(600);
    client.tool.getSessionState('summary', session.sessionId);
    app.advance(600);
    app.policy.sweep();
    expect(fs.existsSync(join(client.directory, `${session.sessionId}.json`))).toBe(true);
    app.advance(401);
    app.policy.sweep();
    expect(fs.existsSync(join(client.directory, `${session.sessionId}.json`))).toBe(false);
    expect(() => client.tool.getSessionState('full', session.sessionId)).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND_OR_EXPIRED' }));
    expect(() => client.tool.applySchemaPatch({ items: [{ alias: 'X1' }] }, session.sessionId)).toThrow();
    expect(() => client.tool.createSession()).not.toThrow();
  });

  it('evicts cached state through the lifecycle binding and releases callbacks with the transport', () => {
    const app = setup();
    const client = app.connect();
    const hooks = app.policy.hooks('account-a', client.namespace);
    const evicted: string[] = [];
    const tool = new RSToolAgent({ persistenceDir: client.directory, sessionLifecycle: { ...hooks,
      onEviction: evict => hooks.onEviction(id => { evicted.push(id); evict(id); }) } });
    const session = tool.createSession();
    app.advance(1000);
    app.policy.sweep();
    expect(evicted).toEqual([session.sessionId]);
    const next = tool.createSession();
    app.policy.release(client.namespace);
    app.advance(1000);
    app.policy.sweep();
    expect(evicted).toEqual([session.sessionId]);
    expect(() => tool.exportSession(next.sessionId)).toThrow();
  });

  it('reports expiry immediately without relying on the background sweep', () => {
    const app = setup();
    const { tool } = app.connect();
    const session = tool.createSession();
    app.advance(1000);
    expect(() => tool.exportSession(session.sessionId)).toThrow(expect.objectContaining({ code: 'SESSION_EXPIRED' }));
    expect(() => tool.exportSession(session.sessionId)).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND_OR_EXPIRED' }));
  });

  it('enforces quota on imported sessions and implicit creation in a different workspace', () => {
    const app = setup(1);
    const first = app.connect();
    first.tool.createSession();
    const next = app.connect('account-a', 'import');
    expect(() => next.tool.importData({ title: 'Imported', alias: 'IMPORT', items: [] }, 'portal-schema')).toThrow(
      expect.objectContaining({ code: 'SESSION_LIMIT_REACHED' }));
    expect(() => next.tool.applySchemaPatch({ items: [{ alias: 'X1' }] })).toThrow(
      expect.objectContaining({ code: 'SESSION_LIMIT_REACHED' }));
    expect(next.tool.getCurrentSession()).toBeNull();
  });

  it('keeps timestamps and quota across restart without treating imports as a trusted expiry clock', () => {
    const app = setup(1);
    const first = app.connect();
    const session = first.tool.createSession({ createdAt: '1900-01-01T00:00:00Z' });
    app.advance(600);
    const restarted = new SessionPolicy(app.root, 1, 1000, app.now);
    const next = app.connect('account-a', 'task', restarted);
    expect(() => next.tool.createSession()).toThrow(expect.objectContaining({ code: 'SESSION_LIMIT_REACHED' }));
    app.advance(400);
    restarted.sweep();
    expect(() => next.tool.getSessionState('full', session.sessionId)).toThrow();
    expect(() => next.tool.createSession()).not.toThrow();
  });

  it('pins async work against sweeps, but never extends the clock just for a live transport', () => {
    const app = setup();
    const client = app.connect();
    const session = client.tool.createSession();
    const release = app.policy.begin(client.namespace);
    client.tool.getSessionState('full', session.sessionId);
    app.advance(1500);
    app.policy.sweep();
    expect(fs.existsSync(join(client.directory, `${session.sessionId}.json`))).toBe(true);
    expect(() => client.tool.commitStep('finished', session.sessionId)).not.toThrow();
    release();
    app.advance(1000);
    app.policy.sweep();
    expect(fs.existsSync(join(client.directory, `${session.sessionId}.json`))).toBe(false);
  });

  it('reclaims expired entries before admitting a new session in the creating workspace', () => {
    const app = setup(1);
    const client = app.connect();
    client.tool.createSession();
    app.advance(1000);
    const release = app.policy.begin(client.namespace);
    try { expect(() => client.tool.createSession()).not.toThrow(); } finally { release(); }
  });

  it('preserves an existing session when its replacement stamp cannot be saved', () => {
    const app = setup(1);
    const client = app.connect();
    client.tool.createSession({ title: 'Before' });
    const before = client.tool.exportSession();
    const incoming = JSON.parse(before);
    incoming.state.title = 'Must not replace';
    const rename = fs.renameSync;
    let stamps = 0;
    const fault = vi.spyOn(fs, 'renameSync').mockImplementation((from, to) => {
      if (String(to).includes('.lifecycle') && ++stamps === 2) throw Object.assign(new Error('Synthetic private path'), { code: 'ENOSPC' });
      return rename(from, to);
    });
    try {
      expect(() => client.tool.importData(incoming)).toThrow(expect.objectContaining({ code: 'SESSION_STORAGE_UNAVAILABLE' }));
    } finally { fault.mockRestore(); }
    expect(client.tool.exportSession()).toBe(before);
    expect(new RSToolAgent({ persistenceDir: client.directory }).exportSession()).toBe(before);
  }, 15_000);

  it('does not reserve quota when a session payload fails to save', () => {
    const app = setup(1);
    const { tool, directory } = app.connect();
    fs.mkdirSync(join(directory, 'blocked.json'));
    expect(() => tool.createSession({ sessionId: 'blocked' })).toThrow();
    expect(() => tool.createSession()).not.toThrow();
  });

  it('blocks undercounted legacy storage until an administrator or authenticated connection claims it', () => {
    const app = setup(1);
    const legacy = 'a'.repeat(64);
    const directory = join(app.root, legacy);
    const old = new RSToolAgent({ persistenceDir: directory });
    const session = old.createSession({ title: 'Preserved' });
    const client = app.connect();
    expect(() => client.tool.createSession()).toThrow(expect.objectContaining({ code: 'SESSION_STORAGE_MIGRATION_REQUIRED' }));
    app.advance(100_000);
    app.policy.sweep();
    expect(fs.existsSync(join(directory, `${session.sessionId}.json`))).toBe(true);
    app.policy.register('account-a', legacy);
    expect(() => client.tool.createSession()).toThrow(expect.objectContaining({ code: 'SESSION_LIMIT_REACHED' }));
    app.advance(1000);
    app.policy.sweep();
    expect(() => client.tool.createSession()).not.toThrow();
  });

  it.skipIf(process.platform === 'win32')('refuses symlink metadata instead of reading another directory', () => {
    const app = setup();
    const client = app.connect();
    client.tool.createSession();
    const metadata = join(client.directory, '.lifecycle');
    fs.renameSync(metadata, join(app.root, 'saved-metadata'));
    fs.symlinkSync(join(app.root, 'saved-metadata'), metadata, 'dir');
    expect(app.policy.sweep().get(client.namespace)).toMatchObject({ code: 'SESSION_STORAGE_UNAVAILABLE' });
    expect(() => client.tool.createSession()).toThrow(expect.objectContaining({ code: 'SESSION_STORAGE_UNAVAILABLE' }));
  });

  it('preserves unrelated JSON instead of treating it as an expiring session', () => {
    const app = setup();
    const namespace = 'b'.repeat(64);
    const directory = join(app.root, namespace);
    fs.mkdirSync(directory);
    const path = join(directory, 'notes.json');
    const contents = JSON.stringify({ notes: 'Not a session envelope' });
    fs.writeFileSync(path, contents);
    expect(() => app.policy.register('account-a', namespace)).toThrow(
      expect.objectContaining({ code: 'SESSION_STORAGE_UNAVAILABLE' }));
    app.advance(100_000);
    expect(app.policy.sweep().get(namespace)).toMatchObject({ code: 'SESSION_STORAGE_UNAVAILABLE' });
    expect(fs.readFileSync(path, 'utf8')).toBe(contents);
  });

  it('continues sweeping healthy workspaces and blocks only the account with corrupt session metadata', () => {
    const app = setup(1);
    const broken = app.connect();
    const healthy = app.connect('account-b');
    const first = broken.tool.createSession();
    const second = healthy.tool.createSession();
    const key = createHash('sha256').update(first.sessionId).digest('hex');
    fs.writeFileSync(join(broken.directory, '.lifecycle', 'sessions', `${key}.json`), '{');
    app.advance(1000);
    expect(app.policy.sweep().has(broken.namespace)).toBe(true);
    expect(fs.existsSync(join(healthy.directory, `${second.sessionId}.json`))).toBe(false);
    expect(() => healthy.tool.createSession()).not.toThrow();
    expect(() => broken.tool.createSession()).toThrow(expect.objectContaining({ code: 'SESSION_STORAGE_UNAVAILABLE' }));
  });

  it('checks publication freshness against actual time even while an older invocation is pinned', () => {
    const app = setup();
    const client = app.connect();
    const session = client.tool.createSession();
    const release = app.policy.begin(client.namespace);
    client.tool.getSessionState('full', session.sessionId);
    app.advance(1000);
    try {
      expect(() => app.policy.assertRetained(client.namespace, session.sessionId)).toThrow(
        expect.objectContaining({ code: 'SESSION_EXPIRED' }));
    } finally { release(); }
  });

  it('fails closed on corrupt owner metadata and rejects ownership reassignment', () => {
    const app = setup();
    const client = app.connect();
    expect(() => app.policy.register('another-account', client.namespace)).toThrow();
    fs.writeFileSync(join(client.directory, '.lifecycle', 'owner.json'), '{');
    expect(() => client.tool.createSession()).toThrow(expect.objectContaining({ code: 'SESSION_STORAGE_UNAVAILABLE' }));
  });
});

describe('session policy environment', () => {
  it('parses seconds and validates configured values without echoing them', () => {
    expect(sessionPolicyConfiguration({ RSTOOL_MAX_SESSIONS_PER_ACCOUNT: '20', RSTOOL_SESSION_RETENTION_SECONDS: '2592000' }))
      .toEqual({ maxStoredSessionsPerAccount: 20, sessionRetentionMs: 2592000000 });
    for (const value of ['0', '-1', '1.5', 'NaN', '', '9007199254740991']) {
      expect(() => sessionPolicyConfiguration({ RSTOOL_SESSION_RETENTION_SECONDS: value })).toThrow();
    }
  });
});
