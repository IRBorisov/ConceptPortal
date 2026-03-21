import { type RO } from '@/utils/meta';
import { applyHash_fnv1a } from '@/utils/utils';

import { type ExpressionType, TypeID } from '../semantic/typification';

import { BOOL_INFINITY, compare, EmptySetV, set, SET_INFINITY, tuple, TUPLE_ID, type Value, VALUE_FALSE, VALUE_TRUE, type ValueContext } from './value';

/** Cartesian product of factor sets. */
export function decartian(factors: Value[][]): Value[] | null {
  const cardinality = factors.reduce((acc, f) => acc * f.length, 1);
  if (cardinality > SET_INFINITY) {
    return null;
  }
  if (cardinality === 0 || factors.length === 0) {
    return EmptySetV;
  }

  let accumulator: Value[][] = [[]];
  for (const factor of factors) {
    const next: Value[][] = [];
    for (const prefix of accumulator) {
      for (const value of factor) {
        next.push([...prefix, value]);
      }
    }
    accumulator = next;
  }
  return accumulator.map(tuple);
}

/** Boolean power set ℬ(X). No cache - materialized. */
export function boolean(base: Value[]): Value[] | null {
  if (base.length > BOOL_INFINITY) {
    return null;
  }
  return powerset(base);
}

/** Powerset of array. */
function powerset(arr: readonly Value[]): Value[][] {
  const result: Value[][] = [[]];
  if (arr.length === 0) {
    return result;
  }

  let current: Value[][] = [[]];
  let maxIndex: number[] = [-1];
  while (current.length > 0) {
    const next: Value[][] = [];
    const nextMaxIndex: number[] = [];
    for (let i = 0; i < current.length; i++) {
      for (let j = maxIndex[i] + 1; j < arr.length; j++) {
        const subset = [...current[i], arr[j]];
        result.push(subset);
        if (j < arr.length - 1) {
          next.push(subset);
          nextMaxIndex.push(j);
        }
      }
    }
    current = next;
    maxIndex = nextMaxIndex;
  }
  return result;
}

