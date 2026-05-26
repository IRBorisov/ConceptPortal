import { describe, expect, it } from 'vitest';

import { validateLocationFormat } from './library-api';

const validateLocationData = [
  ['', 'false'],
  ['U/U', 'false'],
  ['/A', 'false'],
  ['/U/user@mail', 'false'],
  ['U/u\\asdf', 'false'],
  ['/U/ asdf', 'false'],
  ['/User', 'false'],
  ['//', 'false'],
  ['/S/1 ', 'false'],
  ['/S/1/2 /3', 'false'],

  ['/P', 'true'],
  ['/L', 'true'],
  ['/U', 'true'],
  ['/S', 'true'],
  ['/S/Вася пупки', 'true'],
  ['/S/123', 'true'],
  ['/S/1234', 'true'],
  ['/S/1/!asdf/тест тест', 'true']
];

describe('Testing location validation', () => {
  it.each(validateLocationData)('isValid %p', (input: string, expected: string) => {
    const result = validateLocationFormat(input);
    expect(String(result)).toBe(expected);
  });
});
