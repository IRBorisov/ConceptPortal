import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { RSToolAgent } from '@rsconcept/rstool';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PortalClient } from './portal-client';
import { PortalPublisher } from './portal-publisher';
import { PortalVault } from './portal-vault';

const token = 'rcp_abcd1234_' + 'secret'.repeat(8);
const directories: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of directories.splice(0)) {
    const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(directory));
    if (relative.startsWith('..') || !relative.startsWith('portal-vault-test-')) throw new Error('Unsafe cleanup');
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

/** Real encrypted vault and rstool, with only the remote Portal boundary substituted. */
function setup() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-vault-test-'));
  directories.push(directory);
  const key = randomBytes(32);
  const vault = new PortalVault(directory, key);
  let current: Record<string, any> = {
    id: 1,
    title: 'Before',
    alias: 'OLD',
    description: '',
    items: [],
    attribution: [],
    time_update: '2026-11-06T01:00:00Z',
  };
  const request = vi.fn<typeof fetch>(async (input, options) => {
    const url = String(input);
    if (url.endsWith('/me')) return Response.json({ id: 10, username: 'Alice' });
    if (url.endsWith('/publish')) {
      const body = JSON.parse(String(options?.body));
      if (body.expected_time_update !== current.time_update) return Response.json({}, { status: 409 });
      current = { ...body.schema, time_update: '2026-11-06T02:00:00Z' };
      return Response.json({ version: 99, schema: current });
    }
    return Response.json(current);
  });
  const api = new PortalClient('https://api.portal.example', request);
  const publisher = new PortalPublisher(vault, api);
  const tool = new RSToolAgent();
  tool.applySchemaPatch({ initial: { alias: 'NEW' }, items: [{ alias: 'X1', term: 'object', convention: 'Objects' }] });
  return {
    directory,
    key,
    vault,
    publisher,
    tool,
    request,
    changeRemote: () => {
      current.time_update = 'changed';
    },
  };
}

describe('Portal credential isolation and publication', () => {
  it('encrypts at rest, resumes with the key, and rejects tampering or cross-subject file substitution', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const file = fs.readdirSync(app.directory).find((name) => name.endsWith('.json'))!;
    const ciphertext = fs.readFileSync(path.join(app.directory, file), 'utf8');
    expect(ciphertext).not.toContain(token);
    expect(new PortalVault(app.directory, app.key).get('alice')?.token).toBe(token);
    expect(app.vault.get('bob')).toBeNull();
    const bobFile = createHash('sha256').update('bob').digest('hex') + '.json';
    fs.writeFileSync(path.join(app.directory, bobFile), ciphertext);
    expect(() => app.vault.get('bob')).toThrow('unavailable');
    expect(() => new PortalVault(app.directory, randomBytes(32)).get('alice')).toThrow('unavailable');
    const parsed = JSON.parse(ciphertext);
    parsed.data = Buffer.from('tampered').toString('base64');
    fs.writeFileSync(path.join(app.directory, file), JSON.stringify(parsed));
    expect(() => app.vault.get('alice')).toThrow('unavailable');
  });

  it('only prepares through MCP and publishes exactly once after the matching user approves', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const draft = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    expect(app.request.mock.calls.some(([url]) => String(url).endsWith('/publish'))).toBe(false);
    expect(app.publisher.publications('bob')).toEqual([]);
    await expect(app.publisher.approve('bob', draft.publicationId, draft.digest)).rejects.toThrow('not found');
    await expect(app.publisher.approve('alice', draft.publicationId, 'wrong')).rejects.toThrow('changed');
    const result = await app.publisher.approve('alice', draft.publicationId, draft.digest);
    expect(result).toMatchObject({ version: 99, targetId: 1 });
    expect(JSON.stringify(app.publisher.publications('alice'))).not.toContain(token);
    await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow(
      'already attempted'
    );
    expect(app.request.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(1);
  });

  it('rejects changed local content and stale Portal bases', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const old = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    app.tool.applySchemaPatch({ items: [{ alias: 'X2', term: 'other object', convention: 'Other objects' }] });
    await expect(app.publisher.approve('alice', old.publicationId, old.digest)).rejects.toThrow('Local schema changed');
    const stale = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    app.changeRemote();
    await expect(app.publisher.approve('alice', stale.publicationId, stale.digest)).rejects.toThrow('schema changed');
    expect(app.publisher.publications('alice')[0].state).toBe('uncertain');
    await expect(app.publisher.approve('alice', stale.publicationId, stale.digest)).rejects.toThrow(
      'already attempted'
    );
  });

  it('invalidates approval on key replacement, disconnect and workspace disposal', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const draft = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    await app.publisher.connect('alice', token + 'new');
    await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow('not found');
    await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    app.publisher.invalidateWorkspace('workspace');
    expect(app.publisher.publications('alice')).toEqual([]);
    await app.publisher.disconnect('alice');
    await expect(app.publisher.prepare('alice', 'workspace', 1, app.tool)).rejects.toThrow('personal Portal key');
  });

  it('allows service keys only for explicitly assigned subjects and targets without personal fallback', async () => {
    const app = setup();
    const publisher = new PortalPublisher(app.vault, new PortalClient('https://api.portal.example', app.request), {
      token,
      subjects: ['robot'],
      targetIds: [1],
    });
    await expect(publisher.prepare('alice', 'a', 1, app.tool)).rejects.toThrow('personal Portal key');
    await expect(publisher.prepare('robot', 'r', 2, app.tool)).rejects.toThrow('not allowed');
    await expect(publisher.connect('robot', token)).rejects.toThrow('administrator-managed');
    await expect(publisher.prepare('robot', 'r', 1, app.tool)).resolves.toMatchObject({ targetId: 1 });
  });

  it('does not leak remote bodies or fetch exceptions and refuses redirects', async () => {
    const app = setup();
    app.request.mockImplementationOnce(async () => {
      throw new Error('Authorization: Bearer ' + token);
    });
    await expect(app.publisher.connect('alice', token)).rejects.toThrow('Portal request failed');
    app.request.mockResolvedValueOnce(new Response(token, { status: 403 }));
    await expect(app.publisher.connect('alice', token)).rejects.toThrow('403');
    expect(app.request.mock.calls[0][1]?.redirect).toBe('error');
    expect(() => new PortalClient('http://public.example')).toThrow('HTTPS');
    expect(() => new PortalClient('https://public.example/other')).toThrow('HTTPS');
  });

  it('preserves the old encrypted credential if durable replacement fails', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    vi.spyOn(fs, 'renameSync').mockImplementationOnce(() => {
      throw new Error('disk full');
    });
    await expect(app.publisher.connect('alice', token + 'new')).rejects.toThrow('disk full');
    expect(app.vault.get('alice')?.token).toBe(token);
    expect(fs.readdirSync(app.directory)).toHaveLength(1);
  });
});
