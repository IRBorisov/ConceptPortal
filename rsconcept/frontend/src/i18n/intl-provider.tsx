'use client';

import { useEffect } from 'react';
import { IntlProvider } from 'react-intl';

import { usePreferencesStore } from '@/stores/preferences';

import { AppIntlBridge } from './app-intl-bridge';
import { type AppLocale, DEFAULT_LOCALE } from './locales';
import { getMessageMapForLocale } from './map';
import { parsePersistedPreferencesLocale, PREFERENCES_STORAGE_KEY } from './persisted-locale';

const POLL_INTERVAL = 1000;

function handleIntlError(locale: AppLocale, error: unknown) {
  if (locale === 'en' && typeof error === 'object' && error && 'code' in error) {
    const code = (error as { code?: string }).code;
    if (code === 'MISSING_TRANSLATION') {
      return;
    }
  }
  console.error(error);
}

/** Binds React Intl to persisted UI locale and message catalogs. */
export function IntlPreferencesProvider({ children }: React.PropsWithChildren) {
  const locale = usePreferencesStore(state => state.locale);

  const messages = getMessageMapForLocale(locale);

  useEffect(
    function syncDocumentLang() {
      document.documentElement.lang = locale === 'en' ? 'en' : locale === 'fr' ? 'fr' : 'ru';
    },
    [locale]
  );

  useEffect(function reloadWhenPersistedLocaleChanges() {
    let reloadRequested = false;

    function reloadIfPersistedLocaleChanged(raw: string | null) {
      if (reloadRequested) {
        return;
      }
      const nextLocale = parsePersistedPreferencesLocale(raw);
      if (nextLocale === null || nextLocale === usePreferencesStore.getState().locale) {
        return;
      }
      reloadRequested = true;
      window.location.reload();
    }

    function onPreferencesStorage(event: StorageEvent) {
      if (event.key === PREFERENCES_STORAGE_KEY) {
        reloadIfPersistedLocaleChanged(event.newValue);
      }
    }

    function pollPreferencesStorage() {
      reloadIfPersistedLocaleChanged(localStorage.getItem(PREFERENCES_STORAGE_KEY));
    }

    const intervalId = window.setInterval(pollPreferencesStorage, POLL_INTERVAL);
    window.addEventListener('storage', onPreferencesStorage);
    return function removePreferencesStorageListener() {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', onPreferencesStorage);
    };
  }, []);

  return (
    <IntlProvider
      locale={locale}
      defaultLocale={DEFAULT_LOCALE}
      messages={messages}
      onError={error => handleIntlError(locale, error)}
    >
      <AppIntlBridge />
      {children}
    </IntlProvider>
  );
}
