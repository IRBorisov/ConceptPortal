/**
 * Module: Structured data for RSLang expression evaluation.
 */

/** Tuple ID for array distinction. */
export const TUPLE_ID = -10_000;

/** Boolean values: true. */
export const VALUE_TRUE = 1;

/** Boolean values: false. */
export const VALUE_FALSE = 0;

/** Cardinality threshold for "infinite" sets (e.g. Z). */
export const SET_INFINITY = 0x0fffffff;

/** Cardinality threshold for Boolean power set. */
export const BOOL_INFINITY = 12;

/** Expression evaluation result: structured data. */
export type Value = number | Value[];

/** Values context. */
export type ValueContext = Map<string, Value>;

/** Empty set ∅. */
export const EmptySetV = [];

/** Compare two structured data. */
export function compare(v1: Value, v2: Value): number {
  if (v1 === v2) {
    return 0;
  }
  if (!Array.isArray(v1) && !Array.isArray(v2)) {
    return v1 - v2;
  }
  if (!Array.isArray(v1) || !Array.isArray(v2)) {
    throw new Error('Cannot compare different types');
  }
  if (v1.length !== v2.length || v1.length === 0) {
    return v1.length - v2.length;
  }
  for (let i = 0; i < v1.length; i++) {
    const cmp = compare(v1[i], v2[i]);
    if (cmp) {
      return cmp;
    }
  }
  return 0;
}

/** Tuple from components. */
export function tuple(components: Value[]): Value {
  return [TUPLE_ID, ...components];
}

/** Set from elements (unique). Value[] - materialized. */
export function set(elements: Value[]): Value[] {
  const sorted = [...elements].sort(compare);
  for (let i = 1; i < sorted.length;) {
    if (compare(sorted[i - 1], sorted[i]) === 0) {
      sorted.splice(i, 1);
    } else {
      i++;
    }
  }
  return sorted;
}
