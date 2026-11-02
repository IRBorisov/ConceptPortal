import { z } from 'zod';

import { globalTx } from '@/i18n';

import { limits } from '@/utils/constants';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_SIMILARITY_THRESHOLD = 0.7;

/** True when the password ends with whitespace. Signup used to trim it and login did not. */
export function hasTrailingPasswordSpace(password: string): boolean {
  return password !== password.trimEnd();
}

export const schemaPassword = z
  .string()
  .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
  .nonempty(globalTx('tx.general.field.required'))
  .min(PASSWORD_MIN_LENGTH, globalTx('tx.general.password.validate.minLength', { minLength: PASSWORD_MIN_LENGTH }))
  .refine(password => !hasTrailingPasswordSpace(password), {
    message: globalTx('tx.general.password.validate.trailingSpace')
  })
  .refine(password => !/^\d+$/.test(password), {
    message: globalTx('tx.general.password.validate.numeric')
  });

export function isPasswordTooSimilar(password: string, values: readonly string[]): boolean {
  const normalizedPassword = normalizePasswordPart(password);
  if (!normalizedPassword) {
    return false;
  }

  return values.some(value =>
    splitUserValue(value).some(part => getSimilarityRatio(normalizedPassword, part) >= PASSWORD_SIMILARITY_THRESHOLD)
  );
}

function splitUserValue(value: string): string[] {
  return value
    .split(/\W+/)
    .map(normalizePasswordPart)
    .filter(part => part.length > 0);
}

function normalizePasswordPart(value: string): string {
  return value.trim().toLowerCase();
}

/** `1 - distance / (len(a) + len(b))`. A short fragment stays under 0.7; a long shared prefix does not. */
function getSimilarityRatio(a: string, b: string): number {
  if (!a || !b) {
    return 0;
  }
  const distance = getLevenshteinDistance(a, b);
  return 1 - distance / (a.length + b.length);
}

function getLevenshteinDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + substitutionCost);
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}
