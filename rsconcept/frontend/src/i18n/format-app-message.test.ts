import { afterEach, describe, expect, it, vi } from 'vitest';

const PREFERENCES_STORAGE_KEY = 'portal.preferences';

describe('globalTx', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('formats Zod schema messages before the React Intl bridge mounts', async () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) =>
        key === PREFERENCES_STORAGE_KEY ? JSON.stringify({ state: { locale: 'en' } }) : null
      )
    });

    const { schemaUserSignup } = await import('@/features/users/backend/types');

    const result = schemaUserSignup.safeParse({
      username: '',
      email: 'not-an-email',
      first_name: '',
      last_name: '',
      password: '',
      password2: 'different'
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }
    const messages = result.error.issues.map(issue => issue.message);
    expect(messages).toContain('Required field');
    expect(messages).toContain('Enter a valid email address');
    expect(messages).toContain('Passwords do not match');
    expect(messages).not.toContain('labels.error.requiredField');
  });
});
