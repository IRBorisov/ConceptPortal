import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';

import { type AppLocale, DEFAULT_LOCALE, getMessageMapForLocale } from '@/i18n';

function handleIntlError(locale: AppLocale, error: unknown) {
  if (locale === 'en' && typeof error === 'object' && error && 'code' in error) {
    const code = (error as { code?: string }).code;
    if (code === 'MISSING_TRANSLATION') {
      return;
    }
  }
  console.error(error);
}

/** Props for {@link PdfIntlRoot}. */
export interface PdfIntlRootProps {
  /** Active UI locale; selects the message map passed to `IntlProvider`. */
  locale: AppLocale;
  /** PDF document tree that calls `useTx` / `useIntl`. */
  children: ReactNode;
}

/**
 * `react-intl` root for PDF trees rendered outside the React app (main-thread `pdf()` or a
 * dedicated worker).
 *
 * PDF generation does not mount under the app `IntlProvider`, so exports must wrap documents
 * with this component and pass an explicit `AppLocale` (typically from preferences at the
 * call site).
 */
export function PdfIntlRoot({ locale, children }: PdfIntlRootProps) {
  const messages = getMessageMapForLocale(locale);
  return (
    <IntlProvider
      locale={locale}
      defaultLocale={DEFAULT_LOCALE}
      messages={messages}
      onError={error => handleIntlError(locale, error)}
    >
      {children}
    </IntlProvider>
  );
}
