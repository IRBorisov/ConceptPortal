import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import { PortalClient } from './portal-client';
import { PortalCreations, type PortalItemKind } from './portal-creations';
import { PortalPublisher } from './portal-publisher';
import { PortalVault } from './portal-vault';
import { portalToolDefinitions } from './tools';

const token = 'rcp_12345678_' + 'private-key'.repeat(4);
const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) {
    const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(directory));
    if (relative.startsWith('..') || !relative.startsWith('portal-create-test-')) throw new Error('Unsafe cleanup');
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function setup(scopes = ['read', 'write', 'publish']) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-create-test-'));
  directories.push(directory);
  const vault = new PortalVault(path.join(directory, 'keys'), randomBytes(32));
  vault.set('alice', token, { id: 7, username: 'Alice' }, { scopes: scopes as never, expiresAt: null });
  const stored = new Map<number, Record<string, unknown>>();
  const remote = vi.fn<typeof fetch>(async (input, options) => {
    const url = new URL(String(input));
    expect((options?.headers as Record<string, string>).Authorization).toBe(`Bearer ${token}`);
    if (url.pathname.endsWith('context-search')) return Response.json({ ids: [...stored.keys()] });
    if (options?.method === 'POST') {
      const body = JSON.parse(String(options.body));
      const id = stored.size + 10;
      const item = { ...body, id, owner: 7, items: [], operations: [], blocks: [], time_update: '2026-11-13T00:00:00Z' };
      stored.set(id, item);
      return Response.json(item, { status: 201 });
    }
    const id = Number(url.pathname.split('/').at(-2));
    return Response.json(stored.get(id) ?? {}, { status: stored.has(id) ? 200 : 404 });
  });
  const api = new PortalClient('https://portal.example', remote);
  const receipts = new PortalCreations(path.join(directory, 'receipts'));
  const publisher = new PortalPublisher(vault, api, undefined, receipts);
  const args = { requestId: 'demo-create-001', title: 'Demo', alias: 'DEMO', description: 'Original description',
    location: '/U/Дипломы/DEMO001', accessPolicy: 'private' };
  return { directory, vault, remote, api, receipts, publisher, args, stored };
}

it.each<PortalItemKind>(['schema', 'model', 'oss'])('creates and reads back a %s using the personal account and supplied location', async kind => {
  const app = setup();
  const args = { ...app.args, ...(kind === 'model' ? { schemaId: 123 } : {}) };
  const result = await app.publisher.createItem('alice', kind, args);
  expect(result).toMatchObject({ targetId: 10, kind, verified: true,
    item: { location: app.args.location, access_policy: 'private', owner: 7 } });
  if (kind === 'model') expect(result.item.schema).toBe(123);
  expect(app.remote).toHaveBeenCalledTimes(2);
  await expect(app.publisher.creationStatus('alice', args.requestId)).resolves.toMatchObject({ state: 'created', targetId: 10 });
  const receiptText = fs.readFileSync(path.join(app.directory, 'receipts', fs.readdirSync(path.join(app.directory, 'receipts'))[0]), 'utf8');
  expect(receiptText).not.toContain(token);
  expect(receiptText).not.toContain(app.args.description);
});

