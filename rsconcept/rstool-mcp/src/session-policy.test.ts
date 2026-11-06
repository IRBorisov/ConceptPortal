import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { RSToolAgent } from '@rsconcept/rstool';
import { afterEach, describe, expect, it } from 'vitest';

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
    return { namespace, directory, tool: new RSToolAgent({ persistenceDir: directory,
      sessionLifecycle: selectedPolicy.hooks(subject, namespace) }) };
  }
  return { root, policy, connect, now: () => time, advance: (ms: number) => { time += ms; } };
}

describe('durable account session policy', () => {
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
  });

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
    expect(() => app.policy.sweep()).toThrow(expect.objectContaining({ code: 'SESSION_STORAGE_UNAVAILABLE' }));
    expect(() => client.tool.createSession()).toThrow(expect.objectContaining({ code: 'SESSION_STORAGE_UNAVAILABLE' }));
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
