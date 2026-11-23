function show(value) {
  if (Object.is(value, -0)) return '-0';
  if (Array.isArray(value)) return `array of length ${value.length}`;
  if (value !== null && typeof value === 'object') return 'object';
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

export function firstDifference(actual, expected, path = '$') {
  if (Object.is(actual, expected)) return undefined;
  const actualArray = Array.isArray(actual);
  const expectedArray = Array.isArray(expected);
  if (actualArray && expectedArray) {
    if (actual.length !== expected.length) {
      return { path: `${path}.length`, expected: String(expected.length), actual: String(actual.length) };
    }
    for (let index = 0; index < expected.length; index++) {
      const difference = firstDifference(actual[index], expected[index], `${path}[${index}]`);
      if (difference) return difference;
      if (Object.hasOwn(actual, index) !== Object.hasOwn(expected, index)) {
        return { path: `${path}[${index}]`, expected: 'same property presence', actual: 'different property presence' };
      }
    }
    return undefined;
  }
  if (
    !actualArray &&
    !expectedArray &&
    actual !== null &&
    expected !== null &&
    typeof actual === 'object' &&
    typeof expected === 'object'
  ) {
    const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    for (const key of keys) {
      const property = `${path}.${key}`;
      if (!Object.hasOwn(actual, key))
        return { path: property, expected: 'property present', actual: 'property missing' };
      if (!Object.hasOwn(expected, key))
        return { path: property, expected: 'property missing', actual: 'property present' };
      const difference = firstDifference(actual[key], expected[key], property);
      if (difference) return difference;
    }
    return undefined;
  }
  return { path, expected: show(expected), actual: show(actual) };
}

export function makeChecks() {
  const failures = [];
  const ids = new Set();
  function check(id, actual, expected) {
    if (ids.has(id)) throw new Error(`Duplicate case ID: ${id}`);
    ids.add(id);
    try {
      const value = typeof actual === 'function' ? actual() : actual;
      if (value && typeof value.then === 'function') throw new Error('Await the actual value first');
      const difference = firstDifference(value, expected);
      if (difference) failures.push({ id, ...difference });
    } catch (error) {
      failures.push({ id, path: '$', expected: show(expected), actual: String(error) });
    }
  }
  return {
    check,
    failures,
    get total() {
      return ids.size;
    }
  };
}
