import { mkdtemp, rm, stat, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { request } from 'node:http';
import { type AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve, relative } from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { RSToolAgent } from '@rsconcept/rstool';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResultSchema, LATEST_PROTOCOL_VERSION, type CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionPolicy, SessionStorageError } from './session-policy';
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
  vi.restoreAllMocks();
  for (const directory of directories.splice(0)) {
    const child = relative(resolve(tmpdir()), resolve(directory));
    if (child.startsWith('..') || !child.startsWith('rstool-http-test-')) throw new Error('Unsafe test cleanup path');
    await rm(directory, { recursive: true, force: true });
  }
});

/** Start an isolated loopback service and register its storage and clients for cleanup. */
async function start(overrides: Partial<RSToolHttpServerOptions> = {}) {
  const directory = overrides.persistenceDir ?? await mkdtemp(join(tmpdir(), 'rstool-http-test-'));
  if (!overrides.persistenceDir) directories.push(directory);
  const service = createRSToolHttpServer({
    persistenceDir: directory, verifyToken: createBearerTokenVerifier(credentials), ...overrides,
  });
  services.push(service);
  await new Promise<void>(resolveListen => service.server.listen(0, '127.0.0.1', resolveListen));
  const url = `http://127.0.0.1:${(service.server.address() as AddressInfo).port}`;
  /** Exercise the same Streamable HTTP handshake and credentials that a real host uses. */
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

/** Require a successful remote tool result before decoding rstool's JSON-in-text payload. */
async function call(client: Client, name: string, args: Record<string, unknown> = {}) {
  const result = CallToolResultSchema.parse(await client.callTool({ name, arguments: args }));
  expect(result.isError, JSON.stringify(result.content)).not.toBe(true);
  return payload(result);
}

/** Decode the existing rstool text-content contract rather than assuming structuredContent. */
function payload(result: CallToolResult) {
  const content = result.content[0];
  if (content.type !== 'text') throw new Error('Expected text result');
  return JSON.parse(content.text);
}

/** Send an initialization or overridden protocol payload for routing and malformed-input tests. */
function post(url: string, token = ALICE, extraHeaders: Record<string, string> = {}, body = initialize) {
  return fetch(url, { method: 'POST', headers: { ...headers, Authorization: `Bearer ${token}`, ...extraHeaders }, body });
}

describe('rstool Streamable HTTP', () => {
  it('advertises storage limits, complete discovery and safe account self-service over the real MCP client', async () => {
    const app = await start({ maxStoredSessionsPerAccount: 1 });
    const peer = await app.connect();
    const catalog = await peer.client.listTools();
    const names = catalog.tools.map(tool => tool.name);
    expect(await call(peer.client, 'list_methods')).toEqual(names);
    expect(peer.client.getInstructions()).toContain('Max 1 stored sessions per account');
    expect(catalog.tools.find(tool => tool.name === 'get_session_storage_config')?.annotations?.readOnlyHint).toBe(true);
    expect(catalog.tools.find(tool => tool.name === 'list_stored_sessions')?.annotations?.readOnlyHint).toBe(true);
    expect(catalog.tools.find(tool => tool.name === 'delete_stored_session')?.annotations?.destructiveHint).toBe(true);
    expect((await call(peer.client, 'get_session_storage_config')).usage).toMatchObject({ storedSessions: 0, availableSlots: 1 });
    await call(peer.client, 'create_session');
    const full = await peer.client.callTool({ name: 'create_session', arguments: {} });
    expect(full.structuredContent).toMatchObject({ error: { code: 'SESSION_LIMIT_REACHED', recovery: {
      listTool: 'list_stored_sessions', deleteTool: 'delete_stored_session' } } });
    const row = (await call(peer.client, 'list_stored_sessions')).items[0];
    expect(row).toMatchObject({ current: true, busy: false, connected: true, callerWorkspace: true, workspace: 'task' });
    const deleted = await call(peer.client, 'delete_stored_session', {
      sessionRef: row.sessionRef, expectedRevision: row.revision, confirm: true, allowCurrent: true
    });
    expect(deleted).toMatchObject({ deleted: true, freedSlots: 1, usage: { availableSlots: 1 } });
    expect(await call(peer.client, 'get_current_session')).toBeNull();
    await call(peer.client, 'ensure_session');
    expect((await call(peer.client, 'get_session_storage_config')).usage.storedSessions).toBe(1);
  }, 20_000);

  it('rejects caller-supplied identity overrides in storage management tools', async () => {
    const app = await start();
    const peer = await app.connect();
    for (const name of ['get_session_storage_config', 'list_stored_sessions']) {
      const result = await peer.client.callTool({ name, arguments: { subject: 'another-account' } });
      expect(result.structuredContent).toMatchObject({ error: { code: 'INVALID_SESSION_ARGUMENTS' } });
    }
  });

  it('rejects oversized hosted IDs without exposing a filesystem path or consuming quota', async () => {
    const app = await start();
    const peer = await app.connect();
    const result = await peer.client.callTool({ name: 'ensure_session', arguments: { initial: { sessionId: 'x'.repeat(251) } } });
    expect(result.structuredContent).toMatchObject({ error: { code: 'INVALID_SESSION_ID' } });
    expect(JSON.stringify(result)).not.toContain(app.directory);
    expect((await call(peer.client, 'get_session_storage_config')).usage.storedSessions).toBe(0);
  });

  it('does not accumulate empty workspaces after invalid initialization or a closed empty lease', async () => {
    const app = await start();
    for (let index = 0; index < 3; index++) {
      const rejected = await post(`${app.url}/mcp/invalid-${index}`, ALICE, {}, '{}');
      expect(rejected.status).toBe(400);
      await rejected.text();
    }
    const peer = await app.connect('empty-valid');
    await peer.transport.terminateSession();
    await vi.waitFor(async () => {
      expect((await readdir(app.directory)).filter(name => /^[a-f0-9]{64}$/.test(name))).toEqual([]);
    });
  }, 15_000);

  it('returns structured account quota errors for competing creates across workspaces', async () => {
    const app = await start({ maxStoredSessionsPerAccount: 1 });
    const [first, second, other] = await Promise.all([app.connect('one'), app.connect('two'), app.connect('one', BOB)]);
    const results = await Promise.all([first, second].map(peer => peer.client.callTool({ name: 'create_session', arguments: {} })));
    expect(results.filter(result => !result.isError)).toHaveLength(1);
    const rejected = results.find(result => result.isError)!;
    expect(rejected.structuredContent).toMatchObject({ error: { code: 'SESSION_LIMIT_REACHED', limit: 1, count: 1 } });
    expect(payload(CallToolResultSchema.parse(rejected))).toMatchObject({ error: { code: 'SESSION_LIMIT_REACHED' } });
    await call(other.client, 'create_session');
    await call(first.client, 'ping');
  });

  it('removes idle saved sessions on the background timer without requiring a tool request', async () => {
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
    try {
      const app = await start({ sessionRetentionMs: 1000, sessionCleanupIntervalMs: 10 });
      const peer = await app.connect();
      const session = await call(peer.client, 'create_session');
      const namespace = createHash('sha256').update(JSON.stringify(['alice', 'task'])).digest('hex');
      const path = join(app.directory, namespace, `${session.sessionId}.json`);
      expect((await stat(path)).isFile()).toBe(true);
      clock.mockReturnValue(now + 1001);
      await vi.waitFor(async () => { await expect(stat(path)).rejects.toMatchObject({ code: 'ENOENT' }); });
      const expired = await peer.client.callTool({ name: 'get_session_state', arguments: { sessionId: session.sessionId } });
      expect(expired.structuredContent).toMatchObject({ error: { code: 'SESSION_NOT_FOUND_OR_EXPIRED' } });
    } finally { clock.mockRestore(); }
  });

  it('pins a real async model update while background expiry runs and commits its final access clock', async () => {
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
    let release!: () => void;
    let entered!: () => void;
    const started = new Promise<void>(resolve => { entered = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });
    const original = RSToolAgent.prototype.setModelValues;
    const update = vi.spyOn(RSToolAgent.prototype, 'setModelValues').mockImplementationOnce(async function (this: RSToolAgent, input, id) {
      this.getSessionState('summary', id);
      entered();
      await gate;
      return original.call(this, input, id);
    });
    try {
      const app = await start({ sessionRetentionMs: 1000, sessionCleanupIntervalMs: 10 });
      const peer = await app.connect();
      const session = await call(peer.client, 'create_session');
      await call(peer.client, 'apply_schema_patch', { items: [{ alias: 'X1' }] });
      const pending = call(peer.client, 'set_model_values', { sessionId: session.sessionId,
        set: [{ target: 1, value: { 0: 'node-0' } }] });
      await started;
      clock.mockReturnValue(now + 1500);
      await new Promise(resolve => setTimeout(resolve, 30));
      const namespace = createHash('sha256').update(JSON.stringify(['alice', 'task'])).digest('hex');
      expect((await stat(join(app.directory, namespace, `${session.sessionId}.json`))).isFile()).toBe(true);
      release();
      await pending;
      expect((await call(peer.client, 'get_model_state')).items[0].value).toEqual({ 0: 'node-0' });
    } finally { release(); update.mockRestore(); clock.mockRestore(); }
  }, 15_000);

  it.each(['session', 'pointer'])('sanitizes %s persistence failures as structured hosted storage errors', async failure => {
    const app = await start();
    const peer = await app.connect();
    const rename = fs.renameSync;
    const fault = vi.spyOn(fs, 'renameSync').mockImplementation((from, to) => {
      const target = String(to);
      const isPointer = target.endsWith('_current.json');
      if ((failure === 'pointer' ? isPointer : target.endsWith('.json') && !target.includes('.lifecycle') && !isPointer)) {
        throw Object.assign(new Error('Synthetic failure at /private-state/example.json'), { code: 'ENOSPC' });
      }
      return rename(from, to);
    });
    try {
      const result = await peer.client.callTool({ name: 'create_session', arguments: {} });
      expect(result.isError).toBe(true);
      expect(result.structuredContent).toMatchObject({ error: { code: 'SESSION_STORAGE_UNAVAILABLE' } });
      expect(JSON.stringify(result)).not.toContain('/private-state');
      expect(JSON.stringify(result)).not.toContain(app.directory);
    } finally { fault.mockRestore(); }
  });

  it('bounds retention metadata flushes for one bulk schema patch', async () => {
    const app = await start();
    const peer = await app.connect();
    await call(peer.client, 'create_session');
    const open = vi.spyOn(fs, 'openSync');
    try {
      await call(peer.client, 'apply_schema_patch', { items: Array.from({ length: 30 }, (_, i) => ({
        alias: `X${i + 1}`, term: `Objects ${i + 1}`, convention: 'Independent object set'
      })) });
      const metadataWrites = open.mock.calls.filter(([file]) => String(file).includes('.lifecycle'));
      expect(metadataWrites.length).toBeLessThanOrEqual(2);
    } finally { open.mockRestore(); }
  }, 15_000);

  it('expires stored state on a live connection and permits a new session without reviving cached data', async () => {
    const app = await start({ maxStoredSessionsPerAccount: 1, sessionRetentionMs: 1000 });
    const peer = await app.connect();
    const session = await call(peer.client, 'create_session');
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now + 1001);
    try {
      await call(peer.client, 'ping');
      const expired = await peer.client.callTool({ name: 'get_session_state', arguments: { sessionId: session.sessionId } });
      expect(expired.isError).toBe(true);
      expect(expired.structuredContent).toMatchObject({ error: { code: 'SESSION_EXPIRED', retentionSeconds: 1 } });
      const missing = await peer.client.callTool({ name: 'get_session_state', arguments: { sessionId: session.sessionId } });
      expect(missing.structuredContent).toMatchObject({ error: { code: 'SESSION_NOT_FOUND_OR_EXPIRED' } });
      const next = await call(peer.client, 'create_session');
      expect(next.sessionId).not.toBe(session.sessionId);
    } finally { clock.mockRestore(); }
  });

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
  }, process.platform === 'win32' ? 15_000 : 5000);

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

  it('does not let an asynchronous batch rollback erase a following successful tool call', async () => {
    const app = await start();
    const connection = await app.connect();
    await call(connection.client, 'apply_schema_patch', { items: [{ alias: 'X1', convention: 'Objects' }] });
    const batch = [
      { name: 'set_model_values', arguments: { set: [{ target: 1, value: { 0: 'one' } }, { target: 999, value: { 0: 'invalid' } }] } },
      { name: 'apply_schema_patch', arguments: { items: [{ alias: 'X2', convention: 'More objects' }] } },
    ].map((params, index) => ({ jsonrpc: '2.0', id: 100 + index, method: 'tools/call', params }));
    const response = await post(`${app.url}/mcp/task`, ALICE, { 'Mcp-Session-Id': connection.transport.sessionId! }, JSON.stringify(batch));
    expect(response.status).toBe(200);
    const results = await response.json() as Array<{ id: number; result: CallToolResult }>;
    expect(results).toHaveLength(2);
    expect(results.find(result => result.id === 100)!.result.isError).toBe(true);
    expect(results.find(result => result.id === 101)!.result.isError).not.toBe(true);
    const state = await call(connection.client, 'get_session_state');
    expect(state.items.map((item: { alias: string }) => item.alias)).toEqual(['X1', 'X2']);
    expect(state.modelItemCount).toBe(0);
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
    const revokedDelete = await fetch(`${app.url}/mcp/task`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${ALICE}`, 'Mcp-Session-Id': connection.transport.sessionId! },
    });
    expect(revokedDelete.status).toBe(401);
  });

  it.each(['ignores cancellation', 'rejects on cancellation'])(
    'ends a stalled verifier and completes shutdown when it %s', async behavior => {
      let entered!: () => void;
      const verifying = new Promise<void>(resolveVerifying => { entered = resolveVerifying; });
      let verificationSignal: AbortSignal | undefined;
      const app = await start({
        authenticationTimeoutMs: 100,
        verifyToken: (_token, signal) => {
          verificationSignal = signal;
          entered();
          return new Promise((_resolve, rejectVerification) => {
            if (behavior === 'rejects on cancellation') signal!.addEventListener('abort', () => rejectVerification(new Error('Cancelled')));
          });
        },
      });
      const response = post(`${app.url}/mcp/task`);
      await verifying;
      const shutdown = app.service.close();
      expect((await response).status).toBe(503);
      expect(verificationSignal?.aborted).toBe(true);
      await shutdown;
    },
  );

  it('releases interrupted initialize and existing response leases', async () => {
    const app = await start();
    let interruptedWrites = 0;
    app.service.server.on('request', (req, res) => {
      if (req.headers['x-test-interrupt'] !== 'yes') return;
      interruptedWrites++;
      vi.spyOn(res, 'writeHead').mockImplementation(() => {
        res.destroy();
        return res;
      });
    });
    await expect(post(`${app.url}/mcp/task`, ALICE, { 'X-Test-Interrupt': 'yes' })).rejects.toThrow();
    expect(interruptedWrites).toBe(1);
    let sessionId = '';
    await vi.waitFor(async () => {
      const retry = await post(`${app.url}/mcp/task`);
      expect(retry.status).toBe(200);
      sessionId = retry.headers.get('mcp-session-id')!;
    });
    const ping = JSON.stringify({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'ping', arguments: {} } });
    await expect(post(`${app.url}/mcp/task`, ALICE, {
      'Mcp-Session-Id': sessionId, 'X-Test-Interrupt': 'yes',
    }, ping)).rejects.toThrow();
    expect(interruptedWrites).toBe(2);
    expect((await post(`${app.url}/mcp/task`, ALICE, { 'Mcp-Session-Id': sessionId }, ping)).status).toBe(404);
    expect((await post(`${app.url}/mcp/task`)).status).toBe(200);
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

  it('matches configured host names regardless of letter case', async () => {
    const app = await start({ allowedHosts: ['LOCALHOST'] });
    const status = await new Promise<number | undefined>((resolveStatus, rejectRequest) => {
      const req = request(`${app.url}/mcp/task`, {
        method: 'POST', headers: { ...headers, Host: 'LocalHost', Authorization: `Bearer ${ALICE}` },
      }, res => { res.resume(); resolveStatus(res.statusCode); });
      req.on('error', rejectRequest);
      req.end(initialize);
    });
    expect(status).toBe(200);
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

  it.each(['maxSessions', 'idleTimeoutMs', 'maxRequestBodySize', 'maxPendingRequests', 'authenticationTimeoutMs', 'requestTimeoutMs'] as const)(
    'rejects a non-positive %s', key => {
      expect(() => createRSToolHttpServer({ persistenceDir: 'unused', verifyToken: () => 'alice', [key]: 0 })).toThrow(key);
    },
  );
});


it('explicitly releases an idle lease without its lost session ID and preserves saved models', async () => {
  const app = await start();
  const peer = await app.connect('recover');
  const saved = await call(peer.client, 'create_session', { initial: { title: 'Saved' } });
  const url = `${app.url}/mcp/recover/connection`;
  const auth = { Authorization: `Bearer ${ALICE}` };
  const snapshot = await fetch(url, { headers: auth });
  expect(await snapshot.json()).toMatchObject({ state: 'connected', busy: false });
  const revision = snapshot.headers.get('etag')!;
  expect(JSON.stringify(await (await fetch(url, { headers: auth })).json())).not.toContain(peer.transport.sessionId);
  expect((await post(`${app.url}/mcp/recover`)).status).toBe(409);
  expect((await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${BOB}`, 'If-Match': revision } })).status).toBe(404);
  expect((await fetch(url, { method: 'DELETE', headers: auth })).status).toBe(409);
  expect((await fetch(url, { method: 'DELETE', headers: { ...auth, 'If-Match': revision } })).status).toBe(204);
  const replacement = await app.connect('recover');
  expect(await call(replacement.client, 'get_session_state', { sessionId: saved.sessionId })).toMatchObject({ title: 'Saved' });
  expect((await fetch(url, { method: 'DELETE', headers: { ...auth, 'If-Match': revision } })).status).toBe(409);
});

