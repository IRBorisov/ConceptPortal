import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterEach, expect, it, vi } from 'vitest';

import { createBearerTokenVerifier } from './http-auth';
import { createRSToolHttpServer, type RSToolHttpServerOptions } from './http-server';
import { PortalClient } from './portal-client';
import { PortalPublisher } from './portal-publisher';
import { PortalVault } from './portal-vault';

const ALICE = 'a'.repeat(40),
  BOB = 'b'.repeat(40);
const ACCOUNT_ALICE = 'c'.repeat(40),
  ACCOUNT_BOB = 'd'.repeat(40);
const KEY = 'rcp_12345678_' + 'portal-secret'.repeat(4);
const ORIGIN = 'https://mcp.example';
const cleanup: Array<() => Promise<void> | void> = [];
afterEach(async () => {
  for (const action of cleanup.splice(0).reverse()) await action();
});

/** Exercise both protocols against a real loopback listener; only Portal itself is a stub. */
async function start(portalEnabled = true, policy: Pick<RSToolHttpServerOptions, 'sessionRetentionMs' | 'sessionCleanupIntervalMs'> = {}) {
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
    items: [],
    attribution: [],
    time_update: '2026-11-06T01:00:00Z',
  };
  const remote = vi.fn<typeof fetch>(async (input, options) => {
    expect((options!.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
    if (String(input).endsWith('/me')) return Response.json({ id: 7, username: 'Alice' });
    if (String(input).endsWith('/publish')) {
      current = { ...JSON.parse(String(options!.body)).schema, id: 1, time_update: '2026-11-06T02:00:00Z' };
      return Response.json({ version: 1, schema: current });
    }
    return Response.json(current);
  });
  const publisher = new PortalPublisher(
    new PortalVault(path.join(directory, 'vault'), randomBytes(32)),
    new PortalClient('https://portal-api.example', remote)
  );
  const service = createRSToolHttpServer({
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
  return { url, account, client, transport, remote, directory };
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
