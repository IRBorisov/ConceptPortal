import { describe, expect, it } from 'vitest';

import type { TypePath } from './typification';
import { AnyTypificationT, basic, bool, IntegerT, tuple } from './typification';
import { applyPath } from './typification-api';

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
