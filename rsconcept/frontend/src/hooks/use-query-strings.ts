'use client';

import { useLocation } from 'react-router';

/**
 * Reads query-string parameters from the current React Router location.
 *
 * @returns `{ get(key) }` — returns the first value for a key, or `null`.
 */
export function useQueryStrings() {
  const search = useLocation().search;

  function get(key: string) {
    return new URLSearchParams(search).get(key);
  }
  return { get };
}