it('invalidates a recovery revision on activity and management reads never renew idle expiry', async () => {
  const app = await start({ idleTimeoutMs: 120 });
  const peer = await app.connect('race');
  const url = `${app.url}/mcp/race/connection`;
  const auth = { Authorization: `Bearer ${ALICE}` };
  const old = (await fetch(url, { headers: auth })).headers.get('etag')!;
  await call(peer.client, 'ping');
  expect((await fetch(url, { method: 'DELETE', headers: { ...auth, 'If-Match': old } })).status).toBe(409);
  await vi.waitFor(async () => {
    const status = await fetch(url, { headers: auth });
    expect(await status.json()).toMatchObject({ state: 'disconnected' });
  });
  await app.connect('race');
});

it('bounds incomplete HTTP bodies, releases their lease, and does not affect another subject', async () => {
  const app = await start({ requestTimeoutMs: 80 });
  const other = await app.connect('slow', BOB);
  const closed = new Promise<void>((resolveClose) => {
    const req = request(`${app.url}/mcp/slow`, { method: 'POST', headers: { ...headers,
      Authorization: `Bearer ${ALICE}`, 'Content-Length': '100000' } });
    req.on('error', () => resolveClose());
    req.on('close', () => resolveClose());
    req.write('{');
  });
  await closed;
  await app.connect('slow');
  await call(other.client, 'ping');
});