it('replays only the result after restart and rejects a changed request with the same ID', async () => {
  const app = setup();
  await app.publisher.createItem('alice', 'schema', app.args);
  const restarted = new PortalPublisher(app.vault, app.api, undefined, new PortalCreations(path.join(app.directory, 'receipts')));
  await expect(restarted.createItem('alice', 'schema', app.args)).resolves.toMatchObject({ targetId: 10 });
  expect(app.remote.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
  await expect(restarted.createItem('alice', 'schema', { ...app.args, title: 'Changed' })).rejects.toThrow('different creation');
});

it('does not duplicate a request arriving concurrently', async () => {
  const app = setup();
  const results = await Promise.all([app.publisher.createItem('alice', 'oss', app.args), app.publisher.createItem('alice', 'oss', app.args)]);
  expect(results.map(r => r.targetId)).toEqual([10, 10]);
  expect(app.remote.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
});

it('records an uncertain POST and refuses to repeat it after restart', async () => {
  const app = setup();
  app.remote.mockRejectedValueOnce(new Error(token));
  await expect(app.publisher.createItem('alice', 'schema', app.args)).rejects.toThrow('check Portal status');
  const restarted = new PortalPublisher(app.vault, app.api, undefined, new PortalCreations(path.join(app.directory, 'receipts')));
  await expect(restarted.creationStatus('alice', app.args.requestId)).resolves.toMatchObject({ state: 'uncertain' });
  await expect(restarted.createItem('alice', 'schema', app.args)).rejects.toThrow('uncertain');
  expect(app.remote).toHaveBeenCalledTimes(1);
});

it('recovers a known ID after failed readback without sending POST again', async () => {
  const app = setup();
  app.remote.mockImplementationOnce(async () => {
    app.stored.set(10, { ...app.args, access_policy: 'private', id: 10 });
    return Response.json({ id: 10 }, { status: 201 });
  }).mockRejectedValueOnce(new Error('lost readback'));
  await expect(app.publisher.createItem('alice', 'schema', app.args)).rejects.toThrow('check Portal status');
  await expect(app.publisher.creationStatus('alice', app.args.requestId)).resolves.toMatchObject({ targetId: 10 });
  await expect(app.publisher.createItem('alice', 'schema', app.args)).resolves.toMatchObject({ targetId: 10 });
  expect(app.remote.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
});

it.each([400, 403, 429])('never loops on a refused POST (%s)', async status => {
  const app = setup();
  app.remote.mockResolvedValueOnce(Response.json({ secret: token }, { status }));
  await expect(app.publisher.createItem('alice', 'schema', app.args)).rejects.toThrow(`(${status})`);
  await expect(app.publisher.createItem('alice', 'schema', app.args)).rejects.toThrow('uncertain');
  expect(app.remote).toHaveBeenCalledTimes(1);
});

it('does not retry POST when verification finds mismatched metadata', async () => {
  const app = setup();
  app.remote.mockResolvedValueOnce(Response.json({ id: 10 }, { status: 201 }))
    .mockImplementation(async () => Response.json({ id: 10, title: 'Wrong' }));
  await expect(app.publisher.createItem('alice', 'schema', app.args)).rejects.toThrow('verification failed');
  await expect(app.publisher.createItem('alice', 'schema', app.args)).rejects.toThrow('verification failed');
  expect(app.remote.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
});

it('rejects missing keys, expired keys, read-only keys and service-target grants before creating anything', async () => {
  const app = setup(['read']);
  await expect(app.publisher.createItem('alice', 'schema', app.args)).rejects.toThrow('does not allow write');
  await expect(app.publisher.createItem('bob', 'schema', app.args)).rejects.toThrow('Connect a personal');
  app.vault.set('alice', token, { id: 7, username: 'Alice' }, { scopes: ['read', 'write'], expiresAt: '2020-01-01T00:00:00Z' });
  await expect(app.publisher.createItem('alice', 'schema', app.args)).rejects.toThrow('expired');
  const service = new PortalPublisher(app.vault, app.api, { token, subjects: ['service'], targetIds: [10] }, app.receipts);
  await expect(service.createItem('service', 'schema', app.args)).rejects.toThrow('personal Portal connection');
  expect(app.remote).not.toHaveBeenCalled();
});

it('isolates receipts by identity and Portal account', async () => {
  const app = setup();
  await app.publisher.createItem('alice', 'schema', app.args);
  app.vault.set('bob', token, { id: 8, username: 'Bob' });
  await expect(app.publisher.creationStatus('bob', app.args.requestId)).resolves.toMatchObject({ state: 'not_found' });
  app.vault.set('alice', token, { id: 9, username: 'Other' });
  await expect(app.publisher.creationStatus('alice', app.args.requestId)).resolves.toMatchObject({ state: 'not_found' });
  await expect(app.publisher.createItem('alice', 'schema', app.args)).rejects.toThrow('different creation');
});

it('searches private library with encoded query and reads the returned ID', async () => {
  const app = setup();
  await app.publisher.createItem('alice', 'schema', app.args);
  await expect(app.publisher.searchLibrary('alice', 'Диплом & x', '/U/Дипломы')).resolves.toEqual({ ids: [10], complete: true });
  const search = new URL(String(app.remote.mock.calls.at(-1)![0]));
  expect(search.searchParams.get('q')).toBe('Диплом & x');
  await expect(app.publisher.getDetails('alice', 'schema', 10)).resolves.toMatchObject({ id: 10 });
});

it('requires model binding and rejects unknown authority fields and unsafe receipt IDs before POST', async () => {
  const app = setup();
  for (const extra of [{ owner: 123 }, { token }, { subject: 'bob' }, { schema: {} }])
    await expect(app.publisher.createItem('alice', 'schema', { ...app.args, ...extra })).rejects.toThrow('Unexpected');
  await expect(app.publisher.createItem('alice', 'model', app.args)).rejects.toThrow('schemaId');
  await expect(app.publisher.createItem('alice', 'schema', { ...app.args, requestId: '../escape' })).rejects.toThrow('requestId');
  await expect(app.publisher.createItem('alice', 'schema', { ...app.args, location: 'U:\\Folder' })).rejects.toThrow('location');
  expect(app.remote).not.toHaveBeenCalled();
});

it('registers session-independent tools with strict schemas and no secret input', () => {
  const app = setup();
  const tools = portalToolDefinitions(app.publisher, 'alice', 'workspace');
  for (const name of ['portal_create_schema','portal_create_model','portal_create_oss','portal_get_creation_status','portal_search_library','portal_get_details']) {
    const tool = tools.find(t => t.name === name)!;
    expect(tool.sessionActivity).toBe('none');
    expect(tool.inputSchema.additionalProperties).toBe(false);
    expect(Object.keys(tool.inputSchema.properties!)).not.toContain('token');
  }
});

it('rejects metadata that the backend would trim before reserving or creating an item', async () => {
  const app = setup();
  for (const changes of [{ title: ' Demo ' }, { alias: ' DEMO' }, { description: '\nDescription\n' },
    { title: '\u0085Demo' }, { description: 'Description\u001f' },
    { location: '/U/Project ' }, { location: '/U/Project\u0085' }]) {
    await expect(app.publisher.createItem('alice', 'schema', { ...app.args, ...changes })).rejects.toThrow('whitespace');
    await expect(app.publisher.creationStatus('alice', app.args.requestId)).resolves.toMatchObject({ state: 'not_found' });
  }
  expect(app.remote).not.toHaveBeenCalled();
  await expect(app.publisher.createItem('alice', 'schema', app.args)).resolves.toMatchObject({ verified: true });
});

it('cannot reuse receipts or old numeric IDs after the configured Portal origin changes', async () => {
  const app = setup();
  await app.publisher.createItem('alice', 'schema', app.args);
  const otherRemote = vi.fn<typeof fetch>(async () => Response.json({ ...app.args, id: 10, access_policy: 'private' }));
  const other = new PortalPublisher(app.vault, new PortalClient('https://other-portal.example', otherRemote), undefined,
    new PortalCreations(path.join(app.directory, 'receipts')));
  await expect(other.createItem('alice', 'schema', app.args)).rejects.toThrow('different creation');
  await expect(other.creationStatus('alice', app.args.requestId)).rejects.toThrow('different Portal origin');
  expect(otherRemote).not.toHaveBeenCalled();
});
