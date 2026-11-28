import { expect, it, vi } from 'vitest';

import { createRSToolRpcServer, type RSToolHttpIdentity, type RSToolHttpOptions } from './http';

const identity = { subject: 'fixture', projectId: 'project' };

async function withServer(options: RSToolHttpOptions, check: (url: string) => Promise<void>) {
  const server = createRSToolRpcServer(options);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing HTTP address');
  try {
    await check(`http://127.0.0.1:${address.port}/v1/rpc`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

function post(url: string, body: object, token = 'fixture') {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body) });
}

it('bounds success and failure envelopes and only retains an ID that fits', async () => {
  await withServer({ verifyToken: () => identity, maxResponseBytes: 256 }, async url => {
    const ordinary = await post(url, { id: 'diagnostics', method: 'listDiagnostics' });
    expect(await ordinary.json()).toMatchObject({ id: 'diagnostics', ok: false, error: { code: 'NO_CURRENT_SESSION' } });

    for (const method of ['listDiagnostics', 'ping']) {
      const response = await post(url, { id: '\u96ea'.repeat(512), method });
      const body = await response.text();
      expect(response.status).toBe(413);
      expect(Buffer.byteLength(body)).toBeLessThanOrEqual(256);
      expect(JSON.parse(body)).toMatchObject({ id: null, ok: false, error: { code: 'RESPONSE_TOO_LARGE' } });
    }

    const methods = await post(url, { id: 23, method: 'methods' });
    expect(methods.status).toBe(413);
    expect(await methods.json()).toMatchObject({ id: 23, ok: false, error: { code: 'RESPONSE_TOO_LARGE' } });
  });
});

it('cancels stalled verification, releases admission, and ignores the late identity', async () => {
  let completeVerification!: (identity: RSToolHttpIdentity) => void;
  const promise = new Promise<RSToolHttpIdentity>(resolve => { completeVerification = resolve; });
  const resolveProjectAgent = vi.fn();
  let verificationSignal: AbortSignal | undefined;
  await withServer({ resolveProjectAgent, verifyTimeoutMs: 20, verifyToken: (token, signal) => {
    if (token === 'fixture') return identity;
    verificationSignal = signal;
    return promise;
  } }, async url => {
    for (let attempt = 0; attempt < 16; attempt++) {
      const timedOut = await post(url, { id: attempt, method: 'listDiagnostics', state: { sessionId: 'private' } }, 'stalled');
      expect(timedOut.status).toBe(503);
      expect(await timedOut.json()).toMatchObject({ id: null, error: { code: 'AUTH_TIMEOUT' } });
      expect(verificationSignal?.aborted).toBe(true);
    }
    completeVerification(identity);
    const accepted = await post(url, { id: 17, method: 'ping' });
    expect(await accepted.json()).toMatchObject({ id: 17, ok: true, result: { pong: true } });
    expect(resolveProjectAgent).not.toHaveBeenCalled();
  });
});
