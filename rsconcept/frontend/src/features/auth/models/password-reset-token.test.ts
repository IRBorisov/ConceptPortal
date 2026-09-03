import { describe, expect, it } from 'vitest';

import { scrubResetTokenFromUrl } from './password-reset-token';

describe('scrubResetTokenFromUrl', () => {
  it('masks token in query and fragment', () => {
    expect(scrubResetTokenFromUrl('https://p.example/password-change?token=abc123')).toBe(
      'https://p.example/password-change?token=[Filtered]'
    );
    expect(scrubResetTokenFromUrl('https://p.example/password-change#token=abc123')).toBe(
      'https://p.example/password-change#token=[Filtered]'
    );
    expect(scrubResetTokenFromUrl('/password-change?a=1&token=abc&b=2')).toBe(
      '/password-change?a=1&token=[Filtered]&b=2'
    );
  });

  it('leaves URLs without a token untouched', () => {
    expect(scrubResetTokenFromUrl('/rsforms/12?tab=3')).toBe('/rsforms/12?tab=3');
  });
});
