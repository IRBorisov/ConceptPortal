import { describe, expect, it } from 'vitest';

import { TypeID } from '../index';
import { basic, IntegerT, LogicT, tuple as makeTuple } from '../semantic/typification';

import { TUPLE_ID, VALUE_FALSE, VALUE_TRUE } from './value';
import { validateValue } from './value-api';

describe('validateValue', () => {
  const basics = new Map([
    ['X1', [1, 2, 3]],
    ['X2', [7, 8, 42]],
  ]);

  it('validates integers', () => {
    expect(validateValue(42, IntegerT, basics)).toBe(true);
    expect(validateValue([], IntegerT, basics)).toBe(false);
    expect(validateValue([1, 2, 3], IntegerT, basics)).toBe(false);
    expect(validateValue([1, [], 3], IntegerT, basics)).toBe(false);
  });

  it('validates logic values', () => {
    expect(validateValue(VALUE_TRUE, LogicT, basics)).toBe(true);
    expect(validateValue(VALUE_FALSE, LogicT, basics)).toBe(true);
    expect(validateValue(2, LogicT, basics)).toBe(false);
    expect(validateValue([], LogicT, basics)).toBe(false);
    expect(validateValue([1, [], 3], LogicT, basics)).toBe(false);
  });

  it('validates basic types', () => {
    const basicType = basic('X1');
    expect(validateValue(1, basicType, basics)).toBe(true);
    expect(validateValue(2, basicType, basics)).toBe(true);
    expect(validateValue(42, basicType, basics)).toBe(false);
    expect(validateValue(7, basicType, basics)).toBe(false);
    expect(validateValue([1], basicType, basics)).toBe(false);
    const missingType = { typeID: TypeID.basic, baseID: 'NOT_PRESENT' };
    expect(validateValue(1, missingType, basics)).toBe(false);
  });

  it('validates tuple values', () => {
    const tupleType = makeTuple([IntegerT, basic('X1')]);
    // valid tuple
    expect(validateValue([TUPLE_ID, 7, 1], tupleType, basics)).toBe(true);
    // Wrong length
    expect(validateValue([TUPLE_ID, 11], tupleType, basics)).toBe(false);
    // Wrong ID in first element
    expect(validateValue([0, 11, 1], tupleType, basics)).toBe(false);
    // First component invalid
    expect(validateValue([TUPLE_ID, [], 1], tupleType, basics)).toBe(false);
    // Second component invalid
    expect(validateValue([TUPLE_ID, 11, 999], tupleType, basics)).toBe(false);
  });

  it('validates collections', () => {
    const collectionType = {
      typeID: TypeID.collection,
      base: basic('X1')
    };
    // All valid elements
    expect(validateValue([1, 2, 3], collectionType, basics)).toBe(true);
    // Some invalid
    expect(validateValue([1, 99], collectionType, basics)).toBe(false);
    // Not an array
    expect(validateValue(1, collectionType, basics)).toBe(false);
    // Array of tuples (should not have TUPLE_ID at first position)
    expect(validateValue([TUPLE_ID, 1, 2], collectionType, basics)).toBe(false);
  });

  it('returns false for unsupported types', () => {
    expect(validateValue(1, { typeID: TypeID.anyTypification }, basics)).toBe(false);
    expect(validateValue(1, { typeID: TypeID.predicate, result: LogicT, args: [] }, basics)).toBe(false);
    expect(validateValue(1, { typeID: TypeID.function, result: basic('X1'), args: [] }, basics)).toBe(false);
  });
});
