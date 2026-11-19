import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { request } from 'node:http';
import type { AddressInfo } from 'node:net';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterEach, expect, it, vi } from 'vitest';

import packageInfo from '../package.json' with { type: 'json' };
import { createBearerTokenVerifier } from './http-auth';
import { createRSToolHttpServer, type RSToolHttpServerOptions } from './http-server';
import { PortalClient } from './portal-client';
import { PortalCreations } from './portal-creations';
import { PortalPublisher } from './portal-publisher';
import { PortalVault } from './portal-vault';

const ALICE = 'a'.repeat(40),
  BOB = 'b'.repeat(40);
const ACCOUNT_ALICE = 'c'.repeat(40),
  ACCOUNT_BOB = 'd'.repeat(40);
const KEY = 'rcp_12345678_' + 'portal-secret'.repeat(4);
const ORIGIN = 'https://mcp.example';
const cleanup: Array<() => Promise<void> | void> = [];

it('publishes the current session from MCP after the conversation already has permission', async () => {
  const app = await start();
  await app.account('connection', 'PUT', { key: KEY });
  const missing = await app.client.callTool({ name: 'portal_publish_schema', arguments: { targetId: 1 } });
  expect(missing.structuredContent).toMatchObject({ error: { code: 'NO_CURRENT_SESSION' } });
  expect(app.remote.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(0);
  await app.client.callTool({ name: 'apply_schema_patch', arguments: { items: [
    { alias: 'X1', term: 'Objects' },
    { alias: 'D1', definitionFormal: 'X1', convention: 'Preserve the source expression.' },
  ] } });
  const catalog = await app.client.listTools();
  const tool = catalog.tools.find(item => item.name === 'portal_publish_schema');
  expect(tool?.inputSchema.properties).toEqual({ targetId: { type: 'integer', minimum: 1 } });
  expect(tool?.inputSchema.additionalProperties).toBe(false);
  const rejected = await app.client.callTool({ name: 'portal_publish_schema', arguments: { targetId: 1, approved: true } });
  expect(rejected.isError).toBe(true);
  expect(JSON.stringify(rejected)).not.toContain(KEY);
  const published = await app.client.callTool({ name: 'portal_publish_schema', arguments: { targetId: 1 } });
  expect(published.isError).not.toBe(true);
  expect(published.structuredContent).toMatchObject({
    targetId: 1, verified: true, beforeCount: 0, afterCount: 2, version: 1,
    changes: { added: ['X1', 'D1'], removed: [], changed: [] },
  });
  expect(JSON.stringify(published)).not.toContain(KEY);
  expect(app.remote.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(1);
  await app.transport.terminateSession();
  expect(await app.publisher.getDescription('alice', 1)).toMatchObject({ time_update: '2026-11-06T02:00:00Z' });
});

it('prepares a schema with errors using only targetId and still requires independent human approval', async () => {
  const app = await start();
  await app.account('connection', 'PUT', { key: KEY });
  const comment = 'Preserve the source expression and this explanation without repairing its theory.';
  await app.client.callTool({ name: 'apply_schema_patch', arguments: { items: [
    { alias: 'X1', term: 'Objects' },
    { alias: 'D1', definitionFormal: 'X1', convention: comment },
    { alias: 'D2', definitionFormal: 'X1' },
  ] } });
  const diagnostics = await app.client.callTool({ name: 'list_diagnostics', arguments: {} });
  expect(JSON.stringify(diagnostics)).toContain('schemaFormalDuplicate');
  const catalog = await app.client.listTools();
  expect(catalog.tools.some(t => /approve|confirm/.test(t.name))).toBe(false);
  expect(catalog.tools.find(t => t.name === 'portal_prepare_publication')?.inputSchema.properties).toEqual({ targetId: { type: 'integer', minimum: 1 } });
  const prepared = await app.client.callTool({ name: 'portal_prepare_publication', arguments: { targetId: 1 } });
  expect(prepared.isError).not.toBe(true);
  expect(app.remote.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(0);
  const [proposal] = await (await app.account('publications')).json() as Array<{ id: string; digest: string }>;
  expect((await app.account(`publications/${proposal.id}/confirm`, 'POST', { digest: proposal.digest })).status).toBe(200);
  expect(app.remote.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(1);
  expect(await app.client.callTool({ name: 'list_diagnostics', arguments: {} })).toEqual(diagnostics);
});
afterEach(async () => {
  for (const action of cleanup.splice(0).reverse()) await action();
});

it('creates schema, model and OSS over authenticated MCP without allocating a local session', async () => {
  const app = await start();
  await app.account('connection', 'PUT', { key: KEY });
  const before = await app.client.callTool({ name: 'get_current_session', arguments: {} });
  const args = { title: 'Demo', alias: 'DEMO', description: 'Source annotations',
    location: '/U/Дипломы/DEMO001', accessPolicy: 'private' };
  for (const [index, kind] of ['schema', 'model', 'oss'].entries()) {
    const input = { ...args, requestId: `create-demo-${kind}`, ...(kind === 'model' ? { schemaId: 100 } : {}) };
    const result = await app.client.callTool({ name: `portal_create_${kind}`, arguments: input });
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toMatchObject({ targetId: 100 + index, kind, verified: true });
    expect(JSON.stringify(result)).not.toContain(KEY);
    const replay = await app.client.callTool({ name: `portal_create_${kind}`, arguments: input });
    expect(replay.structuredContent).toMatchObject({ targetId: 100 + index });
    const status = await app.client.callTool({ name: 'portal_get_creation_status', arguments: { requestId: input.requestId } });
    expect(status.structuredContent).toMatchObject({ state: 'created', targetId: 100 + index });
    const details = await app.client.callTool({ name: 'portal_get_details', arguments: { kind, targetId: 100 + index } });
    expect(details.structuredContent).toMatchObject({ id: 100 + index, location: args.location });
  }
  const search = await app.client.callTool({ name: 'portal_search_library', arguments: { query: 'Demo', location: args.location } });
  expect(search.structuredContent).toMatchObject({ ids: [100, 101, 102], complete: true });
  expect(app.remote.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(3);
  expect(await app.client.callTool({ name: 'get_current_session', arguments: {} })).toEqual(before);
  for (const extra of [{ key: KEY }, { subject: 'bob' }, { owner: 123 }, { schema: {} }]) {
    const result = await app.client.callTool({ name: 'portal_create_schema', arguments: { ...args, requestId: 'invalid-creation', ...extra } });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result)).not.toContain(KEY);
  }
});

it('builds and edits an OSS with the personal key, revision guards and operation readback', async () => {
  const app = await start();
  const ossId = 42;
  const initialRevision = '2026-11-19T00:00:00.000Z';
  const graph = { id: ossId, time_update: initialRevision,
    operations: [] as Array<Record<string, any>>, arguments: [] as Array<{ operation: number; argument: number }>,
    substitutions: [] as Array<{ operation: number; original: number; substitution: number }> };
  const writes: Array<{ route: string; method: string | undefined; payload: unknown }> = [];
  let conflict = false;
  let loseReadback = false;
  let readbackPending = false;
  app.remote.mockImplementation(async (input, options) => {
    const url = new URL(String(input));
    expect(url.origin).toBe('https://portal-api.example');
    const headers = new Headers(options?.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${KEY}`);
    if (url.pathname === '/api/agents/me') return Response.json({ id: 7, username: 'Alice' });
    if (url.pathname === `/api/agents/oss/${ossId}/details`) {
      if (readbackPending) {
        readbackPending = false;
        return Response.json({ ...graph, arguments: [] });
      }
      return Response.json(graph);
    }
    expect(url.pathname.startsWith(`/api/agents/oss/${ossId}/`)).toBe(true);
    expect(options?.redirect).toBe('error');
    expect(headers.get('X-Expected-Time-Update')).toBe(graph.time_update);
    const route = url.pathname.split('/').at(-1)!;
    const payload = JSON.parse(String(options?.body));
    writes.push({ route, method: options?.method, payload });
    if (conflict) return Response.json({}, { status: 409 });
    graph.time_update = new Date(Date.parse(initialRevision) + writes.length).toISOString();
    const creating = ['create-schema', 'import-schema', 'create-synthesis'].includes(route);
    const operationId = creating ? graph.operations.length + 1 : payload.target;
    if (creating) graph.operations.push({ ...payload.item_data, id: operationId,
      operation_type: route === 'create-synthesis' ? 'synthesis' : 'input',
      result: route === 'import-schema' && !payload.clone_source ? payload.source : 100 + operationId });
    else if (route === 'update-operation') Object.assign(graph.operations[operationId - 1], payload.item_data);
    if (payload.arguments) graph.arguments = payload.arguments.map((argument: number) => ({ operation: operationId, argument }));
    if (payload.substitutions) graph.substitutions = payload.substitutions.map((row: object) => ({ operation: operationId, ...row }));
    readbackPending = loseReadback;
    return creating ? Response.json({ new_operation: operationId, oss: graph }, { status: 201 }) : Response.json(graph);
  });
  expect(app.client.getServerVersion()?.version).toBe(packageInfo.version);
  const call = (name: string, fields: Record<string, unknown>, expectedTimeUpdate = graph.time_update) =>
    app.client.callTool({ name: `portal_oss_${name}`, arguments: { targetId: ossId, expectedTimeUpdate, ...fields } });
  expect((await call('create_schema', { item_data: {} })).isError).toBe(true);
  expect(app.remote.mock.calls).toHaveLength(0);
  await app.account('connection', 'PUT', { key: KEY });
  const catalog = (await app.client.listTools()).tools.filter(tool => tool.name.startsWith('portal_oss_'));
  expect(catalog.map(tool => tool.name).sort()).toEqual(['portal_oss_create_schema', 'portal_oss_create_synthesis',
    'portal_oss_execute_operation', 'portal_oss_import_schema', 'portal_oss_update_operation']);
  expect(catalog.every(tool => tool.inputSchema.additionalProperties === false)).toBe(true);
  const current = await app.client.callTool({ name: 'get_current_session', arguments: {} });
  const input = { alias: 'A', title: 'Local argument', parent: null };
  const imported = { item_data: { alias: 'B' }, source: 77, clone_source: false };
  const synthesis = { item_data: { alias: 'AB' }, arguments: [1, 2], substitutions: [{ original: 15, substitution: 16 }] };
  const update = { target: 3, item_data: { title: 'Revised' }, arguments: [2, 1] };
  expect((await call('create_schema', { item_data: input })).structuredContent).toMatchObject({ operationId: 1, resultId: 101, verified: true });
  expect((await call('import_schema', imported)).structuredContent).toMatchObject({ operationId: 2, resultId: 77, verified: true });
  expect((await call('create_synthesis', synthesis)).structuredContent).toMatchObject({ operationId: 3, resultId: 103, verified: true });
  expect((await call('update_operation', update)).structuredContent).toMatchObject({ operationId: 3, verified: true });
  const executed = await call('execute_operation', { target: 3 });
  expect(executed.structuredContent).toMatchObject({ targetId: ossId, operationId: 3, resultId: 103,
    time_update: graph.time_update, verified: true, oss: graph });
  expect(JSON.stringify(executed)).not.toContain(KEY);
  expect(writes).toEqual([
    { route: 'create-schema', method: 'POST', payload: { item_data: input } },
    { route: 'import-schema', method: 'POST', payload: imported },
    { route: 'create-synthesis', method: 'POST', payload: synthesis },
    { route: 'update-operation', method: 'PATCH', payload: update },
    { route: 'execute-operation', method: 'POST', payload: { target: 3 } },
  ]);
  expect((await call('execute_operation', { target: 3 }, initialRevision)).structuredContent).toMatchObject({
    error: { message: expect.stringContaining('Portal OSS changed') },
  });
  expect((await call('execute_operation', { target: 3, key: KEY })).isError).toBe(true);
  expect(writes).toHaveLength(5);
  conflict = true;
  expect((await call('execute_operation', { target: 3 })).structuredContent).toMatchObject({
    error: { message: expect.stringContaining('Portal OSS changed') },
  });
  expect(writes).toHaveLength(6);
  conflict = false;
  loseReadback = true;
  expect((await call('execute_operation', { target: 3 })).structuredContent).toMatchObject({
    error: { message: expect.stringContaining('Portal OSS verification failed') },
  });
  expect(writes).toHaveLength(7);
  expect(await app.client.callTool({ name: 'get_current_session', arguments: {} })).toEqual(current);
});

/** Exercise both protocols against a real loopback listener; only Portal itself is a stub. */
async function start(portalEnabled = true, policy: Pick<RSToolHttpServerOptions, 'sessionRetentionMs' | 'sessionCleanupIntervalMs' | 'requestTimeoutMs'> = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-http-test-'));
  cleanup.push(() => {
    const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(directory));
    if (relative.startsWith('..') || !relative.startsWith('portal-http-test-')) throw new Error('Unsafe cleanup');
    fs.rmSync(directory, { recursive: true, force: true });
  });
  let current: Record<string, any> = {
    id: 1,
    title: 'Before',
    alias: 'OLD',
    description: '',
    items: [],
    attribution: [],
    time_update: '2026-11-06T01:00:00Z',
  };
  const created = new Map<number, Record<string, unknown>>();
  const remote = vi.fn<typeof fetch>(async (input, options) => {
    expect((options!.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
    if (String(input).endsWith('/me')) return Response.json({ id: 7, username: 'Alice' });
    const route = new URL(String(input)).pathname;
    if (options?.method === 'POST' && /^\/api\/agents\/(rsforms|models|oss)$/.test(route)) {
      const item = { ...JSON.parse(String(options.body)), id: 100 + created.size,
        owner: 7, time_update: '2026-11-13T00:00:00Z', items: [], operations: [], blocks: [] };
      created.set(item.id, item);
      return Response.json(item, { status: 201 });
    }
    if (route.endsWith('/context-search')) return Response.json({ ids: [...created.keys()] });
    const createdId = Number(route.split('/').at(-2));
    if (created.has(createdId)) return Response.json(created.get(createdId));
    if (String(input).endsWith('/description')) {
      const body = JSON.parse(String(options!.body));
      if (body.expected_time_update !== current.time_update) return Response.json({}, { status: 409 });
      current = { ...current, description: body.description, time_update: '2026-11-06T02:00:00Z' };
      return Response.json({ id: 1, description: current.description, time_update: current.time_update });
    }
    if (String(input).endsWith('/publish')) {
      current = { ...JSON.parse(String(options!.body)).schema, id: 1, time_update: '2026-11-06T02:00:00Z' };
      return Response.json({ version: 1, schema: current });
    }
    return Response.json(current);
  });
  const publisher = new PortalPublisher(
    new PortalVault(path.join(directory, 'vault'), randomBytes(32)),
    new PortalClient('https://portal-api.example', remote),
    undefined,
    new PortalCreations(path.join(directory, 'creations'))
  );
  const service = createRSToolHttpServer({
    // These tests isolate account/Portal deadlines, including 80 ms budgets.
    // Real computation processes are covered by compute-pool and HTTP integration tests.
    isolateComputations: false,
    ...policy,
    persistenceDir: path.join(directory, 'workspaces'),
    verifyToken: createBearerTokenVerifier([
      { subject: 'alice', token: ALICE },
      { subject: 'bob', token: BOB },
    ]),
    portal: portalEnabled
      ? {
          publisher,
          publicOrigin: ORIGIN,
          verifyAccountToken: createBearerTokenVerifier([
            { subject: 'alice', token: ACCOUNT_ALICE },
            { subject: 'bob', token: ACCOUNT_BOB },
          ]),
        }
      : undefined,
  });
  await new Promise<void>((resolve) => service.server.listen(0, '127.0.0.1', resolve));
  cleanup.push(() => service.close());
  const url = `http://127.0.0.1:${(service.server.address() as AddressInfo).port}`;
  const client = new Client({ name: 'portal-test', version: '1' });
  const transport = new StreamableHTTPClientTransport(new URL(url + '/mcp/test'), {
    requestInit: { headers: { Authorization: `Bearer ${ALICE}` } },
  });
  await client.connect(transport);
  cleanup.push(() => client.close());
  const account = (route: string, method = 'GET', body?: unknown, token = ACCOUNT_ALICE, origin = ORIGIN) =>
    fetch(url + '/portal/api/' + route, {
      method,
      headers: { Authorization: `Bearer ${token}`, Origin: origin, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  return { url, account, client, transport, remote, directory, service, publisher };
}

it('keeps credentials outside MCP and enforces the authenticated account for approval and disconnect', async () => {
  const app = await start();
  const page = await fetch(app.url + '/portal/account');
  expect(page.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
  expect(page.headers.get('cache-control')).toBe('no-store');
  expect(await page.text()).not.toContain(KEY);
  const script = await fetch(app.url + '/portal/account.js');
  expect(await script.text()).not.toContain('localStorage');
  expect((await app.account('connection', 'PUT', { key: KEY }, ACCOUNT_ALICE, 'https://evil.example')).status).toBe(
    403
  );
  expect((await app.account('connection', 'PUT', { key: KEY, subject: 'bob' })).status).toBe(400);
  const connection = await app.account('connection', 'PUT', { key: KEY });
  expect(connection.status).toBe(200);
  expect(await connection.json()).toMatchObject({ account: { username: 'Alice' } });
  expect(await (await app.account('connection', 'GET', undefined, ACCOUNT_BOB)).json()).toMatchObject({
    connected: false,
  });
  const tools = await app.client.listTools();
  expect(tools.tools.map((tool) => tool.name)).toContain('portal_prepare_publication');
  expect(tools.tools.map((tool) => tool.name)).not.toContain('portal_publish');
  await app.client.callTool({
    name: 'apply_schema_patch',
    arguments: { items: [{ alias: 'X1', term: 'object', convention: 'Objects' }] },
  });
  const invalid = await app.client.callTool({
    name: 'portal_prepare_publication',
    arguments: { targetId: 1, key: KEY },
  });
  expect(invalid.isError).toBe(true);
  expect(JSON.stringify(invalid)).not.toContain(KEY);
  const prepared = await app.client.callTool({ name: 'portal_prepare_publication', arguments: { targetId: 1 } });
  expect(prepared.isError).not.toBe(true);
  const drafts = (await (await app.account('publications')).json()) as Array<{ id: string; digest: string }>;
  expect(drafts).toHaveLength(1);
  expect(JSON.stringify(drafts)).not.toContain(KEY);
  const { id, digest } = drafts[0];
  expect(await (await app.account('publications', 'GET', undefined, ACCOUNT_BOB)).json()).toEqual([]);
  expect((await app.account(`publications/${id}/confirm`, 'POST', { digest }, ACCOUNT_BOB)).status).toBe(400);
  expect((await app.account(`publications/${id}/confirm`, 'POST', { digest, targetId: 2 })).status).toBe(400);
  expect(app.remote.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(0);
  expect((await app.account(`publications/${id}/confirm`, 'POST', { digest })).status).toBe(200);
  expect((await app.account(`publications/${id}/confirm`, 'POST', { digest })).status).toBe(400);
  expect(app.remote.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(1);
  expect((await app.account('connection', 'DELETE')).status).toBe(200);
  const status = await app.client.callTool({ name: 'portal_connection_status', arguments: {} });
  expect(JSON.stringify(status)).toContain('false');
  await app.transport.terminateSession();
  expect(await (await app.account('publications')).json()).toEqual([]);
});

it('requires independent human authentication for account APIs', async () => {
  const app = await start();
  expect((await fetch(app.url + '/portal/api/connection')).status).toBe(401);
  expect((await app.account('connection', 'PUT', { key: KEY }, 'invalid')).status).toBe(401);
  expect((await app.account('connection', 'GET', undefined, ALICE)).status).toBe(401);
  expect((await app.account('connection', 'PUT', { key: KEY }, ALICE)).status).toBe(401);
  expect(
    (
      await fetch(app.url + '/mcp/test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${ACCOUNT_ALICE}`, 'Content-Type': 'application/json' },
        body: '{}',
      })
    ).status
  ).toBe(401);
  expect(
    (await app.account('publications/00000000-0000-0000-0000-000000000000/confirm', 'POST', { digest: 'x' }, ALICE))
      .status
  ).toBe(401);
  expect(app.remote).not.toHaveBeenCalled();
});

it('removes a pending proposal when its MCP session terminates without disconnecting the key', async () => {
  const app = await start();
  await app.client.callTool({ name: 'ensure_session', arguments: {} });
  expect((await app.account('connection', 'PUT', { key: KEY })).status).toBe(200);
  const prepared = await app.client.callTool({ name: 'portal_prepare_publication', arguments: { targetId: 1 } });
  expect(prepared.isError).not.toBe(true);
  expect(await (await app.account('publications')).json()).toHaveLength(1);
  await app.transport.terminateSession();
  expect(await (await app.account('publications')).json()).toEqual([]);
  expect(await (await app.account('connection')).json()).toMatchObject({ connected: true });
});

it('does not expose Portal routes or tools when the integration is absent', async () => {
  const app = await start(false);
  expect((await fetch(app.url + '/portal/account')).status).toBe(404);
  expect(
    (await fetch(app.url + '/portal/api/connection', { headers: { Authorization: `Bearer ${ALICE}` } })).status
  ).toBe(404);
  const names = (await app.client.listTools()).tools.map((tool) => tool.name);
  expect(names.some((name) => name.startsWith('portal_'))).toBe(false);
  expect(app.remote).not.toHaveBeenCalled();
});

it('rejects queued approval when an in-flight preparation outlives source retention', async () => {
  const now = Date.now();
  const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const started = new Promise<void>(resolve => { entered = resolve; });
  try {
    const app = await start(true, { sessionRetentionMs: 1000, sessionCleanupIntervalMs: 10 });
    expect((await app.account('connection', 'PUT', { key: KEY })).status).toBe(200);
    await app.client.callTool({ name: 'apply_schema_patch', arguments: { items: [{ alias: 'X1', term: 'object', convention: 'Objects' }] } });
    const first = await app.client.callTool({ name: 'portal_prepare_publication', arguments: { targetId: 1 } });
    expect(first.isError).not.toBe(true);
    const drafts = await (await app.account('publications')).json() as Array<{ id: string; digest: string }>;
    const { id, digest } = drafts[0];
    app.remote.mockImplementationOnce(async () => {
      entered();
      await gate;
      return Response.json({ id: 1, alias: 'OLD', items: [], time_update: '2026-11-06T01:00:00Z' });
    });
    const preparing = app.client.callTool({ name: 'portal_prepare_publication', arguments: { targetId: 1 } });
    await started;
    clock.mockReturnValue(now + 1001);
    const approval = app.account(`publications/${id}/confirm`, 'POST', { digest });
    release();
    expect((await preparing).isError).toBe(true);
    expect((await approval).status).toBe(400);
    expect(app.remote.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(0);
  } finally { release(); clock.mockRestore(); }
}, 15_000);

it('deleting the selected stored session invalidates its pending publications but preserves the personal connection', async () => {
  const app = await start();
  expect((await app.account('connection', 'PUT', { key: KEY })).status).toBe(200);
  await app.client.callTool({ name: 'apply_schema_patch', arguments: {
    items: [{ alias: 'X1', term: 'object', convention: 'Objects' }]
  } });
  expect((await app.client.callTool({ name: 'portal_prepare_publication', arguments: { targetId: 1 } })).isError).not.toBe(true);
  expect(await (await app.account('publications')).json()).toHaveLength(1);
  const listed = await app.client.callTool({ name: 'list_stored_sessions', arguments: {} });
  const content = listed.content as Array<{ type: string; text: string }>;
  const row = JSON.parse(content[0].text).items[0];
  const deleted = await app.client.callTool({ name: 'delete_stored_session', arguments: {
    sessionRef: row.sessionRef, expectedRevision: row.revision, confirm: true, allowCurrent: true
  } });
  expect(deleted.isError).not.toBe(true);
  expect(await (await app.account('publications')).json()).toEqual([]);
  expect(await (await app.account('connection')).json()).toMatchObject({ connected: true, mode: 'personal' });
  expect(app.remote.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(0);
}, 20_000);


it('updates description through MCP without a local model and rejects identity overrides', async () => {
  const app = await start();
  await app.account('connection', 'PUT', { key: KEY });
  const catalog = await app.client.listTools();
  expect(catalog.tools.map(tool => tool.name)).toContain('portal_update_description');
  expect(catalog.tools.find(tool => tool.name === 'portal_get_description')?.annotations?.readOnlyHint).toBe(true);
  const current = await app.client.callTool({ name: 'portal_get_description', arguments: { targetId: 1 } });
  expect(current.isError).not.toBe(true);
  expect(current.structuredContent).toEqual({ targetId: 1, description: '', time_update: '2026-11-06T01:00:00Z' });
  expect(JSON.stringify(current)).not.toContain(KEY);
  expect((await app.client.callTool({ name: 'portal_get_description', arguments: { targetId: 1, subject: 'bob' } })).isError).toBe(true);
  const args = { targetId: 1, expectedTimeUpdate: (current.structuredContent as Record<string, unknown>).time_update, description: 'Comment' };
  for (const extra of [{ key: KEY }, { subject: 'bob' }, { schema: {} }]) {
    const rejected = await app.client.callTool({ name: 'portal_update_description', arguments: { ...args, ...extra } });
    expect(rejected.isError).toBe(true);
    expect(JSON.stringify(rejected)).not.toContain(KEY);
  }
  const updated = await app.client.callTool({ name: 'portal_update_description', arguments: args });
  expect(updated.isError).not.toBe(true);
  expect(updated.structuredContent).toMatchObject({ targetId: 1, description: 'Comment', time_update: '2026-11-06T02:00:00Z' });
  expect((await app.client.callTool({ name: 'get_current_session', arguments: {} })).structuredContent).toBeUndefined();
  expect(await (await app.account('publications')).json()).toEqual([]);
  expect(app.remote.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(0);
});


it('pins a description-only Portal operation during HTTP timeout and does not release its lease early', async () => {
  const app = await start(true, { requestTimeoutMs: 100 });
  await app.account('connection', 'PUT', { key: KEY });
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const started = new Promise<void>(resolve => { entered = resolve; });
  const normal = app.remote.getMockImplementation()!;
  app.remote.mockImplementationOnce(async (...args) => { entered(); await gate; return normal(...args); });
  const active = app.client.callTool({ name: 'portal_update_description', arguments: {
    targetId: 1, expectedTimeUpdate: '2026-11-06T01:00:00Z', description: 'Comment' } }).catch(() => undefined);
  await started;
  const url = app.url + '/mcp/test/connection';
  const headers = { Authorization: `Bearer ${ALICE}` };
  try {
    await vi.waitFor(async () => {
      expect(await (await fetch(url, { headers })).json()).toMatchObject({ state: 'draining', busy: true });
    });
    const snapshot = await fetch(url, { headers });
    expect((await fetch(url, { method: 'DELETE', headers: { ...headers, 'If-Match': snapshot.headers.get('etag')! } })).status).toBe(409);
  } finally { release(); }
  await active;
  await vi.waitFor(async () => {
    expect(await (await fetch(url, { headers })).json()).toMatchObject({ state: 'disconnected' });
  });
});


it.each(['binding', 'publication'] as const)('bounds an account %s response but waits for its actual Portal operation during shutdown', async mode => {
  const app = await start(true, { requestTimeoutMs: 80 });
  let route = 'connection', method = 'PUT';
  let body: Record<string, unknown> = { key: KEY };
  if (mode === 'publication') {
    await app.account('connection', 'PUT', { key: KEY });
    await app.client.callTool({ name: 'apply_schema_patch', arguments: { initial: { comment: 'Published description' } } });
    const prepared = await app.client.callTool({ name: 'portal_prepare_publication', arguments: { targetId: 1 } });
    expect(prepared.isError).not.toBe(true);
    const [proposal] = await (await app.account('publications')).json() as Array<{ id: string; digest: string }>;
    route = `publications/${proposal.id}/confirm`;
    method = 'POST';
    body = { digest: proposal.digest };
  }
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const started = new Promise<void>(resolve => { entered = resolve; });
  const normal = app.remote.getMockImplementation()!;
  app.remote.mockImplementationOnce(async (...args) => { entered(); await gate; return normal(...args); });
  const pending = app.account(route, method, body).then(() => 'delivered', () => 'closed');
  await started;
  let closing: Promise<void> | undefined;
  let closed = false;
  try {
    expect(await Promise.race([pending, new Promise(resolve => setTimeout(() => resolve('still-open'), 250))])).toBe('closed');
    expect((await app.client.callTool({ name: 'ping', arguments: {} })).isError).not.toBe(true);
    closing = app.service.close().then(() => { closed = true; });
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(closed).toBe(false);
  } finally { release(); }
  await closing;
  await pending;
  expect(app.publisher.connection('alice')).toMatchObject({ connected: true });
  if (mode === 'publication') {
    expect(app.remote.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(1);
    expect(await app.publisher.getDescription('alice', 1)).toMatchObject({ description: 'Published description',
      time_update: '2026-11-06T02:00:00Z' });
  }
});

it('bounds a partial account body and does not start a Portal operation after it aborts', async () => {
  const app = await start(true, { requestTimeoutMs: 80 });
  await new Promise<void>(resolveClose => {
    const req = request(app.url + '/portal/api/connection', { method: 'PUT', headers: {
      Authorization: `Bearer ${ACCOUNT_ALICE}`, Origin: ORIGIN, 'Content-Type': 'application/json', 'Content-Length': '1000' } });
    req.on('error', () => resolveClose());
    req.on('close', () => resolveClose());
    req.write('{"key":');
  });
  await app.service.close();
  expect(app.remote).not.toHaveBeenCalled();
  expect(app.publisher.connection('alice')).toMatchObject({ connected: false });
});
