import { describe, expect, it } from 'vitest';

import { schemaApiKey, schemaCreateApiKey } from './types';

describe('API key policies', () => {
  const metadata = {
    id: 1,
    label: 'Synthetic',
    prefix: 'test',
    created_at: '2026-01-01T00:00:00Z',
    last_used_at: null,
    revoked_at: null
  };

  it('preserves metadata compatibility with pre-policy backends', () => {
    const key = schemaApiKey.parse(metadata);
    expect(key.scopes).toEqual(['read', 'write']);
    expect(key.expires_at).toBeNull();
    expect(key.is_active).toBe(true);
  });

  it('drops the former publication permission from legacy key metadata', () => {
    expect(schemaApiKey.parse({ ...metadata, scopes: ['read', 'write', 'publish'] }).scopes).toEqual(['read', 'write']);
    expect(schemaApiKey.parse({ ...metadata, scopes: ['publish'] }).scopes).toEqual([]);
  });

  it('requires explicit nonempty capabilities for a new key', () => {
    expect(schemaCreateApiKey.safeParse({ label: 'Synthetic', scopes: [] }).success).toBe(false);
    expect(schemaCreateApiKey.safeParse({ label: 'Synthetic', scopes: ['admin'] }).success).toBe(false);
    expect(schemaCreateApiKey.safeParse({ label: 'Synthetic', scopes: ['read', 'write', 'publish'] }).success).toBe(
      false
    );
    expect(schemaCreateApiKey.safeParse({ label: 'Synthetic', scopes: ['read'], expires_at: 'invalid' }).success).toBe(
      false
    );
    expect(schemaCreateApiKey.parse({ label: 'Synthetic', scopes: ['read'], expires_at: null })).toEqual({
      label: 'Synthetic',
      scopes: ['read'],
      expires_at: null
    });
  });
});
