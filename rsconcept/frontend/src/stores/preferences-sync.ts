import { type AppLocale } from '@/i18n';
import { parsePersistedPreferencesLocale } from '@/i18n/persisted-locale';

import { localStorageKeys } from '@/utils/constants';

import { rehydratePreferencesFromStorage, usePreferencesStore } from './preferences';

const POLL_INTERVAL = 1000; // 1 second

export type PreferencesStorageAction = 'reload' | 'rehydrated' | 'ignored';

export async function applyPreferencesStorageChange(raw: string | null): Promise<PreferencesStorageAction> {
  const action = resolvePreferencesStorageAction(raw, usePreferencesStore.getState().locale);
  if (action === 'ignored') {
    return 'ignored';
  }
  if (action === 'reload') {
    return 'reload';
  }
  await rehydratePreferencesFromStorage();
  return 'rehydrated';
}

export function subscribePreferencesStorage(onRawValue: (raw: string | null) => void): () => void {
  function onStorage(event: StorageEvent) {
    if (event.key === localStorageKeys.preferences) {
      onRawValue(event.newValue);
    }
  }

  window.addEventListener('storage', onStorage);
  return function removePreferencesStorageListener() {
    window.removeEventListener('storage', onStorage);
  };
}

export function startPreferencesStoragePolling(onRawValue: (raw: string | null) => void): () => void {
  const intervalId = window.setInterval(function pollPreferencesStorage() {
    onRawValue(localStorage.getItem(localStorageKeys.preferences));
  }, POLL_INTERVAL);

  return function stopPreferencesStoragePolling() {
    window.clearInterval(intervalId);
  };
}

// ===== Internals ======
function resolvePreferencesStorageAction(
  raw: string | null,
  currentLocale: AppLocale
): 'reload' | 'rehydrate' | 'ignored' {
  if (raw === null) {
    return 'ignored';
  }
  const nextLocale = parsePersistedPreferencesLocale(raw);
  if (nextLocale !== null && nextLocale !== currentLocale) {
    return 'reload';
  }
  return 'rehydrate';
}
