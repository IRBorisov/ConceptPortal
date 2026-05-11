import { localStorageKeys } from '@/utils/constants';

import { type AppLocale, DEFAULT_LOCALE, inferLocaleFromNavigator } from './locales';

/** Reads UI locale from persisted preferences JSON (zustand persist shape). */
export function parsePersistedPreferencesLocale(raw: string | null): AppLocale | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const state = (parsed as { state?: unknown }).state;
    if (!state || typeof state !== 'object') {
      return null;
    }
    const locale = (state as { locale?: unknown }).locale;
    if (locale === 'en' || locale === 'fr' || locale === 'ru') {
      return locale;
    }
  } catch {
    // ignore malformed storage
  }
  return null;
}

export function getInitialAppLocale(): AppLocale {
  const persistedLocale = readPersistedLocale();
  if (persistedLocale) {
    return persistedLocale;
  }
  if (typeof navigator !== 'undefined') {
    return inferLocaleFromNavigator();
  }
  return DEFAULT_LOCALE;
}

function readPersistedLocale(): AppLocale | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  try {
    return parsePersistedPreferencesLocale(localStorage.getItem(localStorageKeys.preferences));
  } catch {
    return null;
  }
}
