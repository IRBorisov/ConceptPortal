import { describe, expect, it } from 'vitest';

import type { TypePath } from './typification';
import {
  AnyTypificationT,
  basic,
  bool,
  IntegerT,
  mangleParamAlias,
  mangleRadicalId,
  tuple,
  type Typification
} from './typification';
import { applyPath, cloneTypification, compareTemplated, substituteBase } from './typification-api';

describe('applyPath', () => {
  function typePath(path: number[]): TypePath {
    return path as TypePath;
  }

  it('returns the same typification for empty path', () => {
    const type = basic('X1');
    expect(applyPath(type, typePath([]))).toBe(type);
  });

  it('returns null for path on non-nested types', () => {
    const types = [AnyTypificationT, basic('X1'), IntegerT];
    for (const typ of types) {
      expect(applyPath(typ, typePath([0]))).toBeNull();
    }
  });

  it('follows collection base as expected', () => {
    const base = basic('X1');
    const collection = bool(base);
    expect(applyPath(collection, typePath([0]))).toBe(base);
    expect(applyPath(collection, typePath([0, 0]))).toBeNull();
  });

  it('navigates within tuple by path index', () => {
    const f1 = basic('X1');
    const f2 = basic('X2');
    const tup = tuple([f1, f2]);
    expect(applyPath(tup, typePath([0]))).toBeNull();
    expect(applyPath(tup, typePath([1]))).toBe(f1);
    expect(applyPath(tup, typePath([2]))).toBe(f2);
    expect(applyPath(tup, typePath([3]))).toBeNull();
    expect(applyPath(tup, typePath([1, 0]))).toBeNull();

    const nested = tuple([tup, f2]);
    expect(applyPath(nested, typePath([1, 2]))).toBe(f2);
    expect(applyPath(nested, typePath([1, 3]))).toBeNull();
    expect(applyPath(nested, typePath([2, 1]))).toBeNull();
  });
});

describe('compareTemplated', () => {
  it('accepts R0 on either side', () => {
    const substitutes = new Map<string, Typification>();
    expect(compareTemplated(substitutes, AnyTypificationT, basic('X1'))).toBe(true);
    expect(compareTemplated(substitutes, bool(basic('X1')), AnyTypificationT)).toBe(true);
    expect(compareTemplated(substitutes, AnyTypificationT, AnyTypificationT)).toBe(true);
  });
});

describe('mangleRadicalId', () => {
  it('qualifies template radical with function name', () => {
    expect(mangleRadicalId('R1', 'P2')).toBe('P2<R1>');
    expect(mangleRadicalId('R2', 'F10')).toBe('F10<R2>');
  });
});

describe('mangleParamAlias', () => {
  it('qualifies formal parameter alias with calling function name', () => {
    expect(mangleParamAlias('β', 'P44')).toBe('P44<β>');
    expect(mangleParamAlias('a', 'F1')).toBe('F1<a>');
  });
});

describe('cloneTypification + substituteBase', () => {
  it('resolves mangled radicals for error messages', () => {
    const argType = bool(basic('F2<R1>'));
    const substitutes = new Map<string, Typification>([['F2<R1>', basic('X1')]]);
    const expectedType = cloneTypification(argType);
    substituteBase(expectedType, substitutes);
    expect(expectedType).toEqual(bool(basic('X1')));
  });
});
