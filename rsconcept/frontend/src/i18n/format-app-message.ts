import { type IntlShape } from 'react-intl';

type MessageValues = Record<string, string | number | boolean | Date | null | undefined>;

let intlRef: IntlShape | null = null;

/** Called from `AppIntlBridge` when the app is mounted under `IntlProvider`. */
export function setAppIntl(intl: IntlShape | null) {
  intlRef = intl;
}

/** Formats a message outside React (toasts, stores, Zod issue text). */
export function globalTx(id: string, values?: MessageValues): string {
  if (intlRef) {
    return intlRef.formatMessage({ id }, values);
  }
  return id;
}
