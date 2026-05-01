import { type IntlShape } from 'react-intl';

import { LABEL_DEFAULTS } from '@/app/i18n/labels/catalog';

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
 * Formats a message outside React (toasts, stores, Zod issue text).
 * Pass an explicit English `defaultMessage`; when intl is not ready, uses simple `{name}` substitution on it.
 */
export function formatAppMessage(id: string, defaultMessage: string, values?: MessageValues): string {
  if (intlRef) {
    return intlRef.formatMessage({ id, defaultMessage }, values);
  }
  return interpolateDefault(defaultMessage, values);
}

/**
 * Resolves a label catalog id (`lid` / feature label ids) using {@link LABEL_DEFAULTS} as the English fallback.
 * Same intl bridge as {@link formatAppMessage}; use in non-React code and plain `.ts` helpers.
 */
export function formatLabel(id: string, values?: MessageValues): string {
  return formatAppMessage(id, LABEL_DEFAULTS[id] ?? id, values);
}
