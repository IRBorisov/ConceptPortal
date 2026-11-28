import { expect, it, vi } from 'vitest';

import { PortalClient, portalFailure } from './portal';

it('keeps public reads anonymous and resolves a trusted credential for protected requests', async () => {
  const credential = vi.fn(() => 'fixture-token');
  const request = vi.fn<typeof fetch>(async (_url, init) => Response.json({ id: 12,
    authenticated: new Headers(init?.headers).has('Authorization') }));
  const portal = new PortalClient('https://portal.example', { credential, fetch: request });
  expect(await portal.getDetails('schema', 12, { anonymous: true })).toMatchObject({ authenticated: false });
  expect(credential).not.toHaveBeenCalled();
  expect(await portal.getDetails('schema', 12)).toMatchObject({ authenticated: true });
  expect(request.mock.lastCall?.[1]?.redirect).toBe('error');
  expect(credential).toHaveBeenCalledTimes(1);
});

it('reports TLS and rate-limit diagnostics without leaking the remote error content', async () => {
  const request = vi.fn<typeof fetch>();
  request.mockRejectedValueOnce(new Error('private transport details', { cause: { code: 'ERR_TLS_CERT_ALTNAME_INVALID' } }));
  request.mockResolvedValueOnce(new Response('private remote details', { status: 429, headers: { 'Retry-After': '42' } }));
  const portal = new PortalClient('https://portal.example', { fetch: request });
  const tls = await portal.getDetails('schema', 12).catch(portalFailure);
  expect(tls).toMatchObject({ code: 'PORTAL_TLS', nextAction: 'check_portal_tls' });
  expect(JSON.stringify(tls)).not.toContain('private transport');
  const limit = await portal.getDetails('schema', 12).catch(portalFailure);
  expect(limit).toMatchObject({ code: 'PORTAL_RATE_LIMITED', retryAfter: '42' });
  expect(JSON.stringify(limit)).not.toContain('private remote');
});
