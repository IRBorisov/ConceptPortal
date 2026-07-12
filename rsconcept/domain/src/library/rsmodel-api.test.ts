import { afterEach, describe, expect, it, vi } from 'vitest';

import { type Value } from '../rslang';
import { compare, TUPLE_ID } from '../rslang/eval/value';
import { isTupleValue } from '../rslang/eval/value-api';
import { basic, bool, IntegerT, tuple } from '../rslang/semantic/typification';

import { type BasicBinding } from './rsmodel';
import { generateRandomValue } from './rsmodel-api';

function hasUniqueElements(value: Value[]): boolean {
  const sorted = [...value].sort(compare);
  for (let i = 1; i < sorted.length; i++) {
    if (compare(sorted[i - 1], sorted[i]) === 0) {
      return false;
    }
  }
  return true;
}

describe('generateRandomValue', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns unique elements for collections even when samples collide', () => {
    const basics = new Map<number, BasicBinding>([[10, { 1: 'x1', 2: 'x2' }]]);
    const cstByAlias = new Map([['X1', { id: 10 }]]);
    const collectionType = bool(basic('X1'));

    // Force: size=5, then always pick the same base element id=1.
    const random = vi.spyOn(Math, 'random');
    random
      .mockReturnValueOnce(0.99) // -> 5 elements
      .mockReturnValue(0); // -> always ids[0] === 1

    const value = generateRandomValue(collectionType, basics, cstByAlias, 5);
    expect(Array.isArray(value)).toBe(true);
    expect(value).toEqual([1]);
    expect(hasUniqueElements(value as Value[])).toBe(true);
  });

  it('returns unique nested sets for tuple of collections ℬ(X1)×ℬ(C1)', () => {
    const basics = new Map<number, BasicBinding>([
      [10, { 1: 'x1', 2: 'x2' }],
      [20, { 0: 'c0', 1: 'c1', 2: 'c2' }]
    ]);
    const cstByAlias = new Map([
      ['X1', { id: 10 }],
      ['C1', { id: 20 }]
    ]);
    const type = tuple([bool(basic('X1')), bool(basic('C1'))]);

    for (let attempt = 0; attempt < 30; attempt++) {
      const value = generateRandomValue(type, basics, cstByAlias, 10);
      expect(isTupleValue(value)).toBe(true);
      const tupleValue = value as Value[];
      expect(tupleValue[0]).toBe(TUPLE_ID);
      expect(Array.isArray(tupleValue[1])).toBe(true);
      expect(Array.isArray(tupleValue[2])).toBe(true);
      expect(hasUniqueElements(tupleValue[1] as Value[])).toBe(true);
      expect(hasUniqueElements(tupleValue[2] as Value[])).toBe(true);
    }
  });

  it('returns null when a basic domain is empty', () => {
    const basics = new Map<number, BasicBinding>();
    const cstByAlias = new Map([['X1', { id: 10 }]]);
    expect(generateRandomValue(basic('X1'), basics, cstByAlias)).toBeNull();
    expect(generateRandomValue(bool(basic('X1')), basics, cstByAlias)).toBeNull();
  });

  it('generates integers in range', () => {
    const value = generateRandomValue(IntegerT, new Map(), new Map());
    expect(typeof value).toBe('number');
    expect(value as number).toBeGreaterThanOrEqual(-100);
    expect(value as number).toBeLessThanOrEqual(100);
  });
});
