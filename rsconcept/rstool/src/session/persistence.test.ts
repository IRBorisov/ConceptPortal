import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionPersistence, type PersistedSessionEnvelope } from './persistence';

const envelope: PersistedSessionEnvelope = {
  state: {
    sessionId: 'safe-id',
    alias: '',
    title: '',
    comment: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    revisions: [],
    items: [],
    model: { items: [] }
  },
  diagnostics: []
};

describe('SessionPersistence', () => {
  const dirs: string[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
    for (const dir of dirs.splice(0)) {
      const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(dir));
      if (relative.startsWith('..') || !relative.startsWith('rstool-session-')) throw new Error('Unsafe cleanup path');
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('preserves the previous session after a partial write and cleans up its temporary file', () => {
    const persistence = createPersistence();
    persistence.save('safe-id', envelope);
    const write = fs.writeFileSync;
    vi.spyOn(fs, 'writeFileSync').mockImplementation(file => {
      write(file, '{', 'utf8');
      throw new Error('Simulated partial write');
    });
    expect(() => persistence.save('safe-id', { ...envelope, state: { ...envelope.state, title: 'new' } })).toThrow(/Simulated partial write/);
    vi.restoreAllMocks();
    expect(persistence.load('safe-id')).toEqual(envelope);
    expect(fs.readdirSync(dirs.at(-1)!)).toEqual(['safe-id.json']);
  });

  it.each(['rename', 'flush'] as const)('preserves the previous file on %s failure', failure => {
    const persistence = createPersistence();
    persistence.save('safe-id', envelope);
    if (failure === 'rename') vi.spyOn(fs, 'renameSync').mockImplementation(() => { throw new Error('Simulated failure'); });
    else vi.spyOn(fs, 'fsyncSync').mockImplementation(() => { throw new Error('Simulated failure'); });
    expect(() => persistence.save('safe-id', { ...envelope, state: { ...envelope.state, title: 'new' } })).toThrow(/Simulated failure/);
    vi.restoreAllMocks();
    expect(persistence.load('safe-id')).toEqual(envelope);
    expect(fs.readdirSync(dirs.at(-1)!)).toEqual(['safe-id.json']);
  });

  it('preserves the current-session pointer when replacement fails', () => {
    const persistence = createPersistence();
    persistence.saveCurrentSessionId('first');
    vi.spyOn(fs, 'renameSync').mockImplementation(() => { throw new Error('Simulated failure'); });
    expect(() => persistence.saveCurrentSessionId('second')).toThrow(/Simulated failure/);
    vi.restoreAllMocks();
    expect(persistence.loadCurrentSessionId()).toBe('first');
    expect(fs.readdirSync(dirs.at(-1)!)).toEqual(['_current.json']);
  });

  it('does not remove a sibling file when exclusive creation reports a collision', () => {
    const persistence = createPersistence();
    persistence.save('safe-id', envelope);
    const open = fs.openSync;
    let collidedFile = '';
    vi.spyOn(fs, 'openSync').mockImplementationOnce(file => {
      collidedFile = String(file);
      const descriptor = open(file, 'wx', 0o600);
      fs.writeFileSync(descriptor, 'another writer', 'utf8');
      fs.closeSync(descriptor);
      throw Object.assign(new Error('Simulated collision'), { code: 'EEXIST' });
    });
    expect(() => persistence.save('safe-id', envelope)).toThrow(/Simulated collision/);
    vi.restoreAllMocks();
    expect(fs.readFileSync(collidedFile, 'utf8')).toBe('another writer');
    expect(persistence.load('safe-id')).toEqual(envelope);
  });

  it.each(['_current', '_CURRENT', 'safe:stream', 'NUL', 'con.txt'])(
    'rejects the reserved or nonportable session id %s without touching metadata', sessionId => {
      const persistence = createPersistence();
      persistence.saveCurrentSessionId('first');
      expect(() => persistence.save(sessionId, envelope)).toThrow(/Invalid session ID/);
      expect(() => persistence.load(sessionId)).toThrow(/Invalid session ID/);
      expect(() => persistence.delete(sessionId)).toThrow(/Invalid session ID/);
      expect(persistence.loadCurrentSessionId()).toBe('first');
    },
  );

  function createPersistence(): SessionPersistence {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rstool-session-'));
    dirs.push(dir);
    return new SessionPersistence(dir);
  }

  it('supports long session IDs without extending the temporary filename', () => {
    const persistence = createPersistence();
    const sessionId = 'a'.repeat(240);
    persistence.save(sessionId, envelope);
    expect(persistence.load(sessionId)).toEqual(envelope);
    expect(fs.readdirSync(dirs.at(-1)!)).toEqual([`${sessionId}.json`]);
  });

  it.each(['_current', 'con.txt', '../escape', '', 42, {}])('ignores unsafe persisted pointer %j', sessionId => {
    const persistence = createPersistence();
    fs.writeFileSync(path.join(dirs.at(-1)!, '_current.json'), JSON.stringify({ sessionId }), 'utf8');
    expect(persistence.loadCurrentSessionId()).toBeNull();
  });

  it('persists a safe session id under the configured directory', () => {
    const persistence = createPersistence();
    const sessionId = 'a03eec4c-6519-4088-9d8c-0a9c11611583';

    persistence.save(sessionId, envelope);

    expect(persistence.load(sessionId)).toEqual(envelope);
    persistence.delete(sessionId);
    expect(persistence.load(sessionId)).toBeNull();
  });

  it.each(['../escape', 'foo/bar', 'foo\\bar', '..', 'safe/../escape'])(
    'rejects unsafe session id %j on save',
    unsafeId => {
      const persistence = createPersistence();
      expect(() => persistence.save(unsafeId, envelope)).toThrow(/Invalid session ID/);
    }
  );

  it.each(['../escape', 'foo/bar', 'foo\\bar', '..', 'safe/../escape'])(
    'rejects unsafe session id %j on load and delete',
    unsafeId => {
      const persistence = createPersistence();
      expect(() => persistence.load(unsafeId)).toThrow(/Invalid session ID/);
      expect(() => persistence.delete(unsafeId)).toThrow(/Invalid session ID/);
    }
  );
});
