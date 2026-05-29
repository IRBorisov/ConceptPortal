import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS,
  enabledContextSearchFields,
  isDefaultContextSearchFields,
  normalizeContextSearchFields
} from '@/features/library/models/library-context-search';

describe('library context search fields', () => {
  it('defaults to all enabled fields', () => {
    expect(isDefaultContextSearchFields(DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS)).toBe(true);
    expect(enabledContextSearchFields(DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS)).toHaveLength(9);
  });

  it('normalizes partial persisted state', () => {
    expect(
      normalizeContextSearchFields({
        term: false
      })
    ).toEqual({
      ...DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS,
      term: false
    });
  });

  it('returns only enabled fields', () => {
    expect(
      enabledContextSearchFields({
        ...DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS,
        title: false,
        block: false
      })
    ).toEqual(['alias', 'description', 'term', 'definition_formal', 'definition_text', 'convention', 'operation']);
  });
});
