import { type Value } from './value';

const modelArrays = new WeakSet<Value[]>();

/** Track the identity of arrays allocated by the model loader, including tuple rows. */
export function createModelValueArray<T extends Value>(length: number): T[] {
  const array = new Array<T>(length);
  modelArrays.add(array);
  return array;
}

export function isModelValueArray(value: Value | undefined): value is Value[] {
  return typeof value === 'object' && modelArrays.has(value);
}
