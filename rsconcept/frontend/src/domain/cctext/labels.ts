import { labelGrammemeMessageId } from '@/app/i18n/labels/cctext-ui';
import { formatLabel } from '@/app/i18n/format-app-message';

import { type Grammeme } from './language';

/** Generates label for grammeme. */
export function labelGrammeme(gram: Grammeme): string {
  return formatLabel(labelGrammemeMessageId(gram));
}
