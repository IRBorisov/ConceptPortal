import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

import { RSToolAgent } from '@rsconcept/rstool';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionPolicy } from './session-policy';

const directories: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  for (const directory of directories.splice(0)) {
    const child = relative(resolve(tmpdir()), resolve(directory));
    if (child.startsWith('..') || !child.startsWith('rstool-manage-')) throw new Error('Unsafe cleanup');
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

/** Real durable agents with the same logical invocation boundaries as the HTTP host. */
function setup(limit = 3) {
  const root = fs.mkdtempSync(join(tmpdir(), 'rstool-manage-'));
  directories.push(root);
  let now = 10_000;
  const policy = new SessionPolicy(root, limit, 1000, () => now);
  function connect(subject = 'account-a', workspace = 'task') {
    const namespace = createHash('sha256').update(JSON.stringify([subject, workspace])).digest('hex');
    policy.register(subject, namespace, workspace);
    const directory = join(root, namespace);
    const agent = new RSToolAgent({ persistenceDir: directory, sessionLifecycle: policy.hooks(subject, namespace) });
    const tool = new Proxy(agent, { get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      if (typeof value !== 'function') return value;
      return (...args: unknown[]) => {
        const release = policy.begin(namespace);
        try {
          const result: unknown = Reflect.apply(value, target, args);
          if (result instanceof Promise) return result.finally(release);
          release(); return result;
        } catch (error) { release(); throw error; }
      };
    } });
    return { subject, namespace, directory, tool };
  }
  return { root, policy, connect, advance: (ms: number) => { now += ms; } };
}

