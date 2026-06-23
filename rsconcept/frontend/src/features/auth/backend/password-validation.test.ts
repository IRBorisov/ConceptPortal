import { describe, expect, test } from 'vitest';

import { isPasswordTooSimilar, schemaPassword } from './password-validation';

describe('schemaPassword', () => {
  test('rejects short and numeric-only passwords', () => {
    expect(schemaPassword.safeParse('1234567').success).toBe(false);
    expect(schemaPassword.safeParse('12345678').success).toBe(false);
  });

  test('allows non-dictionary algorithmic checks to pass', () => {
    expect(schemaPassword.safeParse('PortalPass123').success).toBe(true);
  });
});

describe('isPasswordTooSimilar', () => {
  test('detects passwords similar to signup user fields', () => {
    expect(isPasswordTooSimilar('ivanov2026', ['ivanov@example.com', 'Ivanov'])).toBe(true);
  });

  test('allows passwords that differ from signup user fields', () => {
    expect(isPasswordTooSimilar('PortalPass123', ['ivanov@example.com', 'Ivanov'])).toBe(false);
  });
});
