import { z } from 'zod';

/**
 * `tab` query value. A missing or unknown number becomes `fallback`
 * instead of throwing, so a tab id from another page does not crash this one.
 */
export function tabQuerySchema<T extends Record<string, number>>(enumObj: T, fallback: T[keyof T]) {
  return z.preprocess((value: unknown) => (value ? Number(value) : undefined), z.enum(enumObj).catch(fallback));
}
