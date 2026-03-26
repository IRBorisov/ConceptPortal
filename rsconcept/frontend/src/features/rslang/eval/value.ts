/**
 * Module: Structured data for RSLang expression evaluation.
 */

import { type Branded } from '@/utils/meta';

import { printValue } from './value-api';

/** Tuple ID for array distinction. */
export const TUPLE_ID = -111;

/** Invalid value for structured data. */
export const INVALID_ELEMENT = -1;

/** Boolean values: true. */
export const VALUE_TRUE = 1;

/** Boolean values: false. */
export const VALUE_FALSE = 0;

/** Cardinality threshold for "infinite" sets (e.g. Z). */
export const SET_INFINITY = 10_000_000;

/** Cardinality threshold for Boolean power set. */
export const BOOL_INFINITY = 18;

/** Expression evaluation result: structured data. */
export type Value = number | Value[];

/** Values context. */
export type ValueContext = Map<string, Value>;

/** Value extraction path. */
export type ValuePath = Branded<number[], 'ValuePath'>;

/** Creates value path. */
export function makeValuePath(path: number[]): ValuePath {
  return path as ValuePath;
}

/** Empty set ∅. */
export const EmptySetV = [];

/** Compare two structured data without recursive calls. */
export function compare(v1: Value, v2: Value): number {
  const stack1: Value[] = [v1];
  const stack2: Value[] = [v2];

  while (stack1.length > 0 && stack2.length > 0) {
    const el1 = stack1.pop();
    const el2 = stack2.pop();
    if (el1 === el2) {
      continue;
    }

    const type1 = typeof el1;
    const type2 = typeof el2;
    if (type1 === 'number' && type2 === 'number') {
      const numDiff = (el1 as number) - (el2 as number);
      if (numDiff !== 0) return numDiff;
      continue;
    }

    const isArray1 = Array.isArray(el1);
    const isArray2 = Array.isArray(el2);
    if (!isArray1 || !isArray2) {
      throw new Error(`Cannot compare different types ${printValue(el1!)} and ${printValue(el2!)}`);
    }

    const arr1 = el1 as Value[];
    const arr2 = el2 as Value[];
    const len1 = arr1.length;
    const len2 = arr2.length;
    if (len1 !== len2) {
      return len1 - len2;
    }

    for (let i = len1 - 1; i >= 0; i--) {
      stack1.push(arr1[i]);
      stack2.push(arr2[i]);
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