describe('account session self-service', () => {
  it('reports safe effective quota and metadata without renewing retention or revealing other accounts', () => {
    const app = setup(2);
    const first = app.connect();
    const second = app.connect('account-a', 'another-task');
    const foreign = app.connect('account-b');
    first.tool.createSession({ title: 'T'.repeat(400), comment: 'not-for-listing' });
    second.tool.createSession({ title: 'Second' });
    foreign.tool.createSession({ title: 'foreign-private-title' });
    app.advance(500);
    const config = app.policy.configuration(first.subject);
    expect(config.limits).toMatchObject({ maxSessionsPerAccount: 2, retentionSeconds: 1 });
    expect(config.usage).toMatchObject({ status: 'complete', storedSessions: 2, availableSlots: 0 });
    const page = app.policy.list(first.subject, first.namespace);
    expect(page.total).toBe(2);
    expect(page.items.find(item => item.titleTruncated)?.title.length).toBe(200);
    expect(JSON.stringify(page)).not.toContain('not-for-listing');
    expect(JSON.stringify(page)).not.toContain('foreign-private-title');
    expect(JSON.stringify(page)).not.toContain(app.root);
    expect(page.items.every(item => item.lastUsedAt === '1970-01-01T00:00:10.000Z')).toBe(true);
    app.advance(500);
    app.policy.sweep();
    expect(app.policy.configuration(first.subject).usage.storedSessions).toBe(0);
  }, 15_000);

  it('deletes the explicitly selected current session, clears both selections and frees quota immediately', () => {
    const app = setup(1);
    const client = app.connect();
    const session = client.tool.createSession();
    const row = app.policy.list(client.subject, client.namespace).items[0];
    expect(() => app.policy.delete(client.subject, row.sessionRef, row.revision, false)).toThrow(
      expect.objectContaining({ code: 'SESSION_DELETE_CONFIRMATION_REQUIRED' }));
    expect(() => app.policy.delete(client.subject, row.sessionRef, row.revision, true)).toThrow(
      expect.objectContaining({ code: 'SESSION_IS_CURRENT' }));
    const deleted = app.policy.delete(client.subject, row.sessionRef, row.revision, true, true);
    expect(deleted).toMatchObject({ deleted: true, freedSlots: 1, currentSelectionCleared: true,
      cleanupWarnings: [], usage: { storedSessions: 0, availableSlots: 1 } });
    expect(JSON.parse(fs.readFileSync(join(client.directory, '_current.json'), 'utf8'))).toEqual({ sessionId: null });
    expect(client.tool.getCurrentSession()).toBeNull();
    expect(client.tool.ensureSession().sessionId).not.toBe(session.sessionId);
    expect(() => app.policy.delete(client.subject, row.sessionRef, row.revision, true, true)).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND_OR_EXPIRED' }));
  });

  it('distinguishes equal IDs across workspaces and hides foreign refs even when the foreign workspace is busy', () => {
    const app = setup();
    const first = app.connect();
    const second = app.connect('account-a', 'second');
    const foreign = app.connect('account-b');
    for (const client of [first, second, foreign]) client.tool.createSession({ sessionId: 'shared-id' });
    const rows = app.policy.list(first.subject, first.namespace).items;
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map(item => item.sessionRef)).size).toBe(2);
    const foreignRow = app.policy.list(foreign.subject, foreign.namespace).items[0];
    const release = app.policy.begin(foreign.namespace);
    try {
      expect(() => app.policy.delete(first.subject, foreignRow.sessionRef, foreignRow.revision, true, true)).toThrow(
        expect.objectContaining({ code: 'SESSION_NOT_FOUND_OR_EXPIRED' }));
    } finally { release(); }
    const selected = rows.find(item => item.workspaceId === second.namespace)!;
    app.policy.delete(first.subject, selected.sessionRef, selected.revision, true, true);
    expect(fs.existsSync(join(first.directory, 'shared-id.json'))).toBe(true);
    expect(fs.existsSync(join(second.directory, 'shared-id.json'))).toBe(false);
    expect(fs.existsSync(join(foreign.directory, 'shared-id.json'))).toBe(true);
  }, 15_000);

  it('prunes a disconnected workspace after deleting its final session from another workspace', () => {
    const app = setup();
    const target = app.connect('account-a', 'old-task');
    target.tool.createSession();
    app.policy.release(target.namespace);
    const caller = app.connect('account-a', 'management');
    const row = app.policy.list(caller.subject, caller.namespace).items[0];
    expect(row.connected).toBe(false);
    expect(app.policy.delete(caller.subject, row.sessionRef, row.revision, true, true).deleted).toBe(true);
    expect(fs.existsSync(target.directory)).toBe(false);
  });

  it('prunes a disconnected workspace after its final stored session expires', () => {
    const app = setup();
    const target = app.connect();
    target.tool.createSession();
    app.policy.release(target.namespace);
    app.advance(1000);
    expect(app.policy.sweep().size).toBe(0);
    expect(fs.existsSync(target.directory)).toBe(false);
  });

  it('rejects a stale revision after a read even when the activity clock has not advanced', () => {
    const app = setup();
    const client = app.connect();
    const session = client.tool.createSession();
    const row = app.policy.list(client.subject, client.namespace).items[0];
    client.tool.exportSession(session.sessionId);
    expect(() => app.policy.delete(client.subject, row.sessionRef, row.revision, true, true)).toThrow(
      expect.objectContaining({ code: 'SESSION_CHANGED' }));
    const next = app.policy.list(client.subject, client.namespace).items[0];
    expect(next.lastUsedAt).toBe(row.lastUsedAt);
    expect(next.revision).not.toBe(row.revision);
  });

  it('rejects same-clock identical reimports as a new incarnation despite equal payload bytes', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const app = setup();
    const client = app.connect();
    const session = client.tool.createSession();
    const exported = client.tool.exportSession();
    const row = app.policy.list(client.subject, client.namespace).items[0];
    const before = fs.readFileSync(join(client.directory, `${session.sessionId}.json`));
    client.tool.importData(exported);
    expect(fs.readFileSync(join(client.directory, `${session.sessionId}.json`))).toEqual(before);
    expect(() => app.policy.delete(client.subject, row.sessionRef, row.revision, true, true)).toThrow(
      expect.objectContaining({ code: 'SESSION_CHANGED' }));
  });

  it('rejects an ordinary same-clock edit ABA even if payload bytes return to the original value', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const app = setup();
    const client = app.connect();
    client.tool.applySchemaPatch({ items: [{ alias: 'X1', term: 'Original' }] });
    const row = app.policy.list(client.subject, client.namespace).items[0];
    const file = join(client.directory, `${row.sessionId}.json`);
    const before = fs.readFileSync(file);
    client.tool.applySchemaPatch({ items: [{ alias: 'X1', term: 'Changed' }] });
    client.tool.applySchemaPatch({ items: [{ alias: 'X1', term: 'Original' }] });
    expect(fs.readFileSync(file)).toEqual(before);
    expect(() => app.policy.delete(client.subject, row.sessionRef, row.revision, true, true)).toThrow(
      expect.objectContaining({ code: 'SESSION_CHANGED' }));
  });

  it('refuses busy workspaces until their operation completes', () => {
    const app = setup();
    const client = app.connect();
    client.tool.createSession();
    const release = app.policy.begin(client.namespace);
    const row = app.policy.list(client.subject, client.namespace).items[0];
    expect(row.busy).toBe(true);
    expect(() => app.policy.delete(client.subject, row.sessionRef, row.revision, true, true)).toThrow(
      expect.objectContaining({ code: 'SESSION_BUSY' }));
    release();
    expect(() => app.policy.delete(client.subject, row.sessionRef, row.revision, true, true)).toThrow(
      expect.objectContaining({ code: 'SESSION_CHANGED' }));
    const fresh = app.policy.list(client.subject, client.namespace).items[0];
    expect(fresh.busy).toBe(false);
    expect(app.policy.delete(client.subject, fresh.sessionRef, fresh.revision, true, true).deleted).toBe(true);
  });

  it('paginates oldest-first without touching sessions and detects changed ordering or activity', () => {
    const app = setup();
    const client = app.connect();
    const first = client.tool.createSession({ title: 'First' });
    app.advance(100);
    client.tool.createSession({ title: 'Second' });
    app.advance(100);
    client.tool.createSession({ title: 'Third' });
    const one = app.policy.list(client.subject, client.namespace, 1);
    expect(one.items[0].title).toBe('First');
    const two = app.policy.list(client.subject, client.namespace, 1, one.nextCursor!);
    expect(two.items[0].title).toBe('Second');
    const three = app.policy.list(client.subject, client.namespace, 1, two.nextCursor!);
    expect(three.items[0].title).toBe('Third');
    expect(three.nextCursor).toBeNull();
    client.tool.exportSession(first.sessionId);
    expect(() => app.policy.list(client.subject, client.namespace, 1, one.nextCursor!)).toThrow(
      expect.objectContaining({ code: 'SESSION_LIST_CHANGED' }));
    expect(() => app.policy.list(client.subject, client.namespace, 0)).toThrow();
    expect(() => app.policy.list(client.subject, client.namespace, 101)).toThrow();
    expect(() => app.policy.list(client.subject, client.namespace, 1, '???')).toThrow();
  }, 15_000);

  it('reports deletion success if only final timestamp cleanup fails, and retries orphan cleanup later', () => {
    const app = setup(1);
    const client = app.connect();
    const session = client.tool.createSession();
    const row = app.policy.list(client.subject, client.namespace).items[0];
    const stamp = join(client.directory, '.lifecycle', 'sessions', `${createHash('sha256').update(session.sessionId).digest('hex')}.json`);
    const remove = fs.rmSync;
    const fault = vi.spyOn(fs, 'rmSync').mockImplementation((path, options) => {
      if (String(path) === stamp) throw Object.assign(new Error('Synthetic metadata cleanup failure'), { code: 'EPERM' });
      return remove(path, options);
    });
    try {
      const result = app.policy.delete(client.subject, row.sessionRef, row.revision, true, true);
      expect(result).toMatchObject({ deleted: true, freedSlots: 1, cleanupWarnings: ['SESSION_METADATA_CLEANUP_PENDING'],
        usage: { storedSessions: 0, availableSlots: 1 } });
      expect(result.recovery).toContain('Do not delete another session');
    } finally { fault.mockRestore(); }
    expect(fs.existsSync(join(client.directory, `${session.sessionId}.json`))).toBe(false);
    expect(fs.existsSync(stamp)).toBe(true);
    app.policy.sweep();
    expect(fs.existsSync(stamp)).toBe(false);
    expect(() => client.tool.createSession()).not.toThrow();
  });

  it('restores current selection and preserves data when payload unlink fails before the commit point', () => {
    const app = setup();
    const client = app.connect();
    const session = client.tool.createSession();
    const row = app.policy.list(client.subject, client.namespace).items[0];
    const payload = join(client.directory, `${session.sessionId}.json`);
    const unlink = fs.unlinkSync;
    const fault = vi.spyOn(fs, 'unlinkSync').mockImplementation(path => {
      if (String(path) === payload) throw Object.assign(new Error('Synthetic unlink failure'), { code: 'EPERM' });
      return unlink(path);
    });
    try { expect(() => app.policy.delete(client.subject, row.sessionRef, row.revision, true, true)).toThrow(); }
    finally { fault.mockRestore(); }
    expect(fs.existsSync(payload)).toBe(true);
    expect(client.tool.getCurrentSession()?.sessionId).toBe(session.sessionId);
    expect(JSON.parse(fs.readFileSync(join(client.directory, '_current.json'), 'utf8')).sessionId).toBe(session.sessionId);
  });

  it.skipIf(process.platform === 'win32')('refuses symlink timestamp parents for read-only config/list and deletion', () => {
    const app = setup();
    const client = app.connect();
    const session = client.tool.createSession();
    const row = app.policy.list(client.subject, client.namespace).items[0];
    const parent = join(client.directory, '.lifecycle', 'sessions');
    const external = fs.mkdtempSync(join(tmpdir(), 'rstool-manage-external-'));
    directories.push(external);
    const moved = join(external, 'sessions');
    fs.renameSync(parent, moved);
    fs.symlinkSync(moved, parent, 'dir');
    const before = fs.readdirSync(moved).map(name => fs.readFileSync(join(moved, name), 'utf8'));
    expect(app.policy.configuration(client.subject).usage.status).toBe('unavailable');
    expect(() => app.policy.list(client.subject, client.namespace)).toThrow();
    expect(() => app.policy.delete(client.subject, row.sessionRef, row.revision, true, true)).toThrow();
    expect(fs.existsSync(join(client.directory, `${session.sessionId}.json`))).toBe(true);
    expect(fs.readdirSync(moved).map(name => fs.readFileSync(join(moved, name), 'utf8'))).toEqual(before);
  });
});