/** Check if set contains element. */
export function contains(setData: Value[], element: Value): boolean {
  let left = 0;
  let right = setData.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const cmp = compare(setData[mid], element);
    if (cmp === 0) {
      return true;
    } else if (cmp < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return false;
}

/** Is A ⊆ B. */
export function isSubsetOrEq(a: Value[], b: Value[]): boolean {
  let i = 0,
    j = 0;
  while (i < a.length && j < b.length) {
    const cmp = compare(a[i], b[j]);
    if (cmp === 0) {
      i++;
      j++;
    } else if (cmp > 0) {
      j++;
    } else {
      return false;
    }
  }
  return i === a.length;
}

/** Reduce: flatten double boolean to single boolean. */
export function reduce(target: Value[][]): Value[] {
  const result: Value[] = [];
  for (const element of target) {
    result.push(...element);
  }
  return set(result);
}

/** Union A ∪ B. */
export function setUnion(set1: Value[], set2: Value[]): Value[] {
  const result: Value[] = [];
  let i = 0,
    j = 0;
  while (i < set1.length && j < set2.length) {
    const cmp = compare(set1[i], set2[j]);
    if (cmp < 0) {
      result.push(set1[i]);
      i++;
    } else if (cmp > 0) {
      result.push(set2[j]);
      j++;
    } else {
      result.push(set1[i]);
      i++;
      j++;
    }
  }
  while (i < set1.length) {
    result.push(set1[i]);
    i++;
  }
  while (j < set2.length) {
    result.push(set2[j]);
    j++;
  }
  return result;
}

/** Intersection A ∩ B. */
export function setIntersection(set1: Value[], set2: Value[]): Value[] {
  const result: Value[] = [];
  for (let i = 0, j = 0; i < set1.length && j < set2.length;) {
    const cmp = compare(set1[i], set2[j]);
    if (cmp < 0) {
      i++;
    } else if (cmp > 0) {
      j++;
    } else {
      result.push(set1[i]);
      i++;
      j++;
    }
  }
  return result;
}

/** Difference A \ B. */
export function setDiff(set1: Value[], set2: Value[]): Value[] {
  const result: Value[] = [];
  let i = 0,
    j = 0;
  while (i < set1.length && j < set2.length) {
    const cmp = compare(set1[i], set2[j]);
    if (cmp < 0) {
      result.push(set1[i]);
      i++;
    } else if (cmp > 0) {
      j++;
    } else {
      i++;
      j++;
    }
  }
  while (i < set1.length) {
    result.push(set1[i]);
    i++;
  }
  return result;
}

/** Symmetric difference A ∆ B. */
export function setSymDiff(set1: Value[], set2: Value[]): Value[] {
  const result: Value[] = [];
  let i = 0,
    j = 0;
  while (i < set1.length && j < set2.length) {
    const cmp = compare(set1[i], set2[j]);
    if (cmp < 0) {
      result.push(set1[i]);
      i++;
    } else if (cmp > 0) {
      result.push(set2[j]);
      j++;
    } else {
      i++;
      j++;
    }
  }
  while (i < set1.length) {
    result.push(set1[i]);
    i++;
  }
  while (j < set2.length) {
    result.push(set2[j]);
    j++;
  }
  return result;
}

/** Projection of set by indices (BigPr). */
export function projection(target: Value[][], indices: number[]): Value[] {
  const projectedElements: Value[] = target.map(element => {
    const newComponents = indices.map(idx => element[idx]);
    return indices.length === 1 ? newComponents[0] : tuple(newComponents);
  });
  return set(projectedElements);
}

/** Condensed string representation. */
export function printValue(data: RO<Value> | null): string {
  if (!Array.isArray(data)) {
    return String(data);
  }
  const len = data.length;
  if (data.length === 0) {
    return '{}';
  }

  const isTuple = data[0] === TUPLE_ID;
  const start = isTuple ? 1 : 0;

  let result = isTuple ? '(' : '{';
  for (let i = start; i < len; i++) {
    if (i > start) result += ', ';
    result += printValue(data[i] as RO<Value>);
  }
  result += isTuple ? ')' : '}';
  return result;
}

/** Generates stub ID for value. */
export function valueStub(value: RO<Value> | null): string {
  if (!value) {
    return '';
  }
  const str = printValue(value);
  const hash = applyHash_fnv1a(str);
  return hash.toString(16).padStart(8, '0').slice(0, 8);
}

/** Normalize unsorted array of values. */
export function normalizeValue(data: Value): void {
  if (!Array.isArray(data) || data.length < 2 || data[0] === TUPLE_ID) {
    return;
  }

  data.sort((a, b) => compare(a, b));
  let i = 1;
  while (i < data.length) {
    if (compare(data[i - 1], data[i]) === 0) {
      data.splice(i, 1);
    } else {
      i++;
    }
  }
}

/** Validates value for {@link ExpressionType} and value of basic sets. */
export function validateValue(value: RO<Value>, type: RO<ExpressionType>, basics: ValueContext): boolean {
  switch (type.typeID) {
    case TypeID.integer:
      return typeof value === 'number';
    case TypeID.logic: {
      if (typeof value !== 'number') {
        return false;
      }
      return value === VALUE_TRUE || value === VALUE_FALSE;
    }
    case TypeID.basic: {
      if (typeof value !== 'number') {
        return false;
      }
      const domain = basics.get(type.baseID);
      return !!domain && Array.isArray(domain) && domain.includes(value);
    }

    case TypeID.tuple: {
      if (!Array.isArray(value) || value.length !== type.factors.length + 1 || value[0] !== TUPLE_ID) {
        return false;
      }
      for (let i = 0; i < type.factors.length; i++) {
        if (!validateValue(value[i + 1] as RO<Value>, type.factors[i], basics)) {
          return false;
        }
      }
      return true;
    }

    case TypeID.collection: {
      if (!Array.isArray(value) || (value.length > 1 && value[0] === TUPLE_ID)) return false;
      for (const item of value) {
        if (!validateValue(item as RO<Value>, type.base, basics)) {
          return false;
        }
      }
      return true;
    }

    case TypeID.anyTypification:
    case TypeID.predicate:
    case TypeID.function:
      return false;
  }

}