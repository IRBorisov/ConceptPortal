import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  captureResetTokenFromUrl,
  clearResetToken,
  PASSWORD_RESET_TOKEN_STORAGE_KEY,
  readResetToken,
  scrubResetTokenFromUrl
} from './password-reset-token';

/** Minimal `sessionStorage` stand-in for the Node test environment. */
function createStorage(): Storage & { failWrites: boolean } {
  const data = new Map<string, string>();
  return {
    failWrites: false,
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem(key: string, value: string) {
      if (this.failWrites) {
        throw new DOMException('QuotaExceededError');
      }
      data.set(key, value);
    }
  };
}

function stubWindow(href: string) {
  const replaceState = vi.fn((_state: unknown, _unused: string, url: string) => {
    location.href = url;
  });
  const location = { href };
  vi.stubGlobal('window', { location, history: { state: { key: 'x' }, replaceState } });
  return { location, replaceState };
}

describe('captureResetTokenFromUrl', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage();
    vi.stubGlobal('sessionStorage', storage);
  });

  afterEach(() => {
    clearResetToken();
    vi.unstubAllGlobals();
  });

  it('captures a fragment token and strips it from the address bar', () => {
    const { location, replaceState } = stubWindow('https://p.example/password-change#token=frag123');
    captureResetTokenFromUrl();

    expect(readResetToken()).toBe('frag123');
    expect(storage.getItem(PASSWORD_RESET_TOKEN_STORAGE_KEY)).toBe('frag123');
    expect(replaceState).toHaveBeenCalledOnce();
    expect(replaceState.mock.calls[0][0]).toEqual({ key: 'x' });
    expect(location.href).toBe('https://p.example/password-change');
  });

  it('captures a legacy query token', () => {
    const { location } = stubWindow('https://p.example/password-change?token=query456');
    captureResetTokenFromUrl();

    expect(readResetToken()).toBe('query456');
    expect(location.href).toBe('https://p.example/password-change');
  });

  it('preserves unrelated query and fragment parameters', () => {
    const { location } = stubWindow('https://p.example/password-change?lang=ru&token=abc#token=def&tab=2');
    captureResetTokenFromUrl();

    expect(readResetToken()).toBe('def');
    expect(location.href).toBe('https://p.example/password-change?lang=ru#tab=2');
  });

  it('is a no-op without a token', () => {
    const { location, replaceState } = stubWindow('https://p.example/rsforms/1?tab=3');
    captureResetTokenFromUrl();

    expect(readResetToken()).toBe('');
    expect(replaceState).not.toHaveBeenCalled();
    expect(location.href).toBe('https://p.example/rsforms/1?tab=3');
  });

  it('keeps the token for the current page load when sessionStorage rejects writes', () => {
    storage.failWrites = true;
    const { location } = stubWindow('https://p.example/password-change#token=mem789');
    captureResetTokenFromUrl();

    expect(storage.getItem(PASSWORD_RESET_TOKEN_STORAGE_KEY)).toBeNull();
    expect(readResetToken()).toBe('mem789');
    expect(location.href).toBe('https://p.example/password-change');

    clearResetToken();
    expect(readResetToken()).toBe('');
  });
});

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
