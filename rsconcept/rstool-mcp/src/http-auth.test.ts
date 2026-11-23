import { describe, expect, it } from 'vitest';

import { createBearerIdentityVerifier, createBearerTokenVerifier } from './http-auth';

describe('HTTP bearer credentials', () => {
  it('maps independent tokens to stable subjects and allows rotation', async () => {
    const verify = createBearerTokenVerifier([
      { subject: 'alice', token: 'a'.repeat(32) },
      { subject: 'alice', token: 'b'.repeat(32) },
      { subject: 'bob', token: 'c'.repeat(32) },
    ]);
    expect(await verify('a'.repeat(32))).toBe('alice');
    expect(await verify('b'.repeat(32))).toBe('alice');
    expect(await verify('c'.repeat(32))).toBe('bob');
    expect(await verify('unknown')).toBeNull();
  });

  it('assigns only configured projects and rejects ambiguous or invalid credentials', () => {
    const projected = { subject: 'alice', token: 'p'.repeat(32), projectId: 'research' };
    const personal = { subject: 'alice', token: 'a'.repeat(32) };
    const verify = createBearerIdentityVerifier([personal, projected]);
    expect(verify(personal.token)).toBe('alice');
    expect(verify(projected.token)).toEqual({ subject: 'alice', projectId: 'research' });
    expect(() => createBearerIdentityVerifier([projected, { ...projected, projectId: 'other' }])).toThrow('duplicate token');
    expect(() => createBearerIdentityVerifier([{ ...projected, projectId: '../other' }])).toThrow('project ID');
    expect(() => createBearerTokenVerifier([projected])).toThrow('audience');
  });

  it.each([
    [], null, {}, [{ subject: '', token: 'a'.repeat(32) }],
    [{ subject: 'alice', token: 'short' }],
    [{ subject: 'alice', token: 'a'.repeat(31) + ' ' }],
    [{ subject: 'alice', token: 'a'.repeat(32) }, { subject: 'bob', token: 'a'.repeat(32) }],
  ])('fails closed for invalid credentials without echoing them: %#', credentials => {
    expect(() => createBearerTokenVerifier(credentials as never)).toThrow();
  });
});