it.each(['timeout', 'abort'] as const)('keeps a %s lease draining until actual async mutation settles and rejects queued work', async (failure) => {
  let release!: () => void;
  let entered!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const gate = new Promise<void>(resolve => { release = resolve; });
  const original = RSToolAgent.prototype.setModelValues;
  vi.spyOn(RSToolAgent.prototype, 'setModelValues').mockImplementation(async function (this: RSToolAgent, ...args) {
    entered();
    await gate;
    return original.apply(this, args);
  });
  const app = await start({ requestTimeoutMs: failure === 'timeout' ? 150 : 5000 });
  const peer = await app.connect('busy-recover');
  await call(peer.client, 'ensure_session');
  const url = `${app.url}/mcp/busy-recover/connection`;
  const auth = { Authorization: `Bearer ${ALICE}` };
  const sessionHeaders = { 'Mcp-Session-Id': peer.transport.sessionId! };
  const controller = new AbortController();
  const active = fetch(`${app.url}/mcp/busy-recover`, { method: 'POST', headers: { ...headers, ...auth, ...sessionHeaders },
    body: JSON.stringify({ jsonrpc: '2.0', id: 21, method: 'tools/call', params: { name: 'set_model_values', arguments: {} } }),
    signal: controller.signal }).catch(() => undefined);
  await started;
  const busy = await fetch(url, { headers: auth });
  expect(await busy.json()).toMatchObject({ state: 'connected', busy: true });
  expect((await fetch(url, { method: 'DELETE', headers: { ...auth, 'If-Match': busy.headers.get('etag')! } })).status).toBe(409);
  const queued = post(`${app.url}/mcp/busy-recover`, ALICE, sessionHeaders, JSON.stringify({ jsonrpc: '2.0', id: 22,
    method: 'tools/call', params: { name: 'create_session', arguments: {} } })).catch(() => undefined);
  if (failure === 'abort') controller.abort();
  try {
    await vi.waitFor(async () => {
      expect(await (await fetch(url, { headers: auth })).json()).toMatchObject({ state: 'draining', busy: true });
    });
    expect((await post(`${app.url}/mcp/busy-recover`)).status).toBe(409);
  } finally { release(); }
  await Promise.all([active, queued]);
  await vi.waitFor(async () => {
    expect(await (await fetch(url, { headers: auth })).json()).toMatchObject({ state: 'disconnected' });
  });
  const recovered = await app.connect('busy-recover');
  expect((await call(recovered.client, 'list_stored_sessions')).items).toHaveLength(1);
});


