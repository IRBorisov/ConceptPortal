import { useEffect, useMemo } from 'react';
import { IntlProvider } from 'react-intl';

import { usePreferencesStore } from '@/stores/preferences';

import { AppIntlBridge } from './app-intl-bridge';
import { DEFAULT_LOCALE } from './locales';
import { getMessagesForLocale } from './messages';

/** Binds React Intl to persisted UI locale and message catalogs. */
export function IntlPreferencesProvider({ children }: React.PropsWithChildren) {
  const locale = usePreferencesStore(state => state.locale);

  const messages = useMemo(() => getMessagesForLocale(locale), [locale]);

  useEffect(
    function syncDocumentLang() {
      document.documentElement.lang = locale === 'en' ? 'en' : locale === 'fr' ? 'fr' : 'ru';
    },
    [locale]
  );

  return (
    <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={messages}>
      <AppIntlBridge />
      {children}
    </IntlProvider>
  );
}
