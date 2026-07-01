import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

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
    for (const dir of dirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  function createPersistence(): SessionPersistence {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rstool-session-'));
    dirs.push(dir);
    return new SessionPersistence(dir);
  }

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
