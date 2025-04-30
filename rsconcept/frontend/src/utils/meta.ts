/**
 * Module: Generic high order utility functions.
 */

// List of disallowed object types (non-plain)
// ALLOW: Date | RegExp | ArrayBuffer | DataView
type DisallowedObjects =
  | Map<unknown, unknown>
  | Set<unknown>
  | WeakMap<object, unknown>
  | WeakSet<object>
  | Promise<unknown>;

// Detects any disallowed object type directly
type IsDisallowedObject<T> = T extends DisallowedObjects ? true : false;

// Detects if any property in T is a function
type HasFunctionProps<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? true : false;
}[keyof T] extends true
  ? true
  : false;

// Detects if any property in T is a disallowed object
type HasDisallowedProps<T> = {
  [K in keyof T]: IsDisallowedObject<T[K]>;
}[keyof T] extends true
  ? true
  : false;

// Detects if T is a class instance (has constructor)
type IsClassInstance<T> = T extends object
  ? T extends { constructor: new (...args: unknown[]) => unknown }
    ? true
    : false
  : false;

// The final check — should the object be rejected?
type IsInvalid<T> = T extends object
  ? HasFunctionProps<T> extends true
    ? true
    : HasDisallowedProps<T> extends true
    ? true
    : IsClassInstance<T> extends true
    ? true
    : false
  : false;

/**
 * Apply readonly modifier to all properties of a SIMPLE object recursively.
 * only works for arrays, dictionaries and primitives.
 */
export type RO<T> = IsInvalid<T> extends true
  ? never
  : T extends readonly unknown[]
  ? readonly RO<T[number]>[]
  : T extends object
  ? { readonly [K in keyof T]: RO<T[K]> }
  : T;

/**
 * Freeze an object.
 */
export function deepFreeze<T>(obj: T): RO<T> {
  // Ensure the input object is not null or undefined
  if (obj === null || obj === undefined) {
    throw new Error('Cannot freeze null or undefined');
  }

  // Freeze the current object
  Object.freeze(obj);

  // Freeze properties recursively
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as Record<string, unknown>)[prop];
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });

  // Return the frozen object
  return obj as RO<T>;
}
