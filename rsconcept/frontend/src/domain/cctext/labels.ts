import { formatLabel } from '@/i18n/format-app-message';
import { labelGrammemeMessageId } from '@/i18n/labels/cctext-ui';

import { type Grammeme } from './language';

/** Generates label for grammeme. */
export function labelGrammeme(gram: Grammeme): string {
  return formatLabel(labelGrammemeMessageId(gram));
}
