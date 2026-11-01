import { describe, expect, it } from 'vitest';

import { createBearerTokenVerifier } from './http-auth';

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

  it.each([
    [], null, {}, [{ subject: '', token: 'a'.repeat(32) }],
    [{ subject: 'alice', token: 'short' }],
    [{ subject: 'alice', token: 'a'.repeat(31) + ' ' }],
    [{ subject: 'alice', token: 'a'.repeat(32) }, { subject: 'bob', token: 'a'.repeat(32) }],
  ])('fails closed for invalid credentials without echoing them: %#', credentials => {
    expect(() => createBearerTokenVerifier(credentials as never)).toThrow();
  });
});
