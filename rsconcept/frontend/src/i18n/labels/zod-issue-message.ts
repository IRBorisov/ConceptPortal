import { type z } from 'zod';

import { limits } from '@/utils/constants';

import { formatAppMessage } from '../format-app-message';

import { lid } from './lid';

const LENGTH_BY_ID: Partial<Record<string, number>> = {
  [lid.error.aliasLength]: limits.len_alias,
  [lid.error.emailLength]: limits.len_email,
  [lid.error.titleLength]: limits.len_title,
  [lid.error.descriptionLength]: limits.len_description,
  [lid.error.textLength]: limits.len_text
};

/**
 * Localizes a Zod custom `message` (a `labels.*` / `lid` id from schemas) for inline field errors.
 * Interpolates max-length values the same way as {@link formatZodIssueMessage}.
 */
export function formatZodErrorMessage(raw: string | undefined): string | undefined {
  if (raw === undefined || raw === '') {
    return undefined;
  }
  const n = LENGTH_BY_ID[raw];
  if (n !== undefined) {
    return formatAppMessage(raw, { n });
  }
  return formatAppMessage(raw);
}

/** Turns a Zod issue message (usually a label id) into localized text. */
export function formatZodIssueMessage(issue: z.core.$ZodIssue): string {
  return formatZodErrorMessage(issue.message) ?? issue.message;
}
