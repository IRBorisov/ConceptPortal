import { type z } from 'zod';

import { formatAppMessage , LABEL_DEFAULTS, lid } from '@/i18n';

import { limits } from '@/utils/constants';

const LENGTH_BY_ID: Partial<Record<string, number>> = {
  [lid.error.aliasLength]: limits.len_alias,
  [lid.error.emailLength]: limits.len_email,
  [lid.error.titleLength]: limits.len_title,
  [lid.error.descriptionLength]: limits.len_description,
  [lid.error.textLength]: limits.len_text
};

/** Turns a Zod issue message (usually a label id) into localized text. */
export function formatZodIssueMessage(issue: z.core.$ZodIssue): string {
  const raw = issue.message;
  const def = LABEL_DEFAULTS[raw];
  if (def === undefined) {
    return raw;
  }
  const n = LENGTH_BY_ID[raw];
  if (n !== undefined) {
    return formatAppMessage(raw, def, { n });
  }
  return formatAppMessage(raw, def);
}
