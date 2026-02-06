import { BOOL_INFINITY, compare, EmptySetV, set, SET_INFINITY, tuple, TUPLE_ID, type Value } from './value';

/** Cartesian product of factor sets. */
export function decartian(factors: Value[][]): Value[] | null {
  const cardinality = factors.reduce((acc, factor) => acc * factor.length, 1);
  if (cardinality > SET_INFINITY) {
    return null;
  } else if (cardinality === 0 || !factors.length) {
    return EmptySetV;
  }

  const result: Value[] = [];
  const arrays = factors.map(f => [...f]);

  function product(arrays: Value[][], prefix: Value[] = []): void {
    if (arrays.length === 0) {
      result.push(tuple(prefix));
      return;
    }
    const [first, ...rest] = arrays;
    for (const element of first) {
      product(rest, [...prefix, element]);
    }
  }

  product(arrays);
  return result;
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
  let i = 0, j = 0;
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
  let i = 0, j = 0;
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
  let i = 0, j = 0;
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
  let i = 0, j = 0;
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
  return projectedElements;
}

/** String representation for debugging. */
export function printValue(data: Value | null): string {
  if (!Array.isArray(data)) {
    return String(data);
  }
  if (data.length === 0) {
    return '{}';
  }
  if (data[0] === TUPLE_ID) {
    return `(${data.slice(1).map(printValue).join(', ')})`;
  } else {
    return `{${data.map(printValue).join(', ')}}`;
  }
}
