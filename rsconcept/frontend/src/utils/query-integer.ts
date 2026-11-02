import { z } from 'zod';

/**
 * Integer from a route or query value.
 * Empty and non-integer values are `undefined` instead of `NaN`.
 */
export function parseQueryInteger(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) ? value : undefined;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

/** Optional integer field. Missing, empty, and non-integer inputs become `undefined`. */
export function optionalQueryInteger() {
  return z.preprocess(value => parseQueryInteger(value), z.number().optional());
}