it('waits for actual mutation drain during shutdown before another service can use the saved result', async () => {
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const started = new Promise<void>(resolve => { entered = resolve; });
  const original = RSToolAgent.prototype.setModelValues;
  vi.spyOn(RSToolAgent.prototype, 'setModelValues').mockImplementation(async function (this: RSToolAgent, ...args) {
    entered();
    await gate;
    return original.apply(this, args);
  });
  const app = await start({ requestTimeoutMs: 100 });
  const peer = await app.connect('shutdown');
  const saved = await call(peer.client, 'ensure_session', { initial: { title: 'Retained result' } });
  await call(peer.client, 'apply_schema_patch', { items: [{ alias: 'X1' }] });
  const active = peer.client.callTool({ name: 'set_model_values', arguments: { set: [{ target: 1, value: { 0: 'node-0' } }] } }).catch(() => undefined);
  await started;
  await vi.waitFor(async () => {
    expect(await (await fetch(`${app.url}/mcp/shutdown/connection`, { headers: { Authorization: `Bearer ${ALICE}` } })).json())
      .toMatchObject({ state: 'draining', busy: true });
  });
  let closed = false;
  const closing = app.service.close().then(() => { closed = true; });
  try {
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(closed).toBe(false);
  } finally { release(); }
  await closing;
  await active;
  expect(closed).toBe(true);
  const replacement = await start({ persistenceDir: app.directory });
  const recovered = await replacement.connect('shutdown');
  expect(await call(recovered.client, 'get_session_state', { sessionId: saved.sessionId }))
    .toMatchObject({ title: 'Retained result' });
  expect((await call(recovered.client, 'get_model_state', { sessionId: saved.sessionId })).items[0].value)
    .toEqual({ 0: 'node-0' });
  expect((await call(recovered.client, 'list_stored_sessions')).items).toHaveLength(1);
});


