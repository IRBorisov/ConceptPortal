import { mkdtemp, rm } from 'node:fs/promises';
import { request } from 'node:http';
import { type AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve, relative } from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResultSchema, LATEST_PROTOCOL_VERSION, type CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createBearerTokenVerifier } from './http-auth';
import { createRSToolHttpServer, type RSToolHttpServerOptions, type RSToolHttpService } from './http-server';

// Synthetic credentials, never production secrets.
const ALICE = 'alice-test-token-'.repeat(3);
const BOB = 'bob-test-token-'.repeat(3);
const credentials = [{ subject: 'alice', token: ALICE }, { subject: 'bob', token: BOB }];
const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
const initialize = JSON.stringify({
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: { protocolVersion: LATEST_PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: 'test', version: '1' } },
});

const services: RSToolHttpService[] = [];
const clients: Client[] = [];
const directories: string[] = [];

afterEach(async () => {
  await Promise.all(clients.splice(0).map(client => client.close()));
  await Promise.all(services.splice(0).map(service => service.close()));
  vi.useRealTimers();
  for (const directory of directories.splice(0)) {
    const child = relative(resolve(tmpdir()), resolve(directory));
    if (child.startsWith('..') || !child.startsWith('rstool-http-test-')) throw new Error('Unsafe test cleanup path');
    await rm(directory, { recursive: true, force: true });
  }
});

async function start(overrides: Partial<RSToolHttpServerOptions> = {}) {
  const directory = overrides.persistenceDir ?? await mkdtemp(join(tmpdir(), 'rstool-http-test-'));
  if (!overrides.persistenceDir) directories.push(directory);
  const service = createRSToolHttpServer({
    persistenceDir: directory, verifyToken: createBearerTokenVerifier(credentials), ...overrides,
  });
  services.push(service);
  await new Promise<void>(resolveListen => service.server.listen(0, '127.0.0.1', resolveListen));
  const url = `http://127.0.0.1:${(service.server.address() as AddressInfo).port}`;
  async function connect(workspace = 'task', token = ALICE) {
    const client = new Client({ name: 'rstool-http-test', version: '1' });
    clients.push(client);
    const transport = new StreamableHTTPClientTransport(new URL(`${url}/mcp/${workspace}`), {
      requestInit: { headers: { Authorization: `Bearer ${token}` } },
    });
    await client.connect(transport);
    return { client, transport };
  }
  return { service, url, directory, connect };
}

async function call(client: Client, name: string, args: Record<string, unknown> = {}) {
  const result = CallToolResultSchema.parse(await client.callTool({ name, arguments: args }));
  expect(result.isError, JSON.stringify(result.content)).not.toBe(true);
  return payload(result);
}

function payload(result: CallToolResult) {
  const content = result.content[0];
  if (content.type !== 'text') throw new Error('Expected text result');
  return JSON.parse(content.text);
}

function post(url: string, token = ALICE, extraHeaders: Record<string, string> = {}, body = initialize) {
  return fetch(url, { method: 'POST', headers: { ...headers, Authorization: `Bearer ${token}`, ...extraHeaders }, body });
}

