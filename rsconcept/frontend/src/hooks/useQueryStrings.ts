'use client';

import { useLocation } from 'react-router';

function useQueryStrings() {
  const search = useLocation().search;

  function get(key: string) {
    return new URLSearchParams(search).get(key);
  }
  return { get };
}

export default useQueryStrings;