it('releases actual-tool ownership even when retention metadata flushing fails', async () => {
  const app = await start();
  const peer = await app.connect('flush-failure');
  await call(peer.client, 'ensure_session');
  vi.spyOn(SessionPolicy.prototype, 'begin').mockReturnValue(() => {
    throw new SessionStorageError('SESSION_STORAGE_UNAVAILABLE', 'Retention flush failed');
  });
  const failure = await peer.client.callTool({ name: 'get_session_state', arguments: {} });
  expect(failure.isError).toBe(true);
  const url = `${app.url}/mcp/flush-failure/connection`;
  const headers = { Authorization: `Bearer ${ALICE}` };
  const snapshot = await fetch(url, { headers });
  expect(await snapshot.json()).toMatchObject({ state: 'connected', busy: false });
  expect((await fetch(url, { method: 'DELETE', headers: { ...headers, 'If-Match': snapshot.headers.get('etag')! } })).status).toBe(204);
});


it.each(['requestTimeoutMs', 'authenticationTimeoutMs', 'sessionCleanupIntervalMs'] as const)(
  'rejects %s beyond the native timer limit without creating a listener', async option => {
    const directory = await mkdtemp(join(tmpdir(), 'rstool-http-test-'));
    directories.push(directory);
    expect(() => createRSToolHttpServer({ persistenceDir: directory, verifyToken: createBearerTokenVerifier(credentials),
      [option]: 2_147_483_648 })).toThrow(`${option} must not exceed 2147483647`);
  });