describe('rstool Streamable HTTP', () => {
  it('supports the real MCP client and isolates users, workspaces and foreign session references', async () => {
    const app = await start();
    const [alice, bob, otherTask] = await Promise.all([
      app.connect(), app.connect('task', BOB), app.connect('another-task'),
    ]);
    const aliceSession = await call(alice.client, 'create_session', { initial: { title: 'Alice' } });
    const bobSession = await call(bob.client, 'create_session', { initial: { title: 'Bob' } });
    await call(alice.client, 'apply_schema_patch', { items: [{ alias: 'X1', convention: 'Objects' }] });
    expect((await call(alice.client, 'get_session_state')).itemCount).toBe(1);
    expect((await call(bob.client, 'get_session_state')).itemCount).toBe(0);
    expect((await call(bob.client, 'get_current_session')).sessionId).toBe(bobSession.sessionId);
    expect(await call(otherTask.client, 'get_current_session')).toBeNull();
    for (const client of [bob.client, otherTask.client]) {
      const foreign = await client.callTool({ name: 'get_session_state', arguments: { sessionId: aliceSession.sessionId } });
      expect(foreign.isError).toBe(true);
      const synthesis = await client.callTool({ name: 'synthesize', arguments: { sourceSessionId: aliceSession.sessionId } });
      expect(synthesis.isError).toBe(true);
    }
    for (const [workspace, token] of [['task', BOB], ['another-task', ALICE]]) {
      const response = await post(`${app.url}/mcp/${workspace}`, token, { 'Mcp-Session-Id': alice.transport.sessionId! });
      expect(response.status).toBe(404);
    }
  });

  it('restores the current schema after service restart without reusing an MCP transport ID', async () => {
    const first = await start();
    const connection = await first.connect('persist');
    const session = await call(connection.client, 'create_session', { initial: { title: 'Persistent schema' } });
    await call(connection.client, 'apply_schema_patch', { items: [{ alias: 'X1', convention: 'Objects' }] });
    await connection.client.close();
    await first.service.close();
    const second = await start({ persistenceDir: first.directory });
    const restored = await second.connect('persist');
    expect(restored.transport.sessionId).not.toBe(connection.transport.sessionId);
    expect((await call(restored.client, 'get_current_session')).sessionId).toBe(session.sessionId);
    const state = await call(restored.client, 'get_session_state');
    expect(state.title).toBe('Persistent schema');
    expect(state.items.map((item: { alias: string }) => item.alias)).toEqual(['X1']);
  });

  it('checks authentication on every method, including an already initialized transport', async () => {
    let revoked = false;
    const verify = createBearerTokenVerifier(credentials);
    const app = await start({ verifyToken: token => revoked ? null : verify(token) });
    const connection = await app.connect();
    for (const method of ['POST', 'GET', 'DELETE']) {
      const response = await fetch(`${app.url}/mcp/task`, {
        method, headers: { ...headers, 'Mcp-Session-Id': connection.transport.sessionId! },
        ...(method === 'POST' ? { body: initialize } : {}),
      });
      expect(response.status).toBe(401);
      expect(response.headers.get('www-authenticate')).toContain('Bearer');
    }
    revoked = true;
    const response = await post(`${app.url}/mcp/task`, ALICE, { 'Mcp-Session-Id': connection.transport.sessionId! });
    expect(response.status).toBe(401);
  });

  it('reserves a workspace before initialization and releases it on DELETE', async () => {
    const app = await start();
    const responses = await Promise.all([post(`${app.url}/mcp/task`), post(`${app.url}/mcp/task`)]);
    expect(responses.map(response => response.status).sort()).toEqual([200, 409]);
    const initialized = responses.find(response => response.status === 200)!;
    const sessionId = initialized.headers.get('mcp-session-id')!;
    const foreignDelete = await fetch(`${app.url}/mcp/task`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${BOB}`, 'Mcp-Session-Id': sessionId },
    });
    expect(foreignDelete.status).toBe(404);
    const deleted = await fetch(`${app.url}/mcp/task`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${ALICE}`, 'Mcp-Session-Id': sessionId },
    });
    expect(deleted.status).toBe(200);
    expect((await post(`${app.url}/mcp/task`, ALICE, { 'Mcp-Session-Id': sessionId })).status).toBe(404);
    expect((await post(`${app.url}/mcp/task`)).status).toBe(200);
  });

  it('bounds active sessions and does not keep leases after malformed or oversized initialization', async () => {
    const app = await start({ maxSessions: 1, maxRequestBodySize: 1024 });
    expect((await post(`${app.url}/mcp/task`, ALICE, {}, '{')).status).toBe(400);
    expect((await post(`${app.url}/mcp/task`, ALICE, {}, ' '.repeat(2048))).status).toBe(413);
    await app.connect();
    expect((await post(`${app.url}/mcp/second`)).status).toBe(503);
  });

  it('expires idle transport leases while preserving their rstool data', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    const app = await start({ idleTimeoutMs: 30_000 });
    const connection = await app.connect();
    const session = await call(connection.client, 'create_session');
    await connection.client.close();
    await vi.advanceTimersByTimeAsync(60_000);
    expect((await post(`${app.url}/mcp/task`, ALICE, { 'Mcp-Session-Id': connection.transport.sessionId! })).status).toBe(404);
    const next = await app.connect();
    expect((await call(next.client, 'get_current_session')).sessionId).toBe(session.sessionId);
  });

  it('rejects untrusted Host and Origin headers before authentication or session allocation', async () => {
    const app = await start();
    // Fetch owns the Host header; use a native request to exercise DNS rebinding protection.
    const hostStatus = await new Promise<number | undefined>((resolveStatus, rejectRequest) => {
      const req = request(`${app.url}/mcp/task`, {
        method: 'POST', headers: { ...headers, Host: 'attacker.example', Authorization: `Bearer ${ALICE}` },
      }, res => { res.resume(); resolveStatus(res.statusCode); });
      req.on('error', rejectRequest);
      req.end(initialize);
    });
    expect(hostStatus).toBe(403);
    expect((await post(`${app.url}/mcp/task`, ALICE, { Origin: 'https://attacker.example' })).status).toBe(403);
    expect((await post(`${app.url}/unknown`)).status).toBe(404);
    expect((await fetch(`${app.url}/mcp/task`, { headers: { Authorization: `Bearer ${ALICE}` } })).status).toBe(405);
    expect((await call((await app.connect()).client, 'ping')).pong).toBe(true);
  });

  it('bounds pending requests and does not expire a workspace while a request is in flight', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    let onAuthorized: (() => void) | undefined;
    const verify = createBearerTokenVerifier(credentials);
    const app = await start({
      idleTimeoutMs: 30_000, maxPendingRequests: 1,
      verifyToken: token => { onAuthorized?.(); return verify(token); },
    });
    const connection = await app.connect();
    const body = JSON.stringify({ jsonrpc: '2.0', id: 123, method: 'tools/call', params: { name: 'ping', arguments: {} } });
    const authorized = new Promise<void>(resolveAuthorized => { onAuthorized = resolveAuthorized; });
    let finishBody!: () => void;
    const pending = new Promise<number | undefined>((resolveStatus, rejectRequest) => {
      const req = request(`${app.url}/mcp/task`, {
        method: 'POST', headers: {
          ...headers, Authorization: `Bearer ${ALICE}`, 'Mcp-Session-Id': connection.transport.sessionId!,
          'Content-Length': Buffer.byteLength(body),
        },
      }, res => { res.resume(); resolveStatus(res.statusCode); });
      req.on('error', rejectRequest);
      req.write(body.slice(0, 1));
      finishBody = () => req.end(body.slice(1));
    });
    await authorized;
    await new Promise(resolveTurn => setImmediate(resolveTurn));
    try {
      await vi.advanceTimersByTimeAsync(60_000);
      const busy = await post(`${app.url}/mcp/task`, ALICE, { 'Mcp-Session-Id': connection.transport.sessionId! });
      expect(busy.status).toBe(429);
    } finally {
      finishBody();
      expect(await pending).toBe(200);
    }
    expect((await call(connection.client, 'ping')).pong).toBe(true);
  });

  it.each(['maxSessions', 'idleTimeoutMs', 'maxRequestBodySize', 'maxPendingRequests'] as const)(
    'rejects a non-positive %s', key => {
      expect(() => createRSToolHttpServer({ persistenceDir: 'unused', verifyToken: () => 'alice', [key]: 0 })).toThrow(key);
    },
  );
});
