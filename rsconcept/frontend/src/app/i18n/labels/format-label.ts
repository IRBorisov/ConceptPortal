import { formatAppMessage } from '@/app/i18n/format-app-message';

import { LABEL_DEFAULTS } from './catalog';

type LabelValues = Record<string, string | number | boolean | Date | null | undefined>;

/** Resolves a catalog id to the active locale (non-React: API, stores, plain `.ts`). */
export function formatLabel(id: string, values?: LabelValues): string {
  return formatAppMessage(id, LABEL_DEFAULTS[id] ?? id, values);
}