it('drains an existing lease when its authenticated request disconnected during verification', async () => {
  const abandonedToken = 'abandoned-auth-request-'.repeat(3);
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const started = new Promise<void>(resolve => { entered = resolve; });
  const verify = createBearerTokenVerifier([...credentials, { subject: 'alice', token: abandonedToken }]);
  const app = await start({ verifyToken: async token => {
    if (token === abandonedToken) { entered(); await gate; }
    return verify(token);
  } });
  const peer = await app.connect('auth-abort');
  let closed!: () => void;
  const disconnected = new Promise<void>(resolve => { closed = resolve; });
  app.service.server.on('request', (incoming, res) => {
    if (incoming.headers['x-abandon-test']) { incoming.socket.once('close', closed); res.once('close', closed); }
  });
  const req = request(`${app.url}/mcp/auth-abort`, { method: 'POST', headers: { ...headers,
    Authorization: `Bearer ${abandonedToken}`, 'Mcp-Session-Id': peer.transport.sessionId!, 'X-Abandon-Test': 'yes' } });
  req.on('error', () => undefined);
  req.end(JSON.stringify({ jsonrpc: '2.0', id: 51, method: 'tools/call', params: { name: 'create_session', arguments: {} } }));
  try {
    await started;
    req.destroy();
    await disconnected;
  } finally { release(); }
  await vi.waitFor(async () => {
    expect(await (await fetch(`${app.url}/mcp/auth-abort/connection`, { headers: { Authorization: `Bearer ${ALICE}` } })).json())
      .toMatchObject({ state: 'disconnected' });
  });
  const recovered = await app.connect('auth-abort');
  expect((await call(recovered.client, 'list_stored_sessions')).items).toHaveLength(0);
});


it('accepts the native timer boundary while allowing longer stored-session retention', async () => {
  const app = await start({ requestTimeoutMs: 2_147_483_647, authenticationTimeoutMs: 2_147_483_647,
    sessionCleanupIntervalMs: 2_147_483_647, sessionRetentionMs: 30 * 24 * 60 * 60_000 });
  const peer = await app.connect('timer-boundary');
  expect(await call(peer.client, 'ping')).toMatchObject({ pong: true });
});
