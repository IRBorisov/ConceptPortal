import { type IntlShape } from 'react-intl';

type MessageValues = Record<string, string | number | boolean | Date | null | undefined>;

let intlRef: IntlShape | null = null;

/** Called from `AppIntlBridge` when the app is mounted under `IntlProvider`. */
export function setAppIntl(intl: IntlShape | null) {
  intlRef = intl;
}

function interpolateDefault(template: string, values?: MessageValues): string {
  if (!values) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, function replaceToken(_, key: string) {
    const v = values[key];
    return v === undefined || v === null ? `{${key}}` : String(v);
  });
}

/**
 * Formats a catalog message outside React (toasts, stores, Zod issue text).
 * Falls back to `defaultMessage` with simple `{name}` substitution when intl is not ready.
 */
export function formatAppMessage(id: string, defaultMessage: string, values?: MessageValues): string {
  if (intlRef) {
    return intlRef.formatMessage({ id, defaultMessage }, values);
  }
  return interpolateDefault(defaultMessage, values);
}
