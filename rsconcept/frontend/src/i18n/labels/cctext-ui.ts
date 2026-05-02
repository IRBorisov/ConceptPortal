import { type Grammeme } from '@/domain/cctext/language';

export const cctextLid = {
  grammemeUnknown: 'labels.cctext.grammemeUnknown'
} as const;

export function labelGrammemeMessageId(gram: Grammeme): string {
  return `labels.cctext.grammeme.${gram}`;
}
