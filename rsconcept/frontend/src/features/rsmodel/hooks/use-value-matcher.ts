import { useState } from 'react';
import { useDebounce } from 'use-debounce';

import { type RSEngine } from '@/domain/library';

import { PARAMETER } from '@/utils/constants';

import { ValueMatcher } from '../models/value-matcher';

/** Returns filter utility for Values. */
export function useValueMatcher(engine: RSEngine) {
  const [filter, setFilter] = useState('');
  const [debouncedFilter] = useDebounce(filter, PARAMETER.searchDebounce);
  const matcher = debouncedFilter ? new ValueMatcher(engine, debouncedFilter) : null;

  return {
    filter,
    setFilter,
    matcher
  };
}
