import { z } from 'zod';

import { globalTx } from '@/i18n';

import { limits } from '@/utils/constants';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_SIMILARITY_THRESHOLD = 0.7;

export const schemaPassword = z
  .string()
  .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
  .nonempty(globalTx('tx.general.field.required'))
  .min(PASSWORD_MIN_LENGTH, globalTx('tx.general.password.validate.minLength', { minLength: PASSWORD_MIN_LENGTH }))
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

function getSimilarityRatio(a: string, b: string): number {
  if (!a || !b) {
    return 0;
  }
  if (a === b || a.includes(b) || b.includes(a)) {
    return 1;
  }

  const longerLength = Math.max(a.length, b.length);
  return (longerLength - getLevenshteinDistance(a, b)) / longerLength;
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
