import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { RSTabID } from '@/app/navigation/navigation-context';
import { tabQuerySchema } from '@/app/navigation/tab-query';

import { optionalQueryInteger, parseQueryInteger } from './query-integer';

const schemaPageParams = z.strictObject({
  id: optionalQueryInteger(),
  version: optionalQueryInteger(),
  tab: tabQuerySchema(RSTabID, RSTabID.CARD),
  activeID: optionalQueryInteger()
});

describe('parseQueryInteger', () => {
  it('reads a decimal integer and drops empty or non-integer values', () => {
    expect(parseQueryInteger('12')).toBe(12);
    expect(parseQueryInteger(12)).toBe(12);
    expect(parseQueryInteger(null)).toBeUndefined();
    expect(parseQueryInteger('')).toBeUndefined();
    expect(parseQueryInteger('foo')).toBeUndefined();
    expect(parseQueryInteger('12.5')).toBeUndefined();
    expect(parseQueryInteger('abc')).toBeUndefined();
  });
});

describe('editor route integers', () => {
  it('does not throw on a non-numeric version and keeps a numeric id', () => {
    const urlData = schemaPageParams.parse({
      id: '12',
      version: 'foo',
      tab: 'foo',
      activeID: 'bar'
    });
    expect(urlData).toEqual({
      id: 12,
      version: undefined,
      tab: RSTabID.CARD,
      activeID: undefined
    });
  });

  it('turns a non-numeric active id into null', () => {
    const active = z.preprocess(value => parseQueryInteger(value) ?? null, z.number().nullable());
    expect(active.parse('foo')).toBeNull();
    expect(active.parse(null)).toBeNull();
    expect(active.parse('4')).toBe(4);
  });

  it('leaves a non-numeric id empty so the page can open not-found', () => {
    const urlData = schemaPageParams.parse({
      id: 'abc',
      version: null,
      tab: null,
      activeID: null
    });
    expect(urlData.id).toBeUndefined();
    expect(urlData.tab).toBe(RSTabID.CARD);
  });
});
