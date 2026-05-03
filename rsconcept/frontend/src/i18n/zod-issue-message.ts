import { type z } from 'zod';

import { limits } from '@/utils/constants';

import { globalTx } from './format-app-message';

const LENGTH_BY_ID: Partial<Record<string, number>> = {
  ['labels.error.aliasLength']: limits.len_alias,
  ['labels.error.emailLength']: limits.len_email,
  ['labels.error.titleLength']: limits.len_title,
  ['labels.error.descriptionLength']: limits.len_description,
  ['labels.error.textLength']: limits.len_text
};

/**
 * Localizes a Zod custom `message` (a `labels.*` message id from schemas) for inline field errors.
 * Interpolates max-length values the same way as {@link formatZodIssueMessage}.
 */
export function formatZodErrorMessage(raw: string | undefined): string | undefined {
  if (raw === undefined || raw === '') {
    return undefined;
  }
  const n = LENGTH_BY_ID[raw];
  if (n !== undefined) {
    return globalTx(raw, { n });
  }
  return globalTx(raw);
}

/** Turns a Zod issue message (usually a label id) into localized text. */
export function formatZodIssueMessage(issue: z.core.$ZodIssue): string {
  return formatZodErrorMessage(issue.message) ?? issue.message;
}
