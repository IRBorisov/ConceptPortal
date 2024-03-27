'use client';

import { useEffect, useState } from 'react';

import { storage } from '@/utils/constants';

function useLocalStorage<ValueType>(key: string, defaultValue: ValueType | (() => ValueType)) {
  const prefixedKey = `${storage.PREFIX}${key}`;
  const [value, setValue] = useState<ValueType>(() => {
    const loadedJson = localStorage.getItem(prefixedKey);
    if (loadedJson != null) {
      return JSON.parse(loadedJson) as ValueType;
    } else if (typeof defaultValue === 'function') {
      return (defaultValue as () => ValueType)();
    } else {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (value === undefined) {
      localStorage.removeItem(prefixedKey);
    } else {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
    }
  }, [prefixedKey, value]);

  return [value, setValue] as [ValueType, typeof setValue];
}

export default useLocalStorage;
