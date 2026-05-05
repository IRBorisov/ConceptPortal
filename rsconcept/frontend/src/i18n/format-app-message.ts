import { createIntl, createIntlCache, type IntlShape } from 'react-intl';

import { type AppLocale, DEFAULT_LOCALE } from './locales';
import { getMessagesForLocale } from './messages';
import { getInitialAppLocale } from './persisted-locale';

type MessageValues = Record<string, string | number | boolean | Date | null | undefined>;

const intlCache = createIntlCache();

let intlRef: IntlShape = createAppIntl(getInitialAppLocale());

/** Called from `AppIntlBridge` when the app is mounted under `IntlProvider`. */
export function setAppIntl(intl: IntlShape | null) {
  intlRef = intl ?? createAppIntl(getInitialAppLocale());
}

/** Formats a message outside React (toasts, stores, Zod issue text). */
export function globalTx(id: string, values?: MessageValues): string {
  try {
    return intlRef.formatMessage({ id }, values);
  } catch {
    return id;
  }
}

function createAppIntl(locale: AppLocale): IntlShape {
  return createIntl(
    {
      locale,
      defaultLocale: DEFAULT_LOCALE,
      messages: getMessagesForLocale(locale)
    },
    intlCache
  );
}
